function normalizePreco(data: any) {
  if (data && data.preco !== undefined && data.preco !== null) {
    let v = data.preco;
    if (typeof v === "string") {
      v = v.replace(/[R$\s]/g, "").replace(/\./g, "").replace(",", ".").trim();
    }
    const n = Number(v);
    if (Number.isFinite(n)) {
      const fixed = Number(n.toFixed(2));
      data.preco = fixed >= 0 ? fixed : 0;
    } else {
      delete data.preco;
    }
  }
}

function normalizeSku(data: any) {
  if (data && typeof data.sku === "string") {
    const sku = data.sku.trim();
    data.sku = sku ? sku.toUpperCase() : sku;
  }
}

function normalizeEstoque(data: any) {
  if (data && data.estoque !== undefined && data.estoque !== null) {
    const n = Number(data.estoque);
    if (Number.isFinite(n)) {
      data.estoque = Math.max(0, Math.trunc(n));
    } else {
      delete data.estoque;
    }
  }
}

/** Extrai um documentId/id de várias formas possíveis */
function toDocId(x: any): string | undefined {
  if (!x) return undefined;
  if (typeof x === "string") return x;
  if (typeof x === "number") return String(x);
  if (typeof x === "object") {
    return x.documentId ?? x.id ?? x.value ?? x._id ?? undefined;
  }
  return undefined;
}

/**
 * Inclui categoriaPrincipal dentro de categorias **sem** quebrar o formato
 * de relações do Strapi v5 ({ connect, disconnect }).
 */
function ensureCategoriasIncludesPrincipal(data: any) {
  const principalId = toDocId(data?.categoriaPrincipal);
  if (!principalId) return;

  const cat = data.categorias;

  // 1) Nada informado ainda → cria connect com a principal
  if (!cat) {
    data.categorias = { connect: [principalId] };
    return;
  }

  // 2) Formato antigo (array de ids/objetos)
  if (Array.isArray(cat)) {
    const set = new Set<string>();
    for (const item of cat) {
      const id = toDocId(item);
      if (id) set.add(id);
    }
    set.add(principalId);
    // Mantém compatibilidade: deixa array mesmo (Strapi aceita),
    // mas preferível adotar o formato novo quando possível.
    data.categorias = Array.from(set);
    return;
  }

  // 3) Formato novo { connect, disconnect }
  if (typeof cat === "object") {
    const connectSet = new Set<string>();

    // preserva já solicitados
    if (Array.isArray(cat.connect)) {
      for (const c of cat.connect) {
        const id = toDocId(c);
        if (id) connectSet.add(id);
      }
    }

    // garante a principal
    connectSet.add(principalId);

    data.categorias = {
      ...cat,
      connect: Array.from(connectSet),
    };
  }
}

const lifecycles = {
  beforeCreate(event: any) {
    const d = event.params?.data ?? {};
    normalizePreco(d);
    normalizeSku(d);
    normalizeEstoque(d);
    // ⚠️ só ajusta categorias preservando o shape do Strapi v5
    ensureCategoriasIncludesPrincipal(d);
  },
  beforeUpdate(event: any) {
    const d = event.params?.data ?? {};
    normalizePreco(d);
    normalizeSku(d);
    normalizeEstoque(d);
    ensureCategoriasIncludesPrincipal(d);
  },
};

export default lifecycles;
