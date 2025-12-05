import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { initializeDatabase, closePool, markStalePNodesOffline, recordStatsSnapshot } from './db/index.js';
import reportRoutes from './routes/report.js';
import statsRoutes from './routes/stats.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || [
    'http://localhost:3000',
    'https://xandscope.io',
    'https://www.xandscope.io',
  ],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parser
app.use(express.json({ limit: '100kb' }));

// Request logging
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/report', reportRoutes);
app.use('/api', statsRoutes);

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    service: 'XANDSCOPE Stats Service',
    version: '1.0.0',
    description: 'Aggregates pNode statistics for the Xandeum network',
    endpoints: {
      'POST /api/report': 'Submit pNode stats report',
      'GET /api/network/stats': 'Get aggregated network statistics',
      'GET /api/pnodes': 'List all reporting pNodes',
      'GET /api/pnode/:publicKey': 'Get specific pNode stats',
      'GET /api/health': 'Health check',
    },
    docs: 'https://github.com/XANDSCOPE/xandscope-stats-service',
  });
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Error]', err);
  res.status(500).json({
    ok: false,
    error: 'Internal server error',
  });
});

// Background tasks
let staleCheckInterval: NodeJS.Timeout | null = null;
let snapshotInterval: NodeJS.Timeout | null = null;

function startBackgroundTasks() {
  // Check for stale pNodes every minute
  staleCheckInterval = setInterval(async () => {
    try {
      const count = await markStalePNodesOffline();
      if (count > 0) {
        console.log(`[Background] Marked ${count} pNode(s) as offline (stale)`);
      }
    } catch (error) {
      console.error('[Background] Error marking stale pNodes:', error);
    }
  }, 60 * 1000);

  // Record stats snapshot every 5 minutes for historical data
  snapshotInterval = setInterval(async () => {
    try {
      await recordStatsSnapshot();
      console.log('[Background] Recorded stats snapshot');
    } catch (error) {
      console.error('[Background] Error recording snapshot:', error);
    }
  }, 5 * 60 * 1000);
}

function stopBackgroundTasks() {
  if (staleCheckInterval) clearInterval(staleCheckInterval);
  if (snapshotInterval) clearInterval(snapshotInterval);
}

// Graceful shutdown
async function shutdown() {
  console.log('\n[Server] Shutting down...');
  stopBackgroundTasks();
  await closePool();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Start server
async function start() {
  try {
    // Check for required env vars
    if (!process.env.DATABASE_URL) {
      console.error('[Server] Missing DATABASE_URL environment variable');
      console.error('[Server] Set it in .env file or environment');
      process.exit(1);
    }

    // Initialize database
    await initializeDatabase();
    
    // Start background tasks
    startBackgroundTasks();

    // Start listening
    app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   🚀 XANDSCOPE Stats Service                                  ║
║                                                               ║
║   Running on: http://localhost:${PORT}                          ║
║   Environment: ${process.env.NODE_ENV || 'development'}                               ║
║                                                               ║
║   Endpoints:                                                  ║
║   • POST /api/report      - Submit pNode stats               ║
║   • GET  /api/network/stats - Get network totals             ║
║   • GET  /api/pnodes      - List all pNodes                  ║
║   • GET  /api/health      - Health check                     ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('[Server] Failed to start:', error);
    process.exit(1);
  }
}

start();
