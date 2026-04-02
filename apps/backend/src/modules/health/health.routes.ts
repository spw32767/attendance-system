import { FastifyPluginAsync } from "fastify";
import { checkDatabaseConnection } from "../../db/mysql";

const healthRoutes: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.get("/health", async () => {
    const dbConnected = await checkDatabaseConnection();

    return {
      status: "ok",
      dbConnected,
      timestamp: new Date().toISOString()
    };
  });
};

export default healthRoutes;
