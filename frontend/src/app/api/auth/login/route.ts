// src/app/api/auth/login/route.ts
import { NextResponse } from "next/server";

const STRAPI_BASE =
  process.env.NEXT_PUBLIC_STRAPI_URL?.replace(/\/$/, "") ||
  "http://localhost:1337";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Aceita tanto { email, password } quanto { identifier, password }
    const identifier = body.identifier || body.email;
    const password = body.password;

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Preencha e-mail e senha." },
        { status: 400 },
      );
    }

    // Strapi login: /api/auth/local com { identifier, password }
    const strapiRes = await fetch(`${STRAPI_BASE}/api/auth/local`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    });

    let data: any = null;
    let rawText: string | null = null;

    try {
      const ct = strapiRes.headers.get("content-type") ?? "";
      if (ct.includes("application/json")) {
        data = await strapiRes.json();
      } else {
        rawText = await strapiRes.text();
      }
    } catch (e) {
      console.error("Falha ao ler resposta do Strapi (login)", e);
    }

    if (!strapiRes.ok) {
      const msgFromStrapi =
        data?.error?.message ||
        data?.message ||
        rawText ||
        "Não foi possível fazer login. Verifique e-mail e senha.";

      console.error("Erro Strapi /auth/local (login):", data || rawText);

      return NextResponse.json(
        { error: msgFromStrapi },
        { status: strapiRes.status || 401 },
      );
    }

    const jwt = data?.jwt as string | undefined;
    const user = data?.user;

    if (!jwt || !user) {
      console.error("Resposta inesperada do Strapi no login:", data);
      return NextResponse.json(
        { error: "Resposta inesperada do servidor de autenticação." },
        { status: 500 },
      );
    }

    // Resposta para o front
    const res = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    });

    // Cookie com o token JWT
    res.cookies.set("lojinha_token", jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 dias
    });

    // Cookie "leve" com dados básicos do usuário (pra Minha Conta / header)
    res.cookies.set(
      "lojinha_user",
      JSON.stringify({
        id: user.id,
        email: user.email,
        username: user.username,
      }),
      {
        httpOnly: false,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      },
    );

    return res;
  } catch (err) {
    console.error("Erro /api/auth/login", err);
    return NextResponse.json(
      { error: "Erro interno ao fazer login." },
      { status: 500 },
    );
  }
}
