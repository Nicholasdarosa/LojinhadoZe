// src/components/SelectedShowcase.tsx
import Image from "next/image";
import Link from "next/link";

export type SelectedCard = {
  titulo: string;
  subtitulo?: string;
  url?: string;
  iconeUrl?: string;   // media simples
  imagemUrl?: string;  // media simples
};

export default function SelectedShowcase({
  title,
  cards,
}: {
  title: string;
  cards: SelectedCard[];
}) {
  if (!cards?.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex items-baseline gap-2 mb-4">
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-sm text-gray-500">
          Escolhemos cada item dessa coleção para elevar sua vibe
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {cards.map((c, idx) => {
          const content = (
            <div className="group relative h-72 md:h-80 lg:h-96 rounded-2xl overflow-hidden border shadow-sm">
              {/* fundo (foto) */}
              {c.imagemUrl ? (
                <Image
                  src={c.imagemUrl}
                  alt={c.titulo}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 1024px) 50vw, 16vw"
                  priority={idx < 2}
                />
              ) : (
                <div className="absolute inset-0 bg-gray-200" />
              )}

              {/* overlay amarelo -> suaviza no hover */}
              <div className="absolute inset-0 bg-[#fea700]/60 backdrop-blur-[1px] transition-all duration-300 group-hover:bg-black/20 group-hover:backdrop-blur-0" />

              {/* conteúdo */}
              <div className="absolute inset-0 grid place-items-center text-white drop-shadow">
                <div className="flex flex-col items-center gap-3">
                  {c.iconeUrl ? (
                    <Image
                      src={c.iconeUrl}
                      alt=""
                      width={56}
                      height={56}
                      className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 object-contain"
                    />
                  ) : null}
                  <span className="text-center text-xs md:text-sm lg:text-base font-extrabold uppercase tracking-wide">
                    {c.titulo}
                  </span>
                  {c.subtitulo ? (
                    <span className="text-center text-[11px] md:text-xs opacity-90">
                      {c.subtitulo}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          );

          return c.url ? (
            <Link key={idx} href={c.url} className="block">
              {content}
            </Link>
          ) : (
            <div key={idx}>{content}</div>
          );
        })}
      </div>
    </section>
  );
}