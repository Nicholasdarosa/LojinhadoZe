// src/components/LaunchesSection.tsx
import ProductsCarousel from "./ProductsCarousel";

const API = process.env.NEXT_PUBLIC_API_URL!;

async function getLaunches() {
  const params = new URLSearchParams();
  params.append("sort", "createdAt:desc");
  params.append("pagination[pageSize]", "12");
  params.append("populate", "galeria");
  const res = await fetch(`${API}/produtos?${params.toString()}`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data?.data ?? [];
}

export default async function LaunchesSection() {
  const products = await getLaunches();
  if (!products.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <h2 className="text-2xl font-bold mb-4">Lançamentos</h2>
      <ProductsCarousel items={products} />
    </section>
  );
}
