import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Play, 
  AlertTriangle, 
  CheckCircle2, 
  AlertOctagon, 
  Download, 
  FileSpreadsheet, 
  Filter, 
  Search,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import { ValidationFinding, ValidationRun, FindingSeverity } from '../../types';
import { endpoints } from '../../services/api';

interface ValidationCenterProps {
  onSelectTab: (tab: string) => void;
  onOpenFindingReview?: (finding: ValidationFinding) => void;
}

export const ValidationCenter: React.FC<ValidationCenterProps> = ({ 
  onSelectTab,
  onOpenFindingReview
}) => {
  const [runs, setRuns] = useState<ValidationRun[]>([]);
  const [findings, setFindings] = useState<ValidationFinding[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedFinding, setSelectedFinding] = useState<ValidationFinding | null>(null);

  const fetchValidationData = async () => {
    try {
      setLoading(true);
      const [runsRes, findingsRes] = await Promise.all([
        endpoints.getValidationRuns(),
        endpoints.getFindings()
      ]);

      if (runsRes.data?.success) setRuns(runsRes.data.runs);
      if (findingsRes.data?.success) setFindings(findingsRes.data.findings);
    } catch (err) {
      console.error('Error fetching validation results:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchValidationData();
  }, []);

  const handleRunValidation = async () => {
    try {
      setIsValidating(true);
      const res = await endpoints.runValidation();
      if (res.data?.success) {
        fetchValidationData();
      }
    } catch (err: any) {
      alert('Validation run error: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsValidating(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await endpoints.updateFinding(id, { status: newStatus });
      fetchValidationData();
      if (selectedFinding?._id === id) {
        setSelectedFinding(prev => prev ? { ...prev, status: newStatus as any } : null);
      }
    } catch (err) {
      alert('Status update failed');
    }
  };

  const filteredFindings = findings.filter(f => {
    if (severityFilter !== 'all' && f.severity !== severityFilter) return false;
    if (categoryFilter !== 'all' && f.category !== categoryFilter) return false;
    return true;
  });

  const passedCount = findings.filter(f => f.severity === 'passed').length;
  const criticalCount = findings.filter(f => f.severity === 'critical').length;
  const highCount = findings.filter(f => f.severity === 'high').length;
  const mediumCount = findings.filter(f => f.severity === 'medium').length;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Validation Center</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Deterministic 10-point cross-document 3-way match across Purchase Orders, Invoices, and Goods Receipts
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={endpoints.exportCsvUrl}
            download
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-medium text-slate-300 hover:text-white transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Audit CSV</span>
          </a>
          <button
            onClick={handleRunValidation}
            disabled={isValidating}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-sm shadow-indigo-500/20 transition-all whitespace-nowrap"
          >
            <Play className={`w-3.5 h-3.5 ${isValidating ? 'animate-spin' : 'fill-white'}`} />
            <span>{isValidating ? 'Executing 3-Way Match...' : 'Execute 3-Way Match'}</span>
          </button>
        </div>
      </div>

      {/* Summary Scorecards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-[11px] font-medium text-slate-400 mb-1">Total Algorithmic Checks</div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">{findings.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">10-point deterministic matrix</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-[11px] font-medium text-emerald-400 mb-1">Passed Checks</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">{passedCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Exact match & verified bounds</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-[11px] font-medium text-rose-400 mb-1">Critical Discrepancies</div>
          <div className="text-2xl font-bold font-mono text-rose-400 tabular-nums">{criticalCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Financial overcharges & timeline errors</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-[11px] font-medium text-amber-400 mb-1">High Variances</div>
          <div className="text-2xl font-bold font-mono text-amber-400 tabular-nums">{highCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Partial deliveries & backorders</div>
        </div>
      </div>

      {/* Filter Tabs (Interactive Filter Controls conforming to Section 1.A) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Severity Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg overflow-x-auto w-full md:w-auto">
          {[
            { id: 'all', label: 'All Findings' },
            { id: 'critical', label: 'Critical' },
            { id: 'high', label: 'High' },
            { id: 'medium', label: 'Medium' },
            { id: 'passed', label: 'Passed' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSeverityFilter(tab.id)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                severityFilter === tab.id
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Category Dropdown Filter */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <span className="text-xs text-slate-400 font-medium">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Categories</option>
            <option value="quantity">Quantity (Ordered vs Invoiced)</option>
            <option value="unit_price">Unit Price Agreement</option>
            <option value="vendor">Vendor Entity Match</option>
            <option value="po_reference">PO Reference Integrity</option>
            <option value="tax">Tax Verification</option>
            <option value="total_amount">Mathematical Integrity</option>
            <option value="currency">Currency Uniformity</option>
            <option value="date">Date Chronology</option>
            <option value="received_quantity">Goods Received (3-Way)</option>
          </select>
        </div>
      </div>

      {/* Findings Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-mono text-[11px]">
                <th className="py-3 px-5 font-medium">Category & Field</th>
                <th className="py-3 px-4 font-medium">Expected (Contract / PO)</th>
                <th className="py-3 px-4 font-medium">Actual (Invoice / Dock)</th>
                <th className="py-3 px-4 font-medium">Variance</th>
                <th className="py-3 px-4 font-medium">Severity</th>
                <th className="py-3 px-4 font-medium">Evidence Citation</th>
                <th className="py-3 px-5 font-medium text-right">Review Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-mono">
                    Loading validation matrix findings...
                  </td>
                </tr>
              ) : filteredFindings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <ShieldCheck className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                    <div>No findings match the selected filters.</div>
                  </td>
                </tr>
              ) : (
                filteredFindings.map((finding) => (
                  <tr 
                    key={finding._id} 
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                    onClick={() => setSelectedFinding(finding)}
                  >
                    <td className="py-3 px-5">
                      <div className="font-semibold text-slate-200">{finding.fieldName}</div>
                      <div className="text-[10px] font-mono text-slate-500 capitalize">
                        {finding.category.replace('_', ' ')}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">{finding.expectedValue}</td>
                    <td className="py-3 px-4 font-mono text-slate-300">{finding.actualValue}</td>
                    <td className="py-3 px-4 font-mono tabular-nums font-bold">
                      <span className={finding.severity === 'passed' ? 'text-emerald-400' : 'text-rose-400'}>
                        {finding.difference || 'Zero Variance'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        finding.severity === 'critical' ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30' :
                        finding.severity === 'high' ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' :
                        finding.severity === 'passed' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {finding.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      <div>{finding.pageReferences}</div>
                      <div className="text-[10px] text-slate-500 truncate max-w-xs">{finding.sourceDocumentTitle}</div>
                    </td>
                    <td className="py-3 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedFinding(finding)}
                        className="px-2.5 py-1 text-[11px] font-medium text-indigo-300 hover:text-white bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 rounded transition-colors whitespace-nowrap"
                      >
                        Inspect Evidence
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Finding Detail Modal / Drawer */}
      {selectedFinding && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400">
                  Finding Evidence dossier · {selectedFinding.category.replace('_', ' ')}
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">{selectedFinding.fieldName}</h3>
              </div>
              <button
                onClick={() => setSelectedFinding(null)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 rounded-lg"
              >
                Close
              </button>
            </div>

            {/* Variance Metric Highlight */}
            <div className="grid grid-cols-3 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono">
              <div>
                <div className="text-slate-500">Expected Value</div>
                <div className="text-slate-200 font-semibold mt-0.5">{selectedFinding.expectedValue}</div>
              </div>
              <div>
                <div className="text-slate-500">Actual Value</div>
                <div className="text-slate-200 font-semibold mt-0.5">{selectedFinding.actualValue}</div>
              </div>
              <div>
                <div className="text-slate-500">Calculated Variance</div>
                <div className={`font-semibold mt-0.5 ${selectedFinding.severity === 'passed' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {selectedFinding.difference || 'None'}
                </div>
              </div>
            </div>

            {/* Explanation & Action */}
            <div className="space-y-3 text-xs leading-relaxed">
              <div>
                <div className="font-semibold text-slate-200 mb-1">Algorithmic Explanation:</div>
                <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg text-slate-300">
                  {selectedFinding.explanation}
                </div>
              </div>

              <div>
                <div className="font-semibold text-slate-200 mb-1">Recommended Action:</div>
                <div className="p-3 bg-indigo-950/20 border border-indigo-900/40 rounded-lg text-indigo-200">
                  {selectedFinding.recommendedAction}
                </div>
              </div>

              <div>
                <div className="font-semibold text-slate-200 mb-1">Document Evidence Sources:</div>
                <div className="text-slate-400 font-mono text-[11px] space-y-1">
                  <div>· Primary Source: {selectedFinding.sourceDocumentTitle} ({selectedFinding.pageReferences})</div>
                  <div>· Comparison Target: {selectedFinding.targetDocumentTitle}</div>
                  <div>· Algorithmic Confidence: {Math.round(selectedFinding.confidence * 100)}%</div>
                </div>
              </div>
            </div>

            {/* Workflow Action Buttons */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">Current Status: <strong className="text-white capitalize">{selectedFinding.status.replace('_', ' ')}</strong></span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleUpdateStatus(selectedFinding._id, 'approved')}
                  className="px-3 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg transition-colors"
                >
                  Approve Exception
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedFinding._id, 'rejected')}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg transition-colors"
                >
                  Reject & Dispute
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
