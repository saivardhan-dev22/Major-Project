import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { dataStore } from '../db/dataStore.js';

const router = Router();

// List Review Tasks in Human Review Queue
router.get('/tasks', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user._id.toString();
    const tasks = await dataStore.workflowTasks.findAll(userId);
    res.json({ success: true, count: tasks.length, tasks });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update Review Task Action (Approve, Reject, Request Info)
router.post('/tasks/:id/decision', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { action, comments } = req.body; // action: 'approve' | 'reject' | 'request_info'
    const task = await dataStore.workflowTasks.findById(req.params.id);

    if (!task) {
      res.status(404).json({ success: false, message: 'Review task not found' });
      return;
    }

    let status: 'approved' | 'rejected' | 'info_requested' = 'approved';
    if (action === 'reject') status = 'rejected';
    if (action === 'request_info') status = 'info_requested';

    const auditEntry = {
      action: `REVIEWER_${action.toUpperCase()}`,
      actor: req.user.username || req.user.email,
      timestamp: new Date(),
      note: comments || `Action '${action}' completed by ${req.user.role}`,
    };

    const updatedTask = await dataStore.workflowTasks.update(req.params.id, {
      status,
      reviewerComments: comments || task.reviewerComments,
      decisionBy: req.user.username || req.user.email,
      decidedAt: new Date(),
      auditTrail: [...(task.auditTrail || []), auditEntry],
    });

    // Also update underlying finding status
    if (task.findingId) {
      await dataStore.findings.update(task.findingId.toString(), {
        status: status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'under_review',
      });
    }

    await dataStore.auditLogs.log({
      userId: req.user._id.toString(),
      action: `WORKFLOW_TASK_${action.toUpperCase()}`,
      resourceType: 'WORKFLOW_TASK',
      resourceId: req.params.id,
      details: { decision: action, comments },
    });

    res.json({ success: true, task: updatedTask, message: `Review decision successfully logged: ${action}` });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
