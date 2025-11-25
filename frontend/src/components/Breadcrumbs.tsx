// src/components/Breadcrumbs.tsx
export default function Breadcrumbs({ items }: { items: {label:string; href?:string}[] }) {
  return (
    <nav aria-label="breadcrumb" className="text-sm text-neutral-600">
      <ol className="flex flex-wrap gap-1">
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-1">
            {it.href ? <a href={it.href} className="hover:underline">{it.label}</a> : <span className="font-semibold text-black">{it.label}</span>}
            {i < items.length - 1 && <span>/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
