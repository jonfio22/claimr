import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method not allowed');
  const { CallSid, SpeechResult, Digits, RecordingUrl } = req.body || {};
  const rma_number = (Digits || SpeechResult || '').replace(/[^A-Za-z0-9]/g, '');
  // Store or update vendor_status row keyed by call_sid
  await supabase
    .from('vendor_status')
    .upsert({ call_sid: CallSid, rma_number, transcript_url: RecordingUrl });
  return res.status(200).send('<Response><Hangup/></Response>');
}
