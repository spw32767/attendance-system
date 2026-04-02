import { buildApp } from "./app";
import { env } from "./config/env";

async function startServer(): Promise<void> {
  const app = buildApp();

  try {
    await app.listen({ host: env.host, port: env.port });
    app.log.info(`Backend running at http://${env.host}:${env.port}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

void startServer();
