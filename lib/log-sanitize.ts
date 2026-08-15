/**
 * Data masking for anything on its way into a log.
 *
 * The rule is deliberately paranoid: mask by key name AND by value shape, and
 * default to masking when unsure. A log line is written once and read for
 * months, often by more people than the database ever is — a secret that lands
 * there has effectively leaked, and no amount of later deletion undoes it.
 *
 * This matters concretely in this project. Supabase errors are interpolated
 * straight into messages, the panel handles a service_role key that bypasses
 * every row-level policy, and the lead forms carry names and phone numbers
 * that are personal data under the LGPD.
 */

/** Key names whose value is never safe to record, matched case-insensitively. */
const SECRET_KEYS = [
  "password",
  "senha",
  "token",
  "accesstoken",
  "refreshtoken",
  "idtoken",
  "apikey",
  "api_key",
  "anonkey",
  "servicerole",
  "service_role",
  "secret",
  "authorization",
  "cookie",
  "session",
  "jwt",
  "credential",
  "signature",
  "privatekey",
];

/** Key names holding personal data: kept partially, for support to work. */
const PII_KEYS = ["email", "phone", "telefone", "whatsapp", "cpf", "cnpj"];

export const MASK = "[REDIGIDO]";

/**
 * Value shapes that are secrets wherever they appear, including inside a
 * sentence — which is exactly how they escape, since an error message is a
 * string and no key name warns you about it.
 */
const SECRET_PATTERNS: Array<[RegExp, string]> = [
  // JWT: the shape of every Supabase anon and service_role key.
  [/\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/g, "[JWT]"],
  // Supabase personal access tokens and the newer publishable/secret keys.
  [/\bsbp_[A-Za-z0-9]{16,}\b/g, "[TOKEN]"],
  [/\bsb_(secret|publishable)_[A-Za-z0-9_-]{8,}\b/g, "[TOKEN]"],
  [/\bBearer\s+[A-Za-z0-9._-]{12,}/gi, "Bearer [TOKEN]"],
  // A signed storage URL carries its own credential in the query string.
  [/([?&])(token|signature|apikey)=[^&\s]+/gi, "$1$2=[REDIGIDO]"],
];

function isSecretKey(key: string): boolean {
  const flat = key.toLowerCase().replace(/[-_\s]/g, "");
  return SECRET_KEYS.some((needle) => flat.includes(needle.replace(/[-_]/g, "")));
}

function isPiiKey(key: string): boolean {
  const flat = key.toLowerCase().replace(/[-_\s]/g, "");
  return PII_KEYS.some((needle) => flat.includes(needle));
}

/** Keeps just enough to recognise a record without exposing the person. */
export function maskEmail(value: string): string {
  const at = value.indexOf("@");
  if (at < 1) return MASK;
  const head = value[0];
  return `${head}***${value.slice(at)}`;
}

export function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 4) return MASK;
  return `***${digits.slice(-4)}`;
}

/** Strips secret shapes out of free text, such as a database error message. */
export function scrubText(value: string): string {
  let out = value;
  for (const [pattern, replacement] of SECRET_PATTERNS) {
    out = out.replace(pattern, replacement);
  }
  return out;
}

/**
 * Deep-copies a value with every secret removed and every identifier reduced.
 *
 * Cycles and over-deep structures are cut rather than followed: a log call must
 * never be the thing that throws, and an unbounded object would blow the line
 * size limit of the log ingestion anyway.
 */
export function sanitize(input: unknown, depth = 0, seen = new WeakSet<object>()): unknown {
  if (depth > 6) return "[PROFUNDO DEMAIS]";

  if (input === null || input === undefined) return input;

  if (typeof input === "string") return scrubText(input);
  if (typeof input === "number" || typeof input === "boolean") return input;
  if (typeof input === "bigint") return input.toString();
  if (typeof input === "function") return "[FUNCAO]";

  if (input instanceof Date) return input.toISOString();

  if (input instanceof Error) {
    return {
      name: input.name,
      message: scrubText(input.message),
      // The stack is the point of logging an error, but it embeds the message.
      stack: input.stack ? scrubText(input.stack) : undefined,
    };
  }

  if (typeof input === "object") {
    if (seen.has(input as object)) return "[CIRCULAR]";
    seen.add(input as object);

    if (Array.isArray(input)) {
      // A long array in a log is noise; the first entries carry the signal.
      const head = input.slice(0, 20).map((item) => sanitize(item, depth + 1, seen));
      return input.length > 20 ? [...head, `[+${input.length - 20} itens]`] : head;
    }

    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
      if (isSecretKey(key)) {
        out[key] = MASK;
        continue;
      }
      if (isPiiKey(key) && typeof value === "string") {
        out[key] = key.toLowerCase().includes("mail")
          ? maskEmail(value)
          : maskPhone(value);
        continue;
      }
      out[key] = sanitize(value, depth + 1, seen);
    }
    return out;
  }

  return String(input);
}
