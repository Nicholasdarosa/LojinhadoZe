// src/app/logout/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const res = NextResponse.redirect(new URL("/", request.url));
  const store = await cookies();

  // Zera os cookies de auth
  if (store.get("lojinha_token")) {
    res.cookies.set("lojinha_token", "", {
      path: "/",
      maxAge: 0,
    });
  }

  if (store.get("lojinha_user")) {
    res.cookies.set("lojinha_user", "", {
      path: "/",
      maxAge: 0,
    });
  }

  return res;
}
