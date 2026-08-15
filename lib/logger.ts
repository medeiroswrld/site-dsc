import "server-only";

import { AsyncLocalStorage } from "node:async_hooks";
import pino from "pino";
import { sanitize } from "@/lib/log-sanitize";

/**
 * Structured logging for the Node runtime.
 *
 * Writes one JSON object per line to stdout and nothing else. That is
 * deliberate: on Vercel each request runs in an ephemeral function, so a file
 * transport has nowhere durable to write and a worker-thread transport
 * (pino-pretty, pino/file) costs a thread per invocation for no gain. Vercel
 * already ingests stdout and parses JSON, so plain stdout *is* the transport.
 *
 * The middleware cannot use this module — it runs on the Edge runtime, where
 * node:async_hooks and pino are unavailable. See `lib/logger-edge.ts`.
 */

/** Ambient facts attached to every line written during one request. */
export interface LogContext {
  requestId: string;
  /** Set once the session is known. Never the e-mail — see log-sanitize. */
  userId?: string;
  route?: string;
}

const storage = new AsyncLocalStorage<LogContext>();

/**
 * Runs `fn` with a context every log call inside it will pick up, however deep.
 * Without this a Server Action three layers down would have to be handed a
 * request id by every caller in between, which never survives contact with a
 * refactor.
 */
export function withLogContext<T>(context: LogContext, fn: () => T): T {
  return storage.run(context, fn);
}

export function currentContext(): Partial<LogContext> {
  return storage.getStore() ?? {};
}

/** Vercel puts a per-request id on the header; falling back keeps dev usable. */
export function requestIdFrom(headers: Headers): string {
  return (
    headers.get("x-vercel-id") ??
    headers.get("x-request-id") ??
    `local-${Math.random().toString(36).slice(2, 10)}`
  );
}

const base = pino({
  level: process.env.LOG_LEVEL ?? (process.env.NODE_ENV === "production" ? "info" : "debug"),
  // `fatal` is already the top level in pino; naming them here documents the
  // ladder the team is expected to use rather than leaving it to taste.
  customLevels: {},
  base: {
    service: "site-dsc",
    env: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development",
    release: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    // Ship the word, not the number: "error" is greppable, 50 is not.
    level: (label) => ({ level: label }),
  },
  /**
   * Second line of defence. Everything already passes through `sanitize`, but
   * a direct `logger.info({ token })` from future code would bypass that, and
   * this catches it at the serialiser.
   */
  redact: {
    paths: [
      "password",
      "senha",
      "token",
      "*.password",
      "*.senha",
      "*.token",
      "*.accessToken",
      "*.refreshToken",
      "*.apikey",
      "*.authorization",
      "*.cookie",
      "req.headers.authorization",
      "req.headers.cookie",
    ],
    censor: "[REDIGIDO]",
  },
});

type Level = "debug" | "info" | "warn" | "error" | "fatal";

function write(level: Level, event: string, payload?: Record<string, unknown>) {
  const context = currentContext();
  // Sanitising here rather than at the call sites means a new logger.error()
  // written a year from now is safe by default instead of by discipline.
  const safe = (payload ? sanitize(payload) : {}) as Record<string, unknown>;
  base[level]({ ...context, event, ...safe });
}

/**
 * The four levels, with the distinction that matters in review:
 *
 *   info   something expected happened and is worth a trail (a car published)
 *   warn   something went wrong but the visitor is unaffected (a fallback used)
 *   error  a user-visible failure — someone could not do what they came to do
 *   fatal  the process or a dependency is unusable; the site is degraded
 */
export const logger = {
  debug: (event: string, payload?: Record<string, unknown>) => write("debug", event, payload),
  info: (event: string, payload?: Record<string, unknown>) => write("info", event, payload),
  warn: (event: string, payload?: Record<string, unknown>) => write("warn", event, payload),
  error: (event: string, payload?: Record<string, unknown>) => write("error", event, payload),
  fatal: (event: string, payload?: Record<string, unknown>) => write("fatal", event, payload),
};

/**
 * Wraps a Server Action so a thrown error is always recorded before it leaves.
 *
 * Actions in this project answer with `{ ok: false, message }` on failure. That
 * message reaches the person on screen and then nothing keeps it — the audit
 * found 27 such points and not one wrote a line. This closes that gap without
 * touching the shape any caller depends on.
 */
export async function loggedAction<T>(
  action: string,
  fn: () => Promise<T>,
  meta?: Record<string, unknown>,
): Promise<T> {
  const started = Date.now();
  try {
    const result = await fn();

    const failed =
      typeof result === "object" && result !== null && (result as { ok?: boolean }).ok === false;

    if (failed) {
      logger.error("action.failed", {
        action,
        ...meta,
        reason: (result as { message?: string }).message,
        durationMs: Date.now() - started,
      });
    } else {
      logger.info("action.ok", { action, ...meta, durationMs: Date.now() - started });
    }

    return result;
  } catch (error) {
    logger.error("action.threw", {
      action,
      ...meta,
      err: error,
      durationMs: Date.now() - started,
    });
    throw error;
  }
}
