// src/app/page.tsx
export const revalidate = 0;
export const dynamic = "force-dynamic";

import Header from "@/components/Header";
import Carousel from "@/components/Carousel";
import BenefitsBar from "@/components/BenefitsBar";
import CategoryShowcase from "@/components/CategoryShowcase";
import SelectedShowcase, { SelectedCard } from "@/components/SelectedShowcase";
import Footer from "@/components/Footer";
import PartnersCarousel from "@/components/PartnersCarousel";
import ProductsCarousel, { ProductCard } from "@/components/ProductsCarousel";
import FloatingSocial from "@/components/FloatingSocial";
import { strapiGet } from "@/lib/strapi";

const ASSETS = process.env.NEXT_PUBLIC_ASSETS_BASE!;

/* ----------------------------- TIPOS AUXILIARES ---------------------------- */
type Slide = {
  img: string;
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaUrl?: string;
};

type Marca = {
  id: number | string;
  nome: string;
  logoUrl: string;
  site?: string;
};

type HomeConfig = {
  headerBgColor?: string | null;
  // cards "Escolhidos" (CMS – opcional)
  tituloEscolhidos?: string | null;
  escolhidos?: SelectedCard[];
  // parceiros
  tituloMarcas?: string | null;
  marcas?: Marca[];
  // carrosséis de produtos
  tituloLancamentos?: string;
  limiteLancamentos?: number;
  tituloOfertas?: string;
  limiteOfertas?: number;
  ofertasProdutos?: any[];
  lancamentosProdutos?: any[];
  // sociais
  whatsappUrl?: string | null;
  instagramUrl?: string | null;
};

/* -------------------------------- UTILS ----------------------------------- */
function imgFromMedia(media: any): string {
  if (!media) return "";

  if (typeof media === "string")
    return media.startsWith("http") ? media : `${ASSETS}${media}`;

  if (media.url) return media.url.startsWith("http") ? media.url : `${ASSETS}${media.url}`;

  const d = media.data;
  if (d && !Array.isArray(d)) {
    const u = d.attributes?.url ?? d.url;
    return u ? (u.startsWith("http") ? u : `${ASSETS}${u}`) : "";
  }

  const arr = Array.isArray(d) ? d : Array.isArray(media) ? media : [];
  const first = arr[0];
  const u = first?.attributes?.url ?? first?.url;
  return u ? (u.startsWith("http") ? u : `${ASSETS}${u}`) : "";
}

function normalizeProduto(row: any): ProductCard {
  const base = row?.attributes ? row : { id: row.id, attributes: row };
  const a = base.attributes ?? {};
  return {
    id: base.id,
    name: a.nome,
    price: Number(a.preco ?? 0),
    img: imgFromMedia(a.galeria),
    href: `/produto/${a.slug ?? base.id}`,
  };
}

/* ------------------------------- HOME (ST) -------------------------------- */
async function getHomeConfig(): Promise<HomeConfig> {
  const data = await strapiGet<any>("/home", {
    cache: "no-store",
    searchParams: {
      populate: [
        "escolhidos.icone",
        "escolhidos.imagem",
        "marcas.logo",
        "ofertasProdutos.galeria",
        "lancamentosProdutos.galeria",
      ].join(","),
    },
  }).catch(() => null);

  const a = data?.data?.attributes ?? data?.data ?? {};

  const marcasRel = Array.isArray(a?.marcas?.data) ? a.marcas.data : [];
  const marcas: Marca[] = marcasRel
    .map((row: any) => {
      const m = row.attributes ?? row;
      return {
        id: row.id,
        nome: m.nome || "Marca",
        logoUrl: imgFromMedia(m.logo),
        site: m.site,
      };
    })
    .filter((m: Marca) => m.logoUrl);

  const escolhidos: SelectedCard[] = (a.escolhidos ?? []).map((c: any) => ({
    titulo: c.titulo ?? "",
    subtitulo: c.subtitulo ?? "",
    url: c.url ?? "#",
    iconeUrl: imgFromMedia(c.icone),
    imagemUrl: imgFromMedia(c.imagem),
  }));

  return {
    headerBgColor: a.headerBgColor ?? "#ffd101ff",
    tituloEscolhidos: a.tituloEscolhidos ?? "Escolhidos Para Você!",
    escolhidos,
    tituloMarcas: a.tituloMarcas ?? "Marcas de Sucesso!",
    marcas,
    tituloLancamentos: a.tituloLancamentos ?? "Lançamentos",
    limiteLancamentos: a.limiteLancamentos ?? 12,
    tituloOfertas: a.tituloOfertas ?? "Ofertas Imperdíveis",
    limiteOfertas: a.limiteOfertas ?? 12,
    ofertasProdutos: a.ofertasProdutos ?? [],
    lancamentosProdutos: a.lancamentosProdutos ?? [],
    whatsappUrl: a.whatsappUrl ?? null,
    instagramUrl: a.instagramUrl ?? null,
  };
}

