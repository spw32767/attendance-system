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
 */
const PUBLIC_PATHS = new Set<string>([
  "/api/auth/login",
  "/api/auth/me",
  "/api/auth/logout"
]);

const SUPER = "super_admin";
const ADMIN = "admin";
const STAFF = "staff";
const SCANNER = "scanner";

/**
 * Role gates per /api/admin/* URL segment. Matched in order; first hit wins.
 *  - super_admin is implicitly allowed on every protected path.
 *  - Anything not matched falls through to ADMIN_DEFAULT_ROLES.
 *
 * Mirrors the frontend ROUTE_PERMISSION_GROUP so the UI and the API agree.
 */
const ROLE_RULES: Array<{ match: RegExp; roles: string[] }> = [
  // User management + audit — admin only.
  { match: /^\/api\/admin\/users(\/|$|\?)/, roles: [SUPER, ADMIN] },
  { match: /^\/api\/admin\/sso-accounts(\/|$|\?)/, roles: [SUPER, ADMIN] },
  { match: /^\/api\/admin\/login-logs(\/|$|\?)/, roles: [SUPER, ADMIN] },

  // Claim status (mark received) and QR scan — scanner can do these.
  { match: /^\/api\/admin\/claims\/scan(\/|$|\?)/, roles: [SUPER, ADMIN, STAFF, SCANNER] },
  { match: /^\/api\/admin\/claims\/[^/]+\/status(\/|$|\?)/, roles: [SUPER, ADMIN, STAFF, SCANNER] },
  { match: /^\/api\/admin\/claims(\/|$|\?)/, roles: [SUPER, ADMIN, STAFF, SCANNER] }
];

/** Default for any /api/admin/* path not matched by ROLE_RULES. */
const ADMIN_DEFAULT_ROLES = [SUPER, ADMIN, STAFF];

const isProtectedPath = (url: string) => {
  const path = url.split("?")[0];
  if (PUBLIC_PATHS.has(path)) {
    return false;
  }
  if (path.startsWith("/api/public/")) {
    return false;
  }
  return path.startsWith("/api/admin/");
};

const allowedRolesFor = (url: string): string[] => {
  const path = url.split("?")[0];
  for (const rule of ROLE_RULES) {
    if (rule.match.test(path)) {
      return rule.roles;
    }
  }
  return ADMIN_DEFAULT_ROLES;
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

  const allowed = allowedRolesFor(request.url);
  if (!allowed.includes(user.role_code)) {
    reply.code(403).send({ error: "forbidden" });
    return reply;
  }
};
