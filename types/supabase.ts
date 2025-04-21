/**
 * Supabase database type definitions
 * These types match the schema defined in /supabase/schema.sql
 */

export interface Database {
  public: {
    Tables: {
      rma_requests: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          technician_id: string;
          vendor_id: string;
          equipment_type: string;
          equipment_serial: string;
          issue_description: string;
          status: string;
          vendor_rma_number?: string;
          return_tracking_number?: string;
          replacement_tracking_number?: string;
          last_agent_interaction: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          technician_id: string;
          vendor_id: string;
          equipment_type: string;
          equipment_serial: string;
          issue_description: string;
          status?: string;
          vendor_rma_number?: string;
          return_tracking_number?: string;
          replacement_tracking_number?: string;
          last_agent_interaction?: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          technician_id?: string;
          vendor_id?: string;
          equipment_type?: string;
          equipment_serial?: string;
          issue_description?: string;
          status?: string;
          vendor_rma_number?: string;
          return_tracking_number?: string;
          replacement_tracking_number?: string;
          last_agent_interaction?: string;
        };
      };
      agent_logs: {
        Row: {
          id: string;
          created_at: string;
          agent_id: string;
          action_type: string;
          action_data: Record<string, any>;
          rma_id: string;
          status: string;
          error_message?: string;
          timestamp: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          agent_id: string;
          action_type: string;
          action_data: Record<string, any>;
          rma_id?: string;
          status: string;
          error_message?: string;
          timestamp: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          agent_id?: string;
          action_type?: string;
          action_data?: Record<string, any>;
          rma_id?: string;
          status?: string;
          error_message?: string;
          timestamp?: string;
        };
      };
      vendor_status: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          vendor_id: string;
          vendor_name: string;
          rma_id: string;
          status: string;
          last_checked: string;
          response_data: Record<string, any>;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          vendor_id: string;
          vendor_name: string;
          rma_id: string;
          status: string;
          last_checked: string;
          response_data: Record<string, any>;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          vendor_id?: string;
          vendor_name?: string;
          rma_id?: string;
          status?: string;
          last_checked?: string;
          response_data?: Record<string, any>;
        };
      };
    };
  };
}
