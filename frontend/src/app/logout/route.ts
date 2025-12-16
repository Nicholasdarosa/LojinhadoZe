// src/app/logout/route.ts
import { NextResponse } from "next/server";

const SITE_BASE =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/**
 * GET /logout
 * - Apaga os cookies de autenticação/carrinho
 * - Redireciona para a home
 */
export async function GET() {
  const res = NextResponse.redirect(new URL("/", SITE_BASE));

  // Zera cookies principais da lojinha
  res.cookies.set("lojinha_token", "", {
    path: "/",
    maxAge: 0,
  });

  res.cookies.set("lojinha_user", "", {
    path: "/",
    maxAge: 0,
  });

  // opcional: limpa carrinho também
  res.cookies.set("lojinha_cart", "", {
    path: "/",
    maxAge: 0,
  });

  return res;
}
