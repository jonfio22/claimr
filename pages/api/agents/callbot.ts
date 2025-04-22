/**
 * CallBot Agent – Phone-based RMA Handler
 * Automates vendor calls, IVR navigation, and RMA number capture
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { validateToken } from '../../lib/validateToken'; // existing helper
import { handleInput, CallBotInput } from '../../agents/callbot/handleInput';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method not allowed');
  if (!(await validateToken(req, res))) return; // handles auth response

  const input: CallBotInput = req.body;
  const result = await handleInput(input);
  res.status(result.status === 'SUCCESS' ? 200 : 500).json(result);
}
