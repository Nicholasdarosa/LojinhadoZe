// src/app/api/account/profile/route.ts
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

/* ---------------- CPF helpers ---------------- */

function cleanCpf(raw: string | null | undefined): string {
  return (raw ?? "").replace(/\D/g, "");
}

function isValidCpf(raw: string | null | undefined): boolean {
  const cpf = cleanCpf(raw);

  if (cpf.length !== 11) return false;
  // descarta CPFs com todos os dígitos iguais
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  let soma = 0;

  // 1º dígito verificador
  for (let i = 0; i < 9; i++) {
    soma += Number(cpf[i]) * (10 - i);
  }
  let d1 = (soma * 10) % 11;
  if (d1 === 10) d1 = 0;
  if (d1 !== Number(cpf[9])) return false;

  // 2º dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += Number(cpf[i]) * (11 - i);
  }
  let d2 = (soma * 10) % 11;
  if (d2 === 10) d2 = 0;
  if (d2 !== Number(cpf[10])) return false;

  return true;
}

function formatCpf(raw: string | null | undefined): string {
  const cpf = cleanCpf(raw);
  if (cpf.length !== 11) return raw ?? "";
  return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(
    6,
    9,
  )}-${cpf.slice(9)}`;
}

/**
 * Verifica se o CPF já está sendo usado em OUTRO usuário.
 * Retorna string de erro (mensagem) ou null se estiver liberado.
 */
async function ensureCpfUniqueForUser(
  cpfRaw: string | undefined,
  auth: AuthInfo,
): Promise<string | null> {
  const { user, token } = auth;
  const cpfDigits = cleanCpf(cpfRaw);

  if (!cpfDigits) {
    return "CPF é obrigatório.";
  }

  if (!isValidCpf(cpfDigits)) {
    return "CPF inválido.";
  }

  const qs = new URLSearchParams({
    "filters[cpf][$eq]": cpfDigits,
    "filters[user][id][$ne]": String(user.id),
    "pagination[pageSize]": "1",
  });

  const url = `${STRAPI_BASE}/api/clientes?${qs.toString()}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    console.error(
      "Erro Strapi ao verificar unicidade do CPF:",
      res.status,
      url,
      json,
    );
    return "Não foi possível validar o CPF, tente novamente.";
  }

  const exists = Array.isArray(json?.data) && json.data.length > 0;
  if (exists) {
    return "Este CPF já está cadastrado em outra conta.";
  }

  return null;
}

/* ---------------- idade mínima ---------------- */

function isAdult(dateStr: string): boolean {
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return false;

  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) {
    age--;
  }

  return age >= 18;
}

/* ---------------- cliente <-> Strapi helpers ---------------- */

/**
 * Busca o cliente do Strapi vinculado ao usuário logado.
 * NÃO cria nada aqui, só lê.
 * Sempre pega o mais recente (sort desc).
 */
