import { supabase } from '../../lib/supabaseClient';
import { twilioClient } from '../../lib/twilioClient';
import { VendorPhoneMap } from './vendorPhoneMap';
import { z } from 'zod';

export const CallBotInput = z.object({
  vendor: z.string(),
  technicianPhone: z.string().optional(),
  rmaPayload: z.record(z.any())
});
export type CallBotInput = z.infer<typeof CallBotInput>;

export interface CallBotOutput {
  status: 'SUCCESS' | 'FAILED';
  vendor: string;
  rmaNumber?: string;
  transcriptUrl?: string;
  error?: string;
}

/**
 * Main entry for CallBot – dials vendor, captures RMA #, logs result.
 */
export async function handleInput(input: CallBotInput): Promise<CallBotOutput> {
  const parse = CallBotInput.safeParse(input);
  if (!parse.success) {
    return { status: 'FAILED', vendor: input.vendor, error: 'Bad input schema' };
  }
  const { vendor, technicianPhone, rmaPayload } = parse.data;
  const vendorNumber = VendorPhoneMap[vendor.toLowerCase()];
  if (!vendorNumber) {
    return { status: 'FAILED', vendor, error: 'Vendor phone not found' };
  }

  try {
    // ① Place outbound call & gather RMA #
    const call = await twilioClient.calls.create({
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/twilio/callflow?vendor=${vendor}`,
      to: vendorNumber,
      from: process.env.TWILIO_FROM_NUMBER
    });

    // Poll vendor_status for up to 60 s
    let rmaRow = null;
    for (let i = 0; i < 12; i++) {
      const { data, error } = await supabase
        .from('vendor_status')
        .select('rma_number')
        .eq('call_sid', call.sid)
        .single();
      if (error) throw error;
      if (data?.rma_number) { rmaRow = data; break; }
      await new Promise(r => setTimeout(r, 5000));
    }
    if (!rmaRow?.rma_number) throw new Error('No RMA captured in 60 s');

    const rmaNumber = rmaRow.rma_number;

    // ② Log success
    await supabase.from('agent_logs').insert({
      agent: 'callbot',
      action: 'capture_rma',
      payload: { vendor, rmaNumber, callSid: call.sid }
    });

    return { status: 'SUCCESS', vendor, rmaNumber };
  } catch (err: any) {
    await supabase.from('agent_logs').insert({
      agent: 'callbot',
      action: 'error',
      payload: { vendor, message: err.message }
    });
    return { status: 'FAILED', vendor, error: err.message };
  }
}
