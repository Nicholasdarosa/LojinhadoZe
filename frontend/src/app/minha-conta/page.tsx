// src/app/minha-conta/page.tsx
import { cookies } from "next/headers";

async function getCurrentUser() {
  const cookieStore = cookies();
  const token = cookieStore.get("lojinha_token")?.value;

  if (!token) return null;

  const res = await fetch(`${process.env.BACKEND_URL}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) return null;

  return res.json(); // { id, name, email, ... }
}

export default async function MinhaContaPage() {
  const user = await getCurrentUser();

  if (!user) {
    // sem usuário → redireciona pro login
    return (
      <div>
        <p>Você precisa estar logado para acessar a conta.</p>
        {/* ou redirect("/login") em um server action */}
      </div>
    );
  }

  return (
    <div>
      <h1>Minha Conta</h1>

      <form>
        <label>Nome</label>
        <input value={user.name} disabled />

        <label>Email</label>
        <input value={user.email} disabled />

        {/* Campos editáveis de perfil/entrega em outro form */}
      </form>
    </div>
  );
}
