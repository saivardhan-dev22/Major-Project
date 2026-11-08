import React, { useState } from 'react';
import { 
  Bot, 
  Send, 
  FileText, 
  Sparkles, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle,
  Search,
  MessageSquare,
  BookOpen
} from 'lucide-react';
import { endpoints } from '../../services/api';

export const AIAssistantView: React.FC = () => {
  const [messages, setMessages] = useState<Array<{
    role: 'user' | 'assistant';
    content: string;
    sources?: Array<{
      documentTitle: string;
      pageNumber: number;
      snippet: string;
      similarity: number;
    }>;
    grounded?: boolean;
  }>>([
    {
      role: 'assistant',
      content: 'Welcome to DocVision AI Assistant. I can answer inquiries regarding your uploaded business documents (Purchase Orders, Invoices, Goods Receipts). Every statement is strictly grounded in retrieved vector passages with source page citations.',
      grounded: true,
    }
  ]);

  const [inputQuery, setInputQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const sampleQueries = [
    'Are there any quantity or unit price mismatches between PO-2024-884 and INV-9921?',
    'What was the physical quantity received at the dock for the laptops order?',
    'Summarize payment terms and due date for invoice INV-9921',
    'Who is the vendor and what is their contracted hourly/unit rate?',
  ];

  const handleSendQuery = async (queryText?: string) => {
    const q = (queryText || inputQuery).trim();
    if (!q || loading) return;

    setInputQuery('');
    setMessages(prev => [...prev, { role: 'user', content: q }]);
    setLoading(true);

    try {
      const res = await endpoints.queryAssistant(q);
      if (res.data?.success && res.data.data) {
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: res.data.data.answer,
            sources: res.data.data.sources,
            grounded: res.data.data.grounded,
          }
        ]);
      }
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'An error occurred while querying the RAG pipeline: ' + (err.response?.data?.message || err.message),
          grounded: false,
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6 flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <span>Evidence-Grounded AI Assistant</span>
          <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
            Atlas Vector Search + Groq RAG
          </span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Ask questions across all active purchase orders, invoices, and receiving dock reports.
        </p>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex flex-wrap gap-2">
        {sampleQueries.map((sq, i) => (
          <button
            key={i}
            onClick={() => handleSendQuery(sq)}
            className="text-[11px] text-slate-400 hover:text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg px-3 py-1.5 transition-colors text-left"
          >
            {sq}
          </button>
        ))}
      </div>

      {/* Messages Thread Container */}
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl overflow-y-auto p-6 space-y-6">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div className={`space-y-3 max-w-2xl ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div
                className={`p-4 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap font-sans ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none font-mono text-[11px]'
                }`}
              >
                {msg.content}
              </div>

              {/* Source Evidence Cards */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <BookOpen className="w-3 h-3 text-indigo-400" />
                    <span>Retrieved Document Evidence Citations:</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {msg.sources.map((src, sIdx) => (
                      <div
                        key={sIdx}
                        className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-2.5 text-[11px] space-y-1"
                      >
                        <div className="flex items-center justify-between text-indigo-400 font-mono text-[10px]">
                          <span className="truncate max-w-[140px]">{src.documentTitle}</span>
                          <span>Page {src.pageNumber} · Sim {Math.round(src.similarity * 100)}%</span>
                        </div>
                        <div className="text-slate-400 font-mono text-[10px] line-clamp-2">
                          "{src.snippet}"
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3 text-xs font-mono text-indigo-400">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <span>Scanning 384-dim Atlas Vector space and generating verified answer...</span>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendQuery();
        }}
        className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl p-2"
      >
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Ask about document mismatches, unit price variances, or delivery dates..."
          className="flex-1 bg-transparent px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none font-sans"
        />
        <button
          type="submit"
          disabled={loading || !inputQuery.trim()}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
        >
          <span>Ask</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
