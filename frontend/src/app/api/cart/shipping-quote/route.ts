// src/app/api/cart/shipping-quote/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const CART_COOKIE_KEY = "lojinha_cart";

type ShippingOption = {
  id: string;
  carrier: string;
  serviceName: string;
  priceCents: number;
  deadlineDays: number;
};

function parseCart(raw: string | undefined) {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as
    | { cep?: string }
    | null;

  const cep = body?.cep?.replace(/\D/g, "") ?? "";

  if (!cep || cep.length < 8) {
    return NextResponse.json(
      { message: "CEP inválido" },
      { status: 400 },
    );
  }

  // Lê o carrinho só para, futuramente, usar peso/dimensões/valor
  const cookieStore = cookies();
  const rawCart = cookieStore.get(CART_COOKIE_KEY)?.value;
  const cart = parseCart(rawCart);

  // TODO: aqui depois você integra com Melhor Envio / Correios de verdade.
  // Por enquanto, vamos simular algumas opções baseadas em CEP só para dev.

  const basePrice = 1990; // 19,90 fictício
  const cepSuffix = Number(cep.slice(-2)) || 0;

  const options: ShippingOption[] = [
    {
      id: "pac",
      carrier: "Correios",
      serviceName: "PAC",
      priceCents: basePrice + cepSuffix * 5,
      deadlineDays: 7,
    },
    {
      id: "sedex",
      carrier: "Correios",
      serviceName: "SEDEX",
      priceCents: basePrice + 1500 + cepSuffix * 3,
      deadlineDays: 3,
    },
    {
      id: "express",
      carrier: "Transportadora",
      serviceName: "Entrega Expressa",
      priceCents: basePrice + 2500 + cepSuffix * 2,
      deadlineDays: 1,
    },
  ];

  return NextResponse.json({
    cep,
    options,
    cartSummary: cart
      ? { id: cart.id, itemsCount: cart.items?.length ?? 0 }
      : null,
  });
}
