import React from 'react';
import { 
  Settings as SettingsIcon, 
  Database, 
  Cpu, 
  Terminal, 
  Layers, 
  CheckCircle2, 
  Copy,
  ExternalLink
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const atlasIndexJson = JSON.stringify({
    "fields": [
      {
        "type": "vector",
        "path": "embedding",
        "numDimensions": 384,
        "similarity": "cosine"
      },
      {
        "type": "filter",
        "path": "userId"
      },
      {
        "type": "filter",
        "path": "documentId"
      }
    ]
  }, null, 2);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied configuration to clipboard');
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">System Architecture & Configuration</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          DocVision AI runtime parameters, MongoDB Atlas Vector Search configuration, and service ports
        </p>
      </div>

      {/* Architecture Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-indigo-400">
            <span className="text-[11px] font-mono font-bold uppercase">Main Backend</span>
            <Cpu className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-white">Node.js + Express</h3>
          <div className="text-xs font-mono text-slate-400 space-y-1">
            <div>Port: 3000 (Vite Dev & API)</div>
            <div>Auth: JWT + Salted bcrypt</div>
            <div>Engine: Deterministic 3-Way Match</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-[11px] font-mono font-bold uppercase">Database Layer</span>
            <Database className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-white">MongoDB Atlas</h3>
          <div className="text-xs font-mono text-slate-400 space-y-1">
            <div>Driver: Mongoose 8.x</div>
            <div>Collections: 10 Core Schemas</div>
            <div>Vector Store: Atlas Vector Search</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-violet-400">
            <span className="text-[11px] font-mono font-bold uppercase">AI Microservice</span>
            <Layers className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-white">Python FastAPI</h3>
          <div className="text-xs font-mono text-slate-400 space-y-1">
            <div>Port: 8000</div>
            <div>OCR: PyMuPDF + EasyOCR</div>
            <div>Embeddings: all-MiniLM-L6-v2 (384)</div>
          </div>
        </div>
      </div>

      {/* MongoDB Atlas Vector Search Configuration (Part 13 Requirement) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">MongoDB Atlas Vector Search Index Configuration</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Target collection: <code className="text-indigo-300">documentchunks</code> · Dimensions: <code className="text-emerald-400">384</code>
            </p>
          </div>
          <button
            onClick={() => copyToClipboard(atlasIndexJson)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded-lg text-xs font-mono transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy JSON Definition</span>
          </button>
        </div>

        <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-indigo-300 overflow-x-auto">
          {atlasIndexJson}
        </pre>
      </div>

      {/* Windows Local Run Instructions (Part 23 Requirement) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-indigo-400">
          <Terminal className="w-4 h-4" />
          <h3 className="text-sm font-bold text-white">Windows Local Execution Commands (PowerShell)</h3>
        </div>

        <div className="space-y-3 font-mono text-xs">
          <div>
            <div className="text-slate-400 mb-1">1. Start Node.js & React Frontend:</div>
            <pre className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-200">
npm install
npm run dev
            </pre>
          </div>

          <div>
            <div className="text-slate-400 mb-1">2. Start Python AI Microservice (FastAPI + OCR + PyMuPDF):</div>
            <pre className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-200">
cd python-ai-service
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python main.py
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
