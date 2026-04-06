import cors from 'cors';
import dotenv from 'dotenv';
import express, { type Application, type NextFunction, type Request, type Response } from 'express';
import helmet from 'helmet';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import container from './config/container';
import { swaggerSpec, swaggerUi } from './config/swagger';
import { errorHandler, notFound } from './middlewares/errorHandler';

dotenv.config();

const createApp = (): Application => {
  const app: Application = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use('/uploads', express.static(path.resolve(process.cwd(), 'public', 'uploads')));

  app.use((req: Request, res: Response, next: NextFunction) => {
    const incomingRequestId = req.header('X-Request-ID') || req.header('x-request-id');
    const requestId = incomingRequestId || randomUUID();
    req.requestId = requestId;
    res.setHeader('X-Request-ID', requestId);
    next();
  });

  app.use((req: Request, _res: Response, next: NextFunction) => {
    req.container = container;
    next();
  });

  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'MyAnilist API Docs',
      customfavIcon: '/assets/favicon.ico',
    })
  );

  // API Routes
  const router = require('./routes')(container);

  app.use('/api', router);
  app.use(notFound);
  app.use(errorHandler);

  return app;
};

export { container, createApp };
