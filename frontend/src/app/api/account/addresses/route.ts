// src/app/api/account/addresses/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const STRAPI_BASE =
  process.env.NEXT_PUBLIC_STRAPI_URL?.replace(/\/$/, "") ||
  "http://localhost:1337";

function getJwt() {
  const cookieStore = cookies();
  return cookieStore.get("lojinha_token")?.value;
}

// Criar endereço
export async function POST(req: Request) {
  const jwt = getJwt();
  if (!jwt) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await req.json();

  const res = await fetch(`${STRAPI_BASE}/api/enderecos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify({ data: body }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => "");
    console.error("Erro criar endereço:", err);
    return NextResponse.json(
      { error: "Não foi possível salvar o endereço." },
      { status: 400 },
    );
  }

  const json = await res.json();
  return NextResponse.json(json.data);
}
