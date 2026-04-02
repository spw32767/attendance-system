import { FastifyPluginAsync } from "fastify";

const attendanceRoutes: FastifyPluginAsync = async (
  fastify
): Promise<void> => {
  fastify.get("/attendance", async () => {
    return {
      data: [],
      total: 0
    };
  });

  fastify.post("/attendance", async (_request, reply) => {
    reply.code(501);
    return {
      message: "Create attendance endpoint is not implemented yet."
    };
  });
};

export default attendanceRoutes;
