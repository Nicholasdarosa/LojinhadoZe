import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STRAPI_API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1337/api";
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN || "";

export async function GET(request: Request) {
  const reqUrl = new URL(request.url);
  const target = new URL(`${STRAPI_API}/banners`);
  reqUrl.searchParams.forEach((v, k) => target.searchParams.set(k, v));

  const headers: Record<string, string> = {};
  if (STRAPI_TOKEN) headers.Authorization = `Bearer ${STRAPI_TOKEN}`;

  const res = await fetch(target.toString(), { headers, cache: "no-store" });
  const body = await res.arrayBuffer();

  const out = new Headers(res.headers);
  out.delete("content-encoding");
  out.set("Access-Control-Allow-Origin", "*");

  return new NextResponse(body, { status: res.status, headers: out });
}
