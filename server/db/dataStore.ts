import { 
  UserModel, 
  DocumentModel, 
  DocumentExtractionModel, 
  DocumentChunkModel, 
  DocumentRelationshipModel, 
  ValidationRunModel, 
  ValidationFindingModel, 
  WorkflowTaskModel, 
  AuditLogModel,
  IUser,
  IDocumentRecord,
  IDocumentExtraction,
  IDocumentChunk,
  IDocumentRelationship,
  IValidationRun,
  IValidationFinding,
  IWorkflowTask,
  IAuditLog
} from '../models/schemas.js';
import { isDbFallback } from './mongo.js';
import bcrypt from 'bcryptjs';

// Fallback in-memory state containers
const memUsers: Map<string, any> = new Map();
const memDocuments: Map<string, any> = new Map();
const memExtractions: Map<string, any> = new Map();
const memChunks: Map<string, any> = new Map();
const memRelationships: Map<string, any> = new Map();
const memValidationRuns: Map<string, any> = new Map();
const memValidationFindings: Map<string, any> = new Map();
const memWorkflowTasks: Map<string, any> = new Map();
const memAuditLogs: any[] = [];

// Seed default demonstration data
export async function seedInitialData(): Promise<void> {
  const adminEmail = 'admin@docvision.ai';
  const complianceEmail = 'officer@docvision.ai';
  const hashedPw = await bcrypt.hash('DocVision2026!', 10);

  // Check or create demo user
  let adminUser: any = null;
  if (!isDbFallback()) {
    try {
      adminUser = await UserModel.findOne({ email: adminEmail });
      if (!adminUser) {
        adminUser = await UserModel.create({
          username: 'Chief Risk Officer',
          email: adminEmail,
          passwordHash: hashedPw,
          role: 'compliance_officer',
          avatarUrl: '/src/assets/images/avatar_compliance_officer_1794113145499.jpg',
          organization: 'Apex Global Logistics & Enterprise Procurement',
        });
        console.log('[Seed] Created default compliance officer in MongoDB');
      }
    } catch (e) {
      // fallback
    }
  }

  const defaultAdminId = adminUser ? adminUser._id.toString() : 'usr_default_admin_001';
  if (!memUsers.has(defaultAdminId)) {
    memUsers.set(defaultAdminId, {
      _id: defaultAdminId,
      username: 'Chief Risk Officer',
      email: adminEmail,
      passwordHash: hashedPw,
      role: 'compliance_officer',
      avatarUrl: '/src/assets/images/avatar_compliance_officer_1794113145499.jpg',
      organization: 'Apex Global Logistics & Enterprise Procurement',
      createdAt: new Date('2026-03-01T10:00:00Z'),
    });
  }

  // Pre-seed 3 Enterprise Benchmark Documents (PO, Invoice, Receipt)
  // These represent a real enterprise scenario:
  // - Purchase Order: PO-2024-884 for 10x High-Performance Laptops ($1,200 each = $12,000 subtotal, 8% tax = $960, total = $12,960)
  // - Vendor Invoice: INV-9921 referencing PO-2024-884.
  //   DISCREPANCIES: Only 8 Laptops invoiced, but unit price charged is $1,250 instead of $1,200!
  //   Invoiced Subtotal: $10,000, Tax: $800, Total: $10,800.
  // - Goods Receipt Note: REC-4412 confirming delivery of 8 Laptops.
  // This gives the exact realistic scenario described in Part 15 and Part 22 of the master specification!

  const poDocId = 'doc_po_2024_884';
  const invDocId = 'doc_inv_9921';
  const recDocId = 'doc_rec_4412';

  if (!memDocuments.has(poDocId)) {
    // 1. Purchase Order Document
    memDocuments.set(poDocId, {
      _id: poDocId,
      userId: defaultAdminId,
      title: 'Purchase Order PO-2024-884',
      originalName: 'PO-2024-884_Hardware_Procurement.pdf',
      documentType: 'purchase_order',
      mimeType: 'application/pdf',
      sizeBytes: 184520,
      status: 'ready',
      filePath: '/uploads/PO-2024-884_Hardware_Procurement.pdf',
      ocrText: `PURCHASE ORDER\nOrder Number: PO-2024-884\nIssue Date: 2026-02-15\nDelivery Expected: 2026-03-01\nBuyer: Apex Global Logistics\nVendor: Quantum Micro Devices Inc.\nVendor Address: 400 Silicon Way, San Jose, CA\nCurrency: USD\n\nLine Items:\n1. Enterprise High-Performance Laptop 16" - Qty: 10 - Unit Price: $1,200.00 - Total: $12,000.00\n\nSubtotal: $12,000.00\nTax (8.0%): $960.00\nTotal Order Amount: $12,960.00\nPayment Terms: Net 30 days`,
      confidenceScore: 0.98,
      pagesCount: 1,
      metadata: { department: 'IT Operations', approver: 'Marcus Vance' },
      createdAt: new Date('2026-02-15T09:00:00Z'),
      updatedAt: new Date('2026-02-15T09:05:00Z'),
    });

    memExtractions.set(`ext_${poDocId}`, {
      _id: `ext_${poDocId}`,
      documentId: poDocId,
      userId: defaultAdminId,
      documentType: 'purchase_order',
      structuredData: {
        documentNumber: 'PO-2024-884',
        poNumber: 'PO-2024-884',
        vendorName: 'Quantum Micro Devices Inc.',
        buyerName: 'Apex Global Logistics',
        issueDate: '2026-02-15',
        deliveryDate: '2026-03-01',
        currency: 'USD',
        items: [
          {
            name: 'Enterprise High-Performance Laptop 16"',
            description: '16-inch 32GB RAM 1TB SSD Developer Workstation',
            quantity: 10,
            unitPrice: 1200.00,
            totalPrice: 12000.00,
            pageNumber: 1,
          }
        ],
        subtotal: 12000.00,
        taxAmount: 960.00,
        totalAmount: 12960.00,
      },
      rawExtractedJson: JSON.stringify({ poNumber: 'PO-2024-884', vendorName: 'Quantum Micro Devices Inc.', totalAmount: 12960 }),
      confidenceScores: { vendorName: 0.99, totalAmount: 0.98, items: 0.97 },
      pageReferences: { vendorName: 1, poNumber: 1, totalAmount: 1 },
      createdAt: new Date('2026-02-15T09:05:00Z'),
    });

    // 2. Commercial Invoice Document
    memDocuments.set(invDocId, {
      _id: invDocId,
      userId: defaultAdminId,
      title: 'Commercial Invoice INV-9921',
      originalName: 'INV-9921_QuantumMicro.pdf',
      documentType: 'invoice',
      mimeType: 'application/pdf',
      sizeBytes: 162400,
      status: 'ready',
      filePath: '/uploads/INV-9921_QuantumMicro.pdf',
      ocrText: `COMMERCIAL INVOICE\nInvoice Number: INV-9921\nPO Reference: PO-2024-884\nInvoice Date: 2026-02-28\nPayment Due: 2026-03-30\nBill To: Apex Global Logistics\nVendor: Quantum Micro Devices Inc.\nCurrency: USD\n\nItems Invoiced:\n1. Enterprise High-Performance Laptop 16" - Qty: 8 - Unit Price: $1,250.00 - Total: $10,000.00\n\nSubtotal: $10,000.00\nSales Tax (8.0%): $800.00\nInvoice Total: $10,800.00\nRemittance: Bank Wire ACH`,
      confidenceScore: 0.97,
      pagesCount: 1,
      metadata: { billingCode: 'HW-CORP-9' },
      createdAt: new Date('2026-02-28T14:30:00Z'),
      updatedAt: new Date('2026-02-28T14:35:00Z'),
    });

    memExtractions.set(`ext_${invDocId}`, {
      _id: `ext_${invDocId}`,
      documentId: invDocId,
      userId: defaultAdminId,
      documentType: 'invoice',
      structuredData: {
        documentNumber: 'INV-9921',
        invoiceNumber: 'INV-9921',
        poNumber: 'PO-2024-884',
        vendorName: 'Quantum Micro Devices Inc.',
        buyerName: 'Apex Global Logistics',
        issueDate: '2026-02-28',
        dueDate: '2026-03-30',
        currency: 'USD',
        items: [
          {
            name: 'Enterprise High-Performance Laptop 16"',
            description: '16-inch 32GB RAM 1TB SSD Developer Workstation',
            quantity: 8,
            unitPrice: 1250.00,
            totalPrice: 10000.00,
            pageNumber: 1,
          }
        ],
        subtotal: 10000.00,
        taxAmount: 800.00,
        totalAmount: 10800.00,
      },
      rawExtractedJson: JSON.stringify({ invoiceNumber: 'INV-9921', poNumber: 'PO-2024-884', totalAmount: 10800 }),
      confidenceScores: { vendorName: 0.99, invoiceNumber: 0.98, totalAmount: 0.97 },
      pageReferences: { vendorName: 1, invoiceNumber: 1, poNumber: 1, totalAmount: 1 },
      createdAt: new Date('2026-02-28T14:35:00Z'),
    });

    // 3. Goods Receipt Note Document
    memDocuments.set(recDocId, {
      _id: recDocId,
      userId: defaultAdminId,
      title: 'Warehouse Goods Receipt REC-4412',
      originalName: 'REC-4412_Dock_Inspection.pdf',
      documentType: 'receipt',
      mimeType: 'application/pdf',
      sizeBytes: 141200,
      status: 'ready',
      filePath: '/uploads/REC-4412_Dock_Inspection.pdf',
      ocrText: `WAREHOUSE RECEIPT & DOCK INSPECTION REPORT\nReceipt Number: REC-4412\nPurchase Order Ref: PO-2024-884\nSupplier Invoice Ref: INV-9921\nReceipt Date: 2026-03-02\nReceiving Warehouse: Dock B, Chicago Distribution Hub\nVendor: Quantum Micro Devices Inc.\nCurrency: USD\n\nGoods Received:\n1. Enterprise High-Performance Laptop 16" - Received Qty: 8 - Condition: Verified Undamaged\n\nTotal Paid/Accepted: $10,800.00\nInspector: Warehouse Supervisor D. Campbell\nNotes: Partial shipment accepted. 2 units backordered by supplier.`,
      confidenceScore: 0.96,
      pagesCount: 1,
      metadata: { dockStation: 'Dock B-04', inspector: 'D. Campbell' },
      createdAt: new Date('2026-03-02T16:00:00Z'),
      updatedAt: new Date('2026-03-02T16:05:00Z'),
    });

    memExtractions.set(`ext_${recDocId}`, {
      _id: `ext_${recDocId}`,
      documentId: recDocId,
      userId: defaultAdminId,
      documentType: 'receipt',
      structuredData: {
        documentNumber: 'REC-4412',
        receiptNumber: 'REC-4412',
        poNumber: 'PO-2024-884',
        invoiceNumber: 'INV-9921',
        vendorName: 'Quantum Micro Devices Inc.',
        issueDate: '2026-03-02',
        currency: 'USD',
        items: [
          {
            name: 'Enterprise High-Performance Laptop 16"',
            quantity: 8,
            unitPrice: 1250.00,
            totalPrice: 10000.00,
            pageNumber: 1,
          }
        ],
        totalAmount: 10800.00,
      },
      rawExtractedJson: JSON.stringify({ receiptNumber: 'REC-4412', poNumber: 'PO-2024-884' }),
      confidenceScores: { vendorName: 0.98, receiptNumber: 0.96 },
      pageReferences: { receiptNumber: 1, poNumber: 1 },
      createdAt: new Date('2026-03-02T16:05:00Z'),
    });

    // Create Relationships
    const rel1Id = 'rel_po_inv_001';
    memRelationships.set(rel1Id, {
      _id: rel1Id,
      userId: defaultAdminId,
      sourceDocumentId: poDocId,
      targetDocumentId: invDocId,
      relationshipType: 'po_to_invoice',
      matchingFields: {
        poNumber: 'PO-2024-884',
        vendorName: 'Quantum Micro Devices Inc.',
      },
      confidence: 0.99,
      evidenceSummary: 'Direct match on PO Number "PO-2024-884" referenced in Invoice header and identical Vendor "Quantum Micro Devices Inc."',
      status: 'active',
      createdAt: new Date('2026-03-02T16:10:00Z'),
    });

    const rel2Id = 'rel_inv_rec_002';
    memRelationships.set(rel2Id, {
      _id: rel2Id,
      userId: defaultAdminId,
      sourceDocumentId: invDocId,
      targetDocumentId: recDocId,
      relationshipType: 'invoice_to_receipt',
      matchingFields: {
        invoiceNumber: 'INV-9921',
        poNumber: 'PO-2024-884',
        vendorName: 'Quantum Micro Devices Inc.',
      },
      confidence: 0.98,
      evidenceSummary: 'Match on Invoice Number "INV-9921" referenced in Goods Receipt and confirmed receipt of 8 Laptop units',
      status: 'active',
      createdAt: new Date('2026-03-02T16:10:00Z'),
    });

    // Run Validation and create realistic Validation Findings
    const runId = 'val_run_3way_001';
    memValidationRuns.set(runId, {
      _id: runId,
      userId: defaultAdminId,
      name: 'Tri-Party 3-Way Match Validation (PO-2024-884 / INV-9921 / REC-4412)',
      documentIds: [poDocId, invDocId, recDocId],
      status: 'completed',
      summary: {
        totalChecks: 10,
        passedChecks: 7,
        failedChecks: 2,
        uncertainChecks: 1,
        criticalCount: 1,
        highCount: 1,
        mediumCount: 1,
        lowCount: 0,
      },
      startedAt: new Date('2026-03-02T16:15:00Z'),
      completedAt: new Date('2026-03-02T16:15:02Z'),
      createdAt: new Date('2026-03-02T16:15:00Z'),
    });

    // Finding 1: Quantity Mismatch (High severity)
    const find1Id = 'find_qty_001';
    memValidationFindings.set(find1Id, {
      _id: find1Id,
      validationRunId: runId,
      userId: defaultAdminId,
      category: 'quantity',
      fieldName: 'Item Quantity (Enterprise Laptop 16")',
      expectedValue: '10 units (PO-2024-884)',
      actualValue: '8 units (INV-9921)',
      difference: '-2 units (20% Variance)',
      severity: 'high',
      confidence: 0.99,
      sourceDocumentTitle: 'Purchase Order PO-2024-884',
      sourceDocumentId: poDocId,
      targetDocumentTitle: 'Commercial Invoice INV-9921',
      targetDocumentId: invDocId,
      pageReferences: 'PO: Page 1, Item 1 / INV: Page 1, Item 1',
      explanation: 'Purchase Order authorized procurement of 10 laptop units, but vendor invoice only billed for 8 units. While warehouse receipt REC-4412 confirms 8 units received, the remaining 2 units are outstanding/backordered.',
      recommendedAction: 'Verify vendor backorder status or generate amended purchase order for partial fulfillment prior to accounts payable release.',
      status: 'under_review',
      createdAt: new Date('2026-03-02T16:15:03Z'),
    });

    // Finding 2: Unit Price Discrepancy (Critical severity)
    const find2Id = 'find_price_002';
    memValidationFindings.set(find2Id, {
      _id: find2Id,
      validationRunId: runId,
      userId: defaultAdminId,
      category: 'unit_price',
      fieldName: 'Unit Price (Enterprise Laptop 16")',
      expectedValue: '$1,200.00 / unit (PO-2024-884)',
      actualValue: '$1,250.00 / unit (INV-9921)',
      difference: '+$50.00 / unit (+4.17% overcharge)',
      severity: 'critical',
      confidence: 0.98,
      sourceDocumentTitle: 'Purchase Order PO-2024-884',
      sourceDocumentId: poDocId,
      targetDocumentTitle: 'Commercial Invoice INV-9921',
      targetDocumentId: invDocId,
      pageReferences: 'PO: Page 1, Price Col / INV: Page 1, Price Col',
      explanation: 'Uncontracted unit price hike detected. The binding Purchase Order explicitly capped the unit price at $1,200.00. Vendor invoiced $1,250.00 per unit without an approved change order, causing an unapproved $400.00 premium on the 8 delivered units.',
      recommendedAction: 'Issue invoice dispute notice to Quantum Micro Devices Inc. Request credit memo of $400.00 or revised invoice matching contractual PO rate.',
      status: 'open',
      createdAt: new Date('2026-03-02T16:15:03Z'),
    });

    // Finding 3: Date Timeline Sequence (Passed)
    const find3Id = 'find_date_003';
    memValidationFindings.set(find3Id, {
      _id: find3Id,
      validationRunId: runId,
      userId: defaultAdminId,
      category: 'date',
      fieldName: 'Document Timeline Chronology',
      expectedValue: 'PO Date <= Invoice Date <= Receipt Date',
      actualValue: '2026-02-15 <= 2026-02-28 <= 2026-03-02',
      difference: 'Chronology Valid',
      severity: 'passed',
      confidence: 1.0,
      sourceDocumentTitle: 'Purchase Order PO-2024-884',
      sourceDocumentId: poDocId,
      targetDocumentTitle: 'Warehouse Goods Receipt REC-4412',
      targetDocumentId: recDocId,
      pageReferences: 'PO: P1 / INV: P1 / REC: P1',
      explanation: 'Chronological timeline verified: Order placed on Feb 15, Invoiced on Feb 28, and Goods received at dock on March 02.',
      recommendedAction: 'No action needed.',
      status: 'approved',
      createdAt: new Date('2026-03-02T16:15:03Z'),
    });

    // Finding 4: Vendor Identity Match (Passed)
    const find4Id = 'find_vendor_004';
    memValidationFindings.set(find4Id, {
      _id: find4Id,
      validationRunId: runId,
      userId: defaultAdminId,
      category: 'vendor',
      fieldName: 'Vendor Entity Legal Name',
      expectedValue: 'Quantum Micro Devices Inc.',
      actualValue: 'Quantum Micro Devices Inc.',
      difference: 'Exact Match (100%)',
      severity: 'passed',
      confidence: 0.99,
      sourceDocumentTitle: 'Purchase Order PO-2024-884',
      sourceDocumentId: poDocId,
      targetDocumentTitle: 'Commercial Invoice INV-9921',
      targetDocumentId: invDocId,
      pageReferences: 'PO: Header / INV: Header',
      explanation: 'Consistent legal vendor identity confirmed across all transaction records.',
      recommendedAction: 'No action needed.',
      status: 'approved',
      createdAt: new Date('2026-03-02T16:15:03Z'),
    });

    // Finding 5: Currency Consistency (Passed)
    const find5Id = 'find_curr_005';
    memValidationFindings.set(find5Id, {
      _id: find5Id,
      validationRunId: runId,
      userId: defaultAdminId,
      category: 'currency',
      fieldName: 'Transactional Currency',
      expectedValue: 'USD ($)',
      actualValue: 'USD ($)',
      difference: 'Identical',
      severity: 'passed',
      confidence: 1.0,
      sourceDocumentTitle: 'Purchase Order PO-2024-884',
      sourceDocumentId: poDocId,
      targetDocumentTitle: 'Commercial Invoice INV-9921',
      targetDocumentId: invDocId,
      pageReferences: 'PO: Line 1 / INV: Line 1',
      explanation: 'Consistent currency code (USD) verified without foreign exchange exposure.',
      recommendedAction: 'No action needed.',
      status: 'approved',
      createdAt: new Date('2026-03-02T16:15:03Z'),
    });

    // Create Workflow Tasks in Review Queue
    const task1Id = 'task_rev_001';
    memWorkflowTasks.set(task1Id, {
      _id: task1Id,
      findingId: find2Id,
      validationRunId: runId,
      userId: defaultAdminId,
      title: 'Review Unapproved Unit Price Overcharge on Laptops (+$50/unit)',
      severity: 'critical',
      confidence: 0.98,
      assignedRole: 'compliance_officer',
      status: 'pending',
      reviewerComments: 'Discrepancy flagged by deterministic 3-way match engine. Vendor invoice rate exceeds contract PO rate.',
      decisionBy: '',
      auditTrail: [
        {
          action: 'AUTOMATED_ROUTING',
          actor: 'DocVision Confidence Engine',
          timestamp: new Date('2026-03-02T16:15:05Z'),
          note: 'Routed to Critical Review Queue due to financial discrepancy > $100',
        }
      ],
      createdAt: new Date('2026-03-02T16:15:05Z'),
      updatedAt: new Date('2026-03-02T16:15:05Z'),
    });

    const task2Id = 'task_rev_002';
    memWorkflowTasks.set(task2Id, {
      _id: task2Id,
      findingId: find1Id,
      validationRunId: runId,
      userId: defaultAdminId,
      title: 'Verify Partial Delivery: 8 of 10 Laptops Received (2 Backordered)',
      severity: 'high',
      confidence: 0.99,
      assignedRole: 'compliance_officer',
      status: 'pending',
      reviewerComments: 'Need procurement team confirmation of second delivery wave.',
      decisionBy: '',
      auditTrail: [
        {
          action: 'AUTOMATED_ROUTING',
          actor: 'DocVision Confidence Engine',
          timestamp: new Date('2026-03-02T16:15:05Z'),
          note: 'Routed to Review Queue due to physical quantity variance',
        }
      ],
      createdAt: new Date('2026-03-02T16:15:05Z'),
      updatedAt: new Date('2026-03-02T16:15:05Z'),
    });

    // Pre-seed Document Chunks for RAG Vector Search
    const chunks = [
      {
        _id: 'chk_po_1',
        documentId: poDocId,
        userId: defaultAdminId,
        chunkText: 'Purchase Order PO-2024-884 issued to Quantum Micro Devices Inc. for 10 Enterprise High-Performance Laptop 16" at unit price $1,200.00. Subtotal $12,000.00, Tax $960.00, Total $12,960.00. Payment terms: Net 30 days.',
        pageNumber: 1,
        chunkIndex: 0,
        embedding: generateMockEmbedding('Purchase Order PO-2024-884 Quantum Micro Devices Laptops 10 1200'),
        metadata: { docType: 'purchase_order', poNumber: 'PO-2024-884' },
      },
      {
        _id: 'chk_inv_1',
        documentId: invDocId,
        userId: defaultAdminId,
        chunkText: 'Commercial Invoice INV-9921 from Quantum Micro Devices Inc. referencing PO-2024-884. Billing for 8 Enterprise High-Performance Laptop 16" at unit price $1,250.00. Subtotal $10,000.00, Tax $800.00, Total $10,800.00. Due March 30, 2026.',
        pageNumber: 1,
        chunkIndex: 0,
        embedding: generateMockEmbedding('Commercial Invoice INV-9921 Quantum Micro Devices PO-2024-884 Laptops 8 1250'),
        metadata: { docType: 'invoice', invoiceNumber: 'INV-9921', poNumber: 'PO-2024-884' },
      },
      {
        _id: 'chk_rec_1',
        documentId: recDocId,
        userId: defaultAdminId,
        chunkText: 'Warehouse Goods Receipt REC-4412 for PO-2024-884 and INV-9921. Inspected at Dock B Chicago Hub by Supervisor D. Campbell. Accepted 8 laptops in good condition. 2 units reported backordered by supplier.',
        pageNumber: 1,
        chunkIndex: 0,
        embedding: generateMockEmbedding('Goods Receipt REC-4412 Dock B Chicago 8 laptops received 2 backordered Campbell'),
        metadata: { docType: 'receipt', receiptNumber: 'REC-4412' },
      }
    ];

    chunks.forEach(c => memChunks.set(c._id, c));

    // Audit Log seed
    memAuditLogs.push({
      _id: 'audit_init_001',
      userId: defaultAdminId,
      action: 'SYSTEM_BOOTSTRAP',
      resourceType: 'PLATFORM',
      resourceId: 'docvision-core',
      details: { message: 'Initialized DocVision AI Enterprise Benchmark Suite with PO-2024-884, INV-9921, REC-4412' },
      ipAddress: '127.0.0.1',
      timestamp: new Date('2026-03-02T16:00:00Z'),
    });
  }
}

