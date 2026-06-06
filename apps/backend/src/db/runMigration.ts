/**
 * One-shot migration runner. Usage:
 *   npx tsx apps/backend/src/db/runMigration.ts apps/backend/src/db/migrations/002_auth_sessions.sql
 *
 * Splits the file on semicolons (naive but fine for these schemas — no
 * stored-proc DELIMITER hijinks), executes each statement, and exits.
 */
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pool } from "./mysql";

const main = async () => {
  const file = process.argv[2];
  if (!file) {
    // eslint-disable-next-line no-console
    console.error("Usage: tsx runMigration.ts <path-to-sql-file>");
    process.exit(1);
  }

  const sql = await readFile(resolve(process.cwd(), file), "utf8");
  // Strip line comments (-- ...) first so an opening comment doesn't make
  // the whole statement look like a comment.
  const cleaned = sql
    .split("\n")
    .map((line) => (line.trimStart().startsWith("--") ? "" : line))
    .join("\n");
  const statements = cleaned
    .split(/;\s*$/m)
    .map((statement) => statement.trim())
    .filter((statement) => statement.length > 0);

  // eslint-disable-next-line no-console
  console.log(`Applying ${statements.length} statement(s) from ${file}...`);

  for (const statement of statements) {
    await pool.query(statement);
  }

  // eslint-disable-next-line no-console
  console.log("Migration applied.");
  await pool.end();
};

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Migration failed:", err);
  pool.end().finally(() => process.exit(1));
});
