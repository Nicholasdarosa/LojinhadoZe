// src/components/ProductsGrid.tsx
import Image from "next/image";

export default function ProductsGrid({ items }: { items: any[] }) {
  const ASSETS = process.env.NEXT_PUBLIC_ASSETS_BASE!;

  if (!items?.length) {
    return <p className="text-gray-500">Nenhum produto publicado ainda.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {items.map((p: any) => {
        const a = p.attributes ?? p;

        // galeria (Multiple Media):
        const g = a.galeria;
        const first = Array.isArray(g) ? g[0] : g?.data?.[0];
        const imgUrl = first?.url ?? first?.attributes?.url;

        return (
          <div key={p.id} className="border rounded-lg p-4 hover:shadow-sm transition">
            {imgUrl ? (
              <div className="relative w-full h-48 mb-2">
                <Image
                  src={`${ASSETS}${imgUrl}`}
                  alt={a.nome}
                  fill
                  className="object-cover rounded"
                />
              </div>
            ) : (
              <div className="w-full h-48 mb-2 rounded bg-gray-100 grid place-items-center">
                <span className="text-gray-400 text-sm">Sem imagem</span>
              </div>
            )}

            <h3 className="font-semibold">{a.nome}</h3>
            {a.descricao && <p className="text-sm text-gray-600">{a.descricao}</p>}
            <p className="mt-2 font-bold">
              {Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(a.preco ?? 0)}
            </p>
          </div>
        );
      })}
    </div>
  );
}
