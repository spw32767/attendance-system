import { RowDataPacket } from "mysql2/promise";
import { pool } from "../../db/mysql";
import { newSessionId } from "../../lib/tokens";

type AnyRow = RowDataPacket & { [key: string]: any };

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
