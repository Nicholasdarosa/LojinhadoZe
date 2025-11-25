// src/app/api/auth/login/route.ts
import { NextResponse } from "next/server";

const STRAPI_BASE =
  process.env.NEXT_PUBLIC_STRAPI_URL?.replace(/\/$/, "") ||
  "http://localhost:1337";

export async function POST(req: Request) {
  try {
    const { identifier, password } = await req.json();

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Informe e-mail e senha." },
        { status: 400 }
      );
    }

    const strapiRes = await fetch(`${STRAPI_BASE}/api/auth/local`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    });

    const data = await strapiRes.json();

    if (!strapiRes.ok) {
      const msg =
        data?.error?.message ||
        data?.message ||
        "Não foi possível fazer login.";
      return NextResponse.json({ error: msg }, { status: 401 });
    }

    const jwt = data.jwt as string;
    const user = data.user;

    const res = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    });

    // Cookie com o token (httpOnly)
    res.cookies.set("lojinha_token", jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 dias
    });

    // Cookie "light" só pra exibir nome no header, etc.
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
