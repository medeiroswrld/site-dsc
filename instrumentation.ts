/**
 * Next's server instrumentation hook.
 *
 * `onRequestError` fires for every error thrown while rendering a page, a
 * layout or a Server Action — including the ones React has already swallowed
 * into an error boundary. It is the only place that sees all of them, which
 * makes it the backstop the audit was missing: before this, an exception in a
 * Server Component reached the visitor as a generic screen and left nothing
 * behind on the server.
 *
 * It also carries the request context the Server Actions themselves cannot
 * reach, so the router path and the digest land on the same line as the stack.
 * The digest is what ties this entry to the code the visitor sees on the error
 * page.
 */
export async function onRequestError(
  error: unknown,
  request: {
    path: string;
    method: string;
    headers: { [key: string]: string | undefined };
  },
  context: {
    routerKind: string;
    routePath: string;
    routeType: string;
  },
) {
  // Imported lazily: this file is loaded in both runtimes, and the Node logger
  // must not be pulled into the Edge bundle.
  const { logger } = await import("@/lib/logger");

  logger.error("request.unhandled_error", {
    err: error,
    requestId: request.headers["x-vercel-id"] ?? request.headers["x-request-id"],
    method: request.method,
    path: request.path,
    route: context.routePath,
    routeType: context.routeType,
    digest: (error as { digest?: string } | null)?.digest,
  });
}

export async function register() {
  // Nothing to start up yet. Kept because Next only wires onRequestError from
  // a module that also exports register().
}
