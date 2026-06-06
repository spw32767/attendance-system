import bcrypt from "bcryptjs";
import { RowDataPacket } from "mysql2/promise";
import { pool } from "../../db/mysql";
import { newSessionId } from "../../lib/tokens";

type AnyRow = RowDataPacket & { [key: string]: any };

export const BCRYPT_COST = 12;
export const PASSWORD_MIN_LENGTH = 8;
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const VALID_ROLES = new Set(["super_admin", "admin", "staff", "scanner"]);

export type AuthUser = {
  user_id: number;
  email: string;
  display_name: string;
  role_code: string;
  is_active: boolean;
  allow_local_login: boolean;
  password_hash: string | null;
};

export type SessionUser = {
  user_id: number;
  email: string;
  display_name: string;
  role_code: string;
};

/** SESSION_TTL_MS: 7 days. */
export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export const findUserByEmail = async (email: string): Promise<AuthUser | null> => {
  const [rows] = await pool.query<AnyRow[]>(
    `
      SELECT user_id, email, display_name, role_code, is_active, allow_local_login, password_hash
      FROM auth_users
      WHERE email = ?
        AND deleted_at IS NULL
      LIMIT 1
    `,
    [email]
  );
  if (rows.length === 0) {
    return null;
  }
  const row = rows[0];
  return {
    user_id: Number(row.user_id),
    email: row.email,
    display_name: row.display_name,
    role_code: row.role_code,
    is_active: Boolean(row.is_active),
    allow_local_login: Boolean(row.allow_local_login),
    password_hash: row.password_hash || null
  };
};

export const createSession = async (
  userId: number,
  meta: { userAgent?: string | null; ipAddress?: string | null } = {}
): Promise<{ sessionId: string; expiresAt: Date }> => {
  const sessionId = newSessionId();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await pool.execute(
    `
      INSERT INTO auth_sessions (session_id, user_id, expires_at, user_agent, ip_address)
      VALUES (?, ?, ?, ?, ?)
    `,
    [
      sessionId,
      userId,
      expiresAt,
      meta.userAgent ? meta.userAgent.slice(0, 512) : null,
      meta.ipAddress ? meta.ipAddress.slice(0, 64) : null
    ]
  );
  await pool.execute(
    `UPDATE auth_users SET last_login_at = NOW() WHERE user_id = ?`,
    [userId]
  );
  return { sessionId, expiresAt };
};

export const destroySession = async (sessionId: string): Promise<void> => {
  await pool.execute(`DELETE FROM auth_sessions WHERE session_id = ?`, [sessionId]);
};

export const getSessionUser = async (sessionId: string): Promise<SessionUser | null> => {
  const [rows] = await pool.query<AnyRow[]>(
    `
      SELECT u.user_id, u.email, u.display_name, u.role_code
      FROM auth_sessions s
      INNER JOIN auth_users u ON u.user_id = s.user_id
      WHERE s.session_id = ?
        AND s.expires_at > NOW()
        AND u.is_active = 1
        AND u.deleted_at IS NULL
      LIMIT 1
    `,
    [sessionId]
  );
  if (rows.length === 0) {
    return null;
  }
  const row = rows[0];
  return {
    user_id: Number(row.user_id),
    email: row.email,
    display_name: row.display_name,
    role_code: row.role_code
  };
};

export type CreateUserInput = {
  email: string;
  display_name: string;
  role_code: string;
  password: string;
  first_name?: string | null;
  last_name?: string | null;
  allow_local_login?: boolean;
  allow_sso_login?: boolean;
};

export type CreateUserError =
  | "invalid_email"
  | "invalid_role"
  | "weak_password"
  | "missing_display_name"
  | "email_taken";

