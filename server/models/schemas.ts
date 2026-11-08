import mongoose, { Schema, Document as MongoDoc } from 'mongoose';

// 1. User Model
export interface IUser extends MongoDoc {
  username: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'compliance_officer' | 'auditor' | 'reviewer';
  avatarUrl?: string;
  organization?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['admin', 'compliance_officer', 'auditor', 'reviewer'], 
    default: 'compliance_officer' 
  },
  avatarUrl: { type: String, default: '' },
  organization: { type: String, default: 'Enterprise Logistics & Procurement' },
}, { timestamps: true });

// 2. RefreshToken Model
export interface IRefreshToken extends MongoDoc {
  userId: mongoose.Types.ObjectId | string;
  tokenHash: string;
  expiresAt: Date;
  revoked: boolean;
  createdAt: Date;
}

const RefreshTokenSchema = new Schema<IRefreshToken>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  tokenHash: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  revoked: { type: Boolean, default: false },
}, { timestamps: true });

// 3. Document Model
export type DocumentType = 'purchase_order' | 'invoice' | 'receipt' | 'unknown';
export type ProcessingStatus = 'uploaded' | 'processing' | 'ocr_completed' | 'extracting' | 'ready' | 'failed';

export interface IDocumentRecord extends MongoDoc {
  userId: mongoose.Types.ObjectId | string;
  title: string;
  originalName: string;
  documentType: DocumentType;
  mimeType: string;
  sizeBytes: number;
  status: ProcessingStatus;
  filePath: string;
  ocrText: string;
  confidenceScore: number;
  pagesCount: number;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema = new Schema<IDocumentRecord>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  originalName: { type: String, required: true },
  documentType: { 
    type: String, 
    enum: ['purchase_order', 'invoice', 'receipt', 'unknown'], 
    default: 'unknown',
    index: true 
  },
  mimeType: { type: String, default: 'application/pdf' },
  sizeBytes: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['uploaded', 'processing', 'ocr_completed', 'extracting', 'ready', 'failed'], 
    default: 'uploaded',
    index: true 
  },
  filePath: { type: String, default: '' },
  ocrText: { type: String, default: '' },
  confidenceScore: { type: Number, default: 0.95 },
  pagesCount: { type: Number, default: 1 },
  metadata: { type: Schema.Types.Mixed, default: {} },
}, { timestamps: true });

// 4. DocumentExtraction Model
export interface LineItem {
  id?: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  pageNumber?: number;
}

export interface IExtractionData {
  documentNumber?: string;
  poNumber?: string;
  invoiceNumber?: string;
  receiptNumber?: string;
  vendorName?: string;
  buyerName?: string;
  issueDate?: string;
  dueDate?: string;
  deliveryDate?: string;
  items: LineItem[];
  subtotal?: number;
  taxAmount?: number;
  totalAmount?: number;
  currency?: string;
  paymentMethod?: string;
}

