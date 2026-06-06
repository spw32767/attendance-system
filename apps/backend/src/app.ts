import Fastify, { FastifyInstance } from "fastify";
import fastifyCookie from "@fastify/cookie";
import fastifyCors from "@fastify/cors";
import fastifyRateLimit from "@fastify/rate-limit";
import { pool } from "./db/mysql";
import adminRoutes from "./modules/admin/admin.routes";
import attendanceRoutes from "./modules/attendance/attendance.routes";
import authRoutes from "./modules/auth/auth.routes";
import { authPreHandler } from "./modules/auth/auth.middleware";
import healthRoutes from "./modules/health/health.routes";

/**
 * Parse CORS_ORIGIN env into Fastify's `origin` config.
 *  - empty  -> dev fallback ("http://localhost:5173") or false in prod
 *  - "*"    -> allow any (credentials still required — cookies will be
 *              skipped by the browser; fine for public API testing)
 *  - one or comma-separated origins -> array (Fastify matches exactly)
 */
const resolveCorsOrigin = (isProd: boolean): boolean | string | string[] => {
  const raw = (process.env.CORS_ORIGIN || "").trim();
  if (!raw) {
    return isProd ? false : "http://localhost:5173";
  }
  if (raw === "*") {
    return "*";
  }
  const list = raw
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
  return list.length === 1 ? list[0] : list;
};

export function buildApp(): FastifyInstance {
  const app = Fastify({ logger: true });

  const isProd = process.env.NODE_ENV === "production";

  app.register(fastifyCors, {
    origin: resolveCorsOrigin(isProd),
    credentials: true
  });

  app.register(fastifyCookie);

  // Rate-limit plugin — registered global:false so each route opts in via
  // its `config.rateLimit` block. We currently gate only POST /auth/login.
  app.register(fastifyRateLimit, {
    global: false,
    // The plugin throws a FastifyError with these props; our setErrorHandler
    // below reads `.message`, so we put the Thai text there.
    errorResponseBuilder: (_request, context) => ({
      statusCode: 429,
      error: "Too Many Requests",
      message: `ลองใหม่อีกครั้งใน ${Math.ceil(context.ttl / 1000)} วินาที`
    })
  });

  // Auth gate runs before any route handler. It only blocks /api/admin/*
  // — public form endpoints and /api/auth/* are exempt.
  app.addHook("preHandler", authPreHandler);

  app.setErrorHandler((error, request, reply) => {
    request.log.error({ err: error, url: request.url }, "request failed");

    const statusCode =
      typeof (error as { statusCode?: number }).statusCode === "number"
        ? Number((error as { statusCode?: number }).statusCode)
        : 500;

    const safeMessage =
      statusCode < 500 ? error.message : "เกิดข้อผิดพลาดภายในระบบ";

    reply.code(statusCode).send({ error: safeMessage });
  });

  app.register(healthRoutes);
  app.register(authRoutes, { prefix: "/api" });
  app.register(attendanceRoutes, { prefix: "/api" });
  app.register(adminRoutes, { prefix: "/api" });

  app.addHook("onClose", async () => {
    await pool.end();
  });

  return app;
}
