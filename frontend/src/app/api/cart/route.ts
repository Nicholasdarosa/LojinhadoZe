import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

const CART_COOKIE_KEY = "lojinha_cart";

const STRAPI_BASE =
  (process.env.NEXT_PUBLIC_STRAPI_URL as string | undefined)?.replace(
    /\/$/,
    "",
  ) || "http://localhost:1337";

const STRAPI_API = `${STRAPI_BASE}/api`;

/**
 * O que fica salvo no cookie: mínimo necessário.
 */
type RawCartItem = {
  lineId: string;
  productId: number | string;
  slug?: string;
  variantId?: number | string;
  quantity: number;
};

type RawCart = {
  id: string;
  items: RawCartItem[];
};

/**
 * O que o frontend enxerga.
 */
export type CartItem = {
  id: string;
  productId: number | string;
  variantId?: number | string;
  name: string;
  slug: string;
  imageUrl: string;
  unitPrice: number; // em centavos
  quantity: number;
};

export type Cart = {
  id: string;
  items: CartItem[];
  subtotal: number;
  total: number;
};

/* ---------------- helpers gerais ---------------- */

function parseRawCart(raw: string | undefined): RawCart | null {
  if (!raw) return null;
  try {
    const cart = JSON.parse(raw) as RawCart;
    if (!cart.id || !Array.isArray(cart.items)) return null;
    return cart;
  } catch {
    return null;
  }
}

