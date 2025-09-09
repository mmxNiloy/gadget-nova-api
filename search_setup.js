// search_setup.js
const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

async function run() {
  const client = new Client({
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT),
    database: process.env.DATABASE_DB,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
  });

  await client.connect();

  console.log('Connected to DB, running search setup...');

  try {
    await client.query(`
      CREATE EXTENSION IF NOT EXISTS pg_trgm;
      CREATE EXTENSION IF NOT EXISTS unaccent;

      CREATE INDEX IF NOT EXISTS idx_products_title_tsvector
      ON products USING gin (to_tsvector('english', title));

      CREATE INDEX IF NOT EXISTS idx_products_title_trgm
      ON products USING gin (title gin_trgm_ops);
    `);

    console.log('✅ Search setup completed successfully!');
  } catch (err) {
    console.error('❌ Error running search setup:', err);
  } finally {
    await client.end();
    console.log('Disconnected from DB.');
  }
}

run();