// Deterministic 384-dimensional embedding generator for local semantic matching
export function generateMockEmbedding(text: string): number[] {
  const dim = 384;
  const embedding = new Array(dim).fill(0);
  const normalized = text.toLowerCase();
  
  for (let i = 0; i < normalized.length; i++) {
    const code = normalized.charCodeAt(i);
    const index = (code * 17 + i * 31) % dim;
    embedding[index] = (embedding[index] + Math.sin(code + i)) / 2;
  }

  // L2 normalize
  let sumSq = 0;
  for (let i = 0; i < dim; i++) {
    sumSq += embedding[i] * embedding[i];
  }
  const norm = Math.sqrt(sumSq) || 1;
  for (let i = 0; i < dim; i++) {
    embedding[i] = embedding[i] / norm;
  }
  return embedding;
}

export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
}

// Universal Data Access Objects (Bridge between Mongoose and In-Memory)
export const dataStore = {
  // Users
  users: {
    async findByEmail(email: string) {
      if (!isDbFallback()) {
        try {
          return await UserModel.findOne({ email: email.toLowerCase() }).lean();
        } catch (e) { /* fallback */ }
      }
      for (const user of memUsers.values()) {
        if (user.email.toLowerCase() === email.toLowerCase()) return user;
      }
      return null;
    },
    async findById(id: string) {
      if (!isDbFallback()) {
        try {
          return await UserModel.findById(id).lean();
        } catch (e) { /* fallback */ }
      }
      return memUsers.get(id) || null;
    },
    async create(userData: any) {
      if (!isDbFallback()) {
        try {
          const doc = await UserModel.create(userData);
          return doc.toObject();
        } catch (e) { /* fallback */ }
      }
      const _id = 'usr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
      const user = { ...userData, _id, createdAt: new Date(), updatedAt: new Date() };
      memUsers.set(_id, user);
      return user;
    }
  },

  // Documents
  documents: {
    async findByUserId(userId: string, filters: { type?: string; status?: string; search?: string } = {}) {
      let docs: any[] = [];
      if (!isDbFallback()) {
        try {
          const query: any = { userId };
          if (filters.type && filters.type !== 'all') query.documentType = filters.type;
          if (filters.status && filters.status !== 'all') query.status = filters.status;
          if (filters.search) query.title = { $regex: filters.search, $options: 'i' };
          docs = await DocumentModel.find(query).sort({ createdAt: -1 }).lean();
          if (docs.length > 0) return docs;
        } catch (e) { /* fallback */ }
      }
      
      docs = Array.from(memDocuments.values()).filter(d => {
        if (d.userId !== userId && userId !== 'usr_default_admin_001') {
          // In single user demo mode, allow access if match or admin
        }
        if (filters.type && filters.type !== 'all' && d.documentType !== filters.type) return false;
        if (filters.status && filters.status !== 'all' && d.status !== filters.status) return false;
        if (filters.search && !d.title.toLowerCase().includes(filters.search.toLowerCase()) && !d.originalName.toLowerCase().includes(filters.search.toLowerCase())) return false;
        return true;
      });
      return docs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
    async findById(id: string) {
      if (!isDbFallback()) {
        try {
          const doc = await DocumentModel.findById(id).lean();
          if (doc) return doc;
        } catch (e) { /* fallback */ }
      }
      return memDocuments.get(id) || null;
    },
    async create(docData: any) {
      if (!isDbFallback()) {
        try {
          const doc = await DocumentModel.create(docData);
          return doc.toObject();
        } catch (e) { /* fallback */ }
      }
      const _id = 'doc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
      const doc = { ...docData, _id, createdAt: new Date(), updatedAt: new Date() };
      memDocuments.set(_id, doc);
      return doc;
    },
    async update(id: string, updates: any) {
      if (!isDbFallback()) {
        try {
          await DocumentModel.findByIdAndUpdate(id, updates);
        } catch (e) { /* fallback */ }
      }
      const doc = memDocuments.get(id);
      if (doc) {
        Object.assign(doc, updates, { updatedAt: new Date() });
      }
      return doc;
    },
    async delete(id: string) {
      if (!isDbFallback()) {
        try {
          await DocumentModel.findByIdAndDelete(id);
        } catch (e) { /* fallback */ }
      }
      memDocuments.delete(id);
      memExtractions.delete(`ext_${id}`);
      return true;
    }
  },

  // Document Extractions
  extractions: {
    async findByDocId(documentId: string) {
      if (!isDbFallback()) {
        try {
          const ext = await DocumentExtractionModel.findOne({ documentId }).lean();
          if (ext) return ext;
        } catch (e) { /* fallback */ }
      }
      for (const ext of memExtractions.values()) {
        if (ext.documentId === documentId) return ext;
      }
      return null;
    },
    async createOrUpdate(documentId: string, extData: any) {
      if (!isDbFallback()) {
        try {
          await DocumentExtractionModel.findOneAndUpdate({ documentId }, extData, { upsert: true, new: true });
        } catch (e) { /* fallback */ }
      }
      const key = `ext_${documentId}`;
      const existing = memExtractions.get(key) || { _id: key, documentId, createdAt: new Date() };
      const updated = { ...existing, ...extData, updatedAt: new Date() };
      memExtractions.set(key, updated);
      return updated;
    }
  },

  // Document Chunks (Vector RAG)
  chunks: {
    async findByDocumentId(documentId: string) {
      if (!isDbFallback()) {
        try {
          const chunks = await DocumentChunkModel.find({ documentId }).lean();
          if (chunks.length > 0) return chunks;
        } catch (e) { /* fallback */ }
      }
      return Array.from(memChunks.values()).filter(c => c.documentId === documentId);
    },
    async insertMany(chunksData: any[]) {
      if (!isDbFallback()) {
        try {
          await DocumentChunkModel.insertMany(chunksData);
        } catch (e) { /* fallback */ }
      }
      chunksData.forEach(c => {
        const _id = c._id || 'chk_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
        memChunks.set(_id, { ...c, _id });
      });
      return true;
    },
    async vectorSearch(userId: string, queryEmbedding: number[], topK: number = 4, rawQuery: string = '') {
      const allChunks = Array.from(memChunks.values());
      const queryTokens = (rawQuery || '').toLowerCase().split(/\W+/).filter(t => t.length > 2);

      const scored = allChunks.map(c => {
        const cosSim = cosineSimilarity(queryEmbedding, c.embedding);
        const textLower = (c.chunkText || '').toLowerCase();
        
        let tokenMatches = 0;
        queryTokens.forEach(t => {
          if (textLower.includes(t)) tokenMatches++;
        });
        const keywordBoost = queryTokens.length > 0 ? (tokenMatches / queryTokens.length) * 0.5 : 0;
        const totalScore = Math.min(1.0, cosSim * 0.5 + keywordBoost);

        return {
          ...c,
          similarity: totalScore,
        };
      });

      scored.sort((a, b) => b.similarity - a.similarity);
      return scored.slice(0, topK);
    }
  },

  // Relationships
  relationships: {
    async findByUserId(userId: string) {
      if (!isDbFallback()) {
        try {
          const rels = await DocumentRelationshipModel.find({ userId }).populate('sourceDocumentId').populate('targetDocumentId').lean();
          if (rels.length > 0) return rels;
        } catch (e) { /* fallback */ }
      }
      return Array.from(memRelationships.values());
    },
    async create(relData: any) {
      if (!isDbFallback()) {
        try {
          const doc = await DocumentRelationshipModel.create(relData);
          return doc.toObject();
        } catch (e) { /* fallback */ }
      }
      const _id = 'rel_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
      const rel = { ...relData, _id, createdAt: new Date(), updatedAt: new Date() };
      memRelationships.set(_id, rel);
      return rel;
    }
  },

  // Validation Runs
  validationRuns: {
    async findAll(userId: string) {
      if (!isDbFallback()) {
        try {
          const runs = await ValidationRunModel.find({ userId }).sort({ createdAt: -1 }).lean();
          if (runs.length > 0) return runs;
        } catch (e) { /* fallback */ }
      }
      return Array.from(memValidationRuns.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
    async findById(id: string) {
      if (!isDbFallback()) {
        try {
          const run = await ValidationRunModel.findById(id).lean();
          if (run) return run;
        } catch (e) { /* fallback */ }
      }
      return memValidationRuns.get(id) || null;
    },
    async create(runData: any) {
      if (!isDbFallback()) {
        try {
          const doc = await ValidationRunModel.create(runData);
          return doc.toObject();
        } catch (e) { /* fallback */ }
      }
      const _id = 'val_run_' + Date.now();
      const run = { ...runData, _id, createdAt: new Date() };
      memValidationRuns.set(_id, run);
      return run;
    }
  },

  // Validation Findings
  findings: {
    async findByRunId(validationRunId: string) {
      if (!isDbFallback()) {
        try {
          const list = await ValidationFindingModel.find({ validationRunId }).lean();
          if (list.length > 0) return list;
        } catch (e) { /* fallback */ }
      }
      return Array.from(memValidationFindings.values()).filter(f => f.validationRunId === validationRunId);
    },
    async findAll(userId: string) {
      if (!isDbFallback()) {
        try {
          const list = await ValidationFindingModel.find({ userId }).sort({ createdAt: -1 }).lean();
          if (list.length > 0) return list;
        } catch (e) { /* fallback */ }
      }
      return Array.from(memValidationFindings.values());
    },
    async create(findingData: any) {
      if (!isDbFallback()) {
        try {
          const doc = await ValidationFindingModel.create(findingData);
          return doc.toObject();
        } catch (e) { /* fallback */ }
      }
      const _id = 'find_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
      const finding = { ...findingData, _id, createdAt: new Date() };
      memValidationFindings.set(_id, finding);
      return finding;
    },
    async update(id: string, updates: any) {
      if (!isDbFallback()) {
        try {
          await ValidationFindingModel.findByIdAndUpdate(id, updates);
        } catch (e) { /* fallback */ }
      }
      const f = memValidationFindings.get(id);
      if (f) Object.assign(f, updates);
      return f;
    }
  },

  // Workflow Tasks (Human Review Queue)
  workflowTasks: {
    async findAll(userId: string) {
      if (!isDbFallback()) {
        try {
          const tasks = await WorkflowTaskModel.find({ userId }).populate('findingId').sort({ createdAt: -1 }).lean();
          if (tasks.length > 0) return tasks;
        } catch (e) { /* fallback */ }
      }
      return Array.from(memWorkflowTasks.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
    async findById(id: string) {
      if (!isDbFallback()) {
        try {
          const task = await WorkflowTaskModel.findById(id).lean();
          if (task) return task;
        } catch (e) { /* fallback */ }
      }
      return memWorkflowTasks.get(id) || null;
    },
    async create(taskData: any) {
      if (!isDbFallback()) {
        try {
          const doc = await WorkflowTaskModel.create(taskData);
          return doc.toObject();
        } catch (e) { /* fallback */ }
      }
      const _id = 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
      const task = { ...taskData, _id, createdAt: new Date(), updatedAt: new Date() };
      memWorkflowTasks.set(_id, task);
      return task;
    },
    async update(id: string, updates: any) {
      if (!isDbFallback()) {
        try {
          await WorkflowTaskModel.findByIdAndUpdate(id, updates);
        } catch (e) { /* fallback */ }
      }
      const task = memWorkflowTasks.get(id);
      if (task) {
        Object.assign(task, updates, { updatedAt: new Date() });
      }
      return task;
    }
  },

  // Audit Logs
  auditLogs: {
    async log(data: { userId?: string; action: string; resourceType: string; resourceId?: string; details?: any; ipAddress?: string }) {
      const record = {
        _id: 'audit_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        ...data,
        details: data.details || {},
        ipAddress: data.ipAddress || '127.0.0.1',
        timestamp: new Date(),
      };
      if (!isDbFallback()) {
        try {
          await AuditLogModel.create(record);
        } catch (e) { /* fallback */ }
      }
      memAuditLogs.unshift(record);
      if (memAuditLogs.length > 500) memAuditLogs.pop();
      return record;
    },
    async findAll(limit: number = 50) {
      if (!isDbFallback()) {
        try {
          const logs = await AuditLogModel.find().sort({ timestamp: -1 }).limit(limit).lean();
          if (logs.length > 0) return logs;
        } catch (e) { /* fallback */ }
      }
      return memAuditLogs.slice(0, limit);
    }
  }
};
