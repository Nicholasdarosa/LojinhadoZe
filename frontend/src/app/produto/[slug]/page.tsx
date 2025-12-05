// src/app/produto/[slug]/page.tsx
export const revalidate = 0;
export const dynamic = "force-dynamic";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import ProductBuyBox from "@/components/product/ProductBuyBox";

/* ---------------- helpers / tipos (iguais aos seus) ---------------- */

const STRAPI_BASE =
  (process.env.NEXT_PUBLIC_STRAPI_URL as string | undefined)?.replace(
    /\/$/,
    "",
  ) || "http://localhost:1337";
const API = `${STRAPI_BASE}/api`;

function absUrl(u?: string | null): string {
  if (!u) return "";
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  if (u.startsWith("/")) return `${STRAPI_BASE}${u}`;
  return `${STRAPI_BASE}/${u}`;
}

function imgFromMedia(media: any): string {
  if (!media) return "";
  if (typeof media === "string") return absUrl(media);

  if (media?.data && !Array.isArray(media.data)) {
    const a = media.data.attributes ?? media.data;
    return absUrl(a?.url ?? "");
  }

  if (Array.isArray(media?.data)) {
    const first = media.data[0];
    const a = first?.attributes ?? first;
    return absUrl(a?.url ?? "");
  }

  return absUrl(media?.attributes?.url ?? media?.url ?? "");
}

type ProdutoView = {
  id: number | string;
  nome: string;
  slug: string;
  descricao?: string;
  preco: number;
  imagens: string[];
  marca?: { nome?: string; logo?: string } | null;
  categoriaPrincipal?: { nome?: string; slug?: string } | null;
  categorias?: Array<{ nome?: string; slug?: string }>;
};

function buildPopulateQS() {
  const qs = new URLSearchParams({
    "populate[galeria][fields]": "url,alternativeText,width,height",
    "populate[marca][fields]": "nome",
    "populate[marca][populate][logo][fields]": "url",
    "populate[categoriaPrincipal][fields]": "nome,slug",
    "populate[categorias][fields]": "nome,slug",
  });
  return qs;
}

function mapProduto(item: any): ProdutoView | null {
  if (!item) return null;

  const a = item.attributes ?? item;

  const imagens: string[] = (() => {
    const raw = a.galeria?.data ?? a.galeria;

    if (Array.isArray(raw)) {
      return raw
        .map((r: any) => {
          const attr = r.attributes ?? r;
          return absUrl(attr?.url ?? "");
        })
        .filter(Boolean);
    }

    if (raw) {
      const single = imgFromMedia(raw);
      return single ? [single] : [];
    }

    return [];
  })();

  const marcaRaw = a.marca?.data ?? a.marca ?? null;
  let marca: ProdutoView["marca"] = null;

  if (marcaRaw) {
    const mAttr = marcaRaw.attributes ?? marcaRaw;
    const logoRaw = mAttr.logo?.data ?? mAttr.logo;
    const logoAttr = logoRaw?.attributes ?? logoRaw;
    const logoUrl = logoAttr?.url ? absUrl(logoAttr.url) : undefined;

    marca = {
      nome: mAttr.nome,
      logo: logoUrl,
    };
  }

  const catRaw = a.categoriaPrincipal?.data ?? a.categoriaPrincipal ?? null;
  const categoriaPrincipal = catRaw
    ? (() => {
        const cAttr = catRaw.attributes ?? catRaw;
        return {
          nome: cAttr.nome,
          slug: cAttr.slug,
        };
      })()
    : null;

  const catsRaw = a.categorias?.data ?? a.categorias ?? [];
  const categorias = Array.isArray(catsRaw)
    ? catsRaw.map((c: any) => {
        const cAttr = c.attributes ?? c;
        return {
          nome: cAttr.nome,
          slug: cAttr.slug,
        };
      })
    : [];

  const precoNum = (() => {
    const v = a.preco;
    if (v == null) return 0;
    const n = typeof v === "string" ? Number(v.replace(",", ".")) : Number(v);
    return Number.isFinite(n) ? n : 0;
  })();

  return {
    id: item.id ?? a.id,
    nome: a.nome ?? "Produto",
    slug: a.slug ?? String(item.id ?? a.id ?? ""),
    descricao: a.descricao ?? "",
    preco: precoNum,
    imagens,
    marca,
    categoriaPrincipal,
    categorias,
  };
}

/* ----------------------------- fetch helpers ----------------------------- */

async function fetchBySlugApi(slug: string): Promise<ProdutoView | null> {
  const cleanSlug = encodeURIComponent(slug);

  const res = await fetch(`${API}/produtos/slug/${cleanSlug}`, {
    cache: "no-store",
  });

  if (res.status === 404) return null;
  if (!res.ok) {
    console.error("Erro ao buscar produto por slug", res.status);
    return null;
  }

  const json = await res.json();
  return mapProduto(json?.data);
}

