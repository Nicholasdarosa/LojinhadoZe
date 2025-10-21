export default ({ env }) => ({
  encryption: {
    // Avisa ao Strapi qual chave usar
    key: env('ENCRYPTION_KEY'),
  },
});
