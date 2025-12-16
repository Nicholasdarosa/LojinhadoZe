// src/app/api/cart/shipping-quote/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const CART_COOKIE_KEY = "lojinha_cart";

type RawCartItem = {
  productId: number;
  quantity: number;
};

function parseCart(raw: string | undefined | null): RawCartItem[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as RawCartItem[];
    return [];
  } catch {
    return [];
  }
}

export async function POST(req: Request) {
  // 👇 aqui estava o erro: precisa de await
  const cookieStore = await cookies();
  const rawCart = cookieStore.get(CART_COOKIE_KEY)?.value;
  const cart = parseCart(rawCart);

  // se algum dia quiser usar peso/valor por item, já tem o cart aqui
  // console.log("cart para cálculo de frete:", cart);

  const body = await req.json().catch(() => null);
  const cep = body?.cep?.toString().trim() ?? "";

  if (!cep) {
    return NextResponse.json(
      { error: "CEP é obrigatório." },
      { status: 400 },
    );
  }

  // Mock de serviços de frete — mesma ideia que já aparece no layout
  const services = [
    {
      id: "correios-pac",
      name: "Correios - PAC",
      price: 23.9,
      deadline: "7 dias úteis",
    },
    {
      id: "correios-sedex",
      name: "Correios - SEDEX",
      price: 37.3,
      deadline: "3 dias úteis",
    },
    {
      id: "transportadora-express",
      name: "Transportadora - Entrega Expressa",
      price: 46.5,
      deadline: "1 dia útil",
    },
  ];

  // No futuro você troca esse mock pela integração real (Melhor Envio, etc.)
  return NextResponse.json({
    cep,
    services,
  });
}