/* ------------------------------ BANNERS ----------------------------------- */
async function getBanners(): Promise<Slide[]> {
  try {
    const data = await strapiGet<any>("/banners", {
      cache: "no-store",
      searchParams: {
        "filters[ativo][$eq]": "true",
        sort: "ordem:asc",
        populate: "imagem",
        "pagination[pageSize]": "50",
      },
    });

    const rows = data?.data ?? [];
    return rows
      .map((row: any) => {
        const a = row.attributes ?? row;
        return {
          img: imgFromMedia(a.imagem),
          title: a.titulo,
          subtitle: a.subtitulo,
          ctaLabel: a.ctaLabel,
          ctaUrl: a.ctaUrl,
        } as Slide;
      })
      .filter((s: Slide) => s.img);
  } catch {
    return [];
  }
}

/* --------------------------- PARCEIROS (fallback) ------------------------- */
async function getMarcasFallback(): Promise<Marca[]> {
  const data = await strapiGet<any>("/marcas", {
    cache: "no-store",
    searchParams: { populate: "logo", sort: "nome:asc", "pagination[pageSize]": "100" },
  }).catch(() => null);

  const rows = data?.data ?? [];
  return rows
    .map((row: any) => {
      const a = row.attributes ?? row;
      return {
        id: row.id,
        nome: a.nome || "Marca",
        site: a.site,
        logoUrl: imgFromMedia(a.logo),
      } as Marca;
    })
    .filter((m: Marca) => m.logoUrl);
}

/* --------------------------- PRODUTOS (flags) ----------------------------- */
async function getLancamentosByFlag(limit: number): Promise<ProductCard[]> {
  const data = await strapiGet<any>("/produtos", {
    cache: "no-store",
    searchParams: {
      "filters[lancamento][$eq]": "true",
      sort: "createdAt:desc",
      "pagination[pageSize]": String(limit),
      populate: "galeria",
    },
  }).catch(() => null);

  return (data?.data ?? []).map(normalizeProduto);
}

async function getOfertasByFlag(limit: number): Promise<ProductCard[]> {
  const data = await strapiGet<any>("/produtos", {
    cache: "no-store",
    searchParams: {
      "filters[oferta][$eq]": "true",
      sort: "updatedAt:desc",
      "pagination[pageSize]": String(limit),
      populate: "galeria",
    },
  }).catch(() => null);

  return (data?.data ?? []).map(normalizeProduto);
}

/* --------------------------------- PAGE ----------------------------------- */
export default async function Home() {
  const [homeCfg, slides] = await Promise.all([getHomeConfig(), getBanners()]);

  const marcas =
    homeCfg.marcas && homeCfg.marcas.length > 0
      ? homeCfg.marcas
      : await getMarcasFallback();

  let lancamentos: ProductCard[] = [];
  if ((homeCfg.lancamentosProdutos ?? []).length > 0) {
    lancamentos = (homeCfg.lancamentosProdutos ?? []).map(normalizeProduto);
  } else {
    lancamentos = await getLancamentosByFlag(homeCfg.limiteLancamentos ?? 12);
  }

  let ofertas: ProductCard[] = [];
  if ((homeCfg.ofertasProdutos ?? []).length > 0) {
    ofertas = (homeCfg.ofertasProdutos ?? []).map(normalizeProduto);
  } else {
    ofertas = await getOfertasByFlag(homeCfg.limiteOfertas ?? 12);
  }

  return (
    <main>
      <Header bgColor={homeCfg.headerBgColor || undefined} />

      {/* Carrossel principal */}
      {slides.length > 0 ? (
        <section className="border-b">
          <Carousel slides={slides} />
        </section>
      ) : (
        <section className="border-b">
          <div className="w-full h-[260px] md:h-[420px] bg-gradient-to-b from-[#ffda1f] via-[#ffa801] to-[#060300]" />
        </section>
      )}

      {/* Benefícios */}
      <BenefitsBar />

      {/* Escolhidos (cards fixos com ícones) */}
      <CategoryShowcase />

      {/* Escolhidos do CMS (opcional) */}
      {(homeCfg.escolhidos?.length ?? 0) > 0 && (
        <SelectedShowcase
          title={homeCfg.tituloEscolhidos ?? "Escolhidos Para Você!"}
          cards={homeCfg.escolhidos ?? []}
        />
      )}

      {/* Marcas parceiras – título + subtítulo na mesma linha */}
      {marcas.length > 0 && (
        <PartnersCarousel
          items={marcas}
          title={homeCfg.tituloMarcas ?? "Marcas de Sucesso!"}
          subtitle="Conheça nossos parceiros e fornecedores"
          intervalMs={2500}
          stepFraction={0.75}
        />
      )}

      {/* Lançamentos – com subtítulo inline */}
      {lancamentos.length > 0 && (
        <ProductsCarousel
          title={homeCfg.tituloLancamentos ?? "Lançamentos"}
          subtitle="Confira os itens recém-chegados"
          items={lancamentos}
        />
      )}

      {/* Ofertas – com subtítulo inline */}
      {ofertas.length > 0 && (
        <ProductsCarousel
          title={homeCfg.tituloOfertas ?? "Ofertas Imperdíveis"}
          subtitle="Descontos que valem a pena"
          items={ofertas}
        />
      )}

      {/* Ícones flutuantes (WhatsApp / Instagram) */}
      <FloatingSocial
        whatsappUrl={homeCfg.whatsappUrl ?? undefined}
        instagramUrl={homeCfg.instagramUrl ?? undefined}
      />

      <Footer />
    </main>
  );
}
