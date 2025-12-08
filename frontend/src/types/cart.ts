// src/types/cart.ts
export type CartItem = {
  id: string; // id interno do item no carrinho
  productId: number; // id do produto (Strapi)
  variantId?: number; // se tiver variação
  name: string;
  slug: string;
  imageUrl: string;
  unitPrice: number; // em centavos
  quantity: number;
  // campos opcionais que podem vir do Strapi
  variantName?: string; // "OCB Brown 1¼", "Tamanho M", etc.
};

export type Cart = {
  id: string;
  items: CartItem[];
  subtotal: number; // em centavos
  total: number; // em centavos (depois soma frete, cupom etc.)
};
