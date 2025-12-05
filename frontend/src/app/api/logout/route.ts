import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ ok: true });

  // apaga os cookies de auth
  res.cookies.set("lojinha_token", "", {
    maxAge: 0,
    path: "/",
  });

  res.cookies.set("lojinha_user", "", {
    maxAge: 0,
    path: "/",
  });

  return res;
}
