/**
 * Echo Agent – Email Confirmation Handler
 * Sends RMA confirmation emails to technicians using Resend
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';
import { resend } from '@/lib/resendClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { id, vendor_rma_id } = req.body;

  if (!id) {
    console.error('[echo:mail] Missing RMA ID');
    return res.status(400).json({ error: 'Missing RMA ID' });
  }

  try {
    // Query Supabase for the RMA details
    const { data, error } = await supabase
      .from('rma_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    
    if (!data) {
      console.error(`[echo:mail] RMA not found: ${id}`);
      return res.status(400).json({ error: 'RMA not found' });
    }

    // Create confirmation email content
    const subject = `RMA Confirmation – ${data.vendor}`;
    const rmaDetails = `
      <strong>Equipment:</strong> ${data.model_number}<br>
      <strong>Serial Number:</strong> ${data.serial_number}<br>
      <strong>Vendor:</strong> ${data.vendor}<br>
      <strong>Issue:</strong> ${data.issue_description}<br>
      ${vendor_rma_id ? `<strong>Vendor RMA Number:</strong> ${vendor_rma_id}<br>` : ''}
      <strong>Submitted:</strong> ${new Date(data.created_at).toLocaleString()}<br>
    `;

    // Construct the email
    const emailData = {
      from: 'support@claimr.app',
      to: data.submitted_by,
      subject: subject,
      html: `
        <h2>Your RMA Request Has Been Processed</h2>
        <p>We've submitted your RMA request to ${data.vendor}. Here are the details:</p>
        <div>${rmaDetails}</div>
        <p>We'll notify you of any status updates. If you have questions, reply to this email.</p>
        <p>Thank you for using Claimr!</p>
      `
    };

    // Send the email via Resend
    console.log(`[echo:mail] Sending confirmation email to ${data.submitted_by}`);
    const { data: emailResponse, error: emailError } = await resend.emails.send(emailData);

    if (emailError) {
      console.error('[echo:mail] Failed to send email:', emailError);
      return res.status(500).json({ error: 'Failed to send confirmation email' });
    }

    console.log(`[echo:mail] Email sent successfully: ${emailResponse?.id}`);
    return res.status(200).json({
      success: true,
      email_id: emailResponse?.id
    });
  } catch (err) {
    console.error('[echo:mail] Error:', err);
    return res.status(500).json({ error: 'Failed to process confirmation' });
  }
}
