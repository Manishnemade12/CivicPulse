import { NextResponse, type NextRequest } from "next/server";

import { getApiBaseUrl } from "@/lib/env";

const COOKIE_NAME = "cp_token";

export async function POST(req: NextRequest) {
  const base = getApiBaseUrl().replace(/\/$/, "");
  const upstreamUrl = new URL(`${base}/api/auth/login`);

  const upstream = await fetch(upstreamUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: await req.text(),
    cache: "no-store",
  });

  const text = await upstream.text();

  if (!upstream.ok) {
    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        "content-type": upstream.headers.get("content-type") ?? "application/json",
      },
    });
  }

  const json = JSON.parse(text) as { token: string };
  const res = NextResponse.json({ ok: true });

  res.cookies.set({
    name: COOKIE_NAME,
    value: json.token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return res;
}
