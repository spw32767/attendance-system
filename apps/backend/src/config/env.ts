import dotenv from "dotenv";

dotenv.config();

function toNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  host: process.env.HOST ?? "0.0.0.0",
  port: toNumber(process.env.PORT, 4000),
  dbHost: process.env.DB_HOST ?? "127.0.0.1",
  dbPort: toNumber(process.env.DB_PORT, 3306),
  dbUser: process.env.DB_USER ?? "root",
  dbPassword: process.env.DB_PASSWORD ?? "",
  dbName: process.env.DB_NAME ?? "drnadech_attendance_system",
  dbConnectionLimit: toNumber(process.env.DB_CONNECTION_LIMIT, 10),
  smtpHost: process.env.SMTP_HOST ?? "",
  smtpPort: toNumber(process.env.SMTP_PORT, 587),
  smtpSecure: (process.env.SMTP_SECURE ?? "false") === "true",
  smtpUser: process.env.SMTP_USER ?? "",
  smtpPassword: process.env.SMTP_PASSWORD ?? "",
  smtpFromEmail: process.env.SMTP_FROM_EMAIL ?? "",
  smtpFromName: process.env.SMTP_FROM_NAME ?? "Attendance System"
};
