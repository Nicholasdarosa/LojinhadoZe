import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::produto.produto",
  ({ strapi }) => ({
    async findBySlug(ctx) {
      const { slug } = ctx.params;

      if (!slug) {
        return ctx.badRequest("slug is required");
      }

      const produtos = await strapi.entityService.findMany(
        "api::produto.produto",
        {
          filters: {
            slug,
            ativo: true,
          },
          populate: {
            galeria: true,
            marca: true,
            categorias: true,
            categoriaPrincipal: true,
          },
          publicationState: "live",
          limit: 1,
        }
      );

      const produto = produtos[0];

      if (!produto) {
        return ctx.notFound("Produto não encontrado");
      }

      const sanitized = await this.sanitizeOutput(produto, ctx);
      return this.transformResponse(sanitized);
    },
  })
);