export const createUser = async (
  input: CreateUserInput
): Promise<{ ok: false; reason: CreateUserError } | { ok: true; userId: number }> => {
  const email = (input.email || "").trim().toLowerCase();
  const displayName = (input.display_name || "").trim();
  const role = (input.role_code || "").trim();
  const password = input.password || "";

  if (!EMAIL_RE.test(email)) {
    return { ok: false, reason: "invalid_email" };
  }
  if (!displayName) {
    return { ok: false, reason: "missing_display_name" };
  }
  if (!VALID_ROLES.has(role)) {
    return { ok: false, reason: "invalid_role" };
  }
  if (password.length < PASSWORD_MIN_LENGTH) {
    return { ok: false, reason: "weak_password" };
  }

  const [existing] = await pool.query<AnyRow[]>(
    `SELECT user_id FROM auth_users WHERE email = ? LIMIT 1`,
    [email]
  );
  if (existing.length > 0) {
    return { ok: false, reason: "email_taken" };
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_COST);
  const allowLocal = input.allow_local_login !== false;
  const allowSso = input.allow_sso_login === true;

  const [result] = await pool.execute<any>(
    `
      INSERT INTO auth_users
        (email, password_hash, display_name, first_name, last_name,
         role_code, is_active, allow_local_login, allow_sso_login)
      VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)
    `,
    [
      email,
      passwordHash,
      displayName,
      input.first_name || null,
      input.last_name || null,
      role,
      allowLocal ? 1 : 0,
      allowSso ? 1 : 0
    ]
  );

  return { ok: true, userId: Number(result.insertId) };
};

/** Sets a user's password to a new bcrypt hash. Caller must do auth checks. */
export const setUserPassword = async (
  userId: number,
  plaintext: string
): Promise<{ ok: false; reason: "weak_password" | "not_found" } | { ok: true }> => {
  if (!plaintext || plaintext.length < PASSWORD_MIN_LENGTH) {
    return { ok: false, reason: "weak_password" };
  }
  const passwordHash = await bcrypt.hash(plaintext, BCRYPT_COST);
  const [result] = await pool.execute<any>(
    `UPDATE auth_users SET password_hash = ?, allow_local_login = 1 WHERE user_id = ? AND deleted_at IS NULL`,
    [passwordHash, userId]
  );
  if (!result?.affectedRows) {
    return { ok: false, reason: "not_found" };
  }
  return { ok: true };
};

/** True iff the plaintext matches the user's current password. */
export const verifyUserPassword = async (
  userId: number,
  plaintext: string
): Promise<boolean> => {
  const [rows] = await pool.query<AnyRow[]>(
    `SELECT password_hash FROM auth_users WHERE user_id = ? AND deleted_at IS NULL LIMIT 1`,
    [userId]
  );
  const hash = rows[0]?.password_hash;
  if (!hash) {
    return false;
  }
  return bcrypt.compare(plaintext, hash);
};

/**
 * Drop every active session for a user. Call after a password change so
 * old cookies stop working.
 */
export const destroyAllSessionsForUser = async (userId: number): Promise<void> => {
  await pool.execute(`DELETE FROM auth_sessions WHERE user_id = ?`, [userId]);
};

/** Best-effort record of a login attempt for audit. Never throws. */
export const recordLoginAttempt = async (input: {
  identifier: string;
  method: "local" | "sso";
  status: "success" | "failure";
  failureReason?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}): Promise<void> => {
  try {
    await pool.execute(
      `
        INSERT INTO auth_login_logs (
          login_identifier, login_method, login_status,
          failure_reason, ip_address, user_agent
        ) VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        input.identifier.slice(0, 255),
        input.method,
        input.status,
        input.failureReason ? input.failureReason.slice(0, 255) : null,
        input.ipAddress ? input.ipAddress.slice(0, 64) : null,
        input.userAgent ? input.userAgent.slice(0, 512) : null
      ]
    );
  } catch (err) {
    // Audit failure must never break the auth flow.
    // eslint-disable-next-line no-console
    console.error("recordLoginAttempt failed", err);
  }
};
