import "server-only";

import type { ActionResult } from "@/lib/admin/schema";
import { logger } from "@/lib/logger";

/**
 * The single exit for a failed Server Action: records it, then answers.
 *
 * Before this, an action that failed told the person on screen and nobody
 * else — 29 such returns across the panel, not one of them leaving a trace.
 * The result shape is unchanged, so no component had to be touched; what
 * changed is that every failure is now visible from the outside.
 *
 * It lives here rather than in `schema.ts` because that module is imported by
 * the forms as well, and dragging a server-only logger into the browser
 * bundle is exactly the mistake this file exists to avoid.
 *
 * `domain` groups the events ("vehicles", "content"), `reason` is the same
 * text the person reads, and `meta` carries the ids worth filtering on later.
 */
export function fail(
  domain: string,
  reason: string,
  meta?: Record<string, unknown>,
): ActionResult {
  logger.error(`${domain}.action_failed`, { reason, ...meta });
  return { ok: false, message: reason };
}
