// src/components/MenuRowClient.tsx
"use client";

import * as React from "react";

/**
 * Envolve o conteúdo do menu e colapsa ao rolar para baixo; expande ao rolar para cima.
 * Usa animação baseada em max-height para não interferir no sticky do Header.
 */
export default function MenuRowClient({ children }: { children: React.ReactNode }) {
  const innerRef = React.useRef<HTMLDivElement>(null);

  const [maxH, setMaxH] = React.useState<number>(0);
  const [collapsed, setCollapsed] = React.useState(false);
  const [ready, setReady] = React.useState(false);

  const lastY = React.useRef(0);
  const ticking = React.useRef(false);

  // mede a altura do conteúdo e salva como max-height
  const measure = React.useCallback(() => {
    const el = innerRef.current;
    if (!el) return;
    const h = el.getBoundingClientRect().height;
    setMaxH(h);
    if (!ready && h > 0) setReady(true);
  }, [ready]);

  React.useEffect(() => {
    measure();
    // recalcula em resize
    const ro = new ResizeObserver(() => measure());
    if (innerRef.current) ro.observe(innerRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  React.useEffect(() => {
    lastY.current = window.scrollY || 0;

    const onScroll = () => {
      const y = window.scrollY || 0;
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const delta = y - lastY.current;

          // topo da página -> sempre expandido
          if (y < 16) setCollapsed(false);
          // rolando pra cima -> expande
          else if (delta < -8) setCollapsed(false);
          // rolando pra baixo -> colapsa
          else if (delta > 8) setCollapsed(true);

          lastY.current = y;
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // enquanto ainda não mediu, evita "piscar" (fica invisível, mas ocupa espaço)
  if (!ready) {
    return (
      <div style={{ visibility: "hidden" }}>
        <div ref={innerRef}>{children}</div>
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden will-change-[max-height,opacity]"
      style={{
        maxHeight: collapsed ? 0 : maxH,
        transition: "max-height 260ms ease, opacity 200ms ease",
        opacity: collapsed ? 0 : 1,
      }}
      aria-hidden={collapsed ? "true" : "false"}
    >
      <div ref={innerRef}>{children}</div>
    </div>
  );
}
