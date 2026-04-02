import Fastify, { FastifyInstance } from "fastify";
import { pool } from "./db/mysql";
import attendanceRoutes from "./modules/attendance/attendance.routes";
import healthRoutes from "./modules/health/health.routes";

export function buildApp(): FastifyInstance {
  const app = Fastify({ logger: true });

  app.register(healthRoutes);
  app.register(attendanceRoutes, { prefix: "/api" });

  app.addHook("onClose", async () => {
    await pool.end();
  });

  return app;
}
