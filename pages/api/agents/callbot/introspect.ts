import type { NextApiRequest, NextApiResponse } from 'next';
import introspect from '../../../../agents/callbot/introspect';
import { validateToken } from '../../../../lib/validateToken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end('Method not allowed');
  if (!(await validateToken(req, res))) return;
  return res.status(200).json(introspect());
}
