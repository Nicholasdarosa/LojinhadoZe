import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const STRAPI_BASE =
  process.env.NEXT_PUBLIC_STRAPI_URL?.replace(/\/$/, "") ||
  "http://localhost:1337";

type CartItem = {
  productId: number;
  slug: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
};

type Cart = {
  items: CartItem[];
};

function parseCart(raw: string | undefined | null): Cart {
  if (!raw) return { items: [] };

  try {
    const obj = JSON.parse(raw);
    if (!Array.isArray(obj.items)) return { items: [] };

    return {
      items: obj.items.map((it: any) => ({
        productId: Number(it.productId),
        slug: String(it.slug ?? ""),
        name: String(it.name ?? ""),
        price: Number(it.price ?? 0),
        image: it.image ? String(it.image) : undefined,
        quantity: Number(it.quantity ?? 1) || 1,
      })),
    };
  } catch {
    return { items: [] };
  }
}

function computeSubtotal(cart: Cart): number {
  return cart.items.reduce((acc, it) => acc + it.price * it.quantity, 0);
}

function createCartResponse(cart: Cart) {
  const payload = {
    items: cart.items,
    subtotal: computeSubtotal(cart),
  };

  const res = NextResponse.json(payload);

  // persiste o cookie do carrinho (7 dias)
  res.cookies.set("lojinha_cart", JSON.stringify(cart), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return res;
}

// GET → retorna carrinho atual
export async function GET(_request: Request) {
  const store = await cookies();
  const raw = store.get("lojinha_cart")?.value;
  const cart = parseCart(raw);

  return NextResponse.json({
    items: cart.items,
    subtotal: computeSubtotal(cart),
  });
}

// POST → adiciona item ao carrinho
// body: { productId, slug, quantity? }
export async function POST(request: Request) {
  const store = await cookies();
  const jwt = store.get("lojinha_token")?.value;

  // força login pra ter carrinho vinculado ao usuário
  if (!jwt) {
    return NextResponse.json(
      { error: "Não autenticado." },
      { status: 401 },
    );
  }

  const rawCart = store.get("lojinha_cart")?.value;
  const cart = parseCart(rawCart);

  const body = await request.json().catch(() => ({}));
  const slug = typeof body.slug === "string" ? body.slug : "";
  const qty = Number(body.quantity ?? 1) || 1;

  if (!slug) {
    return NextResponse.json(
      { error: "slug obrigatório." },
      { status: 400 },
    );
  }

  // usa a rota POR SLUG, que a gente já sabe que funciona
  const encodedSlug = encodeURIComponent(slug);
  const qs = new URLSearchParams({
    "populate[galeria][fields]": "url",
  });

  const strapiRes = await fetch(
    `${STRAPI_BASE}/api/produtos/slug/${encodedSlug}?${qs.toString()}`,
    { cache: "no-store" },
  );

  if (!strapiRes.ok) {
    return NextResponse.json(
      { error: "Produto não encontrado." },
      { status: 404 },
    );
  }

  const json = await strapiRes.json();
  const d = json?.data;
  const a = d?.attributes ?? d ?? {};

  const productIdNum = Number(d?.id ?? 0);

  const preco = (() => {
    const v = a.preco;
    if (v == null) return 0;
    const n = typeof v === "string" ? Number(v.replace(",", ".")) : Number(v);
    return Number.isFinite(n) ? n : 0;
  })();

  // imagem principal
  const galeria = a.galeria?.data ?? a.galeria ?? [];
  let imageUrl: string | undefined;
  if (Array.isArray(galeria) && galeria[0]) {
    const attr = galeria[0].attributes ?? galeria[0];
    imageUrl = attr?.url;
  }

  const existingIndex = cart.items.findIndex(
    (it) => it.productId === productIdNum,
  );

  if (existingIndex >= 0) {
    cart.items[existingIndex].quantity += qty;
  } else {
    cart.items.push({
      productId: productIdNum,
      slug: a.slug ?? slug,
      name: a.nome ?? "Produto",
      price: preco,
      image: imageUrl,
      quantity: qty,
    });
  }

  return createCartResponse(cart);
}

// PATCH → atualiza quantidade de um item
// body: { productId, quantity }
export async function PATCH(request: Request) {
  const store = await cookies();
  const rawCart = store.get("lojinha_cart")?.value;
  const cart = parseCart(rawCart);

  const body = await request.json().catch(() => ({}));
  const productIdNum = Number(body.productId);
  const newQty = Number(body.quantity);

  if (!Number.isFinite(productIdNum)) {
    return NextResponse.json(
      { error: "productId inválido." },
      { status: 400 },
    );
  }

  const idx = cart.items.findIndex((it) => it.productId === productIdNum);
  if (idx < 0) {
    return NextResponse.json(
      { error: "Item não encontrado no carrinho." },
      { status: 404 },
    );
  }

  if (!Number.isFinite(newQty) || newQty <= 0) {
    // remove o item se quantidade <= 0
    cart.items.splice(idx, 1);
  } else {
    cart.items[idx].quantity = newQty;
  }

  return createCartResponse(cart);
}

// DELETE → limpa carrinho ou remove item
// body opcional: { productId }
export async function DELETE(request: Request) {
  const store = await cookies();
  const rawCart = store.get("lojinha_cart")?.value;
  const cart = parseCart(rawCart);

  const body = await request.json().catch(() => ({}));
  const productIdNum = body.productId ? Number(body.productId) : null;

  if (productIdNum && Number.isFinite(productIdNum)) {
    cart.items = cart.items.filter((it) => it.productId !== productIdNum);
  } else {
    cart.items = [];
  }

  return createCartResponse(cart);
}
