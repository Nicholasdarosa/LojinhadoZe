// src/app/login/page.tsx
export const dynamic = "force-dynamic";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { FC } from "react";
import LoginRegisterClient from "./LoginRegisterClient";

type PageProps = {
  searchParams: Promise<{ redirect?: string }>;
};

const LoginPage: FC<PageProps> = async ({ searchParams }) => {
  const sp = await searchParams;
  const redirect =
    typeof sp?.redirect === "string" && sp.redirect.trim() !== ""
      ? sp.redirect
      : "/conta";

  return (
    <main>
      <Header />

      <div className="mx-auto max-w-5xl px-4 py-10 md:py-12">
        <LoginRegisterClient redirect={redirect} />
      </div>

      <Footer />
    </main>
  );
};

export default LoginPage;
