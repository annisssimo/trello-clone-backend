export const config = {
  username: process.env.DB_USERNAME || 'annisssimo',
  password: process.env.DB_PASSWORD || '4456',
  database: process.env.DB_DATABASE || 'trellodb',
  host: process.env.DB_HOST || 'localhost',
  dialect: 'postgres',
};
