import { Router, Request, Response } from 'express';
import { PNodeReportSchema } from '../types/index.js';
import { upsertPNode } from '../db/index.js';
import { reportRateLimiter } from '../middleware/rateLimiter.js';
import { verifySignature } from '../middleware/verifySignature.js';

const router = Router();

/**
 * POST /api/report
 * 
 * Receives stats reports from pNodes.
 * Each pNode calls this endpoint every 60 seconds when stats reporting is enabled.
 */
router.post(
  '/',
  reportRateLimiter,
  verifySignature,
  async (req: Request, res: Response) => {
    try {
      // Validate the incoming report
      const parseResult = PNodeReportSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        console.error('[Report] Validation error:', parseResult.error.errors);
        res.status(400).json({
          ok: false,
          error: 'Invalid report format',
          details: parseResult.error.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message,
          })),
        });
        return;
      }

      const report = parseResult.data;

      // Log the report (truncate publicKey for readability)
      const shortKey = report.pnode.publicKey.substring(0, 8) + '...';
      console.log(`[Report] Received from ${shortKey}: ${formatBytes(report.storage.totalDedicated)} dedicated`);

      // Store/update in database
      await upsertPNode(report);

      res.json({
        ok: true,
        message: 'Report received',
        pnode: shortKey,
      });
    } catch (error) {
      console.error('[Report] Error processing report:', error);
      res.status(500).json({
        ok: false,
        error: 'Internal server error',
      });
    }
  }
);

// Helper to format bytes
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default router;



