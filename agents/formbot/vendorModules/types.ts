/**
 * RMA Record Type Definition
 * Shared type for FormBot vendor modules
 */

export interface RMARecord {
  id: string;
  serial_number: string;
  model_number: string;
  issue_description: string;
  vendor: string;
  submitted_by: string;
  created_at: string;
}

export interface FormSubmissionResult {
  vendor_rma_id: string;
}

export interface VendorModuleMeta {
  name: string;
  submit: (payload: any) => Promise<{ rmaNumber: string }>;
  requiresPhone?: boolean; // New flag for CallBot integration
}
