import { Router, Request, Response } from 'express';
import { TalentRequest } from '../models/TalentRequest';

const router = Router();

// Localhost-only debug endpoint — returns recent talent requests.
router.get('/talent-requests', async (req: Request, res: Response) => {
  // Only allow when running locally
  const ip = (req.ip || '').toString();
  const localIps = new Set(['::1', '127.0.0.1', '::ffff:127.0.0.1']);
  if (!localIps.has(ip) && req.hostname !== 'localhost') {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Debug endpoint allowed from localhost only' } });
  }

  try {
    const items = await TalentRequest.find().sort({ createdAt: -1 }).limit(100).lean();
    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: String(err instanceof Error ? err.message : err) } });
  }
});

export default router;
