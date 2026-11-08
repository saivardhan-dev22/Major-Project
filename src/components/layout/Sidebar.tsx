import React from 'react';
import { 
  LayoutDashboard, 
  Files, 
  UploadCloud, 
  Bot, 
  ShieldCheck, 
  GitMerge, 
  CheckSquare, 
  FileText, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Layers,
  Sparkles,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenUpload: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  pendingReviewsCount: number;
  onSignOut?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenUpload,
  collapsed,
  onToggleCollapse,
  pendingReviewsCount,
  onSignOut,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'documents', label: 'Documents', icon: Files },
    { id: 'validation', label: 'Validation Center', icon: ShieldCheck },
    { id: 'relationships', label: 'Relationships', icon: GitMerge },
    { id: 'review', label: 'Review Queue', icon: CheckSquare, badge: pendingReviewsCount },
    { id: 'assistant', label: 'AI Assistant', icon: Bot },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className={`h-screen bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-all duration-300 select-none z-30 shrink-0 ${collapsed ? 'w-20' : 'w-64'}`}>
      {/* Brand Zone */}
      <div>
        <div className="h-16 px-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
              <Layers className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <div className="truncate">
                <span className="font-bold text-slate-100 text-sm tracking-tight whitespace-nowrap block">
                  DocVision AI
                </span>
                <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase block">
                  Document Intelligence
                </span>
              </div>
            )}
          </div>
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Upload Quick Button */}
        <div className="p-3">
          <button
            onClick={onOpenUpload}
            className={`w-full flex items-center justify-center gap-2.5 py-2.5 px-3 rounded-lg bg-indigo-600/15 hover:bg-indigo-600/25 border border-indigo-500/30 text-indigo-300 hover:text-indigo-200 text-xs font-semibold transition-all shadow-sm ${collapsed ? 'px-0' : ''}`}
            title="Upload New Document"
          >
            <UploadCloud className="w-4 h-4 text-indigo-400 shrink-0" />
            {!collapsed && <span className="whitespace-nowrap">Upload Documents</span>}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-left relative ${
                  isActive 
                    ? 'bg-slate-800 text-white shadow-sm border border-slate-700/60' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                {!collapsed && (
                  <span className="truncate flex-1 whitespace-nowrap">
                    {item.label}
                  </span>
                )}
                {!collapsed && item.badge !== undefined && item.badge > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded">
                    {item.badge}
                  </span>
                )}
                {collapsed && item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer System Status & Sign Out */}
      <div className="p-4 border-t border-slate-800/80 space-y-2">
        {!collapsed ? (
          <>
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span>Engine Status</span>
                <span className="text-emerald-400 font-mono text-[10px]">Active</span>
              </div>
              <div className="text-[10px] font-mono text-slate-500 truncate">
                Groq Llama-3.3 · MiniLM-384
              </div>
            </div>
            {onSignOut && (
              <button
                onClick={onSignOut}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 text-xs font-medium transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" title="DocVision Engine Active" />
            {onSignOut && (
              <button
                onClick={onSignOut}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
