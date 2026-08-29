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

const DECODED_RESPONSE_HEADERS = new Set([
  "content-encoding",
  "content-length",
  "transfer-encoding",
]);

function backendUrl(path: string[], search: string): string {
  return `${API_BACKEND_URL}/${path.join("/")}${search}`;
}

function rewriteSetCookie(cookie: string): string {
  return cookie.replace(/;\s*Domain=[^;]*/gi, "");
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
    if (HOP_BY_HOP.has(lower) || lower === "accept-encoding") return;
    outgoing[key] = value;
  });
  outgoing["accept-encoding"] = "identity";

  const method = req.method.toUpperCase();
  const hasBody = method !== "GET" && method !== "HEAD";
  const body = hasBody ? Buffer.from(await req.arrayBuffer()) : undefined;
  if (body) {
    outgoing["content-length"] = String(body.length);
  }

  const upstream = await proxyToBackend({
    target,
    method,
    headers: outgoing,
    body,
  });

  const out = new Headers();
  for (const [key, value] of Object.entries(upstream.headers)) {
    const lower = key.toLowerCase();
    if (lower === "set-cookie") continue;
    if (HOP_BY_HOP.has(lower) || DECODED_RESPONSE_HEADERS.has(lower)) continue;
    const serialized = headerValue(value);
    if (serialized) out.set(key, serialized);
  }

  for (const cookie of collectSetCookies(upstream.headers)) {
    out.append("set-cookie", rewriteSetCookie(cookie));
  }

  return new NextResponse(new Uint8Array(upstream.body), {
    status: upstream.statusCode,
    headers: out,
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const OPTIONS = proxy;
export const HEAD = proxy;
