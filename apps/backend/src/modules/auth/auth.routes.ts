import bcrypt from "bcryptjs";
import { FastifyPluginAsync } from "fastify";
import {
  createSession,
  destroySession,
  findUserByEmail,
  getSessionUser,
  recordLoginAttempt,
  SESSION_TTL_MS
} from "./auth.data";

export const SESSION_COOKIE = "att_session";

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  // secure is set per-environment in the route handler
  maxAge: Math.floor(SESSION_TTL_MS / 1000)
};

const authRoutes: FastifyPluginAsync = async (fastify) => {
  const isProd = process.env.NODE_ENV === "production";

  fastify.post("/auth/login", {
    // Per-IP rate limit: 5 attempts / minute. The plugin returns 429 with
    // the Thai message from app.ts errorResponseBuilder. Hits cooldown for
    // every attempt — successful or failed — to keep credential-stuffing
    // costly.
    config: {
      rateLimit: {
        max: 5,
        timeWindow: "1 minute"
      }
    }
  }, async (request, reply) => {
    const body = (request.body || {}) as { email?: string; password?: string };
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const ipAddress = request.ip || null;
    const userAgent = (request.headers["user-agent"] as string | undefined) || null;

    if (!email || !password) {
      await recordLoginAttempt({
        identifier: email || "(missing)",
        method: "local",
        status: "failure",
        failureReason: "missing_credentials",
        ipAddress,
        userAgent
      });
      return reply.code(400).send({ error: "กรุณากรอกอีเมลและรหัสผ่าน" });
    }

    const user = await findUserByEmail(email);

    if (!user || !user.is_active || !user.allow_local_login || !user.password_hash) {
      await recordLoginAttempt({
        identifier: email,
        method: "local",
        status: "failure",
        failureReason: user ? "login_disabled" : "unknown_user",
        ipAddress,
        userAgent
      });
      return reply.code(401).send({ error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
    }

    const passwordOk = await bcrypt.compare(password, user.password_hash);
    if (!passwordOk) {
      await recordLoginAttempt({
        identifier: email,
        method: "local",
        status: "failure",
        failureReason: "bad_password",
        ipAddress,
        userAgent
      });
      return reply.code(401).send({ error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
    }

    const { sessionId, expiresAt } = await createSession(user.user_id, {
      ipAddress,
      userAgent
    });

    await recordLoginAttempt({
      identifier: email,
      method: "local",
      status: "success",
      ipAddress,
      userAgent
    });

    reply.setCookie(SESSION_COOKIE, sessionId, {
      ...COOKIE_OPTS,
      secure: isProd,
      expires: expiresAt
    });

    return {
      user: {
        user_id: user.user_id,
        email: user.email,
        display_name: user.display_name,
        role_code: user.role_code
      }
    };
  });

  fastify.post("/auth/logout", async (request, reply) => {
    const sessionId = request.cookies?.[SESSION_COOKIE];
    if (sessionId) {
      await destroySession(sessionId);
    }
    reply.clearCookie(SESSION_COOKIE, { path: "/" });
    return { ok: true };
  });

  fastify.get("/auth/me", async (request, reply) => {
    const sessionId = request.cookies?.[SESSION_COOKIE];
    if (!sessionId) {
      return reply.code(401).send({ error: "unauthenticated" });
    }
    const user = await getSessionUser(sessionId);
    if (!user) {
      reply.clearCookie(SESSION_COOKIE, { path: "/" });
      return reply.code(401).send({ error: "session_expired" });
    }
    return { user };
  });
};

export default authRoutes;
