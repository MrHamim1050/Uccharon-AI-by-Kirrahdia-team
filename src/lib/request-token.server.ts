// Short-lived HMAC-signed request token used to gate paid AI endpoints.
// Format: "<ts>.<nonce>.<hex-hmac(sha256, secret, `${ts}.${nonce}`)>"
// A same-origin `GET /api/request-token` mints one; browser sends it back on
// each AI call in the `X-Request-Token` header. Not a substitute for auth,
// but raises the bar for scripted abuse of `LOVABLE_API_KEY` quota.
import { createHmac, timingSafeEqual } from "node:crypto";

const TTL_MS = 10 * 60 * 1000; // 10 minutes
const CLOCK_SKEW_MS = 60 * 1000;

function getSecret(): string {
  const s = process.env.LOVABLE_API_KEY;
  if (!s) throw new Error("Missing signing secret");
  return s;
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

export function mintRequestToken(): string {
  const ts = Date.now().toString();
  const nonce = crypto.randomUUID().replace(/-/g, "");
  const payload = `${ts}.${nonce}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyRequestToken(token: string | null | undefined): boolean {
  if (!token || typeof token !== "string" || token.length > 256) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [ts, nonce, sig] = parts;
  if (!/^[0-9]+$/.test(ts) || !/^[a-f0-9]{16,64}$/.test(nonce) || !/^[a-f0-9]{64}$/.test(sig)) {
    return false;
  }
  const tsNum = Number(ts);
  const age = Date.now() - tsNum;
  if (age > TTL_MS) return false;
  if (age < -CLOCK_SKEW_MS) return false;
  const expected = sign(`${ts}.${nonce}`);
  const a = Buffer.from(sig, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
