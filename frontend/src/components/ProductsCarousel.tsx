// src/components/ProductsCarousel.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useLayoutEffect } from "react";
import { Heart, ShoppingCart } from "lucide-react";

/** Dados mínimos de cada produto exibido no carrossel */
export type ProductCard = {
  id: string | number;
  name: string;
  price: number;
  img: string;
  href: string;
  /** opcional: preço antigo (para riscar) */
  oldPrice?: number;
  /** opcional: desconto forçado (caso não use oldPrice) */
  discountPct?: number;
  /** opcional: badge custom (ex.: "LANÇAMENTO", "OFERTA") */
  badge?: string;
};

export default function ProductsCarousel({
  title,
  subtitle,
  items,
}: {
  title: string;
  subtitle?: string;
  items: ProductCard[];
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const refreshArrows = () => {
    const el = scroller.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 0);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  useLayoutEffect(() => {
    refreshArrows();
    const el = scroller.current;
    if (!el) return;
    const onScroll = () => refreshArrows();
    el.addEventListener("scroll", onScroll, { passive: true });
    const ro = new ResizeObserver(() => refreshArrows());
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", onScroll);
      ro.disconnect();
    };
  }, []);

  const scrollBy = (dir: "left" | "right") => {
    const el = scroller.current;
    if (!el) return;
    const step = Math.round(el.clientWidth * 0.9);
    el.scrollBy({ left: dir === "left" ? -step : step, behavior: "smooth" });
  };

  const fmt = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-baseline gap-3">
          <h2 className="text-2xl font-extrabold tracking-tight">{title}</h2>
          {subtitle ? (
            <p className="text-sm text-neutral-600">{subtitle}</p>
          ) : null}
        </div>

        {/* setas (desktop) */}
        <div className="hidden md:flex gap-2 shrink-0">
          <button
            onClick={() => scrollBy("left")}
            disabled={!canPrev}
            aria-label="Anterior"
            className="rounded-full bg-white px-3 py-1 text-sm shadow-sm hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ◀
          </button>
          <button
            onClick={() => scrollBy("right")}
            disabled={!canNext}
            aria-label="Próximo"
            className="rounded-full bg-white px-3 py-1 text-sm shadow-sm hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ▶
          </button>
        </div>
      </div>

      {/* faixa de cards */}
      <div
        ref={scroller}
        className="flex gap-6 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth snap-x snap-mandatory"
      >
        {items.map((p) => {
          const hasOld = typeof p.oldPrice === "number" && p.oldPrice! > p.price;
          const pct =
            typeof p.discountPct === "number"
              ? Math.round(p.discountPct!)
              : hasOld
              ? Math.max(1, Math.round(100 - (p.price / (p.oldPrice as number)) * 100))
              : null;

          return (
            <article
              key={p.id}
              className="
                relative group snap-start min-w-[280px] w-[300px] max-w-[320px]
                rounded-2xl bg-white shadow-[0_1px_6px_rgba(0,0,0,0.08)]
                transition overflow-hidden
                hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)]
                /* camada 1: contorno interno 100% com ::after */
                after:pointer-events-none after:content-[''] after:absolute after:inset-0 after:rounded-2xl
                after:border-2 after:border-[#ffd101] after:opacity-0 group-hover:after:opacity-100 after:transition after:z-10
                /* camada 2 (backup): anel externo (não mexe em layout) */
                hover:ring-2 hover:ring-[#ffd101] hover:ring-offset-0
              "
            >
              {/* imagem / badges / favorito */}
              <div className="relative z-0">
                {p.badge ? (
                  <span className="absolute left-3 top-3 z-20 rounded bg-red-600 px-2 py-1 text-[11px] font-extrabold text-white">
                    {p.badge}
                  </span>
                ) : pct !== null ? (
                  <span className="absolute left-3 top-3 z-20 rounded bg-red-600 px-2 py-1 text-[11px] font-extrabold text-white">
                    -{pct}%
                  </span>
                ) : null}

                <button
                  aria-label="Favoritar"
                  className="absolute right-3 top-3 z-20 grid h-9 w-9 place-items-center rounded-lg bg-white/95 text-black/80 shadow
                             hover:bg-white"
                >
                  <Heart className="h-4 w-4" />
                </button>

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
                    <div className="text-sm text-neutral-400">sem imagem</div>
                  )}
                </div>
              </div>

              {/* conteúdo */}
              <div className="p-4 flex flex-col gap-3 z-0 relative">
                <Link
                  href={p.href}
                  className="line-clamp-2 text-[15px] font-semibold leading-snug hover:underline"
                >
                  {p.name}
                </Link>

                <div className="flex items-baseline gap-2">
                  {hasOld && (
                    <span className="text-sm text-neutral-500 line-through">
                      {fmt(p.oldPrice!)}
                    </span>
                  )}
                  <span className="text-[22px] font-extrabold">{fmt(p.price)}</span>
                </div>

                <Link
                  href={p.href}
                  aria-label={`Adicionar ${p.name}`}
                  className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-xl
                             bg-[#ffd101] px-4 py-3 font-semibold text-black
                             hover:brightness-95 active:scale-[0.99] transition"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Adicionar
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