async function getOrCreateRawCart(): Promise<RawCart> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(CART_COOKIE_KEY)?.value;
  const existing = parseRawCart(raw);
  if (existing) return existing;

  const cart: RawCart = {
    id: randomUUID(),
    items: [],
  };

  cookieStore.set(CART_COOKIE_KEY, JSON.stringify(cart), {
    httpOnly: false,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return cart;
}

async function saveRawCart(cart: RawCart): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(CART_COOKIE_KEY, JSON.stringify(cart), {
    httpOnly: false,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

/* ---------------- helpers Strapi ---------------- */

function absUrl(u?: string | null): string {
  if (!u) return "";
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  if (u.startsWith("/")) return `${STRAPI_BASE}${u}`;
  return `${STRAPI_BASE}/${u}`;
}

async function fetchProductFromStrapiBySlugOrId(
  productId: number | string,
  slug?: string,
): Promise<{
  name: string;
  slug: string;
  unitPrice: number;
  imageUrl: string;
} | null> {
  const qs = "populate[galeria][fields]=url";

  // 1º tenta pelo slug (se existir)
  if (slug) {
    const encodedSlug = encodeURIComponent(slug);
    const urlSlug = `${STRAPI_API}/produtos/slug/${encodedSlug}?${qs}`;

    try {
      const resSlug = await fetch(urlSlug, { cache: "no-store" });
      if (resSlug.ok) {
        const json = await resSlug.json();
        const data = json?.data;
        if (data) {
          const a = data.attributes ?? data;
          const nome = a.nome as string | undefined;
          const slugAttr = a.slug as string | undefined;
          const precoRaw = a.preco;

          let precoNumber = 0;
          if (precoRaw != null) {
            const n =
              typeof precoRaw === "string"
                ? Number(precoRaw.replace(",", "."))
                : Number(precoRaw);
            precoNumber = Number.isFinite(n) ? n : 0;
          }

          const galeria = a.galeria?.data ?? a.galeria;
          let imageUrl = "";
          if (Array.isArray(galeria) && galeria.length > 0) {
            const first = galeria[0];
            const attr = first.attributes ?? first;
            imageUrl = absUrl(attr?.url ?? "");
          }

          return {
            name: nome ?? `Produto #${productId}`,
            slug: slugAttr ?? slug,
            unitPrice: precoNumber > 0 ? Math.round(precoNumber * 100) : 0,
            imageUrl,
          };
        }
      } else if (resSlug.status !== 404) {
        console.error(
          "Erro ao buscar produto no Strapi por slug:",
          resSlug.status,
          urlSlug,
        );
      }
    } catch (err) {
      console.error("Erro fetchProductFromStrapi por slug:", err);
    }
  }

  // 2º fallback: tenta por ID numérico
  const idNumber = Number(productId);
  if (!Number.isFinite(idNumber)) {
    return null;
  }

  const urlId = `${STRAPI_API}/produtos/${idNumber}?${qs}`;

  try {
    const resId = await fetch(urlId, { cache: "no-store" });
    if (!resId.ok) {
      if (resId.status !== 404) {
        console.error(
          "Erro ao buscar produto no Strapi por ID:",
          resId.status,
          urlId,
        );
      }
      return null;
    }

    const json = await resId.json();
    const data = json?.data;
    if (!data) return null;

    const a = data.attributes ?? data;
    const nome = a.nome as string | undefined;
    const slugAttr = a.slug as string | undefined;
    const precoRaw = a.preco;

    let precoNumber = 0;
    if (precoRaw != null) {
      const n =
        typeof precoRaw === "string"
          ? Number(precoRaw.replace(",", "."))
          : Number(precoRaw);
      precoNumber = Number.isFinite(n) ? n : 0;
    }

    const galeria = a.galeria?.data ?? a.galeria;
    let imageUrl = "";
    if (Array.isArray(galeria) && galeria.length > 0) {
      const first = galeria[0];
      const attr = first.attributes ?? first;
      imageUrl = absUrl(attr?.url ?? "");
    }

    return {
      name: nome ?? `Produto #${productId}`,
      slug: slugAttr ?? String(productId),
      unitPrice: precoNumber > 0 ? Math.round(precoNumber * 100) : 0,
      imageUrl,
    };
  } catch (err) {
    console.error("Erro fetchProductFromStrapi por ID:", err);
    return null;
  }
}

/**
 * Monta o carrinho completo (nome, preço, imagem) a partir do raw do cookie.
 */
async function buildCartFromRaw(raw: RawCart): Promise<Cart> {
  const items: CartItem[] = [];

  for (const rawItem of raw.items) {
    const productData = await fetchProductFromStrapiBySlugOrId(
      rawItem.productId,
      rawItem.slug,
    );

    if (productData) {
      items.push({
        id: rawItem.lineId,
        productId: rawItem.productId,
        variantId: rawItem.variantId,
        name: productData.name,
        slug: productData.slug,
        imageUrl: productData.imageUrl,
        unitPrice: productData.unitPrice,
        quantity: rawItem.quantity,
      });
    } else {
      // fallback se der 404/erro: não some com item do carrinho
      items.push({
        id: rawItem.lineId,
        productId: rawItem.productId,
        variantId: rawItem.variantId,
        name: `Produto #${rawItem.productId}`,
        slug: String(rawItem.slug || rawItem.productId),
        imageUrl: "",
        unitPrice: 0,
        quantity: rawItem.quantity,
      });
    }
  }

  const subtotal = items.reduce(
    (acc, item) => acc + item.unitPrice * item.quantity,
    0,
  );

  const cart: Cart = {
    id: raw.id,
    items,
    subtotal,
    total: subtotal,
  };

  return cart;
}

/* ------------------------ HANDLERS HTTP ------------------------ */

// GET /api/cart
export async function GET() {
  const raw = await getOrCreateRawCart();
  const cart = await buildCartFromRaw(raw);
  return NextResponse.json(cart);
}

// POST /api/cart → adicionar/atualizar item
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as
    | {
        productId?: number | string;
        quantity?: number;
        variantId?: number | string;
        slug?: string;
      }
    | null;

  if (!body?.productId) {
    return NextResponse.json(
      { message: "productId obrigatório" },
      { status: 400 },
    );
  }

  const quantity = body.quantity && body.quantity > 0 ? body.quantity : 1;

  const raw = await getOrCreateRawCart();

  const existingIndex = raw.items.findIndex(
    (item) =>
      String(item.productId) === String(body.productId) &&
      String(item.variantId ?? "") === String(body.variantId ?? ""),
  );

  if (existingIndex >= 0) {
    raw.items[existingIndex].quantity += quantity;
    // se slug veio e antes não tinha, salva
    if (body.slug && !raw.items[existingIndex].slug) {
      raw.items[existingIndex].slug = body.slug;
    }
  } else {
    raw.items.push({
      lineId: randomUUID(),
      productId: body.productId,
      variantId: body.variantId,
      quantity,
      slug: body.slug,
    });
  }

  await saveRawCart(raw);

  const cart = await buildCartFromRaw(raw);
  return NextResponse.json(cart, { status: 201 });
}

// PATCH /api/cart → atualizar quantidade
export async function PATCH(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as
    | { itemId?: string; quantity?: number }
    | null;

  if (!body?.itemId || typeof body.quantity !== "number") {
    return NextResponse.json(
      { message: "Parâmetros inválidos" },
      { status: 400 },
    );
  }

  const raw = await getOrCreateRawCart();
  const idx = raw.items.findIndex((item) => item.lineId === body.itemId);
  if (idx === -1) {
    return NextResponse.json({ message: "Item não encontrado" }, { status: 404 });
  }

  if (body.quantity <= 0) {
    raw.items.splice(idx, 1);
  } else {
    raw.items[idx].quantity = body.quantity;
  }

  await saveRawCart(raw);
  const cart = await buildCartFromRaw(raw);
  return NextResponse.json(cart);
}

// DELETE /api/cart?itemId=xxx
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const itemId = searchParams.get("itemId");

  if (!itemId) {
    return NextResponse.json(
      { message: "itemId obrigatório" },
      { status: 400 },
    );
  }

  const raw = await getOrCreateRawCart();
  const idx = raw.items.findIndex((item) => item.lineId === itemId);
  if (idx === -1) {
    return NextResponse.json({ message: "Item não encontrado" }, { status: 404 });
  }

  raw.items.splice(idx, 1);
  await saveRawCart(raw);

  const cart = await buildCartFromRaw(raw);
  return NextResponse.json(cart);
}