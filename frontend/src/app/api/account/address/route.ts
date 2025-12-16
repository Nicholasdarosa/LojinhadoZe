// src/app/api/account/address/route.ts
import { NextRequest, NextResponse } from "next/server";

const STRAPI_BASE =
  process.env.NEXT_PUBLIC_STRAPI_URL?.replace(/\/$/, "") ||
  "http://localhost:1337";

type AuthInfo = {
  token: string;
  user: {
    id: number;
    username?: string;
    email?: string;
  };
};

function getAuthFromRequest(req: NextRequest): AuthInfo | null {
  const token = req.cookies.get("lojinha_token")?.value || "";
  const userRaw = req.cookies.get("lojinha_user")?.value || "";

  if (!token || !userRaw) return null;

  try {
    const user = JSON.parse(userRaw);
    if (!user?.id) return null;
    return { token, user };
  } catch {
    return null;
  }
}

export type AddressDTO = {
  id: number | null;
  documentId: string | null;
  apelido: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  principal: boolean;
};

function mapEnderecoItem(raw: any): AddressDTO {
  const attrs = raw?.attributes ?? raw ?? {};
  return {
    id: raw?.id ?? null,
    documentId: raw?.documentId ?? attrs.documentId ?? null,
    apelido: attrs.apelido ?? "",
    cep: attrs.cep ?? "",
    logradouro: attrs.logradouro ?? "",
    numero: attrs.numero ?? "",
    complemento: attrs.complemento ?? "",
    bairro: attrs.bairro ?? "",
    cidade: attrs.cidade ?? "",
    estado: attrs.estado ?? "",
    principal: Boolean(attrs.principal),
  };
}

/**
 * Lista endereços do usuário logado.
 * Filtro direto no Strapi por user.id.
 */
async function listEnderecos(auth: AuthInfo): Promise<AddressDTO[]> {
  const { user, token } = auth;

  const qs = new URLSearchParams({
    "filters[user][id][$eq]": String(user.id),
    "pagination[pageSize]": "100",
    "sort[0]": "createdAt:asc",
  });

  const url = `${STRAPI_BASE}/api/enderecos?${qs.toString()}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    console.error("Erro Strapi list enderecos:", res.status, url, json);
    return [];
  }

  const items: any[] = json?.data ?? [];
  return items.map(mapEnderecoItem);
}

/**
 * Cria endereço.
 */
async function createEndereco(
  auth: AuthInfo,
  dataOverride: Partial<AddressDTO>,
): Promise<AddressDTO> {
  const { user, token } = auth;

  const payload = {
    data: {
      user: user.id,
      apelido: dataOverride.apelido ?? "",
      cep: dataOverride.cep ?? "",
      logradouro: dataOverride.logradouro ?? "",
      numero: dataOverride.numero ?? "",
      complemento: dataOverride.complemento ?? "",
      bairro: dataOverride.bairro ?? "",
      cidade: dataOverride.cidade ?? "",
      estado: dataOverride.estado ?? "",
      principal: Boolean(dataOverride.principal),
    },
  };

  const url = `${STRAPI_BASE}/api/enderecos`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    console.error("Erro Strapi create endereco:", res.status, url, json);
    throw new Error("Não foi possível salvar o endereço.");
  }

  return mapEnderecoItem(json?.data);
}

/**
 * Atualiza endereço via documentId; se der 404, cria um novo.
 */
async function updateEnderecoWithDocumentId(
  auth: AuthInfo,
  documentId: string,
  dataOverride: Partial<AddressDTO>,
): Promise<AddressDTO> {
  const { token } = auth;

  const payload = {
    data: {
      apelido: dataOverride.apelido,
      cep: dataOverride.cep,
      logradouro: dataOverride.logradouro,
      numero: dataOverride.numero,
      complemento: dataOverride.complemento,
      bairro: dataOverride.bairro,
      cidade: dataOverride.cidade,
      estado: dataOverride.estado,
      principal: dataOverride.principal,
    },
  };

  const url = `${STRAPI_BASE}/api/enderecos/${documentId}`;

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    if (res.status === 404) {
      console.warn(
        "Endereço não encontrado no update (404), criando um novo...",
        url,
      );
      return createEndereco(auth, dataOverride);
    }

    console.error("Erro Strapi update endereco:", res.status, url, json);
    throw new Error("Não foi possível salvar o endereço.");
  }

  return mapEnderecoItem(json?.data);
}

/**
 * Resolve documentId a partir do body (id numérico ou documentId).
 */
async function resolveDocumentIdFromBody(
  auth: AuthInfo,
  body: any,
): Promise<string | null> {
  const explicitDocId =
    typeof body.documentId === "string" && body.documentId.trim()
      ? body.documentId.trim()
      : null;

  if (explicitDocId) return explicitDocId;

  const idRaw = body.id;
  if (idRaw == null) return null;

  const { token } = auth;

  const qs = new URLSearchParams({
    "filters[id][$eq]": String(idRaw),
    "pagination[pageSize]": "1",
  });

  const url = `${STRAPI_BASE}/api/enderecos?${qs.toString()}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    console.error("Erro Strapi lookup endereco por id:", res.status, url, json);
    return null;
  }

  const item = json?.data?.[0];
  return item?.documentId ?? item?.attributes?.documentId ?? null;
}

/**
 * GET /api/account/address
 * -> retorna todos os endereços do usuário logado.
 */
export async function GET(req: NextRequest) {
  try {
    const auth = getAuthFromRequest(req);
    if (!auth) {
      return NextResponse.json(
        { error: "Não autenticado." },
        { status: 401 },
      );
    }

    const enderecos = await listEnderecos(auth);
    return NextResponse.json({ data: enderecos });
  } catch (e) {
    console.error("GET /api/account/address", e);
    return NextResponse.json(
      { error: "Erro interno." },
      { status: 500 },
    );
  }
}

/**
 * POST /api/account/address
 * -> cria ou atualiza um endereço (conforme receber id/documentId).
 */
export async function POST(req: NextRequest) {
  try {
    const auth = getAuthFromRequest(req);
    if (!auth) {
      return NextResponse.json(
        { error: "Não autenticado." },
        { status: 401 },
      );
    }

    const body = await req.json().catch(() => ({} as any));

    const addressPayload: Partial<AddressDTO> = {
      apelido: body.apelido ?? "",
      cep: body.cep ?? "",
      logradouro: body.logradouro ?? "",
      numero: body.numero ?? "",
      complemento: body.complemento ?? "",
      bairro: body.bairro ?? "",
      cidade: body.cidade ?? "",
      estado: body.estado ?? "",
      principal: Boolean(body.principal),
    };

    const documentId = await resolveDocumentIdFromBody(auth, body);

    const saved = documentId
      ? await updateEnderecoWithDocumentId(auth, documentId, addressPayload)
      : await createEndereco(auth, addressPayload);

    return NextResponse.json({ data: saved });
  } catch (e) {
    console.error("POST /api/account/address", e);
    return NextResponse.json(
      { error: "Erro interno ao salvar endereço." },
      { status: 500 },
    );
  }
}