async function findCliente(auth: AuthInfo) {
  const { user, token } = auth;

  const qs = new URLSearchParams({
    "filters[user][id][$eq]": String(user.id),
    "pagination[pageSize]": "1",
  });
  qs.append("sort[0]", "createdAt:desc");

  const url = `${STRAPI_BASE}/api/clientes?${qs.toString()}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    console.error("Erro Strapi find cliente:", res.status, url, json);
    return null;
  }

  return json?.data?.[0] ?? null;
}

/**
 * Cria um cliente no Strapi para o usuário logado.
 */
async function createCliente(auth: AuthInfo, dataOverride: Partial<any>) {
  const { user, token } = auth;

  const payload = {
    data: {
      user: user.id,
      nomeCompleto: user.username ?? "",
      cpf: "",
      telefone: "",
      dataNascimento: null,
      ...dataOverride,
    },
  };

  const url = `${STRAPI_BASE}/api/clientes`;

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
    console.error("Erro Strapi create cliente:", res.status, url, json);
    throw new Error("Não foi possível salvar seus dados.");
  }

  return json?.data;
}

/**
 * Salva cliente:
 * - se tiver documentId → tenta UPDATE
 * - se não tiver ou der 404 → faz CREATE
 */
async function saveCliente(
  auth: AuthInfo,
  clienteDocumentId: string | null,
  dataOverride: Partial<any>,
) {
  // não existe ainda → cria
  if (!clienteDocumentId) {
    return createCliente(auth, dataOverride);
  }

  const { token } = auth;
  const url = `${STRAPI_BASE}/api/clientes/${clienteDocumentId}`;

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ data: dataOverride }),
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    if (res.status === 404) {
      console.warn(
        "Cliente não encontrado no update (404 com documentId), criando um novo registro...",
        url,
      );
      return createCliente(auth, dataOverride);
    }

    console.error("Erro Strapi update cliente:", res.status, url, json);
    throw new Error("Não foi possível salvar seus dados.");
  }

  return json?.data;
}

/* ---------------- GET /api/account/profile ---------------- */

export async function GET(req: NextRequest) {
  try {
    const auth = getAuthFromRequest(req);
    if (!auth) {
      return NextResponse.json(
        { error: "Não autenticado." },
        { status: 401 },
      );
    }

    const { user } = auth;
    const cliente = await findCliente(auth);
    const attrs = cliente?.attributes ?? cliente ?? {};

    const perfil = {
      id: cliente?.id ?? null, // id numérico, só informativo
      nomeCompleto: attrs.nomeCompleto ?? user.username ?? "",
      email: user.email ?? "",
      cpf: formatCpf(attrs.cpf ?? ""),
      telefone: attrs.telefone ?? "",
      dataNascimento: attrs.dataNascimento ?? null,
    };

    return NextResponse.json({ data: perfil });
  } catch (e) {
    console.error("GET /api/account/profile", e);
    return NextResponse.json(
      { error: "Erro interno." },
      { status: 500 },
    );
  }
}

/* ---------------- POST /api/account/profile ---------------- */

export async function POST(req: NextRequest) {
  try {
    const auth = getAuthFromRequest(req);
    if (!auth) {
      return NextResponse.json(
        { error: "Não autenticado." },
        { status: 401 },
      );
    }

    const { user } = auth;
    const body = await req.json().catch(() => ({} as any));

    const { nomeCompleto, cpf, telefone, dataNascimento } = body as {
      nomeCompleto?: string;
      cpf?: string;
      telefone?: string;
      dataNascimento?: string | null;
    };

    // valida CPF (formato + unicidade)
    const cpfError = await ensureCpfUniqueForUser(cpf, auth);
    if (cpfError) {
      return NextResponse.json(
        { error: cpfError },
        { status: 400 },
      );
    }

    const cpfDigits = cleanCpf(cpf);

    // valida maior de 18 (se veio data)
    if (typeof dataNascimento === "string" && dataNascimento) {
      if (!isAdult(dataNascimento)) {
        return NextResponse.json(
          {
            error:
              "Você precisa ter pelo menos 18 anos para usar a loja.",
          },
          { status: 400 },
        );
      }
    }

    // 1) tenta achar o cliente mais recente
    const existing = await findCliente(auth);
    const existingAttrs = existing?.attributes ?? existing ?? {};

    const dataPayload = {
      user: user.id,
      nomeCompleto:
        typeof nomeCompleto === "string"
          ? nomeCompleto
          : existingAttrs.nomeCompleto ?? user.username ?? "",
      cpf:
        cpfDigits ||
        cleanCpf(existingAttrs.cpf) ||
        "", // sempre salvo sem máscara
      telefone:
        typeof telefone === "string"
          ? telefone
          : existingAttrs.telefone ?? "",
      dataNascimento:
        typeof dataNascimento === "string" || dataNascimento === null
          ? dataNascimento
          : existingAttrs.dataNascimento ?? null,
    };

    // 2) salva (update por documentId ou create)
    const saved = await saveCliente(
      auth,
      existing?.documentId ?? null,
      dataPayload,
    );

    const savedAttrs = saved?.attributes ?? saved ?? {};

    const perfil = {
      id: saved?.id ?? null,
      nomeCompleto:
        savedAttrs.nomeCompleto ?? dataPayload.nomeCompleto ?? "",
      email: user.email ?? "",
      cpf: formatCpf(savedAttrs.cpf ?? dataPayload.cpf ?? ""),
      telefone: savedAttrs.telefone ?? dataPayload.telefone ?? "",
      dataNascimento:
        savedAttrs.dataNascimento ?? dataPayload.dataNascimento ?? null,
    };

    return NextResponse.json({ data: perfil });
  } catch (e) {
    console.error("POST /api/account/profile", e);
    return NextResponse.json(
      { error: "Erro interno ao salvar dados." },
      { status: 500 },
    );
  }
}
