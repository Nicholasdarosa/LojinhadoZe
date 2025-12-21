export const runtime = "nodejs";

function pagbankBaseUrl() {
  return process.env.PAGBANK_ENV === "production"
    ? "https://api.pagseguro.com"
    : "https://sandbox.api.pagseguro.com";
}

export async function POST() {
  const token = process.env.PAGBANK_TOKEN!;
  const webhookUrl = process.env.PAGBANK_WEBHOOK_URL!;

  // EXEMPLO: pedido PIX simples (valor em centavos)
  const payload = {
    reference_id: `pedido-${Date.now()}`,
    customer: {
      name: "Cliente Teste",
      email: "cliente@teste.com",
      tax_id: "12345678909",
    },
    items: [
      { name: "Produto Teste", quantity: 1, unit_amount: 500 }, // R$ 5,00
    ],
    qr_codes: [
      {
        amount: { value: 500 },
        expiration_date: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      },
    ],
    notification_urls: [webhookUrl],
  };

  const res = await fetch(`${pagbankBaseUrl()}/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    return Response.json(
      { error: "PagBank error", details: data },
      { status: 400 }
    );
  }

  // Retorna o que o checkout precisa para mostrar o PIX
  const qr = data.qr_codes?.[0];
  return Response.json({
    orderId: data.id,
    referenceId: data.reference_id,
    qrText: qr?.text,
    qrImage: qr?.links?.find((l: any) => l.rel === "QRCODE.PNG")?.href,
    raw: data,
  });
}
