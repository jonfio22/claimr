/**
 * supabaseClient.ts
 * Initializes and exports the Supabase client for use across the application
 * 
 * Dependencies:
 * - Supabase SDK
 * - Environment variables for authentication
 */

import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