async function fetchById(id: string | number): Promise<ProdutoView | null> {
  const qs = buildPopulateQS();

  const res = await fetch(`${API}/produtos/${id}?${qs.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) return null;
  const json = await res.json();
  return mapProduto(json?.data);
}

async function getBySlugRobusto(slugOrId: string): Promise<ProdutoView | null> {
  const cleaned = decodeURIComponent(String(slugOrId || "").trim());

  let p = await fetchBySlugApi(cleaned);
  if (p) return p;

  const asNumber = Number(cleaned);
  if (Number.isFinite(asNumber)) {
    p = await fetchById(asNumber);
    if (p) return p;
  }

  return null;
}

/* ----------------------------- PAGE ----------------------------- */

export default async function ProdutoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const produto = await getBySlugRobusto(slug);

  if (!produto) {
    return (
      <main>
        <Header />
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Produto não encontrado</h1>
            <p className="text-neutral-500 mb-4">
              O item que você tentou acessar não está disponível no momento.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full bg-black px-5 py-2 text-sm font-medium text-white hover:opacity-90 transition"
            >
              Voltar para a página inicial
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main>
      <Header />

      <div className="mx-auto max-w-6xl lg:max-w-7xl px-4 md:px-6 lg:px-8 py-8 md:py-10">
        {/* Breadcrumb */}
        <nav className="text-xs md:text-sm text-neutral-500 mb-4 md:mb-6 flex flex-wrap items-center gap-1">
          <Link href="/" className="hover:text-black hover:underline">
            Home
          </Link>
          {produto.categoriaPrincipal?.slug ? (
            <>
              <span className="mx-1 text-neutral-400">/</span>
              <Link
                href={`/categoria/${produto.categoriaPrincipal.slug}`}
                className="hover:text-black hover:underline"
              >
                {produto.categoriaPrincipal.nome}
              </Link>
            </>
          ) : null}
          <span className="mx-1 text-neutral-400">/</span>
          <span className="text-black font-medium truncate">
            {produto.nome}
          </span>
        </nav>

        {/* Header produto */}
        <header className="mb-6 md:mb-8">
          {produto.marca?.nome ? (
            <p className="text-xs md:text-sm uppercase tracking-wide text-neutral-500 mb-1">
              {produto.marca.nome}
            </p>
          ) : null}
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-neutral-900">
            {produto.nome}
          </h1>
        </header>

        {/* Galeria + Buy box */}
        <section className="grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] items-start">
          {/* Galeria */}
          <div>
            <div className="grid gap-4 md:grid-cols-[80px_minmax(0,1fr)] items-start">
              {/* thumbs */}
              <aside className="order-2 md:order-1">
                <div className="flex md:flex-col gap-3 max-md:overflow-x-auto max-md:-mx-2 max-md:px-2">
                  {(produto.imagens.length ? produto.imagens : [""]).map(
                    (src, i) => (
                      <div
                        key={i}
                        className="h-16 w-16 md:h-18 md:w-18 rounded-md border border-neutral-200 bg-white grid place-items-center overflow-hidden cursor-pointer hover:border-neutral-400 transition"
                      >
                        {src ? (
                          <img
                            src={src}
                            alt={`Thumbnail ${i + 1}`}
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <span className="text-[10px] text-neutral-400">
                            Sem imagem
                          </span>
                        )}
                      </div>
                    ),
                  )}
                </div>
              </aside>

              {/* imagem principal */}
              <div className="order-1 md:order-2">
                <div className="w-full rounded-md border border-neutral-200 bg-white grid place-items-center min-h-[260px] md:min-h-[340px] lg:min-h-[380px] overflow-hidden">
                  {produto.imagens?.length ? (
                    <img
                      src={produto.imagens[0]}
                      alt={produto.nome}
                      className="max-h-[420px] w-auto object-contain"
                    />
                  ) : (
                    <div className="text-neutral-400 text-sm">
                      Sem imagem disponível
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Buy box client-side */}
          <ProductBuyBox
            product={{
              id: produto.id,
              slug: produto.slug,
              nome: produto.nome,
              preco: produto.preco,
            }}
          />
        </section>

        {/* Descrição */}
        <section className="mt-10 md:mt-12">
          <div className="flex items-center gap-8 border-b border-neutral-200">
            <button className="relative pb-3 text-sm font-semibold text-neutral-900">
              DESCRIÇÃO GERAL
              <span className="absolute left-0 right-0 -bottom-[1px] h-[2px] bg-neutral-900" />
            </button>
            <button className="pb-3 text-sm font-medium text-neutral-400 hover:text-neutral-700">
              AVALIAÇÕES
            </button>
          </div>

          <div className="pt-6 md:pt-7">
            <div className="prose max-w-none prose-p:mb-3 prose-p:text-[15px] prose-p:leading-relaxed text-neutral-700">
              {produto.descricao ? (
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: produto.descricao }}
                />
              ) : (
                <p>
                  Este produto ainda não possui descrição detalhada. Em breve
                  traremos mais informações sobre este item.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
