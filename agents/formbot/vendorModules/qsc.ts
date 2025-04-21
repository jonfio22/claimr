/**
 * QSC Vendor Module
 * Handles RMA form submissions for QSC equipment via API integration
 */

import { RMARecord, FormSubmissionResult } from './types';

// Load environment variables
declare const process: { env: { [key: string]: string | undefined } };
const QSC_API_URL = process.env.QSC_API_URL || 'https://api.qsc.com/rma/submit';
const QSC_API_KEY = process.env.QSC_API_KEY || '';

if (!QSC_API_KEY) {
  console.warn('[formbot:qsc] QSC_API_KEY is not set in environment variables');
}

/**
 * Submit RMA form to QSC's API endpoint
 * @param data RMA record data from Supabase
 * @returns Object containing the vendor RMA ID
 */
export async function submitForm(data: RMARecord): Promise<FormSubmissionResult> {
  console.log(`[formbot:qsc] Processing RMA submission for ${data.serial_number}`);
  
  try {
    // Build payload for QSC API
    const payload = {
      serial_number: data.serial_number,
      model_number: data.model_number,
      issue_description: data.issue_description,
      submitted_by: data.submitted_by
    };
    
    console.log(`[formbot:qsc] Sending request to QSC API: ${QSC_API_URL}`);
    
    // Send POST request to QSC API
    const response = await fetch(QSC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${QSC_API_KEY}`,
        'User-Agent': 'Claimr-RMA-Agent/1.0'
      },
      body: JSON.stringify(payload)
    });
    
    // Handle unsuccessful response
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`QSC API returned ${response.status}: ${errorText}`);
    }
    
    // Parse response
    const responseData = await response.json();
    
    if (!responseData.rma_id) {
      throw new Error('QSC API response missing rma_id field');
    }
    
    const vendorRmaId = responseData.rma_id;
    console.log(`[formbot:qsc] Successfully created RMA: ${vendorRmaId}`);
    
    return { vendor_rma_id: vendorRmaId };
  } catch (error: unknown) {
    console.error(`[formbot:qsc] API error:`, error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to submit RMA to QSC: ${errorMessage}`);
  }
}
