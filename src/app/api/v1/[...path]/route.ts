import http from "node:http";
import https from "node:https";
import { IncomingHttpHeaders } from "node:http";
import { URL } from "node:url";
import { NextRequest, NextResponse } from "next/server";
import { API_BACKEND_URL } from "@/utils/env.utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
  "host",
  "content-length",
]);

/** No reenviar al backend: el proxy no es el mismo recurso que el cliente cacheó. */
const STRIP_REQUEST_HEADERS = new Set([
  ...HOP_BY_HOP,
  "accept-encoding",
  "origin",
  "referer",
  "if-none-match",
  "if-modified-since",
]);

const DECODED_RESPONSE_HEADERS = new Set([
  "content-encoding",
  "content-length",
  "transfer-encoding",
]);

function rewriteSetCookie(raw: string): string {
  return raw.replace(/;\s*Domain=[^;]*/gi, "");
}

/** Dominios donde el backend (o un proxy roto) pudo haber dejado connect.sid inválida. */
const LEGACY_SESSION_COOKIE_DOMAINS = [".cerebiia.com.co", "cerebiia.com.co"];

function clearLegacySessionCookies(response: NextResponse, name: string) {
  const expired =
    "Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; HttpOnly; Secure; SameSite=None";
  for (const domain of LEGACY_SESSION_COOKIE_DOMAINS) {
    response.headers.append(
      "set-cookie",
      `${name}=; Path=/; Domain=${domain}; Expires=${expired}`
    );
  }
}

function collectSetCookies(headers: IncomingHttpHeaders): string[] {
  const raw = headers["set-cookie"];
  if (!raw) return [];
  return Array.isArray(raw) ? raw : [raw];
}

function headerValue(value: string | string[] | undefined): string | null {
  if (value == null) return null;
  return Array.isArray(value) ? value.join(", ") : value;
}

function backendUrl(path: string[], search: string): string {
  return `${API_BACKEND_URL}/${path.join("/")}${search}`;
}

function proxyToBackend(options: {
  target: string;
  method: string;
  headers: Record<string, string>;
  body?: Buffer;
}): Promise<{ statusCode: number; headers: IncomingHttpHeaders; body: Buffer }> {
  const parsed = new URL(options.target);
  const client = parsed.protocol === "https:" ? https : http;

  return new Promise((resolve, reject) => {
    const upstream = client.request(
      {
        protocol: parsed.protocol,
        hostname: parsed.hostname,
        port: parsed.port || undefined,
        path: `${parsed.pathname}${parsed.search}`,
        method: options.method,
        headers: options.headers,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
        res.on("end", () => {
          resolve({
            statusCode: res.statusCode ?? 502,
            headers: res.headers,
            body: Buffer.concat(chunks),
          });
        });
      }
    );

    upstream.on("error", reject);
    if (options.body && options.body.length > 0) {
      upstream.write(options.body);
    }
    upstream.end();
  });
}

async function proxy(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
): Promise<NextResponse> {
  const { path } = await context.params;
  const target = backendUrl(path ?? [], req.nextUrl.search);

  const outgoing: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (STRIP_REQUEST_HEADERS.has(lower)) {
      return;
    }
    outgoing[key] = value;
  });

  outgoing["accept-encoding"] = "identity";
  outgoing["x-forwarded-host"] = req.headers.get("host") ?? "";
  outgoing["x-forwarded-proto"] = req.nextUrl.protocol.replace(":", "");
  outgoing["x-forwarded-for"] =
    req.headers.get("x-forwarded-for") ??
    req.headers.get("x-real-ip") ??
    "";

  const method = req.method.toUpperCase();
  const hasBody = method !== "GET" && method !== "HEAD";
  const body = hasBody ? Buffer.from(await req.arrayBuffer()) : undefined;
  if (body) {
    outgoing["content-length"] = String(body.length);
  }

  let upstream: { statusCode: number; headers: IncomingHttpHeaders; body: Buffer };
  try {
    upstream = await proxyToBackend({
      target,
      method,
      headers: outgoing,
      body,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "upstream unreachable";
    console.error("[api-proxy] upstream error", { target, message });
    return NextResponse.json(
      {
        error: {
          code: "proxy/upstream-unreachable",
          message: "No se pudo conectar con el servidor de datos",
        },
      },
      { status: 502 }
    );
  }

  const out = new Headers();
  for (const [key, value] of Object.entries(upstream.headers)) {
    const lower = key.toLowerCase();
    if (lower === "set-cookie") continue;
    if (HOP_BY_HOP.has(lower) || DECODED_RESPONSE_HEADERS.has(lower)) continue;
    const serialized = headerValue(value);
    if (serialized) out.set(key, serialized);
  }

  const statusCode = upstream.statusCode;
  const response =
    statusCode === 304
      ? new NextResponse(null, { status: 304, headers: out })
      : new NextResponse(new Uint8Array(upstream.body), {
          status: statusCode,
          headers: out,
        });

  // Reenviar Set-Cookie tal cual (sin Domain). No usar cookies.set(): Next
  // vuelve a URL-encodear el valor y express-session queda inválido (s%253A…).
  const upstreamCookies = collectSetCookies(upstream.headers);
  for (const cookie of upstreamCookies) {
    response.headers.append("set-cookie", rewriteSetCookie(cookie));

    const sessionName = cookie.split("=", 1)[0]?.trim();
    if (sessionName === "connect.sid") {
      // Borrar cookies legacy en .cerebiia.com.co: si el navegador las envía
      // junto con la nueva (host-only), express-session falla con 401.
      clearLegacySessionCookies(response, sessionName);
    }
  }

  return response;
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const OPTIONS = proxy;
export const HEAD = proxy;
