import React, { useState } from 'react';
import { 
  X, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { endpoints } from '../../services/api';
import { DocumentType } from '../../types';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState<DocumentType>('unknown');
  const [customTitle, setCustomTitle] = useState<string>('');
  const [manualText, setManualText] = useState<string>('');
  const [useTextInput, setUseTextInput] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      if (!customTitle) setCustomTitle(selected.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!file && !manualText.trim()) {
      setErrorMsg('Please select a file to upload or enter document text');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      if (file) {
        formData.append('file', file);
      }
      formData.append('title', customTitle || (file ? file.name : 'Procurement Document'));
      formData.append('documentType', docType);
      if (manualText.trim()) {
        formData.append('ocrText', manualText.trim());
      }

      const res = await endpoints.uploadDocument(formData);
      if (res.data?.success) {
        onUploadSuccess();
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  // Pre-configured Benchmark Loaders
  const loadBenchmarkDoc = (type: 'po' | 'invoice' | 'receipt') => {
    if (type === 'po') {
      setCustomTitle('Purchase Order PO-2024-884');
      setDocType('purchase_order');
      setUseTextInput(true);
      setManualText(`PURCHASE ORDER\nOrder Number: PO-2024-884\nIssue Date: 2026-02-15\nDelivery Expected: 2026-03-01\nBuyer: Apex Global Logistics\nVendor: Quantum Micro Devices Inc.\nCurrency: USD\n\nLine Items:\n1. Enterprise High-Performance Laptop 16" - Qty: 10 - Unit Price: $1,200.00 - Total: $12,000.00\n\nSubtotal: $12,000.00\nTax (8.0%): $960.00\nTotal Order Amount: $12,960.00\nPayment Terms: Net 30 days`);
    } else if (type === 'invoice') {
      setCustomTitle('Commercial Invoice INV-9921');
      setDocType('invoice');
      setUseTextInput(true);
      setManualText(`COMMERCIAL INVOICE\nInvoice Number: INV-9921\nPO Reference: PO-2024-884\nInvoice Date: 2026-02-28\nPayment Due: 2026-03-30\nBill To: Apex Global Logistics\nVendor: Quantum Micro Devices Inc.\nCurrency: USD\n\nItems Invoiced:\n1. Enterprise High-Performance Laptop 16" - Qty: 8 - Unit Price: $1,250.00 - Total: $10,000.00\n\nSubtotal: $10,000.00\nSales Tax (8.0%): $800.00\nInvoice Total: $10,800.00`);
    } else if (type === 'receipt') {
      setCustomTitle('Warehouse Goods Receipt REC-4412');
      setDocType('receipt');
      setUseTextInput(true);
      setManualText(`WAREHOUSE RECEIPT & DOCK INSPECTION REPORT\nReceipt Number: REC-4412\nPurchase Order Ref: PO-2024-884\nSupplier Invoice Ref: INV-9921\nReceipt Date: 2026-03-02\nReceiving Warehouse: Dock B, Chicago Hub\nVendor: Quantum Micro Devices Inc.\nCurrency: USD\n\nGoods Received:\n1. Enterprise High-Performance Laptop 16" - Received Qty: 8 - Condition: Verified Undamaged\n\nTotal Accepted: $10,800.00\nNotes: Partial delivery accepted. 2 units backordered.`);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Upload Business Document</h2>
              <p className="text-[11px] text-slate-400">PDF, JPG, PNG or OCR text payload</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Benchmark Presets Toolbar */}
        <div className="bg-slate-950 px-6 py-3 border-b border-slate-800 flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-400">Quick Test Benchmark Presets:</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => loadBenchmarkDoc('po')}
              className="text-[10px] font-mono px-2 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded border border-slate-700 transition-colors"
            >
              Preset PO
            </button>
            <button
              type="button"
              onClick={() => loadBenchmarkDoc('invoice')}
              className="text-[10px] font-mono px-2 py-1 bg-slate-800 hover:bg-slate-700 text-violet-300 rounded border border-slate-700 transition-colors"
            >
              Preset Invoice
            </button>
            <button
              type="button"
              onClick={() => loadBenchmarkDoc('receipt')}
              className="text-[10px] font-mono px-2 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded border border-slate-700 transition-colors"
            >
              Preset Receipt
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-300">
              {errorMsg}
            </div>
          )}

          {/* Title Field */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Document Title</label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="e.g. Purchase Order PO-2024-884"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Document Type Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Classification Type</label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value as DocumentType)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="unknown">Auto-Detect via Neural Classifier</option>
              <option value="purchase_order">Purchase Order (PO)</option>
              <option value="invoice">Commercial Invoice</option>
              <option value="receipt">Warehouse Goods Receipt / Inspection</option>
            </select>
          </div>

          {/* File Upload / Text Toggle */}
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-400 font-medium">Input Method</span>
            <button
              type="button"
              onClick={() => setUseTextInput(!useTextInput)}
              className="text-indigo-400 hover:text-indigo-300 font-mono text-[11px]"
            >
              {useTextInput ? 'Switch to File Drag & Drop' : 'Switch to Raw Text Input'}
            </button>
          </div>

          {useTextInput ? (
            <div>
              <textarea
                rows={6}
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                placeholder="Paste OCR text stream, PO lines, invoice details, or receipt notes..."
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-xl p-6 text-center transition-colors bg-slate-950/40">
              <input
                type="file"
                id="doc-file-upload"
                onChange={handleFileChange}
                accept=".pdf,.png,.jpg,.jpeg,.txt"
                className="hidden"
              />
              <label htmlFor="doc-file-upload" className="cursor-pointer block">
                <UploadCloud className="w-8 h-8 mx-auto text-slate-500 mb-2" />
                <div className="text-xs font-semibold text-slate-200">
                  {file ? file.name : 'Click to browse or drag and drop file'}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Supported formats: PDF (digital or scanned), JPG, PNG, TXT (up to 25MB)
                </div>
              </label>
            </div>
          )}

          {/* Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg shadow-sm transition-all"
            >
              {uploading ? 'Processing OCR & AI...' : 'Ingest & Process'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
