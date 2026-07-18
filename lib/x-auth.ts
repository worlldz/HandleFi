import { createHash, createHmac, randomBytes, timingSafeEqual } from "crypto";

export const X_AUTH_STATE_COOKIE = "handlefi_x_state";
export const X_AUTH_VERIFIER_COOKIE = "handlefi_x_verifier";
export const X_USERNAME_COOKIE = "handlefi_x_username";

export function makeCodeVerifier() {
  return base64Url(randomBytes(48));
}

export function makeState() {
  return base64Url(randomBytes(24));
}

export function makeCodeChallenge(verifier: string) {
  return base64Url(createHash("sha256").update(verifier).digest());
}

export function resolveCallbackUrl() {
  return (
    process.env.X_CALLBACK_URL || "http://localhost:3000/api/x/callback"
  );
}

export function makeXIdentityCookie(username: string) {
  const normalized = normalizeUsername(username);
  const signature = signIdentity(normalized);
  return `${normalized}.${signature}`;
}

export function readXIdentityCookie(value?: string) {
  if (!value) return null;

  const separator = value.lastIndexOf(".");
  if (separator <= 0) return null;

  const username = normalizeUsername(value.slice(0, separator));
  const received = value.slice(separator + 1);
  const expected = signIdentity(username);
  const receivedBuffer = Buffer.from(received);
  const expectedBuffer = Buffer.from(expected);

  if (receivedBuffer.length !== expectedBuffer.length) return null;
  return timingSafeEqual(receivedBuffer, expectedBuffer) ? username : null;
}

function signIdentity(username: string) {
  const secret = process.env.SESSION_SECRET || process.env.X_CLIENT_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is missing.");
  return base64Url(createHmac("sha256", secret).update(username).digest());
}

function normalizeUsername(username: string) {
  return username.trim().replace(/^@/, "").toLowerCase();
}

function base64Url(input: Buffer) {
  return input
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}
