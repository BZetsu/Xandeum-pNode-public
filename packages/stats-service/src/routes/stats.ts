import { Router, Request, Response } from 'express';
import { getNetworkStats, getPNodeStats, getAllPNodes } from '../db/index.js';
import { statsRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

/**
 * GET /api/network/stats
 * 
 * Returns aggregated network statistics.
 * This is the main endpoint that XANDSCOPE dashboard calls.
 */
router.get('/network/stats', statsRateLimiter, async (_req: Request, res: Response) => {
  try {
    const stats = await getNetworkStats();
    
    res.json({
      ok: true,
      data: stats,
    });
  } catch (error) {
    console.error('[Stats] Error fetching network stats:', error);
    res.status(500).json({
      ok: false,
      error: 'Internal server error',
    });
  }
});

/**
 * GET /api/pnodes
 * 
 * Returns list of all pNodes with their stats.
 * Supports pagination via query params: ?limit=100&offset=0
 */
router.get('/pnodes', statsRateLimiter, async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 100, 500);
    const offset = parseInt(req.query.offset as string) || 0;

    const pnodes = await getAllPNodes(limit, offset);

    res.json({
      ok: true,
      data: {
        pnodes,
        pagination: {
          limit,
          offset,
          count: pnodes.length,
        },
      },
    });
  } catch (error) {
    console.error('[Stats] Error fetching pNodes:', error);
    res.status(500).json({
      ok: false,
      error: 'Internal server error',
    });
  }
});

/**
 * GET /api/pnode/:publicKey
 * 
 * Returns stats for a specific pNode by public key.
 */
router.get('/pnode/:publicKey', statsRateLimiter, async (req: Request, res: Response) => {
  try {
    const { publicKey } = req.params;

    if (!publicKey || publicKey.length < 32 || publicKey.length > 64) {
      res.status(400).json({
        ok: false,
        error: 'Invalid public key format',
      });
      return;
    }

    const pnode = await getPNodeStats(publicKey);

    if (!pnode) {
      res.status(404).json({
        ok: false,
        error: 'pNode not found',
      });
      return;
    }

    res.json({
      ok: true,
      data: pnode,
    });
  } catch (error) {
    console.error('[Stats] Error fetching pNode:', error);
    res.status(500).json({
      ok: false,
      error: 'Internal server error',
    });
  }
});

/**
 * GET /api/health
 * 
 * Health check endpoint for monitoring.
 */
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    ok: true,
    service: 'xandscope-stats-service',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

export default router;



