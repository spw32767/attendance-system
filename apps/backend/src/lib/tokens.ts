import { randomBytes } from "node:crypto";

/**
 * Cryptographically random session id. 32 bytes hex-encoded (64 chars).
 * Suitable for cookie-based auth tokens.
 */
export const newSessionId = () => randomBytes(32).toString("hex");

/**
 * Cryptographically random share key for public form links.
 * 8 bytes hex-encoded (16 chars). Long enough to resist guessing while
 * keeping URLs short.
 */
export const newShareKey = () => randomBytes(8).toString("hex");
