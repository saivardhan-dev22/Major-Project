import React, { useState, useEffect } from 'react';
import { 
  Files, 
  Search, 
  Filter, 
  Trash2, 
  Eye, 
  RefreshCw, 
  FileText, 
  Calendar, 
  Database,
  UploadCloud,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { DocumentItem, DocumentType, ProcessingStatus } from '../../types';
import { endpoints } from '../../services/api';

interface DocumentListProps {
  onOpenUpload: () => void;
  selectedDocId?: string;
  onSelectDoc: (id: string) => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  onOpenUpload,
  selectedDocId,
  onSelectDoc,
}) => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeDocDetail, setActiveDocDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await endpoints.getDocuments({
        type: typeFilter !== 'all' ? typeFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: search.trim() ? search.trim() : undefined,
      });
      if (res.data?.success) {
        setDocuments(res.data.documents);
      }
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [typeFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDocuments();
  };

  const handleOpenDetail = async (id: string) => {
    try {
      setDetailLoading(true);
      const res = await endpoints.getDocument(id);
      if (res.data?.success) {
        setActiveDocDetail(res.data);
      }
    } catch (err) {
      console.error('Failed to load document details:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this document from the vault?')) return;
    try {
      await endpoints.deleteDocument(id);
      fetchDocuments();
      if (activeDocDetail?.document?._id === id) setActiveDocDetail(null);
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Enterprise Document Vault</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Classified business documents, PyMuPDF digital layers, OCR extractions, and metadata
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDocuments}
            className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-lg transition-colors"
            title="Refresh List"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all whitespace-nowrap"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Documents</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar (Adhering to Section 1.A Interactive Filter Tabs) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, PO #, vendor, item..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </form>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800/80 rounded-lg overflow-x-auto">
          {[
            { id: 'all', label: 'All Documents' },
            { id: 'purchase_order', label: 'Purchase Orders' },
            { id: 'invoice', label: 'Invoices' },
            { id: 'receipt', label: 'Receipts' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTypeFilter(tab.id)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                typeFilter === tab.id
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-mono text-[11px]">
                <th className="py-3 px-5 font-medium">Document Title</th>
                <th className="py-3 px-4 font-medium">Type</th>
                <th className="py-3 px-4 font-medium">Size</th>
                <th className="py-3 px-4 font-medium">Extraction Confidence</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium">Date Uploaded</th>
                <th className="py-3 px-5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-mono">
                    Loading enterprise documents...
                  </td>
                </tr>
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <Files className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                    <div>No documents found matching the filter criteria.</div>
                    <button
                      onClick={onOpenUpload}
                      className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                    >
                      Upload a document or load benchmark set
                    </button>
                  </td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr key={doc._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-5 font-medium text-slate-200">
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="truncate max-w-xs">{doc.title}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono capitalize text-slate-400">
                      {doc.documentType.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-slate-400">
                      {(doc.sizeBytes / 1024).toFixed(0)} KB
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-emerald-400">
                      {Math.round(doc.confidenceScore * 100)}%
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium ${
                        doc.status === 'ready' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        doc.status === 'failed' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                        'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500 tabular-nums">
                      {new Date(doc.createdAt).toISOString().split('T')[0]}
                    </td>
                    <td className="py-3 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenDetail(doc._id)}
                          className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-slate-800 rounded transition-colors"
                          title="View Extraction & Intelligence"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(doc._id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                          title="Delete Document"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Document Detail Drawer */}
      {activeDocDetail && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full max-w-2xl bg-slate-900 border-l border-slate-800 h-full overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-base font-bold text-white">{activeDocDetail.document.title}</h2>
                <div className="text-xs font-mono text-slate-400 capitalize mt-0.5">
                  {activeDocDetail.document.documentType.replace('_', ' ')} · {activeDocDetail.document.originalName}
                </div>
              </div>
              <button
                onClick={() => setActiveDocDetail(null)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 rounded-lg"
              >
                Close
              </button>
            </div>

            {/* Structured Schema Extraction Card */}
            {activeDocDetail.extraction?.structuredData ? (
              <div className="space-y-4">
                <div className="text-xs font-mono uppercase tracking-wider text-indigo-400">
                  AI Structured Information Extraction
                </div>
                
                <div className="grid grid-cols-2 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono">
                  <div>
                    <div className="text-slate-500">Document Identifier</div>
                    <div className="text-slate-200 font-semibold">{activeDocDetail.extraction.structuredData.documentNumber || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">PO Reference</div>
                    <div className="text-slate-200 font-semibold">{activeDocDetail.extraction.structuredData.poNumber || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Vendor Legal Name</div>
                    <div className="text-slate-200 font-semibold">{activeDocDetail.extraction.structuredData.vendorName || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Buyer Organization</div>
                    <div className="text-slate-200 font-semibold">{activeDocDetail.extraction.structuredData.buyerName || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Issue Date</div>
                    <div className="text-slate-200 font-semibold">{activeDocDetail.extraction.structuredData.issueDate || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Total Amount</div>
                    <div className="text-emerald-400 font-semibold tabular-nums">
                      ${(activeDocDetail.extraction.structuredData.totalAmount || 0).toLocaleString()} {activeDocDetail.extraction.structuredData.currency || 'USD'}
                    </div>
                  </div>
                </div>

                {/* Line Items Table */}
                {activeDocDetail.extraction.structuredData.items?.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold text-slate-300 mb-2">Extracted Line Items</div>
                    <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-500 font-mono text-[10px]">
                            <th className="p-2.5">Item Name</th>
                            <th className="p-2.5">Qty</th>
                            <th className="p-2.5">Unit Price</th>
                            <th className="p-2.5 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                          {activeDocDetail.extraction.structuredData.items.map((item: any, idx: number) => (
                            <tr key={idx}>
                              <td className="p-2.5 font-sans text-slate-200">{item.name}</td>
                              <td className="p-2.5 tabular-nums">{item.quantity}</td>
                              <td className="p-2.5 tabular-nums">${item.unitPrice?.toFixed(2)}</td>
                              <td className="p-2.5 tabular-nums text-right">${item.totalPrice?.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            {/* Raw OCR Text Preview */}
            <div className="space-y-2">
              <div className="text-xs font-mono uppercase tracking-wider text-slate-400">
                PyMuPDF & EasyOCR Text Stream
              </div>
              <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-[11px] font-mono text-slate-300 whitespace-pre-wrap max-h-60 overflow-y-auto">
                {activeDocDetail.document.ocrText || 'No text extracted'}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
