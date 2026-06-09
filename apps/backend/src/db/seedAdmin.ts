/**
 * Create (or reset) the first super_admin from environment variables — for
 * first-time production setup without SSH. Run via Plesk "Run script":
 *
 *   npm run seed:admin
 *
 * Requires env vars (set them as Plesk Node.js custom environment variables,
 * then remove ADMIN_PASSWORD afterwards):
 *   ADMIN_EMAIL      (required)
 *   ADMIN_PASSWORD   (required)
 *   ADMIN_NAME       (optional, default "Administrator")
 *
 * Idempotent: if the email already exists it resets the password + promotes
 * to super_admin + reactivates.
 */
import bcrypt from "bcryptjs";
import { pool } from "./mysql";

const main = async () => {
  const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "";
  const name = (process.env.ADMIN_NAME || "Administrator").trim();

  if (!email || !password) {
    // eslint-disable-next-line no-console
    console.error("Missing env. Set ADMIN_EMAIL and ADMIN_PASSWORD first.");
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 12);
  await pool.execute(
    `INSERT INTO auth_users
       (email, password_hash, display_name, role_code, is_active, allow_local_login, allow_sso_login)
     VALUES (?, ?, ?, 'super_admin', 1, 1, 0)
     ON DUPLICATE KEY UPDATE
       password_hash = VALUES(password_hash),
       display_name = VALUES(display_name),
       role_code = 'super_admin',
       is_active = 1,
       allow_local_login = 1,
       deleted_at = NULL`,
    [email, hash, name]
  );

  // eslint-disable-next-line no-console
  console.log(`super_admin ready: ${email}`);
  await pool.end();
};

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("seed:admin failed:", err);
  pool.end().finally(() => process.exit(1));
});
