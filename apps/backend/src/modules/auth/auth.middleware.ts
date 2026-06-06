import { FastifyReply, FastifyRequest } from "fastify";
import { getSessionUser, SessionUser } from "./auth.data";
import { SESSION_COOKIE } from "./auth.routes";

declare module "fastify" {
  interface FastifyRequest {
    sessionUser?: SessionUser;
  }
}

/**
 * Routes that bypass auth even when their URL starts with the admin prefix.
 * The public form submission endpoints live under `/api/public/*` so they
 * are already exempt — this list is for any unauthenticated escape hatches
 * we deliberately add later.
 */
const PUBLIC_PATHS = new Set<string>([
  "/api/auth/login",
  "/api/auth/me",
  "/api/auth/logout"
]);

const isProtectedPath = (url: string) => {
  // Strip query string before checking.
  const path = url.split("?")[0];
  if (PUBLIC_PATHS.has(path)) {
    return false;
  }
  if (path.startsWith("/api/public/")) {
    return false;
  }
  return path.startsWith("/api/admin/");
};

export const authPreHandler = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  if (!isProtectedPath(request.url)) {
    return;
  }

  const sessionId = request.cookies?.[SESSION_COOKIE];
  if (!sessionId) {
    reply.code(401).send({ error: "unauthenticated" });
    return reply;
  }

  const user = await getSessionUser(sessionId);
  if (!user) {
    reply.clearCookie(SESSION_COOKIE, { path: "/" });
    reply.code(401).send({ error: "session_expired" });
    return reply;
  }

  request.sessionUser = user;
};
