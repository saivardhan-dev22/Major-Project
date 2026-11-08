import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { dataStore } from '../db/dataStore.js';

const router = Router();

// Get Executive Validation & Audit Reports
router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user._id.toString();
    const runs = await dataStore.validationRuns.findAll(userId);
    const findings = await dataStore.findings.findAll(userId);
    const tasks = await dataStore.workflowTasks.findAll(userId);
    const auditLogs = await dataStore.auditLogs.findAll(25);

    const reports = runs.map(run => {
      const runFindings = findings.filter(f => f.validationRunId === run._id.toString());
      return {
        id: run._id,
        name: run.name,
        date: run.createdAt,
        status: run.status,
        summary: run.summary,
        findingsCount: runFindings.length,
        criticalDiscrepancies: runFindings.filter(f => f.severity === 'critical').length,
        highDiscrepancies: runFindings.filter(f => f.severity === 'high').length,
      };
    });

    res.json({
      success: true,
      reports,
      totalFindings: findings.length,
      pendingReviews: tasks.filter(t => t.status === 'pending').length,
      recentAudits: auditLogs,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Download Findings as CSV
router.get('/export-csv', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user._id.toString();
    const findings = await dataStore.findings.findAll(userId);

    const headers = [
      'Finding ID',
      'Category',
      'Field Name',
      'Severity',
      'Confidence',
      'Expected Value',
      'Actual Value',
      'Difference',
      'Source Document',
      'Target Document',
      'Page Reference',
      'Explanation',
      'Status'
    ];

    const rows = findings.map(f => [
      `"${f._id}"`,
      `"${f.category}"`,
      `"${f.fieldName.replace(/"/g, '""')}"`,
      `"${f.severity}"`,
      `"${Math.round(f.confidence * 100)}%"`,
      `"${f.expectedValue.replace(/"/g, '""')}"`,
      `"${f.actualValue.replace(/"/g, '""')}"`,
      `"${(f.difference || '').replace(/"/g, '""')}"`,
      `"${f.sourceDocumentTitle.replace(/"/g, '""')}"`,
      `"${f.targetDocumentTitle.replace(/"/g, '""')}"`,
      `"${f.pageReferences.replace(/"/g, '""')}"`,
      `"${f.explanation.replace(/"/g, '""')}"`,
      `"${f.status}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="DocVision_Validation_Report.csv"');
    res.send(csvContent);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
