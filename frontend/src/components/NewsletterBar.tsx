// src/components/NewsletterBar.tsx
export default function NewsletterBar() {
  return (
    <section className="bg-black text-white">
      <div className="mx-auto max-w-7xl px-4 py-10 grid gap-4 sm:grid-cols-2 items-center">
        <div>
          <h3 className="text-lg font-semibold">Receba novidades e ofertas</h3>
          <p className="text-white/80 text-sm">
            Cadastre seu e-mail para não perder nenhum lançamento.
          </p>
        </div>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            alert("Obrigado! (exemplo)");
          }}
        >
          <input
            type="email"
            required
            placeholder="seu-email@exemplo.com"
            className="w-full rounded-md px-4 py-3 text-black"
          />
          <button
            type="submit"
            className="shrink-0 rounded-md bg-white px-4 py-3 text-black font-medium"
          >
            Assinar
          </button>
        </form>
      </div>
    </section>
  );
}
