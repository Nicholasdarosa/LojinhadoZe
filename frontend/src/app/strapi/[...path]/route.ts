// src/app/api/strapi/[...path]/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";       // garante Node runtime
export const dynamic = "force-dynamic";

const STRAPI_API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1337/api";
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN || "";

function joinUrl(base: string, parts: string[]) {
  const baseClean = base.replace(/\/+$/, "");
  const path = parts.map(p => p.replace(/^\/+|\/+$/g, "")).join("/");
  return `${baseClean}/${path}`;
}

async function proxy(request: Request, path: string[]) {
  // monta URL destino preservando query string
  const reqUrl = new URL(request.url);
  const targetBase = STRAPI_API; // ex: http://localhost:1337/api
  const targetUrl = new URL(joinUrl(targetBase, path));

  // copia query params
  reqUrl.searchParams.forEach((v, k) => targetUrl.searchParams.set(k, v));

  // headers
  const headers: Record<string, string> = {};
  if (STRAPI_TOKEN) headers["Authorization"] = `Bearer ${STRAPI_TOKEN}`;

  const res = await fetch(targetUrl.toString(), {
    method: "GET",
    headers,
    // não cacheia em dev
    cache: "no-store",
  });

  // retransmite status e body
  const body = await res.arrayBuffer();
  const outHeaders = new Headers(res.headers);
  // CORS/encoding simplificados
  outHeaders.set("Access-Control-Allow-Origin", "*");
  outHeaders.delete("content-encoding");

  return new NextResponse(body, {
    status: res.status,
    statusText: res.statusText,
    headers: outHeaders,
  });
}

export async function GET(
  request: Request,
  ctx: { params: { path?: string[] } }
) {
  const path = ctx.params?.path ?? [];
  if (path.length === 0) {
    return NextResponse.json({ error: "Missing path" }, { status: 400 });
  }
  return proxy(request, path);
}
