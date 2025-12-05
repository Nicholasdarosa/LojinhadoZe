// src/app/favoritos/page.tsx
export const dynamic = "force-dynamic";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import AddToCartButton from "@/components/cart/AddToCartButton";

const SITE_BASE =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

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

async function loadFavorites(): Promise<Favorites> {
  const res = await fetch(`${SITE_BASE}/api/favorites`, {
    cache: "no-store",
  });
  if (!res.ok) return { items: [] };
  return res.json();
}

export default async function FavoritesPage() {
  const fav = await loadFavorites();
  const fmt = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <main>
      <Header />

      <div className="mx-auto max-w-6xl lg:max-w-7xl px-4 md:px-6 lg:px-8 py-8 md:py-10">
        <h1 className="text-2xl md:text-3xl font-extrabold mb-6">
          Meus favoritos
        </h1>

        {fav.items.length === 0 ? (
          <div className="border border-neutral-200 rounded-md p-6 text-center">
            <p className="text-neutral-600 mb-3">
              Você ainda não adicionou produtos aos favoritos.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-md bg-black px-5 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              Ver ofertas
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {fav.items.map((item) => (
              <div
                key={item.productId}
                className="border border-neutral-200 rounded-md p-4 flex flex-col gap-3"
              >
                <Link
                  href={`/produto/${item.slug}`}
                  className="block h-40 border border-neutral-200 rounded-md bg-white grid place-items-center overflow-hidden mb-2"
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="max-h-36 w-auto object-contain"
                    />
                  ) : (
                    <span className="text-xs text-neutral-400">
                      Sem imagem
                    </span>
                  )}
                </Link>

                <div className="flex-1 flex flex-col gap-1">
                  <Link
                    href={`/produto/${item.slug}`}
                    className="font-semibold text-sm hover:underline line-clamp-2"
                  >
                    {item.name}
                  </Link>
                  <span className="text-base font-bold text-neutral-900">
                    {fmt(item.price)}
                  </span>
                </div>

                <AddToCartButton
                  productId={item.productId}
                  slug={item.slug}
                  quantity={1}
                  redirectToCart={false}
                  label="Adicionar ao carrinho"
                  variant="primary"
                  fullWidth
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
