// config/database.ts
export default ({ env }) => {
  // Se quiser usar uma URL única (ex.: em produção): postgres://user:pass@host:5432/dbname
  const DATABASE_URL = env('DATABASE_URL', '');

  // SSL somente se você realmente precisar (cloud/produção). Em dev local, deixe false.
  const ssl =
    env.bool('DATABASE_SSL', false)
      ? {
          rejectUnauthorized: env.bool(
            'DATABASE_SSL_REJECT_UNAUTHORIZED',
            false
          ),
        }
      : false;

  // Monta a conexão: com URL ou com cada campo separado
  const connection = DATABASE_URL
    ? {
        connectionString: DATABASE_URL,
        ssl,
        schema: env('DATABASE_SCHEMA', 'public'),
      }
    : {
        host: env('DATABASE_HOST', 'localhost'),
        port: env.int('DATABASE_PORT', 5432),
        database: env('DATABASE_NAME', 'loja_db'),
        user: env('DATABASE_USERNAME', 'loja_user'),
        password: env('DATABASE_PASSWORD', 'SUA_SENHA_FORTE'),
        ssl,
        schema: env('DATABASE_SCHEMA', 'public'),
      };

  return {
    connection: {
      client: 'postgres',
      connection,
      pool: {
        min: env.int('DATABASE_POOL_MIN', 0),
        max: env.int('DATABASE_POOL_MAX', 10),
      },
      acquireConnectionTimeout: env.int('DATABASE_CONNECTION_TIMEOUT', 60000),
    },
  };
};
