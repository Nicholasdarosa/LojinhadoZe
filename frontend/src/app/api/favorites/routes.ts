// src/app/api/favorites/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const STRAPI_BASE =
  process.env.NEXT_PUBLIC_STRAPI_URL?.replace(/\/$/, "") ||
  "http://localhost:1337";

type FavoriteItem = {
  productId: number;
  slug: string;
  name: string;
  price: number;
  image?: string;
};

type Favorites = {
  items: FavoriteItem[];
};

function parseFavorites(raw: string | undefined | null): Favorites {
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
      })),
    };
  } catch {
    return { items: [] };
  }
}

function createFavoritesResponse(fav: Favorites) {
  const res = NextResponse.json(fav);
  res.cookies.set("lojinha_favorites", JSON.stringify(fav), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 dias
  });
  return res;
}

function computePrice(value: any): number {
  if (value == null) return 0;
  const n =
    typeof value === "string"
      ? Number(value.replace(",", "."))
      : Number(value);
  return Number.isFinite(n) ? n : 0;
}

// GET – lista favoritos
export async function GET() {
  const store = await cookies();
  const raw = store.get("lojinha_favorites")?.value;
  const fav = parseFavorites(raw);
  return NextResponse.json(fav);
}

// POST – adiciona um produto aos favoritos
// body: { productId }
export async function POST(req: Request) {
  const store = await cookies();
  const jwt = store.get("lojinha_token")?.value;

  // se quiser liberar favoritos sem login, é só remover esse if
  if (!jwt) {
    return NextResponse.json(
      { error: "Não autenticado." },
      { status: 401 },
    );
  }

  const rawFav = store.get("lojinha_favorites")?.value;
  const fav = parseFavorites(rawFav);

  const body = await req.json().catch(() => ({}));
  const productIdNum = Number(body.productId);

  if (!Number.isFinite(productIdNum) || productIdNum <= 0) {
    return NextResponse.json(
      { error: "productId inválido." },
      { status: 400 },
    );
  }

  // Busca produto no Strapi
  const qs = new URLSearchParams({
    "populate[galeria][fields]": "url",
  });
  const strapiRes = await fetch(
    `${STRAPI_BASE}/api/produtos/${productIdNum}?${qs.toString()}`,
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

  const price = computePrice(a.preco);

  // imagem principal
  const galeria = a.galeria?.data ?? a.galeria ?? [];
  let imageUrl: string | undefined;
  if (Array.isArray(galeria) && galeria[0]) {
    const attr = galeria[0].attributes ?? galeria[0];
    imageUrl = attr?.url;
  }

  const exists = fav.items.some(
    (it) => it.productId === productIdNum,
  );
  if (!exists) {
    fav.items.push({
      productId: productIdNum,
      slug: a.slug ?? String(d?.id ?? productIdNum),
      name: a.nome ?? "Produto",
      price,
      image: imageUrl,
    });
  }

  return createFavoritesResponse(fav);
}

// DELETE – remove todos ou um item (body opcional: { productId })
export async function DELETE(req: Request) {
  const store = await cookies();
  const rawFav = store.get("lojinha_favorites")?.value;
  const fav = parseFavorites(rawFav);

  const body = await req.json().catch(() => ({}));
  const productIdNum = body.productId ? Number(body.productId) : null;

  if (productIdNum && Number.isFinite(productIdNum)) {
    fav.items = fav.items.filter(
      (it) => it.productId !== productIdNum,
    );
  } else {
    fav.items = [];
  }

  return createFavoritesResponse(fav);
}
