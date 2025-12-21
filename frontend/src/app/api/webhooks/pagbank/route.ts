// src/app/api/webhooks/pagbank/route.ts
import crypto from "crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
// Evita cache e garante que o handler execute sempre
export const dynamic = "force-dynamic";

function sha256Hex(input: string) {
  return crypto.createHash("sha256").update(input, "utf8").digest("hex");
}

function safeEqual(a: string, b: string) {
  // timing-safe compare
  const aBuf = Buffer.from(a, "utf8");
  const bBuf = Buffer.from(b, "utf8");
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

function unauthorized(message = "Unauthorized") {
  return new NextResponse(message, {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="pagbank-webhook"' },
  });
}

function badRequest(message = "Bad Request") {
  return NextResponse.json({ ok: false, error: message }, { status: 400 });
}

export async function POST(req: Request) {
  // 1) (Opcional) BasicAuth no webhook
  // Se você setar PAGBANK_WEBHOOK_USER/PASS no env, ele passa a exigir BasicAuth.
  const basicUser = process.env.PAGBANK_WEBHOOK_USER;
  const basicPass = process.env.PAGBANK_WEBHOOK_PASS;

  if (basicUser && basicPass) {
    const auth = req.headers.get("authorization") || "";
    if (!auth.startsWith("Basic ")) return unauthorized();

    const decoded = Buffer.from(auth.slice("Basic ".length), "base64").toString("utf8");
    const idx = decoded.indexOf(":");
    const user = idx >= 0 ? decoded.slice(0, idx) : "";
    const pass = idx >= 0 ? decoded.slice(idx + 1) : "";

    if (user !== basicUser || pass !== basicPass) return unauthorized();
  }

  // 2) Lê o body CRU (precisa ser raw pra validar assinatura)
  const rawBody = await req.text();

  // 3) Valida autenticidade do PagBank (x-authenticity-token)
  // Assinatura esperada: SHA-256( token + "-" + payload )
  const token = process.env.PAGBANK_TOKEN;
  if (!token) return badRequest("Missing PAGBANK_TOKEN env var");

  const receivedSig =
    req.headers.get("x-authenticity-token") ||
    req.headers.get("X-Authenticity-Token") ||
    "";

  if (!receivedSig) return unauthorized("Missing x-authenticity-token");

  const expectedSig = sha256Hex(`${token}-${rawBody}`);

  if (!safeEqual(receivedSig, expectedSig)) {
    return unauthorized("Invalid signature");
  }

  // 4) Parse JSON (PagBank normalmente manda JSON)
  let event: any;
  try {
    event = rawBody ? JSON.parse(rawBody) : null;
  } catch {
    return badRequest("Invalid JSON payload");
  }

  // 5) TODO: atualizar seu pedido local
  // Aqui você precisa mapear o evento do PagBank -> status do seu pedido.
  // Eu deixei só um exemplo de extração defensiva:
  const orderId = event?.id || event?.data?.id || event?.order?.id || null;
  const referenceId = event?.reference_id || event?.data?.reference_id || null;
  const status =
    event?.status ||
    event?.data?.status ||
    event?.charges?.[0]?.status ||
    event?.data?.charges?.[0]?.status ||
    null;

  // Exemplo de log temporário (remova em produção):
  // console.log("[PagBank webhook]", { orderId, referenceId, status });

  // TODO: aqui você faria:
  // await updateOrderPaymentStatus({ orderId, referenceId, status, raw: event });

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return new NextResponse("Method Not Allowed", { status: 405 });
}
