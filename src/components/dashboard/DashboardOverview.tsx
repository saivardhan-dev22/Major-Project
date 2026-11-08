import React, { useState, useEffect } from 'react';
import { 
  Files, 
  CheckCircle, 
  Clock, 
  AlertOctagon, 
  AlertTriangle, 
  CheckSquare, 
  ArrowUpRight,
  RefreshCw,
  FileText,
  Calendar,
  ExternalLink
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { endpoints } from '../../services/api';

interface DashboardOverviewProps {
  onSelectTab: (tab: string) => void;
  onSelectDocument: (docId: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ 
  onSelectTab, 
  onSelectDocument 
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchMetrics = async () => {
    try {
      setRefreshing(true);
      const res = await endpoints.getDashboardMetrics();
      if (res.data?.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  if (loading && !data) {
    return (
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-900 border border-slate-800 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 h-80 bg-slate-900 border border-slate-800 rounded-xl animate-pulse" />
          <div className="lg:col-span-4 h-80 bg-slate-900 border border-slate-800 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  const m = data?.metrics || {
    totalDocs: 3,
    processedDocs: 3,
    pendingDocs: 0,
    failedDocs: 0,
    docsWithDiscrepancies: 2,
    pendingReviews: 2,
  };

  const statCards = [
    { label: 'Total Documents', value: m.totalDocs, icon: Files, color: 'text-blue-400', tab: 'documents' },
    { label: 'Processed & Ready', value: m.processedDocs, icon: CheckCircle, color: 'text-emerald-400', tab: 'documents' },
    { label: 'Pending Processing', value: m.pendingDocs, icon: Clock, color: 'text-amber-400', tab: 'documents' },
    { label: 'Processing Failed', value: m.failedDocs, icon: AlertOctagon, color: 'text-slate-400', tab: 'documents' },
    { label: 'With Discrepancies', value: m.docsWithDiscrepancies, icon: AlertTriangle, color: 'text-rose-400', tab: 'validation' },
    { label: 'Pending Reviews', value: m.pendingReviews, icon: CheckSquare, color: 'text-amber-400', tab: 'review' },
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Title & Refresh Control */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Enterprise Analytics Overview</h1>
          <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
            <span>Real-time database metrics across PO, Invoice, and Goods Receipts</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-[11px] text-slate-500">Live 3-Way Triangulation</span>
          </div>
        </div>

        <button
          onClick={fetchMetrics}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors font-medium"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              onClick={() => onSelectTab(card.tab)}
              className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between cursor-pointer hover:border-slate-700 transition-all hover:bg-slate-850"
            >
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-medium truncate">{card.label}</span>
                <Icon className={`w-4 h-4 ${card.color} shrink-0`} />
              </div>
              <div className="text-2xl font-bold text-white font-mono tabular-nums">
                {card.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Processing Activity Bar Chart */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-200">Document Processing & Discrepancy Trends</h3>
              <p className="text-xs text-slate-500 mt-0.5">Weekly volume of processed business records versus flagged variances</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500" />
                Processed
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
                Discrepancies
              </span>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.charts?.activityTimeline || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="processed" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="discrepancies" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Document Type Breakdown Donut Chart */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-200">Document Category Distribution</h3>
            <p className="text-xs text-slate-500 mt-0.5">Breakdown by document category</p>
          </div>

          <div className="h-48 w-full my-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.charts?.typeDistribution || []}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                >
                  {(data?.charts?.typeDistribution || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
            {(data?.charts?.typeDistribution || []).map((item: any, i: number) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-400">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <span className="font-mono text-slate-200 font-semibold tabular-nums">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Discrepancies and Recent Documents Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Discrepancies Table */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-200">Active High-Priority Discrepancies</h3>
              <p className="text-xs text-slate-500 mt-0.5">Mismatches flagged by the deterministic 3-way match engine</p>
            </div>
            <button
              onClick={() => onSelectTab('validation')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
            >
              <span>Validation Center</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                  <th className="pb-2.5 font-medium">Category</th>
                  <th className="pb-2.5 font-medium">Field</th>
                  <th className="pb-2.5 font-medium">Variance</th>
                  <th className="pb-2.5 font-medium">Severity</th>
                  <th className="pb-2.5 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {(data?.recentDiscrepancies || []).map((disc: any) => (
                  <tr key={disc.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 font-mono capitalize text-slate-400">{disc.category.replace('_', ' ')}</td>
                    <td className="py-2.5 font-medium text-slate-200">{disc.fieldName}</td>
                    <td className="py-2.5 font-mono text-rose-400 tabular-nums">{disc.difference}</td>
                    <td className="py-2.5">
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        disc.severity === 'critical' ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30' :
                        disc.severity === 'high' ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {disc.severity}
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-mono capitalize text-slate-400">{disc.status.replace('_', ' ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Documents Quick List */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-200">Recent Documents</h3>
              <p className="text-xs text-slate-500 mt-0.5">Ingested business records</p>
            </div>
            <button
              onClick={() => onSelectTab('documents')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
            >
              <span>All Documents</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {(data?.recentDocuments || []).map((doc: any) => (
              <div 
                key={doc._id}
                onClick={() => onSelectDocument(doc._id)}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-950/50 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                  <div className="truncate">
                    <div className="text-xs font-medium text-slate-200 truncate">{doc.title}</div>
                    <div className="text-[10px] font-mono text-slate-500 capitalize">
                      {doc.documentType.replace('_', ' ')} · {(doc.sizeBytes / 1024).toFixed(0)} KB
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 shrink-0">
                  {Math.round((doc.confidenceScore || 0.95) * 100)}% Conf
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
