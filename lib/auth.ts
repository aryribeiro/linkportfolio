import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWTPayload } from "./types";

const SALT_ROUNDS = 10;

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not configured");
  return secret;
}

function getAdminPassword(): string {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) throw new Error("ADMIN_PASSWORD not configured");
  return password;
}

// ADMIN_PASSWORD env var stores plaintext. We hash it at startup-time
// and compare the user input against that hash (timing-safe via bcrypt).
let cachedHash: string | null = null;

async function getAdminHash(): Promise<string> {
  if (!cachedHash) {
    const adminPassword = getAdminPassword();
    cachedHash = await bcrypt.hash(adminPassword, SALT_ROUNDS);
  }
  return cachedHash;
}

export async function verifyPassword(input: string): Promise<boolean> {
  const hash = await getAdminHash();
  return bcrypt.compare(input, hash);
}

export function generateToken(): string {
  const secret = getJwtSecret();
  const payload: Omit<JWTPayload, "iat" | "exp"> = { authenticated: true };
  return jwt.sign(payload, secret, { expiresIn: "24h" });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const secret = getJwtSecret();
    return jwt.verify(token, secret) as JWTPayload;
  } catch {
    return null;
  }
}
