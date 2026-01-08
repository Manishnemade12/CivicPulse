import { NextResponse, type NextRequest } from "next/server";

import { getApiBaseUrl } from "../../../lib/env";

type Params = { path: string[] };

function buildTargetUrl(req: NextRequest, prefix: string, pathParts: string[]) {
  const base = getApiBaseUrl().replace(/\/$/, "");
  const path = pathParts.map(encodeURIComponent).join("/");
  const url = new URL(`${base}/${prefix}/${path}`);

  const incoming = new URL(req.url);
  incoming.searchParams.forEach((value, key) => url.searchParams.append(key, value));

  return url;
}

async function proxy(req: NextRequest, prefix: string, pathParts: string[]) {
  const targetUrl = buildTargetUrl(req, prefix, pathParts);

  const headers = new Headers(req.headers);
  headers.delete("host");

  const upstream = await fetch(targetUrl, {
    method: req.method,
    headers,
    cache: "no-store",
  });

  const upstreamBody = await upstream.arrayBuffer();
  const respHeaders = new Headers(upstream.headers);
  respHeaders.delete("content-encoding");

  return new NextResponse(upstreamBody, {
    status: upstream.status,
    headers: respHeaders,
  });
}

export async function GET(req: NextRequest, ctx: { params: Promise<Params> }) {
  const { path } = await ctx.params;
  return proxy(req, "actuator", path);
}
