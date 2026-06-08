/**
 * Tracked migration runner.
 *
 *   npm run migrate            apply every pending migration in order
 *   npm run migrate status     show applied vs pending (no changes applied)
 *   npm run migrate baseline   mark all current files as applied WITHOUT
 *                              running them — use once when adopting this
 *                              runner on a DB that was provisioned by hand
 *   npm run migrate list       print the ordered file list (offline, no DB)
 *
 * Applied versions are recorded in `schema_migrations` (one row per file).
 * Only numbered files (e.g. 001_*.sql, 002_*.sql) are treated as migrations;
 * snapshot dumps like `latest_attendance_system.sql` and the seeds folder are
 * ignored.
 *
 * Note: MySQL auto-commits DDL, so a file that fails partway cannot be fully
 * rolled back. Keep each migration file focused and idempotent where possible.
 */
import { readdir, readFile } from "node:fs/promises";
import * as path from "node:path";
import type { RowDataPacket } from "mysql2";
import { pool } from "./mysql";

const MIGRATIONS_DIR = path.resolve(__dirname, "migrations");
const MIGRATION_FILE = /^\d+.*\.sql$/i;

const log = (...args: unknown[]) => {
  // eslint-disable-next-line no-console
  console.log(...args);
};

/** Numbered .sql migration files, sorted by filename (001, 002, ...). */
const listMigrationFiles = async (): Promise<string[]> => {
  const entries = await readdir(MIGRATIONS_DIR);
  return entries.filter((name) => MIGRATION_FILE.test(name)).sort((a, b) => a.localeCompare(b));
};

/** Split a .sql file into individual statements (line comments stripped). */
const splitStatements = (sql: string): string[] => {
  const cleaned = sql
    .split("\n")
    .map((line) => (line.trimStart().startsWith("--") ? "" : line))
    .join("\n");
  return cleaned
    .split(/;\s*$/m)
    .map((statement) => statement.trim())
    .filter((statement) => statement.length > 0);
};

const ensureTrackingTable = async () => {
  await pool.query(
    `CREATE TABLE IF NOT EXISTS schema_migrations (
       version VARCHAR(255) NOT NULL,
       applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
       PRIMARY KEY (version)
     ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
  );
};

const getAppliedVersions = async (): Promise<Set<string>> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT version FROM schema_migrations`
  );
  return new Set(rows.map((row) => String(row.version)));
};

const recordVersion = async (version: string) => {
  await pool.query(`INSERT INTO schema_migrations (version) VALUES (?)`, [version]);
};

const applyFile = async (file: string) => {
  const sql = await readFile(path.join(MIGRATIONS_DIR, file), "utf8");
  const statements = splitStatements(sql);
  log(`→ applying ${file} (${statements.length} statement(s))`);
  for (const statement of statements) {
    await pool.query(statement);
  }
  await recordVersion(file);
  log(`  done: ${file}`);
};

const cmdList = async () => {
  const files = await listMigrationFiles();
  log(`Migrations in ${MIGRATIONS_DIR}:`);
  files.forEach((file, index) => log(`  ${index + 1}. ${file}`));
};

const cmdStatus = async () => {
  await ensureTrackingTable();
  const [files, applied] = await Promise.all([listMigrationFiles(), getAppliedVersions()]);
  log("version".padEnd(40), "status");
  for (const file of files) {
    log(file.padEnd(40), applied.has(file) ? "applied" : "PENDING");
  }
  const pending = files.filter((file) => !applied.has(file));
  log(`\n${applied.size} applied, ${pending.length} pending.`);
};

const cmdBaseline = async () => {
  await ensureTrackingTable();
  const [files, applied] = await Promise.all([listMigrationFiles(), getAppliedVersions()]);
  const toMark = files.filter((file) => !applied.has(file));
  if (toMark.length === 0) {
    log("Nothing to baseline — every migration is already recorded.");
    return;
  }
  for (const file of toMark) {
    await recordVersion(file);
    log(`baselined (marked applied, not run): ${file}`);
  }
};

const cmdMigrate = async () => {
  await ensureTrackingTable();
  const [files, applied] = await Promise.all([listMigrationFiles(), getAppliedVersions()]);
  const pending = files.filter((file) => !applied.has(file));
  if (pending.length === 0) {
    log("Already up to date — no pending migrations.");
    return;
  }
  log(`Applying ${pending.length} pending migration(s)...`);
  for (const file of pending) {
    await applyFile(file);
  }
  log("All pending migrations applied.");
};

const main = async () => {
  const command = (process.argv[2] || "migrate").toLowerCase();

  // `list` is fully offline — never opens a DB connection.
  if (command === "list") {
    await cmdList();
    return;
  }

  switch (command) {
    case "status":
      await cmdStatus();
      break;
    case "baseline":
      await cmdBaseline();
      break;
    case "migrate":
    case "up":
      await cmdMigrate();
      break;
    default:
      // eslint-disable-next-line no-console
      console.error(`Unknown command "${command}". Use: migrate | status | baseline | list`);
      process.exitCode = 1;
  }
};

main()
  .then(async () => {
    await pool.end();
  })
  .catch(async (err) => {
    // eslint-disable-next-line no-console
    console.error("Migration runner failed:", err);
    await pool.end().catch(() => undefined);
    process.exit(1);
  });
