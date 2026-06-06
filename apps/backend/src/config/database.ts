import { env } from "./env";

export const databaseConfig = {
  host: env.dbHost,
  port: env.dbPort,
  user: env.dbUser,
  password: env.dbPassword,
  database: env.dbName,
  connectionLimit: env.dbConnectionLimit,
  // Remote MySQL hosts (shared / managed) often kill idle TCP connections
  // after a few minutes. Pooled connections then surface as ECONNRESET on
  // the next query. TCP keepalive keeps the socket warm so the server
  // doesn't drop it; the timeouts cap any single attempt.
  enableKeepAlive: true,
  keepAliveInitialDelay: 30 * 1000,
  connectTimeout: 20 * 1000,
  waitForConnections: true,
  queueLimit: 0,
  // Return DATE / DATETIME / TIMESTAMP / TIME as raw strings instead of JS
  // Date objects. Avoids a class of timezone bugs where a local date stored
  // by the user (e.g. birth_date 1999-12-31) is read back as 1999-12-30 in
  // a UTC-offset machine. Existing toDateTime() handles string inputs.
  dateStrings: true
};
