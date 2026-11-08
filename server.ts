import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

import { config } from './server/config.js';
import { connectMongo } from './server/db/mongo.js';
import { seedInitialData } from './server/db/dataStore.js';

import authRoutes from './server/routes/authRoutes.js';
import documentRoutes from './server/routes/documentRoutes.js';
import validationRoutes from './server/routes/validationRoutes.js';
import relationshipRoutes from './server/routes/relationshipRoutes.js';
import assistantRoutes from './server/routes/assistantRoutes.js';
import workflowRoutes from './server/routes/workflowRoutes.js';
import reportRoutes from './server/routes/reportRoutes.js';
import dashboardRoutes from './server/routes/dashboardRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function bootstrap() {
  const app = express();
  const PORT = config.port;

  // Initialize Database & Benchmark seed
  await connectMongo();
  await seedInitialData();

  // Security & Middleware
  app.use(helmet({
    contentSecurityPolicy: false, // Allow Vite inline scripts and styles
    crossOriginEmbedderPolicy: false,
  }));
  app.use(cors({
    origin: true,
    credentials: true,
  }));
  app.use(cookieParser());
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // Static uploads directory
  const uploadsDir = path.resolve(__dirname, 'uploads');
  app.use('/uploads', express.static(uploadsDir));

  // Health-check endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      app: 'DocVision AI',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        embeddingDimensions: config.embeddingDimensions,
        groqModel: config.groqModel,
      }
    });
  });

  // REST API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/documents', documentRoutes);
  app.use('/api/validation', validationRoutes);
  app.use('/api/relationships', relationshipRoutes);
  app.use('/api/assistant', assistantRoutes);
  app.use('/api/workflow', workflowRoutes);
  app.use('/api/reports', reportRoutes);
  app.use('/api/dashboard', dashboardRoutes);

  // Centralized Error Handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('[DocVision Server Error]:', err);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Internal Server Error',
    });
  });

  // Vite Dev Server or Production Static Serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(`  DOCVISION AI — Enterprise Document Intelligence Platform`);
    console.log(`  Dev Server running at http://0.0.0.0:${PORT}`);
    console.log(`  API Base URL: http://0.0.0.0:${PORT}/api`);
    console.log(`=======================================================`);
  });
}

bootstrap().catch(err => {
  console.error('Fatal bootstrap error:', err);
  process.exit(1);
});
