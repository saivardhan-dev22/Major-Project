import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { dataStore } from '../db/dataStore.js';

const router = Router();

// Get Document Relationships and Connected Graph
router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user._id.toString();
    const relationships = await dataStore.relationships.findByUserId(userId);
    const documents = await dataStore.documents.findByUserId(userId);

    // Build visual graph nodes and links for frontend
    const nodes = documents.map(d => ({
      id: d._id.toString(),
      label: d.title,
      type: d.documentType,
      status: d.status,
      confidence: d.confidenceScore,
      originalName: d.originalName,
    }));

    const links = relationships.map((r: any) => ({
      id: r._id.toString(),
      source: r.sourceDocumentId.toString(),
      target: r.targetDocumentId.toString(),
      type: r.relationshipType,
      confidence: r.confidence,
      evidenceSummary: r.evidenceSummary,
      matchingFields: r.matchingFields,
    }));

    res.json({
      success: true,
      relationships,
      graph: { nodes, links },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Auto-detect relationships across documents
router.post('/detect', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user._id.toString();
    const docs = await dataStore.documents.findByUserId(userId);
    
    // Map of extractions
    const extractions: any[] = [];
    for (const d of docs) {
      const ext = await dataStore.extractions.findByDocId(d._id.toString());
      if (ext && ext.structuredData) {
        extractions.push({ doc: d, data: ext.structuredData });
      }
    }

    const detected: any[] = [];

    // Pairwise matching
    for (const itemA of extractions) {
      for (const itemB of extractions) {
        if (itemA.doc._id.toString() === itemB.doc._id.toString()) continue;

        // PO to Invoice match
        if (itemA.doc.documentType === 'purchase_order' && itemB.doc.documentType === 'invoice') {
          const poNum = itemA.data.poNumber || itemA.data.documentNumber;
          const invPoRef = itemB.data.poNumber;
          if (poNum && invPoRef && poNum.toLowerCase() === invPoRef.toLowerCase()) {
            const rel = await dataStore.relationships.create({
              userId,
              sourceDocumentId: itemA.doc._id.toString(),
              targetDocumentId: itemB.doc._id.toString(),
              relationshipType: 'po_to_invoice',
              matchingFields: { poNumber: poNum, vendorName: itemA.data.vendorName },
              confidence: 0.99,
              evidenceSummary: `Shared PO Reference Identifier: ${poNum}`,
              status: 'active'
            });
            detected.push(rel);
          }
        }

        // Invoice to Receipt match
        if (itemA.doc.documentType === 'invoice' && itemB.doc.documentType === 'receipt') {
          const invNum = itemA.data.invoiceNumber || itemA.data.documentNumber;
          const recInvRef = itemB.data.invoiceNumber;
          if (invNum && recInvRef && invNum.toLowerCase() === recInvRef.toLowerCase()) {
            const rel = await dataStore.relationships.create({
              userId,
              sourceDocumentId: itemA.doc._id.toString(),
              targetDocumentId: itemB.doc._id.toString(),
              relationshipType: 'invoice_to_receipt',
              matchingFields: { invoiceNumber: invNum, vendorName: itemA.data.vendorName },
              confidence: 0.98,
              evidenceSummary: `Shared Invoice Reference Identifier: ${invNum}`,
              status: 'active'
            });
            detected.push(rel);
          }
        }
      }
    }

    res.json({ success: true, count: detected.length, detected });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
