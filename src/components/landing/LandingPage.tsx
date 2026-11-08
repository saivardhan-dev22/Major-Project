import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Layers, 
  FileSearch, 
  GitMerge, 
  CheckCircle2, 
  ArrowRight, 
  FileText, 
  Lock, 
  Database, 
  Cpu, 
  Bot, 
  ChevronRight,
  Sparkles,
  AlertTriangle,
  Receipt,
  FileCheck
} from 'lucide-react';

interface LandingPageProps {
  onEnterApp: () => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp, onOpenAuth }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* 3-Zone Top Navigation Contract */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Wordmark */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-base tracking-tight text-white whitespace-nowrap">
              DocVision AI
            </span>
          </div>

          {/* Zone 2: Single-line Text Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors whitespace-nowrap">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors whitespace-nowrap">How It Works</a>
            <a href="#documents" className="hover:text-white transition-colors whitespace-nowrap">Supported Docs</a>
            <a href="#security" className="hover:text-white transition-colors whitespace-nowrap">Security & Architecture</a>
          </nav>

          {/* Zone 3: Primary Action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onOpenAuth('login')}
              className="text-xs font-medium text-slate-300 hover:text-white px-3 py-1.5 transition-colors whitespace-nowrap"
            >
              Sign In
            </button>
            <button
              onClick={onEnterApp}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-lg transition-all shadow-sm shadow-indigo-500/30 whitespace-nowrap shrink-0"
            >
              Launch Console
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-32 overflow-hidden border-b border-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950/0 to-slate-950/0 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs text-indigo-400 font-medium">
              <span className="font-mono uppercase tracking-wider">Enterprise Document Intelligence</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-400">Tri-Party 3-Way Consistency Validation</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1] text-balance">
              Your Documents. Understood. Connected. Verified.
            </h1>

            <p className="text-base md:text-lg text-slate-300 max-w-xl leading-relaxed">
              Transform scattered business documents into structured intelligence. Extract information, connect related records, and identify discrepancies with AI-powered cross-document validation.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onEnterApp}
                className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-lg transition-all shadow-md shadow-indigo-500/25"
              >
                <span>Explore Platform</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="px-5 py-3 text-sm font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors"
              >
                Create Account
              </button>
            </div>

            <div className="pt-4 flex items-center gap-6 text-xs text-slate-400 font-mono">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Deterministic Arithmetic</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Evidence-Grounded RAG</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>MongoDB Vector Search</span>
              </div>
            </div>
          </div>

          {/* Right Visual Frame */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl shadow-indigo-950/40">
              <img 
                src="/src/assets/images/hero_document_intelligence_1794113145875.jpg" 
                alt="DocVision AI Multi-Document Intelligence Pipeline" 
                className="w-full h-auto object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent flex flex-col justify-end p-6">
                <div className="text-xs font-mono text-indigo-400 mb-1">LIVE ARITHMETIC VERIFICATION</div>
                <div className="text-sm font-semibold text-white">
                  3-Way Match: PO-2024-884 ↔ INV-9921 ↔ REC-4412
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Quantity & Unit Price Variance detected with direct page evidence citation.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Sections (Part 5 Requirements) */}
      <section id="features" className="py-20 bg-slate-900/40 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl mb-14">
            <div className="text-xs font-mono uppercase tracking-wider text-indigo-400 mb-2">Core Capabilities</div>
            <h2 className="text-3xl font-bold tracking-tight text-white">
              End-to-End Enterprise Document Intelligence
            </h2>
            <p className="text-slate-400 text-sm mt-3 leading-relaxed">
              Designed for compliance officers, procurement auditors, and financial risk analysts who require mathematically rigorous cross-document verification.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 transition-all hover:border-slate-700">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
                <FileSearch className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">1. Intelligent Document Processing</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                PyMuPDF extracts digital PDF layers with precise bounding coordinates, while EasyOCR handles scanned receipts and invoices with high character accuracy.
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 transition-all hover:border-slate-700">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">2. AI Information Extraction</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Groq LLM extracts line items, tax breakdowns, vendor entities, and transaction identifiers into validated JSON schemas with zero guesswork.
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 transition-all hover:border-slate-700">
              <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">3. Cross-Document Validation</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Deterministic 10-point algorithmic verification checks unit prices, physical dock receipts, vendor names, and tax formulas without LLM hallucination.
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 transition-all hover:border-slate-700">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">4. Semantic Document Search</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                384-dimensional dense vectors powered by Hugging Face Sentence Transformers and MongoDB Atlas Vector Search enable natural language document querying.
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 transition-all hover:border-slate-700">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">5. Evidence-Based Reporting</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every discrepancy report links directly to source document titles, line numbers, and exact financial variances. Exportable to CSV and audit PDFs.
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 transition-all hover:border-slate-700">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">6. Confidence-Aware Review</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                High-confidence matches pass automatically, while low-confidence extractions or confirmed financial mismatches are routed to human compliance reviewers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Workflow (Part 5) */}
      <section id="how-it-works" className="py-20 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="text-xs font-mono uppercase tracking-wider text-indigo-400 mb-2">Processing Pipeline</div>
            <h2 className="text-3xl font-bold tracking-tight text-white">How DocVision AI Works</h2>
            <p className="text-slate-400 text-sm mt-3">From raw document intake to verified evidence reports in seconds.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { step: '01', title: 'Upload Docs', desc: 'PDF, JPG, PNG ingestion with signature verification' },
              { step: '02', title: 'OCR & Text', desc: 'PyMuPDF digital stream & EasyOCR scanned fallback' },
              { step: '03', title: 'AI Extraction', desc: 'Groq schema extraction with confidence scoring' },
              { step: '04', title: 'Doc Matching', desc: 'PO & Invoice identifier cross-referencing' },
              { step: '05', title: 'Validation', desc: '10-point deterministic arithmetic check' },
              { step: '06', title: 'Evidence Report', desc: 'Actionable discrepancy audit & review routing' },
            ].map((s, idx) => (
              <div key={idx} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-mono font-bold text-indigo-400 mb-2">{s.step}</div>
                  <h4 className="text-xs font-semibold text-slate-200 mb-1">{s.title}</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Document Types (Part 5 & 12) */}
      <section id="documents" className="py-20 bg-slate-900/30 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl mb-12">
            <div className="text-xs font-mono uppercase tracking-wider text-indigo-400 mb-2">Supported Categories</div>
            <h2 className="text-3xl font-bold tracking-tight text-white">The Tri-Party Document Standard</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <FileCheck className="w-5 h-5 text-blue-400" />
                <h3 className="font-semibold text-slate-200 text-sm">1. Purchase Orders (PO)</h3>
              </div>
              <div className="text-xs text-slate-400 space-y-1.5 font-mono">
                <div>· PO Number & Issue Date</div>
                <div>· Vendor & Buyer Legal Entities</div>
                <div>· Authorized Line Items & SKU</div>
                <div>· Contractual Unit Prices & Quantities</div>
                <div>· Tax & Budgetary Total Capping</div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-5 h-5 text-purple-400" />
                <h3 className="font-semibold text-slate-200 text-sm">2. Commercial Invoices</h3>
              </div>
              <div className="text-xs text-slate-400 space-y-1.5 font-mono">
                <div>· Invoice Number & Due Date</div>
                <div>· Referenced PO Number</div>
                <div>· Billed Quantities & Rates</div>
                <div>· Sales Tax / VAT Calculations</div>
                <div>· Payment Remittance Terms</div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <Receipt className="w-5 h-5 text-emerald-400" />
                <h3 className="font-semibold text-slate-200 text-sm">3. Goods Receipts & Proofs</h3>
              </div>
              <div className="text-xs text-slate-400 space-y-1.5 font-mono">
                <div>· Receiving Dock Note & Date</div>
                <div>· Referenced PO & Invoice</div>
                <div>· Inspected Physical Quantities</div>
                <div>· Backorder / Damage Notices</div>
                <div>· Warehouse Receiving Sign-Off</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security & CTA Section */}
      <section id="security" className="py-20 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="text-xs font-mono uppercase tracking-wider text-indigo-400">Security & Privacy</div>
            <h2 className="text-3xl font-bold text-white">Built for High-Assurance Audits</h2>
            <p className="text-slate-300 text-sm leading-relaxed max-w-2xl">
              Strict user-scoped access control ensures documents and vector embeddings are never shared across tenants. All sensitive passwords use salted bcrypt hashing, HTTP-only secure cookie session tokens, and complete audit logging on every human action.
            </p>
          </div>
          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3">
            <button
              onClick={onEnterApp}
              className="w-full py-3 px-5 text-center text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-all"
            >
              Launch Live Demonstration
            </button>
            <button
              onClick={() => onOpenAuth('register')}
              className="w-full py-3 px-5 text-center text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-lg transition-colors"
            >
              Create Free Workspace
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-slate-950 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">DocVision AI</span>
            <span>·</span>
            <span>Enterprise Document Intelligence Platform</span>
          </div>
          <div className="flex items-center gap-6">
            <span>Node.js / Express</span>
            <span>MongoDB Atlas</span>
            <span>FastAPI Python</span>
            <span>Groq Llama-3.3</span>
          </div>
          <div className="text-slate-600 font-mono">
            © 2026 DocVision AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
