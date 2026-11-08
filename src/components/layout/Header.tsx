import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  ShieldCheck, 
  Search, 
  Play, 
  LogOut, 
  Bell,
  Sparkles,
  Sliders
} from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  onRunValidation: () => void;
  isValidating: boolean;
  onOpenSettings: () => void;
  pendingReviewsCount: number;
  onSelectTab: (tab: string) => void;
  onSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onRunValidation,
  isValidating,
  onOpenSettings,
  pendingReviewsCount,
  onSelectTab,
  onSignOut,
}) => {
  const { user } = useAuth();

  const getBreadcrumb = () => {
    switch (currentTab) {
      case 'dashboard': return 'Overview / Enterprise Analytics';
      case 'documents': return 'Document Intelligence / Vault';
      case 'validation': return 'Validation Center / Tri-Party Verification';
      case 'relationships': return 'Graph / Document Relationships';
      case 'review': return 'Compliance / Human Review Queue';
      case 'assistant': return 'AI Intelligence / Contextual RAG';
      case 'reports': return 'Compliance / Audit & Evidence Reports';
      case 'settings': return 'System / Configuration & Architecture';
      default: return 'Overview';
    }
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-6 flex items-center justify-between gap-8 shrink-0 z-20">
      {/* Zone 1: Contextual Breadcrumb */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
          {getBreadcrumb()}
        </span>
      </div>

      {/* Zone 2: Navigation Links / Fast Action Bar */}
      <div className="hidden lg:flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search documents, POs, vendors, discrepancies..." 
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 transition-colors"
          />
        </div>
      </div>

      {/* Zone 3: Primary Action & User Profile */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onRunValidation}
          disabled={isValidating}
          className="flex items-center gap-2 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-medium transition-all shadow-sm shadow-indigo-500/20 whitespace-nowrap shrink-0"
        >
          <Play className={`w-3.5 h-3.5 ${isValidating ? 'animate-spin' : 'fill-white'}`} />
          <span>{isValidating ? 'Running 3-Way Match...' : 'Execute 3-Way Match'}</span>
        </button>

        <button
          onClick={() => onSelectTab('review')}
          className="relative p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          title="Pending Compliance Reviews"
        >
          <Bell className="w-4 h-4" />
          {pendingReviewsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full" />
          )}
        </button>

        <button
          onClick={onOpenSettings}
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          title="System Settings"
        >
          <Sliders className="w-4 h-4" />
        </button>

        <div className="h-5 w-px bg-slate-800" />

        <div className="flex items-center gap-2.5">
          {user?.avatarUrl ? (
            <img 
              src={user.avatarUrl} 
              alt={user.username} 
              className="w-8 h-8 rounded-full border border-slate-700 object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-semibold text-slate-300">
              {user?.username?.charAt(0) || 'U'}
            </div>
          )}
          <div className="hidden sm:block text-left">
            <div className="text-xs font-semibold text-slate-200 leading-tight whitespace-nowrap">
              {user?.username || 'Compliance Officer'}
            </div>
            <div className="text-[10px] font-mono text-slate-500 leading-tight">
              {user?.role?.replace('_', ' ') || 'officer'}
            </div>
          </div>
        </div>

        <button
          onClick={onSignOut}
          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
