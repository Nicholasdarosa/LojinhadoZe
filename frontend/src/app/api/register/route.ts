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

    const strapiRes = await fetch(`${STRAPI_BASE}/api/auth/local/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await strapiRes.json();

    if (!strapiRes.ok) {
      const msg =
        data?.error?.message ||
        data?.message ||
        "Não foi possível criar a conta.";
      return NextResponse.json({ error: msg }, { status: 400 });
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

    res.cookies.set("lojinha_token", jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

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
