// src/components/MenuRow.tsx
import Link from "next/link";
import { strapiGet } from "@/lib/strapi";
import MenuRowClient from "./MenuRowClient";

type Props = {
  /** mesma cor do header (Single Type Home.headerBgColor) */
  bgColor?: string;
};

type Category = { id: string | number; name: string; slug?: string };

async function fetchCategories(): Promise<Category[]> {
  const data = await strapiGet<any>("/categorias", {
    cache: "no-store",
    searchParams: {
      sort: "nome:asc",
      fields: "nome,slug",
      "pagination[pageSize]": "200",
    },
  }).catch(() => null);

  const rows = data?.data ?? [];
  return rows.map((row: any) => {
    const a = row.attributes ?? row;
    return {
      id: row.id ?? a.id,
      name: a.nome || a.titulo || "Categoria",
      slug: a.slug,
    };
  });
}

/**
 * Menu horizontal logo abaixo do Header. O conteúdo é SSR (carrega categorias do Strapi)
 * e fica embrulhado pelo MenuRowClient (que colapsa/expande ao rolar).
 */
export default async function MenuRow({ bgColor = "#ffd101ff" }: Props) {
  const categories = await fetchCategories();

  return (
    <MenuRowClient>
      <nav className="w-full text-black" style={{ backgroundColor: bgColor }}>
        <div className="mx-auto max-w-7xl px-4">
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 py-3">
            {/* Link fixo opcional */}
            <li>
              <Link
                href="/promocoes"
                className="text-sm font-semibold tracking-wide hover:opacity-80 transition"
              >
                PROMOÇÕES
              </Link>
            </li>

            {/* Categorias vindas do Strapi */}
            {categories.map((c) => (
              <li key={`cat-${c.id}`}>
                <Link
                  href={c.slug ? `/categoria/${c.slug}` : `/categoria/${c.id}`}
                  className="text-sm font-semibold tracking-wide hover:opacity-80 transition"
                  title={c.name}
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </MenuRowClient>
  );
}
