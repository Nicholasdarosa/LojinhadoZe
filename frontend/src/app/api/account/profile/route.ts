// src/app/api/account/profile/route.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const STRAPI_BASE =
  process.env.NEXT_PUBLIC_STRAPI_URL?.replace(/\/$/, "") ||
  "http://localhost:1337";

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("lojinha_token")?.value || "";
    const userRaw = cookieStore.get("lojinha_user")?.value || "";

    if (!token || !userRaw) {
      return NextResponse.json(
        { error: "Não autenticado." },
        { status: 401 },
      );
    }

    const user = JSON.parse(userRaw);
    const userId = user.id;

    const qs = new URLSearchParams({
      "filters[user][id][$eq]": String(userId),
      "pagination[pageSize]": "1"
    });

    const res = await fetch(
      `${STRAPI_BASE}/api/clientes?${qs.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
        cache: "no-store"
      },
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "Erro ao buscar dados de cliente." },
        { status: 500 },
      );
    }

    const json = await res.json();
    const data = json?.data?.[0] ?? null;

    return NextResponse.json({ data });
  } catch (e) {
    console.error("GET /api/account/profile", e);
    return NextResponse.json(
      { error: "Erro interno." },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nomeCompleto, cpf, telefone, dataNascimento } = body;

    const cookieStore = cookies();
    const token = cookieStore.get("lojinha_token")?.value || "";
    const userRaw = cookieStore.get("lojinha_user")?.value || "";

    if (!token || !userRaw) {
      return NextResponse.json(
        { error: "Não autenticado." },
        { status: 401 },
      );
    }

    const user = JSON.parse(userRaw);
    const userId = user.id;

    // Verifica se já existe cliente para esse user
    const qs = new URLSearchParams({
      "filters[user][id][$eq]": String(userId),
      "pagination[pageSize]": "1"
    });

    const existingRes = await fetch(
      `${STRAPI_BASE}/api/clientes?${qs.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
        cache: "no-store"
      },
    );

    const existingJson = await existingRes.json();
    const existing = existingJson?.data?.[0];

    const payload = {
      data: {
        user: userId,
        nomeCompleto,
        cpf,
        telefone,
        dataNascimento
      },
    };

    let saveRes: Response;

    if (existing) {
      const id = existing.id;
      saveRes = await fetch(`${STRAPI_BASE}/api/clientes/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
    } else {
      saveRes = await fetch(`${STRAPI_BASE}/api/clientes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
    }

    const saveJson = await saveRes.json();

    if (!saveRes.ok) {
      console.error("Erro Strapi cliente:", saveJson);
      return NextResponse.json(
        { error: "Não foi possível salvar seus dados." },
        { status: 400 },
      );
    }

    return NextResponse.json({ data: saveJson.data });
  } catch (e) {
    console.error("POST /api/account/profile", e);
    return NextResponse.json(
      { error: "Erro interno ao salvar dados." },
      { status: 500 },
    );
  }
}
