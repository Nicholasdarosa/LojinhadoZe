"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const strongPasswordRegex =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{11,}$/;

function validatePassword(pwd: string): string | null {
  if (!pwd) return "Informe uma senha.";
  if (pwd.length < 11) return "A senha deve ter pelo menos 11 caracteres.";
  if (!/[A-Z]/.test(pwd))
    return "A senha deve conter pelo menos 1 letra maiúscula.";
  if (!/\d/.test(pwd))
    return "A senha deve conter pelo menos 1 número.";
  if (!/[^A-Za-z0-9]/.test(pwd))
    return "A senha deve conter pelo menos 1 caractere especial.";
  if (!strongPasswordRegex.test(pwd))
    return "Senha inválida. Verifique os requisitos.";
  return null;
}

export default function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    // valida senha antes de chamar API
    const pwdErr = validatePassword(password);
    setPasswordError(pwdErr);
    if (pwdErr) return;

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      let json: any = null;
      try {
        json = await res.json();
      } catch (e) {
        console.error("Falha ao parsear resposta do /api/auth/register", e);
      }

      if (!res.ok) {
        setErro(
          json?.error || "Não foi possível criar sua conta no momento.",
        );
        return;
      }

      // sucesso -> volta pro redirect
      router.push(redirect);
      router.refresh();
    } catch (err) {
      console.error(err);
      setErro("Erro de comunicação com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  function handlePasswordChange(v: string) {
    setPassword(v);
    if (passwordError || erro) {
      // valida em tempo real quando já tentou enviar
      const pwdErr = validatePassword(v);
      setPasswordError(pwdErr);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <label className="block text-sm font-medium text-neutral-800">
          Nome
        </label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-800"
          placeholder="Como quer ser chamado"
          required
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-neutral-800">
          E-mail
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-800"
          placeholder="seu-email@exemplo.com"
          required
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-neutral-800">
          Senha
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => handlePasswordChange(e.target.value)}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-800"
          required
        />
        {passwordError && (
          <p className="text-xs text-red-500">{passwordError}</p>
        )}
        {!passwordError && (
          <p className="text-[11px] text-neutral-500">
            Requisitos: mínimo 11 caracteres, contendo pelo menos 1 letra
            maiúscula, 1 número e 1 caractere especial.
          </p>
        )}
      </div>

      {erro && <p className="text-xs text-red-500">{erro}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-[#ff6a00] py-2.5 text-sm font-semibold text-white hover:brightness-95 disabled:opacity-60 transition"
      >
        {loading ? "Criando conta..." : "Criar conta"}
      </button>
    </form>
  );
}
