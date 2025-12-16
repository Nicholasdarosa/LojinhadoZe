// src/app/api/shipping/route.ts
import { NextRequest, NextResponse } from "next/server";

function cleanCep(raw: string | null | undefined): string {
  return (raw ?? "").replace(/\D/g, "");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const cepRaw: string | undefined = body.cep;

    const cep = cleanCep(cepRaw);
    if (cep.length !== 8) {
      return NextResponse.json(
        { error: "CEP inválido." },
        { status: 400 },
      );
    }

    // tenta ViaCEP só pra enriquecer info (não trava o frete se falhar)
    let destino: any = null;
    try {
      const viaRes = await fetch(
        `https://viacep.com.br/ws/${cep}/json/`,
        { cache: "no-store" },
      );
      if (viaRes.ok) {
        const via = await viaRes.json();
        if (!via?.erro) {
          destino = {
            logradouro: via.logradouro,
            bairro: via.bairro,
            localidade: via.localidade,
            uf: via.uf,
          };
        }
      }
    } catch {
      // ignora erro de ViaCEP, seguimos com frete padrão
    }

    // regra de frete simplificada:
    // - CEP começando com 8 (Sul/PR) → R$ 15,00 e prazo 4 dias
    // - demais → R$ 25,00 e prazo 7 dias
    const priceInCents = cep.startsWith("8") ? 1500 : 2500;
    const prazoEmDias = cep.startsWith("8") ? 4 : 7;

    return NextResponse.json({
      data: {
        cep,
        priceInCents,
        price: priceInCents / 100,
        prazoEmDias,
        destino,
      },
    });
  } catch (e) {
    console.error("POST /api/shipping", e);
    return NextResponse.json(
      { error: "Erro ao calcular frete." },
      { status: 500 },
    );
  }
}
