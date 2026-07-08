// Client helper: transparently attaches a short-lived request token to
// server calls that gate on `X-Request-Token`. Refreshes on 401/403.

let cached: { token: string; mintedAt: number } | null = null;
const REFRESH_BEFORE_MS = 8 * 60 * 1000; // refresh a bit before the 10-min TTL

async function mintToken(): Promise<string> {
  const res = await fetch("/api/request-token", { method: "GET" });
  if (!res.ok) throw new Error(`Failed to mint request token (${res.status})`);
  const data = (await res.json()) as { token?: string };
  if (!data.token) throw new Error("Missing token");
  cached = { token: data.token, mintedAt: Date.now() };
  return data.token;
}

async function getToken(force = false): Promise<string> {
  if (!force && cached && Date.now() - cached.mintedAt < REFRESH_BEFORE_MS) {
    return cached.token;
  }
  return mintToken();
}

export async function authedFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const doFetch = async (force: boolean) => {
    const token = await getToken(force);
    const headers = new Headers(init.headers ?? {});
    headers.set("X-Request-Token", token);
    return fetch(input, { ...init, headers });
  };
  const res = await doFetch(false);
  if (res.status === 401 || res.status === 403) {
    cached = null;
    return doFetch(true);
  }
  return res;
}
