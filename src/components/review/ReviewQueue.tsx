import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  CheckCircle, 
  XCircle, 
  HelpCircle, 
  Clock, 
  MessageSquare, 
  ShieldAlert, 
  ChevronRight,
  RefreshCw,
  User,
  AlertTriangle
} from 'lucide-react';
import { endpoints } from '../../services/api';
import { WorkflowTask } from '../../types';

export const ReviewQueue: React.FC = () => {
  const [tasks, setTasks] = useState<WorkflowTask[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTask, setActiveTask] = useState<WorkflowTask | null>(null);
  const [decisionAction, setDecisionAction] = useState<'approve' | 'reject' | 'request_info'>('approve');
  const [commentText, setCommentText] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await endpoints.getWorkflowTasks();
      if (res.data?.success) {
        setTasks(res.data.tasks);
      }
    } catch (err) {
      console.error('Failed to load review queue tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleOpenDecision = (task: WorkflowTask, action: 'approve' | 'reject' | 'request_info') => {
    setActiveTask(task);
    setDecisionAction(action);
    setCommentText(task.reviewerComments || '');
  };

  const handleSubmitDecision = async () => {
    if (!activeTask) return;
    try {
      setSubmitting(true);
      await endpoints.submitTaskDecision(activeTask._id, {
        action: decisionAction,
        comments: commentText.trim(),
      });
      setActiveTask(null);
      fetchTasks();
    } catch (err: any) {
      alert('Decision submission failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const resolvedTasks = tasks.filter(t => t.status !== 'pending');

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Compliance Human Review Queue</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Confidence-aware triage routing for financial discrepancies and low-confidence document extractions
          </p>
        </div>

        <button
          onClick={fetchTasks}
          className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-lg transition-colors self-start sm:self-auto"
          title="Refresh Queue"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Queue Stat Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-[11px] font-medium text-amber-400 mb-1">Awaiting Auditor Review</div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">{pendingTasks.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Requires human sign-off</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-[11px] font-medium text-emerald-400 mb-1">Resolved Decisions</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">{resolvedTasks.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Approved exceptions & rejected claims</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-[11px] font-medium text-indigo-400 mb-1">Review Protocol</div>
          <div className="text-xs font-mono text-slate-300 mt-1">SOX Compliance & 3-Way Match</div>
          <div className="text-[11px] text-slate-500 mt-1">Audit trail logged with timestamp & ID</div>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-200">Active Review Tasks</h3>

        {loading ? (
          <div className="p-8 text-center text-xs font-mono text-slate-500 bg-slate-900 border border-slate-800 rounded-xl">
            Loading compliance review queue...
          </div>
        ) : tasks.length === 0 ? (
          <div className="p-12 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-xl">
            <CheckCircle className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
            <div>All validation findings have been reviewed and approved. Zero pending exceptions.</div>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div 
                key={task._id} 
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      task.severity === 'critical' ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30' :
                      task.severity === 'high' ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      {task.severity}
                    </span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs font-mono text-slate-400">
                      Algorithmic Confidence: {Math.round(task.confidence * 100)}%
                    </span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className={`text-xs font-mono uppercase font-semibold ${
                      task.status === 'pending' ? 'text-amber-400' :
                      task.status === 'approved' ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {task.status}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white leading-tight">{task.title}</h4>
                  
                  {task.reviewerComments && (
                    <div className="text-xs text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono">
                      {task.reviewerComments}
                    </div>
                  )}

                  {/* Audit Trail Snippet */}
                  {task.auditTrail?.length > 0 && (
                    <div className="text-[11px] font-mono text-slate-500">
                      Last Action: {task.auditTrail[task.auditTrail.length - 1].action} by {task.auditTrail[task.auditTrail.length - 1].actor}
                    </div>
                  )}
                </div>

                {/* Review Action Controls */}
                <div className="flex items-center gap-2 shrink-0">
                  {task.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => handleOpenDecision(task, 'approve')}
                        className="px-3 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg transition-colors"
                      >
                        Approve Exception
                      </button>
                      <button
                        onClick={() => handleOpenDecision(task, 'reject')}
                        className="px-3 py-1.5 text-xs font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg transition-colors"
                      >
                        Reject & Dispute
                      </button>
                      <button
                        onClick={() => handleOpenDecision(task, 'request_info')}
                        className="px-3 py-1.5 text-xs font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-colors"
                      >
                        Request Info
                      </button>
                    </>
                  ) : (
                    <span className="text-xs font-mono text-slate-400">
                      Decision Recorded: <strong className="text-white capitalize">{task.status}</strong>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Decision Dialog Modal */}
      {activeTask && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white capitalize">
              Confirm Decision: {decisionAction.replace('_', ' ')}
            </h3>
            <p className="text-xs text-slate-400">
              {activeTask.title}
            </p>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Auditor Findings & Justification Comments:
              </label>
              <textarea
                rows={4}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Enter audit justification note, vendor communication notes, or procurement credit memo reference..."
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveTask(null)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitDecision}
                disabled={submitting}
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg shadow-sm"
              >
                {submitting ? 'Recording Audit...' : 'Confirm Decision'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
