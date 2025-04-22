import type { NextApiRequest, NextApiResponse } from 'next';

export async function validateToken(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token || token !== process.env.CLAIMR_API_TOKEN) {
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }
  return true;
}
