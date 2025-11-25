// src/app/categoria/[slug]/page.tsx
export const dynamic = "force-dynamic";

import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { strapiGet } from "@/lib/strapi";

const ASSETS = process.env.NEXT_PUBLIC_ASSETS_BASE ?? "";

function imgFromMedia(media: any): string {
  if (!media) return "";
  if (typeof media === "string") return media.startsWith("http") ? media : `${ASSETS}${media}`;
  const d = media?.data;
  if (d && !Array.isArray(d)) {
    const u = d.attributes?.url ?? d.url;
    return u ? (u.startsWith("http") ? u : `${ASSETS}${u}`) : "";
  }
  const arr = Array.isArray(d) ? d : Array.isArray(media) ? media : [];
  const first = arr[0];
  const u = first?.attributes?.url ?? first?.url;
  return u ? (u.startsWith("http") ? u : `${ASSETS}${u}`) : "";
}

const fmtBRL = (v: number) =>
  (v ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

async function getCategoryBySlug(slug: string) {
  const data = await strapiGet<any>("/categorias", {
    cache: "no-store",
    searchParams: {
      "filters[slug][$eq]": slug,
      fields: "nome,slug",
      "pagination[pageSize]": "1",
    },
  });
  const row = data?.data?.[0];
  if (!row) return null;
  const a = row.attributes ?? {};
  return { id: row.id, nome: a.nome ?? "", slug: a.slug ?? slug };
}

type Card = { id: number | string; name: string; price: number; href: string; img: string };

async function getProductsByCategory(slug: string): Promise<Card[]> {
  const data = await strapiGet<any>("/produtos", {
    cache: "no-store",
    searchParams: {
      "filters[categorias][slug][$eq]": slug,
      publicationState: "live",
      sort: "createdAt:desc",
      "pagination[pageSize]": "48",

      // ✅ mídia/relations com 'true'
      "populate[galeria]": "true",
      "populate[marca]": "true",
    },
  });

  const rows = Array.isArray(data?.data) ? data.data : [];
  return rows.map((row: any) => {
    const a = row.attributes ?? {};
    return {
      id: row.id,
      name: a.nome ?? "",
      price: Number(a.preco ?? 0),
      img: imgFromMedia(a.galeria),
      href: `/produto/${a.slug ?? row.id}`,
    };
  });
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [category, products] = await Promise.all([
    getCategoryBySlug(slug),
    getProductsByCategory(slug),
  ]);

  return (
    <main>
      <Header />

      <section className="mx-auto max-w-7xl px-4 py-8">
        <nav className="mb-6 text-sm text-neutral-600">
          <Link href="/" className="hover:underline">Home</Link>
          <span className="mx-2">›</span>
          <span className="font-semibold text-black">{category?.nome ?? "Categoria"}</span>
        </nav>

        <h1 className="mb-6 text-3xl font-extrabold">{category?.nome ?? "Produtos"}</h1>

        {products.length === 0 ? (
          <p className="text-neutral-600">Nenhum produto encontrado.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <article
                key={p.id}
                className="group rounded-2xl bg-white shadow-[0_1px_6px_rgba(0,0,0,0.08)]
                           hover:shadow-[0_0_0_2px_rgba(255,209,1,1),0_8px_24px_rgba(0,0,0,0.12)]
                           transition overflow-hidden"
              >
                <Link href={p.href}>
                  <div className="relative">
                    <div className="aspect-[16/12] w-full bg-white grid place-items-center">
                      {p.img ? (
                        <Image
                          src={p.img}
                          alt={p.name}
                          width={900}
                          height={675}
                          className="h-full w-full object-contain transition duration-300 group-hover:scale-[1.02]"
                        />
                      ) : (
                        <div className="text-sm text-neutral-400">Sem imagem</div>
                      )}
                    </div>
                  </div>
                  <div className="p-4">
                    <h2 className="line-clamp-2 text-[15px] font-semibold leading-snug">{p.name}</h2>
                    <div className="mt-2 text-[20px] font-extrabold">{fmtBRL(p.price)}</div>
                    <div className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-[#ffd101] px-4 py-3 font-semibold text-black hover:brightness-95 active:scale-[0.99] transition">
                      Ver detalhes
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
