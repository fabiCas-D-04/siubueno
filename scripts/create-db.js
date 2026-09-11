#!/usr/bin/env node

const { Client } = require('pg');

const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres';
const targetDb = 'univalle_academic';

async function main() {
  const baseUrl = databaseUrl.replace(/\/[^/]*$/, `/${targetDb}`);
  const adminUrl = databaseUrl.replace(/\/[^/]*$/, '/postgres');

  const client = new Client({ connectionString: adminUrl });
  try {
    await client.connect();
    const result = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [targetDb]);
    if (result.rows.length === 0) {
      await client.query(`CREATE DATABASE ${targetDb}`);
      console.log(`Base de datos "${targetDb}" creada exitosamente.`);
    } else {
      console.log(`La base de datos "${targetDb}" ya existe.`);
    }
  } catch (error) {
    console.error('No se pudo conectar a PostgreSQL. Verifica que el servidor este corriendo y que la URL en .env sea correcta.');
    console.error(error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();