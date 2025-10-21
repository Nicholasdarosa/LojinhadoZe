// src/components/BrandsStrip.tsx
import Image from "next/image";

type Brand = {
  id: number | string;
  name?: string;
  logoUrl: string;
  link?: string | null;
};

export default function BrandsStrip({ brands }: { brands: Brand[] }) {
  if (!brands?.length) return null;

  return (
    <section className="border-y bg-white">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <h2 className="mb-4 text-base font-semibold text-gray-900">
          Marcas parceiras
        </h2>

        {/* carrossel simples horizontal/scroll */}
        <div className="flex gap-6 overflow-x-auto py-2 no-scrollbar">
          {brands.map((b) => {
            const content = (
              <div className="shrink-0 grid place-items-center rounded-lg border bg-white px-6 py-4 hover:shadow-sm transition">
                {/* Alt com fallback para acessibilidade */}
                <Image
                  src={b.logoUrl}
                  alt={b.name || "Marca"}
                  width={160}
                  height={80}
                  className="h-10 sm:h-12 w-auto object-contain"
                />
              </div>
            );
            return b.link ? (
              <a
                key={b.id}
                href={b.link}
                target="_blank"
                rel="noopener noreferrer"
                className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black rounded-lg"
                title={b.name || undefined}
              >
                {content}
              </a>
            ) : (
              <div key={b.id}>{content}</div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
