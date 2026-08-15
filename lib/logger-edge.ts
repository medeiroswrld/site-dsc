import { sanitize } from "@/lib/log-sanitize";

/**
 * Structured logging for the Edge runtime.
 *
 * The middleware is the one piece of server code that does not run on Node:
 * it runs on the Edge runtime, where `node:async_hooks` and pino are simply
 * absent. Importing `lib/logger.ts` there fails the build, so this writes the
 * same JSON shape with nothing but `console` and `JSON.stringify`.
 *
 * Keeping the field names identical to the Node logger is the whole point —
 * a query filtering by `event` or `requestId` must not care which runtime
 * produced the line.
 */

type Level = "info" | "warn" | "error" | "fatal";

interface EdgeContext {
  requestId?: string;
  route?: string;
}

function write(level: Level, event: string, context: EdgeContext, payload?: Record<string, unknown>) {
  const line = {
    level,
    time: new Date().toISOString(),
    service: "site-dsc",
    env: process.env.VERCEL_ENV ?? "development",
    runtime: "edge",
    ...context,
    event,
    ...((payload ? sanitize(payload) : {}) as Record<string, unknown>),
  };

  // A logger must never be the reason a request fails, so a serialisation
  // problem degrades to a single flat line instead of throwing in middleware.
  try {
    console.log(JSON.stringify(line));
  } catch {
    console.log(`{"level":"${level}","event":"${event}","note":"log serialization failed"}`);
  }
}

export const edgeLogger = {
  info: (event: string, ctx: EdgeContext, payload?: Record<string, unknown>) =>
    write("info", event, ctx, payload),
  warn: (event: string, ctx: EdgeContext, payload?: Record<string, unknown>) =>
    write("warn", event, ctx, payload),
  error: (event: string, ctx: EdgeContext, payload?: Record<string, unknown>) =>
    write("error", event, ctx, payload),
  fatal: (event: string, ctx: EdgeContext, payload?: Record<string, unknown>) =>
    write("fatal", event, ctx, payload),
};

export function edgeRequestId(headers: Headers): string {
  return (
    headers.get("x-vercel-id") ??
    headers.get("x-request-id") ??
    `edge-${Math.random().toString(36).slice(2, 10)}`
  );
}
