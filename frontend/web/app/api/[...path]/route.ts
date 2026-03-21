import { NextResponse, type NextRequest } from "next/server";

import { getApiBaseUrl } from "../../../lib/env";

type Params = { path: string[] };

function buildTargetUrl(req: NextRequest, prefix: string, pathParts: string[]) {
  const base = getApiBaseUrl().replace(/\/$/, "");
  const path = pathParts.map(encodeURIComponent).join("/");
  const url = new URL(`${base}/${prefix}/${path}`);

  // Preserve query string
  const incoming = new URL(req.url);
  incoming.searchParams.forEach((value, key) => url.searchParams.append(key, value));

  return url;
}

async function proxy(req: NextRequest, prefix: string, pathParts: string[]) {
  const targetUrl = buildTargetUrl(req, prefix, pathParts);

  const headers = new Headers(req.headers);
  // The Host header can confuse upstream servers.
  headers.delete("host");
  // Never forward browser cookies to the backend.
  headers.delete("cookie");

  // If client didn't send Authorization, attach it from our httpOnly cookie.
  if (!headers.get("authorization")) {
    const token = req.cookies.get("cp_token")?.value;
    if (token) headers.set("authorization", `Bearer ${token}`);
  }

  const method = req.method.toUpperCase();
  const bodyText = method === "GET" || method === "HEAD" ? undefined : await req.text();

  let upstream: Response;
  try {
    upstream = await fetch(targetUrl, {
      method,
      headers,
      body: bodyText && bodyText.length > 0 ? bodyText : undefined,
      cache: "no-store",
    });
  } catch (err) {
    // Connection refused or DNS failure — backend is unreachable
    const msg = err instanceof Error ? err.message : "Backend unreachable";
    console.error(`[Proxy] Failed to reach ${targetUrl}:`, msg);
    return NextResponse.json(
      { error: { code: "BACKEND_UNAVAILABLE", message: "The API server is not reachable. Please try again later." } },
      { status: 503 }
    );
  }

  const upstreamBody = await upstream.arrayBuffer();
  const respHeaders = new Headers(upstream.headers);
  // Avoid returning compressed encoding that Next might not re-encode.
  respHeaders.delete("content-encoding");

  return new NextResponse(upstreamBody, {
    status: upstream.status,
    headers: respHeaders,
  });
}

export async function GET(req: NextRequest, ctx: { params: Promise<Params> }) {
  const { path } = await ctx.params;
  return proxy(req, "api", path);
}

export async function POST(req: NextRequest, ctx: { params: Promise<Params> }) {
  const { path } = await ctx.params;
  return proxy(req, "api", path);
}

export async function PUT(req: NextRequest, ctx: { params: Promise<Params> }) {
  const { path } = await ctx.params;
  return proxy(req, "api", path);
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<Params> }) {
  const { path } = await ctx.params;
  return proxy(req, "api", path);
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<Params> }) {
  const { path } = await ctx.params;
  return proxy(req, "api", path);
}