export interface IDocumentExtraction extends MongoDoc {
  documentId: mongoose.Types.ObjectId | string;
  userId: mongoose.Types.ObjectId | string;
  documentType: DocumentType;
  structuredData: IExtractionData;
  rawExtractedJson: string;
  confidenceScores: Record<string, number>;
  pageReferences: Record<string, number>;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentExtractionSchema = new Schema<IDocumentExtraction>({
  documentId: { type: Schema.Types.ObjectId, ref: 'Document', required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  documentType: { type: String, required: true },
  structuredData: { type: Schema.Types.Mixed, default: {} },
  rawExtractedJson: { type: String, default: '{}' },
  confidenceScores: { type: Schema.Types.Mixed, default: {} },
  pageReferences: { type: Schema.Types.Mixed, default: {} },
}, { timestamps: true });

// 5. DocumentChunk Model (Atlas Vector Search)
export interface IDocumentChunk extends MongoDoc {
  documentId: mongoose.Types.ObjectId | string;
  userId: mongoose.Types.ObjectId | string;
  chunkText: string;
  pageNumber: number;
  chunkIndex: number;
  embedding: number[]; // 384 dimensional vector
  metadata: Record<string, any>;
}

const DocumentChunkSchema = new Schema<IDocumentChunk>({
  documentId: { type: Schema.Types.ObjectId, ref: 'Document', required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  chunkText: { type: String, required: true },
  pageNumber: { type: Number, default: 1 },
  chunkIndex: { type: Number, default: 0 },
  embedding: { type: [Number], default: [] },
  metadata: { type: Schema.Types.Mixed, default: {} },
}, { timestamps: true });

// 6. DocumentRelationship Model
export type RelationshipType = 'po_to_invoice' | 'invoice_to_receipt' | 'po_to_receipt';

export interface IDocumentRelationship extends MongoDoc {
  userId: mongoose.Types.ObjectId | string;
  sourceDocumentId: mongoose.Types.ObjectId | string;
  targetDocumentId: mongoose.Types.ObjectId | string;
  relationshipType: RelationshipType;
  matchingFields: {
    poNumber?: string;
    invoiceNumber?: string;
    receiptNumber?: string;
    vendorName?: string;
    amount?: number;
  };
  confidence: number;
  evidenceSummary: string;
  status: 'active' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

const DocumentRelationshipSchema = new Schema<IDocumentRelationship>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  sourceDocumentId: { type: Schema.Types.ObjectId, ref: 'Document', required: true },
  targetDocumentId: { type: Schema.Types.ObjectId, ref: 'Document', required: true },
  relationshipType: { 
    type: String, 
    enum: ['po_to_invoice', 'invoice_to_receipt', 'po_to_receipt'], 
    required: true 
  },
  matchingFields: { type: Schema.Types.Mixed, default: {} },
  confidence: { type: Number, default: 0.95 },
  evidenceSummary: { type: String, default: '' },
  status: { type: String, enum: ['active', 'archived'], default: 'active' },
}, { timestamps: true });

// 7. ValidationRun Model
export interface IValidationRun extends MongoDoc {
  userId: mongoose.Types.ObjectId | string;
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
  startedAt: Date;
  completedAt?: Date;
  createdAt: Date;
}

const ValidationRunSchema = new Schema<IValidationRun>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, default: 'Cross-Document 3-Way Match' },
  documentIds: [{ type: String }],
  status: { type: String, enum: ['running', 'completed', 'failed'], default: 'completed' },
  summary: {
    totalChecks: { type: Number, default: 0 },
    passedChecks: { type: Number, default: 0 },
    failedChecks: { type: Number, default: 0 },
    uncertainChecks: { type: Number, default: 0 },
    criticalCount: { type: Number, default: 0 },
    highCount: { type: Number, default: 0 },
    mediumCount: { type: Number, default: 0 },
    lowCount: { type: Number, default: 0 },
  },
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
}, { timestamps: true });

// 8. ValidationFinding Model
export type FindingCategory = 
  | 'vendor' 
  | 'po_reference' 
  | 'item' 
  | 'quantity' 
  | 'unit_price' 
  | 'tax' 
  | 'total_amount' 
  | 'currency' 
  | 'date' 
  | 'received_quantity';

export type FindingSeverity = 'critical' | 'high' | 'medium' | 'low' | 'passed';

export interface IValidationFinding extends MongoDoc {
  validationRunId: mongoose.Types.ObjectId | string;
  userId: mongoose.Types.ObjectId | string;
  category: FindingCategory;
  fieldName: string;
  expectedValue: string;
  actualValue: string;
  difference: string;
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
  createdAt: Date;
}

