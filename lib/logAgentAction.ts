/**
 * logAgentAction.ts
 * Utility for logging agent actions to Supabase for auditing and analytics
 * 
 * Dependencies:
 * - Supabase client
 */

import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export interface AgentAction {
  agent_id: string;
  action_type: 'a2a_message' | 'mcp_call' | 'tool_use' | 'state_change';
  action_data: Record<string, any>;
  rma_id?: string;
  status: 'success' | 'failure' | 'pending';
  error_message?: string;
}

/**
 * Logs an agent action to the database
 */
export async function logAgentAction(action: AgentAction): Promise<void> {
  try {
    const { error } = await supabase
      .from('agent_logs')
      .insert({
        agent_id: action.agent_id,
        action_type: action.action_type,
        action_data: action.action_data,
        rma_id: action.rma_id,
        status: action.status,
        error_message: action.error_message,
        timestamp: new Date().toISOString(),
      });

    if (error) {
      console.error('Error logging agent action:', error);
    }
  } catch (error) {
    console.error('Failed to log agent action:', error);
  }
}
