// src/app/api/conta/route.ts
import { NextRequest, NextResponse } from "next/server";

const STRAPI_BASE =
  process.env.NEXT_PUBLIC_STRAPI_URL?.replace(/\/$/, "") ||
  "http://localhost:1337";

// GET /api/conta  -> dados do usuário logado (Nome, Email, CPF, Telefone)
export async function GET(req: NextRequest) {
  const token = req.cookies.get("lojinha_token")?.value;

  if (!token) {
    return NextResponse.json(
      { error: "Usuário não autenticado." },
      { status: 401 },
    );
  }

  // Busca o usuário logado no Strapi
  const meRes = await fetch(`${STRAPI_BASE}/api/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!meRes.ok) {
    const data = await meRes.json().catch(() => null);
    console.error("Erro ao buscar /users/me no Strapi:", data);
    return NextResponse.json(
      { error: "Não foi possível carregar seus dados." },
      { status: meRes.status || 500 },
    );
  }

  const me = await meRes.json();

  return NextResponse.json({
    id: me.id,
    email: me.email,
    username: me.username,
    cpf: me.cpf ?? "",
    telefone: me.telefone ?? "",
  });
}

// PUT /api/conta  -> atualizar CPF/Telefone (Nome/Email não são editáveis)
export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get("lojinha_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Usuário não autenticado." },
        { status: 401 },
      );
    }

    const body = await req.json().catch(() => ({} as any));
    const { cpf, telefone } = body as { cpf?: string; telefone?: string };

    // Busca o usuário logado pra saber o ID
    const meRes = await fetch(`${STRAPI_BASE}/api/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!meRes.ok) {
      const data = await meRes.json().catch(() => null);
      console.error("Erro ao buscar /users/me no Strapi (PUT):", data);
      return NextResponse.json(
        { error: "Não foi possível carregar o usuário para atualização." },
        { status: meRes.status || 500 },
      );
    }

    const me = await meRes.json();

    // Monta payload só com os campos que queremos permitir editar
    const payload: Record<string, any> = {};
    if (typeof cpf === "string") payload.cpf = cpf;
    if (typeof telefone === "string") payload.telefone = telefone;

    // Atualiza o usuário no Strapi
    const updateRes = await fetch(`${STRAPI_BASE}/api/users/${me.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    let updateData: any = null;
    let rawText: string | null = null;

    try {
      const ct = updateRes.headers.get("content-type") ?? "";
      if (ct.includes("application/json")) {
        updateData = await updateRes.json();
      } else {
        rawText = await updateRes.text();
      }
    } catch (e) {
      console.error("Falha ao ler resposta do Strapi (update user)", e);
    }

    if (!updateRes.ok) {
      const msgFromStrapi =
        updateData?.error?.message ||
        updateData?.message ||
        rawText ||
        "Não foi possível salvar seus dados.";

      console.error(
        "Erro Strapi ao atualizar usuário (/users/:id):",
        updateData || rawText,
      );

      return NextResponse.json(
        { error: msgFromStrapi },
        { status: updateRes.status || 400 },
      );
    }

    const updated = updateData;

    return NextResponse.json({
      id: updated.id,
      email: updated.email,
      username: updated.username,
      cpf: updated.cpf ?? "",
      telefone: updated.telefone ?? "",
    });
  } catch (err) {
    console.error("Erro interno em PUT /api/conta:", err);
    return NextResponse.json(
      { error: "Não foi possível salvar seus dados." },
      { status: 500 },
    );
  }
}
