import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { dataStore } from '../db/dataStore.js';
import { ValidationEngine } from '../services/validationEngine.js';

const router = Router();

// Execute Validation Run
router.post('/run', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user._id.toString();
    const { documentIds, runName } = req.body;

    let targetDocs: any[] = [];
    if (documentIds && Array.isArray(documentIds) && documentIds.length > 0) {
      for (const id of documentIds) {
        const d = await dataStore.documents.findById(id);
        if (d) targetDocs.push(d);
      }
    } else {
      targetDocs = await dataStore.documents.findByUserId(userId);
    }

    if (targetDocs.length === 0) {
      res.status(400).json({ success: false, message: 'No documents available to validate. Please upload documents first.' });
      return;
    }

    // Fetch extractions for these documents
    const extractionsMap: Record<string, any> = {};
    for (const doc of targetDocs) {
      const ext = await dataStore.extractions.findByDocId(doc._id.toString());
      if (ext && ext.structuredData) {
        extractionsMap[doc._id.toString()] = ext.structuredData;
      }
    }

    const result = await ValidationEngine.executeTriangulatedValidation(
      userId,
      runName || 'Enterprise Cross-Document 3-Way Match Verification',
      targetDocs,
      extractionsMap
    );

    res.json({
      success: true,
      runId: result.runId,
      summary: result.summary,
      findings: result.findings,
      message: `Validation completed with ${result.summary.passedChecks} passed checks and ${result.summary.failedChecks} flagged findings.`
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Validation run failed: ' + err.message });
  }
});

// List all Validation Runs
router.get('/runs', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user._id.toString();
    const runs = await dataStore.validationRuns.findAll(userId);
    res.json({ success: true, count: runs.length, runs });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get specific Validation Run findings
router.get('/runs/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const run = await dataStore.validationRuns.findById(req.params.id);
    if (!run) {
      res.status(404).json({ success: false, message: 'Validation run not found' });
      return;
    }

    const findings = await dataStore.findings.findByRunId(req.params.id);
    res.json({ success: true, run, findings });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// List all findings
router.get('/findings', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user._id.toString();
    const findings = await dataStore.findings.findAll(userId);
    res.json({ success: true, count: findings.length, findings });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update single finding status
router.patch('/findings/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, recommendedAction } = req.body;
    const updated = await dataStore.findings.update(req.params.id, { status, recommendedAction });
    if (!updated) {
      res.status(404).json({ success: false, message: 'Finding not found' });
      return;
    }

    await dataStore.auditLogs.log({
      userId: req.user._id.toString(),
      action: 'FINDING_STATUS_UPDATED',
      resourceType: 'VALIDATION_FINDING',
      resourceId: req.params.id,
      details: { newStatus: status },
    });

    res.json({ success: true, finding: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
