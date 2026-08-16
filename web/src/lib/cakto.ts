const DEFAULT_BASE = "https://api.cakto.com.br/public_api";

type TokenCache = { accessToken: string; expiresAt: number };

let tokenCache: TokenCache | null = null;

function apiBase() {
  return (process.env.CAKTO_API_BASE || DEFAULT_BASE).replace(/\/$/, "");
}

export async function caktoGetToken() {
  const now = Date.now();
  if (tokenCache && tokenCache.expiresAt > now + 60_000) {
    return tokenCache.accessToken;
  }
  const clientId = process.env.CAKTO_CLIENT_ID;
  const clientSecret = process.env.CAKTO_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("CAKTO_CLIENT_ID / CAKTO_CLIENT_SECRET não configurados");
  }

  const res = await fetch(`${apiBase()}/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });
  const data = (await res.json().catch(() => ({}))) as {
    access_token?: string;
    expires_in?: number;
    error?: string;
  };
  if (!res.ok || !data.access_token) {
    throw new Error(`Cakto auth falhou: ${res.status} ${data.error || JSON.stringify(data)}`);
  }
  const ttl = Number(data.expires_in || 36000) * 1000;
  tokenCache = { accessToken: data.access_token, expiresAt: now + ttl };
  return data.access_token;
}

async function caktoFetch(path: string, init: RequestInit = {}) {
  const token = await caktoGetToken();
  const url = path.startsWith("http") ? path : `${apiBase()}${path.startsWith("/") ? "" : "/"}${path}`;
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(url, { ...init, headers });
  const text = await res.text();
  let json: unknown = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }
  if (!res.ok) {
    throw new Error(`Cakto ${init.method || "GET"} ${path} → ${res.status}: ${text.slice(0, 800)}`);
  }
  return json;
}

export function caktoGet<T = unknown>(path: string) {
  return caktoFetch(path) as Promise<T>;
}

export function caktoPost<T = unknown>(path: string, body: unknown) {
  return caktoFetch(path, { method: "POST", body: JSON.stringify(body) }) as Promise<T>;
}

export function payUrlForOffer(offerId: string) {
  return `https://pay.cakto.com.br/${offerId}`;
}
