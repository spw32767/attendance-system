import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import bcrypt from "bcryptjs";

// Mock the auth data layer so the login route never touches the database.
// (The project's .env points at a real DB — tests must stay offline.)
vi.mock("../src/modules/auth/auth.data", () => ({
  SESSION_TTL_MS: 7 * 24 * 60 * 60 * 1000,
  findUserByEmail: vi.fn(),
  createSession: vi.fn(),
  destroySession: vi.fn(),
  getSessionUser: vi.fn(),
  recordLoginAttempt: vi.fn(async () => {})
}));

import * as authData from "../src/modules/auth/auth.data";
import { buildApp } from "../src/app";

const PASSWORD = "test1234";
let app: ReturnType<typeof buildApp>;
let passwordHash: string;

const activeUser = () => ({
  user_id: 1,
  email: "admin@attendance.local",
  is_active: 1,
  allow_local_login: 1,
  password_hash: passwordHash,
  display_name: "Super Admin",
  role_code: "super_admin"
});

beforeAll(async () => {
  passwordHash = bcrypt.hashSync(PASSWORD, 10);
  app = buildApp();
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

const login = (payload: unknown) =>
  app.inject({ method: "POST", url: "/api/auth/login", payload });

describe("POST /api/auth/login", () => {
  it("returns 400 when email or password is missing", async () => {
    const res = await login({ email: "", password: "" });
    expect(res.statusCode).toBe(400);
  });

  it("returns 401 for an unknown user", async () => {
    vi.mocked(authData.findUserByEmail).mockResolvedValue(null as never);
    const res = await login({ email: "ghost@nowhere.test", password: PASSWORD });
    expect(res.statusCode).toBe(401);
  });

  it("returns 401 when the password does not match", async () => {
    vi.mocked(authData.findUserByEmail).mockResolvedValue(activeUser() as never);
    const res = await login({ email: "admin@attendance.local", password: "wrong-pass" });
    expect(res.statusCode).toBe(401);
  });

  it("returns 200, a session cookie, and the user on valid credentials", async () => {
    vi.mocked(authData.findUserByEmail).mockResolvedValue(activeUser() as never);
    vi.mocked(authData.createSession).mockResolvedValue({
      sessionId: "session-abc",
      expiresAt: new Date(Date.now() + 60 * 60 * 1000)
    } as never);

    const res = await login({ email: "admin@attendance.local", password: PASSWORD });

    expect(res.statusCode).toBe(200);
    const setCookie = res.headers["set-cookie"];
    expect(String(setCookie)).toContain("att_session=");
    expect(res.json().user.role_code).toBe("super_admin");
  });
});
