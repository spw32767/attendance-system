import Fastify, { FastifyInstance } from "fastify";
import fastifyCookie from "@fastify/cookie";
import fastifyCors from "@fastify/cors";
import { pool } from "./db/mysql";
import adminRoutes from "./modules/admin/admin.routes";
import attendanceRoutes from "./modules/attendance/attendance.routes";
import authRoutes from "./modules/auth/auth.routes";
import { authPreHandler } from "./modules/auth/auth.middleware";
import healthRoutes from "./modules/health/health.routes";

export function buildApp(): FastifyInstance {
  const app = Fastify({ logger: true });

  const isProd = process.env.NODE_ENV === "production";
  const corsOrigin =
    process.env.CORS_ORIGIN ||
    (isProd ? false : "http://localhost:5173");

  app.register(fastifyCors, {
    origin: corsOrigin,
    credentials: true
  });

  app.register(fastifyCookie);

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