const ValidationFindingSchema = new Schema<IValidationFinding>({
  validationRunId: { type: Schema.Types.ObjectId, ref: 'ValidationRun', required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  category: { 
    type: String, 
    enum: ['vendor', 'po_reference', 'item', 'quantity', 'unit_price', 'tax', 'total_amount', 'currency', 'date', 'received_quantity'],
    required: true,
    index: true 
  },
  fieldName: { type: String, required: true },
  expectedValue: { type: String, required: true },
  actualValue: { type: String, required: true },
  difference: { type: String, default: '' },
  severity: { 
    type: String, 
    enum: ['critical', 'high', 'medium', 'low', 'passed'], 
    required: true,
    index: true 
  },
  confidence: { type: Number, default: 0.95 },
  sourceDocumentTitle: { type: String, required: true },
  sourceDocumentId: { type: String, required: true },
  targetDocumentTitle: { type: String, required: true },
  targetDocumentId: { type: String, required: true },
  pageReferences: { type: String, default: 'Page 1' },
  explanation: { type: String, required: true },
  recommendedAction: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['open', 'under_review', 'approved', 'rejected'], 
    default: 'open',
    index: true 
  },
}, { timestamps: true });

// 9. WorkflowTask Model
export interface IWorkflowTask extends MongoDoc {
  findingId: mongoose.Types.ObjectId | string;
  validationRunId: mongoose.Types.ObjectId | string;
  userId: mongoose.Types.ObjectId | string;
  title: string;
  severity: FindingSeverity;
  confidence: number;
  assignedRole: string;
  status: 'pending' | 'approved' | 'rejected' | 'info_requested';
  reviewerComments?: string;
  decisionBy?: string;
  decidedAt?: Date;
  auditTrail: Array<{
    action: string;
    actor: string;
    timestamp: Date;
    note?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const WorkflowTaskSchema = new Schema<IWorkflowTask>({
  findingId: { type: Schema.Types.ObjectId, ref: 'ValidationFinding', required: true },
  validationRunId: { type: Schema.Types.ObjectId, ref: 'ValidationRun', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  severity: { type: String, required: true },
  confidence: { type: Number, default: 0.9 },
  assignedRole: { type: String, default: 'compliance_officer' },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'info_requested'], 
    default: 'pending',
    index: true 
  },
  reviewerComments: { type: String, default: '' },
  decisionBy: { type: String, default: '' },
  decidedAt: { type: Date },
  auditTrail: [{
    action: { type: String },
    actor: { type: String },
    timestamp: { type: Date, default: Date.now },
    note: { type: String },
  }],
}, { timestamps: true });

// 10. AuditLog Model
export interface IAuditLog extends MongoDoc {
  userId?: mongoose.Types.ObjectId | string;
  action: string;
  resourceType: string;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress?: string;
  timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true, index: true },
  resourceType: { type: String, required: true },
  resourceId: { type: String },
  details: { type: Schema.Types.Mixed, default: {} },
  ipAddress: { type: String, default: '127.0.0.1' },
  timestamp: { type: Date, default: Date.now, index: true },
});

export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export const RefreshTokenModel = mongoose.models.RefreshToken || mongoose.model<IRefreshToken>('RefreshToken', RefreshTokenSchema);
export const DocumentModel = mongoose.models.Document || mongoose.model<IDocumentRecord>('Document', DocumentSchema);
export const DocumentExtractionModel = mongoose.models.DocumentExtraction || mongoose.model<IDocumentExtraction>('DocumentExtraction', DocumentExtractionSchema);
export const DocumentChunkModel = mongoose.models.DocumentChunk || mongoose.model<IDocumentChunk>('DocumentChunk', DocumentChunkSchema);
export const DocumentRelationshipModel = mongoose.models.DocumentRelationship || mongoose.model<IDocumentRelationship>('DocumentRelationship', DocumentRelationshipSchema);
export const ValidationRunModel = mongoose.models.ValidationRun || mongoose.model<IValidationRun>('ValidationRun', ValidationRunSchema);
export const ValidationFindingModel = mongoose.models.ValidationFinding || mongoose.model<IValidationFinding>('ValidationFinding', ValidationFindingSchema);
export const WorkflowTaskModel = mongoose.models.WorkflowTask || mongoose.model<IWorkflowTask>('WorkflowTask', WorkflowTaskSchema);
export const AuditLogModel = mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
