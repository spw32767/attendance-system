/**
 * One-shot helper: hash a plaintext password and store it on a user row.
 * Usage:
 *   npx tsx src/db/setAdminPassword.ts <email> <new-password>
 *
 * Used to reset a known password during local development.
 */
import bcrypt from "bcryptjs";
import { pool } from "./mysql";

const main = async () => {
  const email = process.argv[2];
  const plaintext = process.argv[3];
  if (!email || !plaintext) {
    // eslint-disable-next-line no-console
    console.error("Usage: tsx setAdminPassword.ts <email> <new-password>");
    process.exit(1);
  }

  const hash = await bcrypt.hash(plaintext, 12);
  const [result]: any = await pool.execute(
    `UPDATE auth_users SET password_hash = ? WHERE email = ? AND deleted_at IS NULL`,
    [hash, email]
  );

  // eslint-disable-next-line no-console
  console.log(`Updated ${result?.affectedRows ?? 0} row(s) for ${email}.`);
  await pool.end();
};

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Failed:", err);
  pool.end().finally(() => process.exit(1));
});
