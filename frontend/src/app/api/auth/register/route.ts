// src/app/api/auth/register/route.ts
import { NextResponse } from "next/server";

const STRAPI_BASE =
  process.env.NEXT_PUBLIC_STRAPI_URL?.replace(/\/$/, "") ||
  "http://localhost:1337";

export async function POST(req: Request) {
  try {
    const { username, email, password } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "Preencha nome, e-mail e senha." },
        { status: 400 },
      );
    }

    // Chama o Strapi
    const strapiRes = await fetch(`${STRAPI_BASE}/api/auth/local/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
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
      console.error("Falha ao ler resposta do Strapi (register)", e);
    }

    if (!strapiRes.ok) {
      const msgFromStrapi =
        data?.error?.message ||
        data?.message ||
        rawText ||
        "Não foi possível criar a conta.";

      console.error("Erro Strapi /auth/local/register:", data || rawText);

      return NextResponse.json(
        { error: msgFromStrapi },
        { status: strapiRes.status || 400 },
      );
    }

    // Sucesso: pega jwt + user
    const jwt = data?.jwt as string | undefined;
    const user = data?.user;

    if (!jwt || !user) {
      console.error("Resposta inesperada do Strapi no register:", data);
      return NextResponse.json(
        { error: "Resposta inesperada do servidor de autenticação." },
        { status: 500 },
      );
    }

    const res = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    });

    // Cookie com token
    res.cookies.set("lojinha_token", jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 dias
    });

    // Cookie "leve" com dados básicos do user
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
    console.error("Erro /api/auth/register", err);
    return NextResponse.json(
      { error: "Erro interno ao criar conta." },
      { status: 500 },
    );
  }
}
