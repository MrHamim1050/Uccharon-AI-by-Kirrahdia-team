// Lightweight guard for public server routes that call paid AI APIs.
// Deters casual scripted abuse by requiring a same-origin browser request:
// the Origin (or Referer) host must match the request's own Host header.
// Not a substitute for auth, but blocks trivial cross-origin/no-origin calls.
export function isSameOriginRequest(request: Request): boolean {
  try {
    const host = request.headers.get("host");
    if (!host) return false;
    const origin = request.headers.get("origin");
    const referer = request.headers.get("referer");
    const source = origin ?? referer;
    if (!source) return false;
    const url = new URL(source);
    return url.host === host;
  } catch {
    return false;
  }
}
