export type DocumentType = 'purchase_order' | 'invoice' | 'receipt' | 'unknown';
export type ProcessingStatus = 'uploaded' | 'processing' | 'ocr_completed' | 'extracting' | 'ready' | 'failed';
export type FindingSeverity = 'critical' | 'high' | 'medium' | 'low' | 'passed';

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'compliance_officer' | 'reviewer' | 'auditor' | 'admin';
  organization?: string;
  avatarUrl?: string;
}

export interface DocumentItem {
  _id: string;
  title: string;
  originalName: string;
  documentType: DocumentType;
  mimeType: string;
  sizeBytes: number;
  status: ProcessingStatus;
  ocrText?: string;
  confidenceScore: number;
  pagesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface LineItem {
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  pageNumber?: number;
}

export interface StructuredExtraction {
  documentNumber?: string;
  poNumber?: string;
  invoiceNumber?: string;
  receiptNumber?: string;
  vendorName?: string;
  buyerName?: string;
  issueDate?: string;
  dueDate?: string;
  deliveryDate?: string;
  currency?: string;
  subtotal?: number;
  taxAmount?: number;
  totalAmount?: number;
  items: LineItem[];
}

export interface ValidationFinding {
  _id: string;
  validationRunId: string;
  category: 'vendor' | 'po_reference' | 'item' | 'quantity' | 'unit_price' | 'tax' | 'total_amount' | 'currency' | 'date' | 'received_quantity';
  fieldName: string;
  expectedValue: string;
  actualValue: string;
  difference?: string;
  severity: FindingSeverity;
  confidence: number;
  sourceDocumentTitle: string;
  sourceDocumentId: string;
  targetDocumentTitle: string;
  targetDocumentId: string;
  pageReferences: string;
  explanation: string;
  recommendedAction: string;
  status: 'open' | 'under_review' | 'approved' | 'rejected';
  createdAt: string;
}

export interface ValidationRun {
  _id: string;
  name: string;
  documentIds: string[];
  status: 'running' | 'completed' | 'failed';
  summary: {
    totalChecks: number;
    passedChecks: number;
    failedChecks: number;
    uncertainChecks: number;
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
  };
  startedAt: string;
  completedAt?: string;
  createdAt: string;
}

export interface WorkflowTask {
  _id: string;
  findingId: string | ValidationFinding;
  validationRunId: string;
  title: string;
  severity: FindingSeverity;
  confidence: number;
  assignedRole: string;
  status: 'pending' | 'approved' | 'rejected' | 'info_requested';
  reviewerComments?: string;
  decisionBy?: string;
  auditTrail: Array<{
    action: string;
    actor: string;
    timestamp: string;
    note?: string;
  }>;
  createdAt: string;
}

export interface DocumentRelationship {
  _id: string;
  sourceDocumentId: any;
  targetDocumentId: any;
  relationshipType: 'po_to_invoice' | 'invoice_to_receipt' | 'po_to_receipt';
  matchingFields: Record<string, any>;
  confidence: number;
  evidenceSummary: string;
  status: string;
  createdAt: string;
}

export interface DashboardMetrics {
  totalDocs: number;
  processedDocs: number;
  pendingDocs: number;
  failedDocs: number;
  docsWithDiscrepancies: number;
  pendingReviews: number;
}
