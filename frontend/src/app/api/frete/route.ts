
// src/app/api/frete/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const cep = String(body.cep || "").replace(/\D/g, "");

    if (!cep || cep.length !== 8) {
      return NextResponse.json(
        { error: "CEP inválido" },
        { status: 400 }
      );
    }

    // Aqui é MOCK. Depois trocamos por Correios/MelhorEnvio/etc.
    // Dá pra considerar peso/total do carrinho, cidade, etc.
    let valor = 19.9;
    if (cep.startsWith("80") || cep.startsWith("81")) {
      // Ex: região Curitiba mais barato
      valor = 9.9;
    }

    return NextResponse.json({
      cep,
      valor,
      prazoDias: 3,
      servico: "Envio padrão",
    });
  } catch (e) {
    console.error("Erro ao calcular frete", e);
    return NextResponse.json(
      { error: "Erro ao calcular frete" },
      { status: 500 }
    );
  }
}
