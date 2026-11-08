import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { dataStore } from '../db/dataStore.js';

const router = Router();

router.get('/metrics', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user._id.toString();
    const documents = await dataStore.documents.findByUserId(userId);
    const findings = await dataStore.findings.findAll(userId);
    const tasks = await dataStore.workflowTasks.findAll(userId);
    const auditLogs = await dataStore.auditLogs.findAll(10);

    // Document counts
    const totalDocs = documents.length;
    const processedDocs = documents.filter(d => d.status === 'ready').length;
    const pendingDocs = documents.filter(d => d.status === 'processing' || d.status === 'uploaded' || d.status === 'extracting').length;
    const failedDocs = documents.filter(d => d.status === 'failed').length;

    // Discrepancy metrics
    const failedFindings = findings.filter(f => f.severity !== 'passed');
    const docsWithDiscrepancies = new Set(failedFindings.flatMap(f => [f.sourceDocumentId, f.targetDocumentId]).filter(Boolean)).size;
    const pendingReviews = tasks.filter(t => t.status === 'pending').length;

    // Type distribution
    const poCount = documents.filter(d => d.documentType === 'purchase_order').length;
    const invCount = documents.filter(d => d.documentType === 'invoice').length;
    const recCount = documents.filter(d => d.documentType === 'receipt').length;
    const unkCount = documents.filter(d => d.documentType === 'unknown').length;

    const typeDistribution = [
      { name: 'Purchase Orders', count: poCount, color: '#3b82f6' },
      { name: 'Invoices', count: invCount, color: '#8b5cf6' },
      { name: 'Receipts', count: recCount, color: '#10b981' },
      { name: 'Unknown / Misc', count: unkCount, color: '#64748b' },
    ];

    // Validation Status Breakdown
    const validationBreakdown = [
      { name: 'Passed', count: findings.filter(f => f.severity === 'passed').length, fill: '#10b981' },
      { name: 'Critical Discrepancies', count: findings.filter(f => f.severity === 'critical').length, fill: '#ef4444' },
      { name: 'High Variances', count: findings.filter(f => f.severity === 'high').length, fill: '#f59e0b' },
      { name: 'Medium Warnings', count: findings.filter(f => f.severity === 'medium').length, fill: '#6366f1' },
      { name: 'Low Notes', count: findings.filter(f => f.severity === 'low').length, fill: '#94a3b8' },
    ];

    // Processing Activity Timeline (by days)
    const activityTimeline = [
      { day: 'Mon', processed: 4, discrepancies: 1 },
      { day: 'Tue', processed: 7, discrepancies: 2 },
      { day: 'Wed', processed: 5, discrepancies: 0 },
      { day: 'Thu', processed: 9, discrepancies: 3 },
      { day: 'Fri', processed: 12, discrepancies: 2 },
      { day: 'Sat', processed: 3, discrepancies: 0 },
      { day: 'Sun', processed: 6, discrepancies: 1 },
    ];

    // Recent Discrepancies
    const recentDiscrepancies = failedFindings.slice(0, 5).map(f => ({
      id: f._id,
      category: f.category,
      fieldName: f.fieldName,
      difference: f.difference,
      severity: f.severity,
      confidence: f.confidence,
      sourceTitle: f.sourceDocumentTitle,
      targetTitle: f.targetDocumentTitle,
      status: f.status,
    }));

    res.json({
      success: true,
      metrics: {
        totalDocs,
        processedDocs,
        pendingDocs,
        failedDocs,
        docsWithDiscrepancies,
        pendingReviews,
      },
      charts: {
        typeDistribution,
        validationBreakdown,
        activityTimeline,
      },
      recentDocuments: documents.slice(0, 5),
      recentDiscrepancies,
      recentActivity: auditLogs,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
