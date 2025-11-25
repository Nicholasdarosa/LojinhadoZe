export default {
  routes: [
    {
      method: 'GET',
      path: '/produtos/slug/:slug',
      handler: 'produto.findBySlug',
      config: {
        auth: false,
      },
    },
  ],
};
