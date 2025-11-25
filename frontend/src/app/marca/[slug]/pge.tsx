// src/app/marca/[slug]/page.tsx
import ProductsGrid from "@/components/ProductsGrid";
import Breadcrumbs from "@/components/Breadcrumbs";
import { strapiGet } from "@/lib/strapi";

export default async function MarcaPage({ params }: { params: { slug: string } }) {
  const marcaRes = await strapiGet<any>("/marcas", {
    cache: "no-store",
    searchParams: { "filters[slug][$eq]": params.slug }
  });
  const marca = marcaRes?.data?.[0];
  if (!marca) return <div className="mx-auto max-w-7xl px-4 py-10">Marca não encontrada.</div>;

  const prodRes = await strapiGet<any>("/produtos", {
    cache: "no-store",
    searchParams: {
      "filters[marca][id][$eq]": marca.id,
      "populate": "galeria,marca,categorias",
      "pagination[pageSize]": "48",
      "sort": "nome:asc"
    }
  });

  const items = (prodRes?.data ?? []).map((row: any) => {
    const a = row.attributes ?? row;
    return {
      id: row.id,
      name: a.nome,
      price: Number(a.preco || 0),
      img: a.galeria?.data?.[0]?.attributes?.url ? process.env.NEXT_PUBLIC_ASSETS_BASE + a.galeria.data[0].attributes.url : "",
      href: `/produto/${a.slug}`
    };
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Breadcrumbs items={[{label:'Home', href:'/'}, {label:'Marcas', href:'/marcas'}, {label: marca.attributes?.nome}]} />
      <h1 className="mt-4 text-2xl font-extrabold">{marca.attributes?.nome}</h1>
      <ProductsGrid items={items} />
    </div>
  );
}
