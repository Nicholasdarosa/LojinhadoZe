// src/app/api/payments/pagbank/pix/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function pagbankBaseUrl() {
  return process.env.PAGBANK_ENV === "production"
    ? "https://api.pagseguro.com"
    : "https://sandbox.api.pagseguro.com";
}

function maskToken(token: string) {
  if (!token) return "";
  const head = token.slice(0, 6);
  const tail = token.slice(-4);
  return `${head}…${tail}`;
}

export async function POST() {
  const env = process.env.PAGBANK_ENV || "sandbox";
  const token = process.env.PAGBANK_TOKEN || "";
  const webhookUrl = process.env.PAGBANK_WEBHOOK_URL || "";

  // Logs (não vaza token)
  console.log("[PagBank][PIX] env:", env);
  console.log("[PagBank][PIX] baseUrl:", pagbankBaseUrl());
  console.log("[PagBank][PIX] token length:", token.length);
  console.log("[PagBank][PIX] token preview:", maskToken(token));
  console.log("[PagBank][PIX] webhookUrl:", webhookUrl);

  // Validação de env
  if (!token) {
    return Response.json(
      { error: "Missing env", details: "PAGBANK_TOKEN is not set" },
      { status: 500 }
    );
  }
  if (!webhookUrl) {
    return Response.json(
      { error: "Missing env", details: "PAGBANK_WEBHOOK_URL is not set" },
      { status: 500 }
    );
  }

  // Payload PIX (valor em centavos)
  const amountValue = 500;

  const payload = {
    reference_id: `pedido-${Date.now()}`,
    customer: {
      name: "Cliente Teste",
      email: "cliente@teste.com",
      tax_id: "12345678909",
    },
    items: [{ name: "Produto Teste", quantity: 1, unit_amount: amountValue }],
    qr_codes: [
      {
        amount: { value: amountValue },
        expiration_date: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      },
    ],
    notification_urls: [webhookUrl],
  };

  console.log("[PagBank][PIX] request payload:", {
    reference_id: payload.reference_id,
    itemsCount: payload.items.length,
    amountValue,
    notification_urls: payload.notification_urls,
  });

  const url = `${pagbankBaseUrl()}/orders`;
  console.log("[PagBank][PIX] POST", url);

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch (err: any) {
    console.error("[PagBank][PIX] fetch failed:", err?.message || err);
    return Response.json(
      { error: "Fetch failed", details: err?.message || String(err) },
      { status: 500 }
    );
  }

  const rawText = await res.text();
  console.log("[PagBank][PIX] response status:", res.status);

  // Tenta parsear JSON, mas sem explodir se vier texto
  let data: any = null;
  try {
    data = rawText ? JSON.parse(rawText) : null;
  } catch {
    data = { raw: rawText };
  }

  if (!res.ok) {
    console.error("[PagBank][PIX] error response:", data);
    return Response.json({ error: "PagBank error", details: data }, { status: 400 });
  }

  const qr = data?.qr_codes?.[0] ?? null;
  const qrLinks = Array.isArray(qr?.links) ? qr.links : [];
  const qrImage =
    qrLinks.find((l: any) => l?.rel === "QRCODE.PNG")?.href ||
    qrLinks.find((l: any) => (l?.rel || "").toLowerCase().includes("qrcode"))?.href ||
    null;

  console.log("[PagBank][PIX] created order:", {
    orderId: data?.id,
    referenceId: data?.reference_id,
    hasQrText: Boolean(qr?.text),
    hasQrImage: Boolean(qrImage),
  });

  return Response.json({
    orderId: data.id,
    referenceId: data.reference_id,
    qrText: qr?.text ?? null,
    qrImage,
    raw: data,
  });
}
