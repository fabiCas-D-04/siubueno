import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import studentRoutes from './routes/studentRoutes';
import { errorHandler } from './middleware/errorHandler';
import { createTables } from './database/schema';
import { seedDatabase } from './database/seed';
import { isMemoryDb } from './database/connection';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'UNIVALLE ACADEMIC API funcionando correctamente' });
});

app.use('/api/auth', authRoutes);
app.use('/api', studentRoutes);

app.use(errorHandler);

async function start(): Promise<void> {
  try {
    await createTables();
    if (isMemoryDb) {
      await seedDatabase();
    }
    console.log('Base de datos lista');
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error iniciando servidor:', error);
    process.exit(1);
  }
}

start();