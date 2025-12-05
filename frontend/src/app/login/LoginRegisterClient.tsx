"use client";

import { useState } from "react";

type Props = {
  redirect: string;
};

type ApiError = { error?: string };

async function postJSON<T = any>(
  url: string,
  body: unknown
): Promise<{ ok: boolean; data?: T; error?: string }> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const ct = res.headers.get("content-type") ?? "";
    let json: any = null;

    if (ct.includes("application/json")) {
      json = await res.json();
    }

    if (!res.ok) {
      const msg =
        (json as ApiError)?.error || "Não foi possível completar a operação.";
      return { ok: false, error: msg };
    }

    return { ok: true, data: json as T };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Erro de comunicação com o servidor." };
  }
}

function validaSenhaCadastro(password: string): string | null {
  if (password.length < 11) {
    return "A senha deve ter pelo menos 11 caracteres.";
  }
  if (!/[A-Z]/.test(password)) {
    return "A senha deve ter pelo menos 1 letra maiúscula.";
  }
  if (!/[0-9]/.test(password)) {
    return "A senha deve ter pelo menos 1 número.";
  }
  if (!/[!@#$%^&*()_\-+={}[\]:;"'<>,.?/~`|\\]/.test(password)) {
    return "A senha deve ter pelo menos 1 caractere especial.";
  }
  return null;
}

export default function LoginRegisterClient({ redirect }: Props) {
  // login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // registro
  const [regNome, setRegNome] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPass, setRegPass] = useState("");
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    const { ok, error } = await postJSON("/api/auth/login", {
      identifier: loginEmail,
      password: loginPass,
    });

    setLoginLoading(false);

    if (!ok) {
      setLoginError(error || "E-mail ou senha inválidos.");
      return;
    }

    // sucesso → vai pro redirect (carrinho ou conta)
    window.location.href = redirect;
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setRegError(null);

    const senhaErro = validaSenhaCadastro(regPass);
    if (senhaErro) {
      setRegError(senhaErro);
      return;
    }

    setRegLoading(true);

    const { ok, error } = await postJSON("/api/auth/register", {
      username: regNome,
      email: regEmail,
      password: regPass,
    });

    setRegLoading(false);

    if (!ok) {
      setRegError(error || "Não foi possível criar sua conta.");
      return;
    }

    // sucesso → redireciona igual login
    window.location.href = redirect;
  }

  return (
    <div className="grid gap-10 md:grid-cols-2">
      {/* Login */}
      <section>
        <h1 className="text-2xl font-extrabold mb-2">Entrar na sua conta</h1>
        <p className="text-sm text-neutral-600 mb-6">
          Use o e-mail e senha cadastrados para continuar a sua compra.
        </p>

        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm font-medium mb-1">E-mail</label>
            <input
              type="email"
              required
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
              placeholder="seu-email@exemplo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Senha</label>
            <input
              type="password"
              required
              value={loginPass}
              onChange={(e) => setLoginPass(e.target.value)}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
              placeholder="Sua senha"
            />
          </div>

          {loginError && (
            <p className="text-xs text-red-600">{loginError}</p>
          )}

          <button
            type="submit"
            disabled={loginLoading}
            className="w-full inline-flex items-center justify-center rounded-md bg-black py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
          >
            {loginLoading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </section>

      {/* Registro */}
      <section>
        <h2 className="text-2xl font-extrabold mb-2">Criar uma conta</h2>
        <p className="text-sm text-neutral-600 mb-6">
          Cadastre-se para salvar seus endereços, acompanhar pedidos e finalizar
          suas compras com mais rapidez.
        </p>

        <form className="space-y-4" onSubmit={handleRegister}>
          <div>
            <label className="block text-sm font-medium mb-1">Nome</label>
            <input
              type="text"
              required
              value={regNome}
              onChange={(e) => setRegNome(e.target.value)}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
              placeholder="Como quer ser chamado"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">E-mail</label>
            <input
              type="email"
              required
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
              placeholder="seu-email@exemplo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Senha</label>
            <input
              type="password"
              required
              value={regPass}
              onChange={(e) => setRegPass(e.target.value)}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
              placeholder="Mínimo 11 caracteres, 1 maiúscula, 1 número e 1 símbolo"
            />
            <p className="mt-1 text-[11px] text-neutral-500">
              Requisitos: mínimo 11 caracteres, contendo pelo menos 1 letra
              maiúscula, 1 número e 1 caractere especial.
            </p>
          </div>

          {regError && <p className="text-xs text-red-600">{regError}</p>}

          <button
            type="submit"
            disabled={regLoading}
            className="w-full inline-flex items-center justify-center rounded-md bg-[#ff6a00] py-2.5 text-sm font-semibold text-white hover:brightness-95 disabled:opacity-60"
          >
            {regLoading ? "Criando conta..." : "Criar conta"}
          </button>
        </form>
      </section>
    </div>
  );
}
