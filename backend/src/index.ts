import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import studentRoutes from './routes/studentRoutes';
import { errorHandler } from './middleware/errorHandler';
import { createTables } from './database/schema';
import { seedDatabase } from './database/seed';
import { isMemoryDb } from './database/connection';

dotenv.config();

const allowedOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

let readyPromise: Promise<void> | null = null;

export function bootstrap(): Promise<void> {
  if (!readyPromise) {
    readyPromise = (async () => {
      await createTables();
      if (isMemoryDb) {
        await seedDatabase();
      }
    })();
  }
  return readyPromise;
}

export function createApp(): Express {
  const app = express();

  app.set('trust proxy', 1);
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        callback(null, false);
      },
      credentials: true,
    })
  );
  app.use(express.json());

  app.use(async (_req, res, next) => {
    try {
      await bootstrap();
      next();
    } catch (error) {
      console.error('Error inicializando base de datos:', error);
      res.status(503).json({ message: 'Base de datos no disponible' });
    }
  });

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', message: 'UNIVALLE ACADEMIC API funcionando correctamente' });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api', studentRoutes);

  app.use(errorHandler);

  return app;
}

export async function start(): Promise<void> {
  await bootstrap();
  const port = Number(process.env.PORT) || 3001;
  createApp().listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
  });
}

if (require.main === module) {
  start().catch((error) => {
    console.error('Error iniciando servidor:', error);
    process.exit(1);
  });
}
