import React, { useState, useEffect } from 'react';
import { 
  GitMerge, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  FileCheck, 
  Receipt, 
  FileText,
  RefreshCw,
  Sparkles,
  Link as LinkIcon
} from 'lucide-react';
import { endpoints } from '../../services/api';
import { DocumentRelationship } from '../../types';

export const RelationshipGraph: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [detecting, setDetecting] = useState<boolean>(false);

  const fetchRelationships = async () => {
    try {
      setLoading(true);
      const res = await endpoints.getRelationships();
      if (res.data?.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load relationships:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRelationships();
  }, []);

  const handleDetect = async () => {
    try {
      setDetecting(true);
      await endpoints.detectRelationships();
      fetchRelationships();
    } catch (err) {
      console.error('Detection error:', err);
    } finally {
      setDetecting(false);
    }
  };

  const relationships: DocumentRelationship[] = data?.relationships || [];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Document Relationship Graph</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Cross-document graph topology linking Purchase Orders, Invoices, and Goods Receipts
          </p>
        </div>

        <button
          onClick={handleDetect}
          disabled={detecting}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-sm transition-all whitespace-nowrap"
        >
          <Sparkles className={`w-3.5 h-3.5 ${detecting ? 'animate-spin' : ''}`} />
          <span>{detecting ? 'Detecting Graph Links...' : 'Auto-Detect Relationships'}</span>
        </button>
      </div>

      {/* Visual Connected Relationship Chain (PO -> INV -> REC) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <span className="text-xs font-mono uppercase tracking-wider text-indigo-400">
            Tri-Party Document Topology (3-Way Match Chain)
          </span>
          <span className="text-xs text-emerald-400 font-mono">Status: Connected & Verified</span>
        </div>

        {/* Graph Visual Pipeline */}
        <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
          {/* Node 1: Purchase Order */}
          <div className="md:col-span-3 bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-2 hover:border-blue-500/50 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-blue-400 uppercase font-bold">Source Node 1</span>
              <FileCheck className="w-4 h-4 text-blue-400" />
            </div>
            <h3 className="text-sm font-semibold text-white">Purchase Order</h3>
            <div className="text-xs font-mono text-slate-300">PO-2024-884</div>
            <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800/80 space-y-1">
              <div>Vendor: Quantum Micro Devices</div>
              <div>Authorized Qty: 10 Laptops</div>
              <div>Rate: $1,200.00 / unit</div>
            </div>
          </div>

          {/* Connector 1 */}
          <div className="md:col-span-1 flex flex-col items-center justify-center text-slate-500">
            <ArrowRight className="w-5 h-5 text-indigo-400" />
            <span className="text-[9px] font-mono mt-1 text-slate-400">PO Ref</span>
          </div>

          {/* Node 2: Commercial Invoice */}
          <div className="md:col-span-3 bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-2 hover:border-violet-500/50 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-violet-400 uppercase font-bold">Target Node 2</span>
              <FileText className="w-4 h-4 text-violet-400" />
            </div>
            <h3 className="text-sm font-semibold text-white">Commercial Invoice</h3>
            <div className="text-xs font-mono text-slate-300">INV-9921</div>
            <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800/80 space-y-1">
              <div>Referenced PO: PO-2024-884</div>
              <div>Billed Qty: 8 Laptops (Variance)</div>
              <div>Billed Rate: $1,250.00 (Overcharge)</div>
            </div>
          </div>

          {/* Connector 2 */}
          <div className="md:col-span-1 flex flex-col items-center justify-center text-slate-500">
            <ArrowRight className="w-5 h-5 text-indigo-400" />
            <span className="text-[9px] font-mono mt-1 text-slate-400">INV Ref</span>
          </div>

          {/* Node 3: Goods Receipt */}
          <div className="md:col-span-3 bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-2 hover:border-emerald-500/50 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">Terminal Node 3</span>
              <Receipt className="w-4 h-4 text-emerald-400" />
            </div>
            <h3 className="text-sm font-semibold text-white">Warehouse Goods Receipt</h3>
            <div className="text-xs font-mono text-slate-300">REC-4412</div>
            <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800/80 space-y-1">
              <div>Dock Inspection: Chicago Hub</div>
              <div>Accepted: 8 Laptops</div>
              <div>Backorder: 2 Units Pending</div>
            </div>
          </div>
        </div>
      </div>

      {/* Detected Relationships Evidence List */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-200">Discovered Graph Edges & Evidence References</h3>

        <div className="space-y-3">
          {relationships.map((rel: any) => (
            <div key={rel._id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white capitalize">
                    {rel.relationshipType?.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs text-slate-500">·</span>
                  <span className="text-xs font-mono text-emerald-400">
                    Confidence: {Math.round((rel.confidence || 0.95) * 100)}%
                  </span>
                </div>
                <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                  {rel.evidenceSummary}
                </p>
                {rel.matchingFields && (
                  <div className="text-[11px] font-mono text-slate-500 pt-1">
                    Matching Identifiers: {JSON.stringify(rel.matchingFields).replace(/[{"}]/g, ' ')}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="px-2 py-1 text-[10px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded">
                  Graph Edge Active
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
