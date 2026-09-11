import { Pool } from 'pg';
import { newDb } from 'pg-mem';
import dotenv from 'dotenv';

dotenv.config();

export const isMemoryDb = (process.env.DB_MODE || 'memory') !== 'postgres';

let pool: Pool;

if (isMemoryDb) {
  const memDb = newDb({ noAstCoverageCheck: true, noErrorDiagnostic: true });
  const { Pool: MemPool } = memDb.adapters.createPg() as any;
  pool = new MemPool();
  console.log('Base de datos en memoria activada (no se requiere PostgreSQL)');
} else {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
}

if (!isMemoryDb) {
  pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
  });
}

export default pool;