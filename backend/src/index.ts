import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import session from 'express-session';
import routes from './routes/main.routes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { securityMonitor } from './middleware/securityMonitor.js';
import securityLogger from './utils/securityLogger.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

if(process.env.SESSION_SECRET === undefined) throw new Error('SESSION_SECRET no esta definido');

const sessionConfig = {
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict' as const,
    maxAge: 24 * 60 * 60 * 1000 
  },
  name: 'sessionId', 
  rolling: true, 
};

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Demasiadas peticiones desde esta IP, por favor intente nuevamente en 15 minutos',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: express.Request, res: express.Response) => {
    securityLogger.warn('Rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      timestamp: new Date().toISOString()
    });
    res.status(429).json({
      error: 'Demasiadas peticiones desde esta IP, por favor intente nuevamente en 15 minutos'
    });
  }
});

const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400
};

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      sandbox: ['allow-forms', 'allow-scripts', 'allow-same-origin']
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(morgan('combined', {
  stream: {
    write: (message: string) => securityLogger.info(message.trim())
  }
}));

app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true, limit: '1mb' }))

app.use(session(sessionConfig));

app.use(securityMonitor as express.RequestHandler);

app.use(limiter);

app.use('/api', routes);

app.use(errorHandler);

const server = app.listen(port, () => {
  securityLogger.info(`🚀 Servidor corriendo en http://localhost:${port}`);
}); 

export { server };
export default app;