// src/app/api/account/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const STRAPI_BASE =
  process.env.NEXT_PUBLIC_STRAPI_URL?.replace(/\/$/, "") ||
  "http://localhost:1337";

type StrapiUser = {
  id: number;
  username?: string;
  email?: string;
  nome?: string;
  cpf?: string;
  telefone?: string;
  enderecos?: any[];
};

function mapUserToAccount(u: StrapiUser | null) {
  if (!u) return null;

  const enderecosRaw = Array.isArray(u.enderecos) ? u.enderecos : [];

  const enderecos = enderecosRaw.map((e: any) => ({
    id: e.id,
    apelido: e.apelido ?? "",
    cep: e.cep ?? "",
    logradouro: e.logradouro ?? "",
    numero: e.numero ?? "",
    complemento: e.complemento ?? "",
    bairro: e.bairro ?? "",
    cidade: e.cidade ?? "",
    estado: e.estado ?? "",
    principal: !!e.principal,
  }));

  return {
    id: u.id,
    name: u.nome ?? u.username ?? "",
    email: u.email ?? "",
    cpf: u.cpf ?? "",
    phone: u.telefone ?? "",
    enderecos,
  };
}

async function getAuthContext() {
  const store = await cookies();
  const jwt = store.get("lojinha_token")?.value || null;
  const rawUser = store.get("lojinha_user")?.value || null;

  if (!jwt || !rawUser) {
    return { jwt: null, userId: null };
  }

  try {
    const parsed = JSON.parse(rawUser);
    return { jwt, userId: parsed.id as number };
  } catch {
    return { jwt: null, userId: null };
  }
}

/* GET – dados da conta atual */
export async function GET() {
  const { jwt, userId } = await getAuthContext();

  if (!jwt || !userId) {
    return NextResponse.json(
      { error: "Não autenticado." },
      { status: 401 },
    );
  }

  const res = await fetch(
    `${STRAPI_BASE}/api/users/${userId}?populate[enderecos]=*`,
    {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      cache: "no-store",
    },
  );

  if (!res.ok) {
    console.error("Erro ao buscar usuário no Strapi", res.status);
    return NextResponse.json(
      { error: "Não foi possível carregar sua conta." },
      { status: 500 },
    );
  }

  const data = (await res.json()) as StrapiUser;
  return NextResponse.json(mapUserToAccount(data));
}

/* PUT – atualiza dados pessoais + endereços */
export async function PUT(req: Request) {
  const { jwt, userId } = await getAuthContext();

  if (!jwt || !userId) {
    return NextResponse.json(
      { error: "Não autenticado." },
      { status: 401 },
    );
  }

  const body = await req.json().catch(() => ({} as any));

  const name = body.name as string | undefined;
  const cpf = body.cpf as string | undefined;
  const phone = body.phone as string | undefined;

  const addressesInput =
    (body.addresses as any[] | undefined) ??
    (body.enderecos as any[] | undefined);

  const payload: any = {};

  if (typeof name === "string") {
    payload.nome = name;
  }
  if (typeof cpf === "string") {
    payload.cpf = cpf;
  }
  if (typeof phone === "string") {
    payload.telefone = phone;
  }

  if (Array.isArray(addressesInput)) {
    payload.enderecos = addressesInput.map((e) => ({
      id: e.id,
      apelido: e.apelido ?? "",
      cep: e.cep ?? "",
      logradouro: e.logradouro ?? "",
      numero: e.numero ?? "",
      complemento: e.complemento ?? "",
      bairro: e.bairro ?? "",
      cidade: e.cidade ?? "",
      estado: e.estado ?? "",
      principal: !!e.principal,
    }));
  }

  if (Object.keys(payload).length === 0) {
    return NextResponse.json(
      { error: "Nenhum campo válido para atualizar." },
      { status: 400 },
    );
  }

  const res = await fetch(`${STRAPI_BASE}/api/users/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    console.error("Erro ao atualizar usuário no Strapi:", res.status, txt);
    return NextResponse.json(
      { error: "Não foi possível salvar seus dados." },
      { status: 500 },
    );
  }

  const updated = (await res.json()) as StrapiUser;
  return NextResponse.json(mapUserToAccount(updated));
}
