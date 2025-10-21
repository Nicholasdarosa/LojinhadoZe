import Image from "next/image";
import Link from "next/link";
import {
  Scissors,
  Cigarette,
  Flame,
  Package2,
  Rocket,
  Hammer,
  LucideIcon,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL!;
const ASSETS = process.env.NEXT_PUBLIC_ASSETS_BASE!;

// Ordem + rótulos (o que exibimos na UI)
const TARGET = [
  { slug: "acessorios", label: "Acessórios" },
  { slug: "pipes", label: "Pipes" },
  { slug: "para-enrolar", label: "Para Enrolar" },
  { slug: "narguiles", label: "Narguiles" },
  { slug: "dichavadores", label: "Dichavadores" },
  { slug: "acendedores-macaricos-isqueiros", label: "Acendedores, Maçaricos e Isqueiros" },
];

// Ícones por slug (ajuste se quiser)
const iconMap: Record<string, LucideIcon> = {
  acessorios: Scissors,
  pipes: Package2,
  "para-enrolar": Cigarette,
  narguiles: Rocket,
  dichavadores: Hammer,
  "acendedores-macaricos-isqueiros": Flame,
};
const pickIcon = (slug: string) => iconMap[slug] ?? Package2;

// MAP das imagens locais em /public (caminho começa com “/”)
const localImgMap: Record<string, string> = {
  acessorios: "/Acessorios.webp",
  pipes: "/Pipes.webp",
  "para-enrolar": "/Para Enrolar.webp",
  narguiles: "/Narguiles.webp",
  dichavadores: "/Dichavadores.webp",
  "acendedores-macaricos-isqueiros": "/Acendedores,Maçaricos e Isqueiros.webp",
};

type Cat = { slug: string; nome: string; img?: string };

async function fetchSelectedCategories(): Promise<Record<string, Cat>> {
  const params = new URLSearchParams();
  for (const { slug } of TARGET) params.append("filters[slug][$in]", slug);
  params.append("fields", "nome");
  params.append("fields", "slug");
  params.append("populate", "imagem");
  params.append("pagination[pageSize]", "50");

  const url = `${API}/categorias?${params.toString()}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return {};

  const data = await res.json();
  const out: Record<string, Cat> = {};

  for (const item of data?.data ?? []) {
    const a = item.attributes ?? item;
    const first = Array.isArray(a.imagem) ? a.imagem[0] : a.imagem?.data?.[0];
    const rel = first?.url ?? first?.attributes?.url;
    out[a.slug] = {
      slug: a.slug,
      nome: a.nome,
      img: rel ? `${ASSETS}${rel}` : undefined, // preferimos Strapi se existir
    };
  }
  return out;
}

export default async function CategoryShowcase() {
  const found = await fetchSelectedCategories();

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex items-baseline gap-2 mb-4">
        <h2 className="text-2xl font-bold">Escolhidos Para Você!</h2>
        <p className="text-sm text-gray-500">
          Escolhemos cada item dessa coleção para elevar sua vibe
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {TARGET.map(({ slug, label }) => {
          const Icon = pickIcon(slug);
          const c = found[slug];
          // 1) se vier do Strapi, usa; 2) senão, usa /public; 3) fallback cinza
          const img =
            c?.img ??
            (localImgMap[slug] ? encodeURI(localImgMap[slug]) : undefined);

          const CardInner = (
            <div className="group relative h-72 md:h-80 lg:h-96 rounded-2xl overflow-hidden border shadow-sm">
              {img ? (
                <div className="absolute inset-0">
                  <Image
                    src={img}
                    alt={c?.nome ?? label}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 1024px) 50vw, 16vw"
                    priority
                  />
                </div>
              ) : (
                <div className="absolute inset-0 bg-gray-200" />
              )}

             {/* Overlay inicial escuro → clareia no hover */}
<div className="absolute inset-0 bg-[#fea700]/60 backdrop-blur-[1px] transition-all duration-300 group-hover:bg-black/20 group-hover:backdrop-blur-0" />


              <div className="absolute inset-0 grid place-items-center pointer-events-none">
                <div className="text-white flex flex-col items-center gap-2 drop-shadow-md">
                <Icon className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16" />
                <span className="text-xs md:text-sm lg:text-base font-extrabold uppercase tracking-wide text-center">
                    {(c?.nome ?? label).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          );

          // Só linka se a categoria existir no Strapi (senão vira card “informativo”)
          return c ? (
            <Link key={slug} href={`/c/${slug}`} className="block">
              {CardInner}
            </Link>
          ) : (
            <div key={slug}>{CardInner}</div>
          );
        })}
      </div>
    </section>
  );
}
