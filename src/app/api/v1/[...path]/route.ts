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

interface ParsedSetCookie {
  name: string;
  value: string;
  path?: string;
  maxAge?: number;
  expires?: Date;
  httpOnly: boolean;
  secure: boolean;
  sameSite?: "lax" | "strict" | "none";
}

function backendUrl(path: string[], search: string): string {
  return `${API_BACKEND_URL}/${path.join("/")}${search}`;
}

function parseSetCookieHeader(header: string): ParsedSetCookie | null {
  const segments = header.split(";").map((part) => part.trim()).filter(Boolean);
  if (segments.length === 0) return null;

  const eq = segments[0].indexOf("=");
  if (eq <= 0) return null;

  const parsed: ParsedSetCookie = {
    name: segments[0].slice(0, eq),
    value: segments[0].slice(eq + 1),
    httpOnly: false,
    secure: false,
  };

  for (const segment of segments.slice(1)) {
    const attrEq = segment.indexOf("=");
    const key = (attrEq === -1 ? segment : segment.slice(0, attrEq)).toLowerCase();
    const value = attrEq === -1 ? "" : segment.slice(attrEq + 1);

    switch (key) {
      case "path":
        parsed.path = value;
        break;
      case "max-age":
        parsed.maxAge = Number(value);
        break;
      case "expires":
        parsed.expires = new Date(value);
        break;
      case "httponly":
        parsed.httpOnly = true;
        break;
      case "secure":
        parsed.secure = true;
        break;
      case "samesite":
        parsed.sameSite = value.toLowerCase() as ParsedSetCookie["sameSite"];
        break;
      default:
        break;
    }
  }

  return parsed;
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

function applySetCookie(response: NextResponse, raw: string) {
  const parsed = parseSetCookieHeader(raw);
  if (!parsed) return;

  const isHostPrefixed = parsed.name.startsWith("__Host-");
  const isSecurePrefixed = parsed.name.startsWith("__Secure-");

  response.cookies.set(parsed.name, parsed.value, {
    // Path=/ garantiza que el navegador envíe la cookie a /api/v1/*
    path: isHostPrefixed ? "/" : "/",
    httpOnly: parsed.httpOnly,
    secure: parsed.secure || isHostPrefixed || isSecurePrefixed || true,
    sameSite: parsed.sameSite ?? "lax",
    ...(parsed.maxAge !== undefined && Number.isFinite(parsed.maxAge)
      ? { maxAge: parsed.maxAge }
      : {}),
    ...(parsed.expires ? { expires: parsed.expires } : {}),
  });
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
    if (
      HOP_BY_HOP.has(lower) ||
      lower === "accept-encoding" ||
      lower === "origin" ||
      lower === "referer"
    ) {
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

  const response = new NextResponse(new Uint8Array(upstream.body), {
    status: upstream.statusCode,
    headers: out,
  });

  for (const cookie of collectSetCookies(upstream.headers)) {
    applySetCookie(response, cookie);
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
