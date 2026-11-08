import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { LandingPage } from './components/landing/LandingPage';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { DocumentList } from './components/documents/DocumentList';
import { DocumentUploadModal } from './components/documents/DocumentUploadModal';
import { ValidationCenter } from './components/validation/ValidationCenter';
import { RelationshipGraph } from './components/relationships/RelationshipGraph';
import { ReviewQueue } from './components/review/ReviewQueue';
import { AIAssistantView } from './components/assistant/AIAssistantView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';
import { AuthModal } from './components/auth/AuthModal';
import { endpoints } from './services/api';

function MainApplication() {
  const { user, logout, loginAsDemo, loading } = useAuth();
  const [view, setView] = useState<'app' | 'landing'>('app');
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [pendingReviewsCount, setPendingReviewsCount] = useState<number>(2);
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchPendingReviews = async () => {
    if (!user) return;
    try {
      const res = await endpoints.getWorkflowTasks();
      if (res.data?.success) {
        const pending = res.data.tasks.filter((t: any) => t.status === 'pending').length;
        setPendingReviewsCount(pending);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (view === 'app' && user) {
      fetchPendingReviews();
    }
  }, [view, currentTab, user]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSignOut = async () => {
    await logout();
    setView('landing');
    showToast('Signed out successfully.');
  };

  const handleRunValidation = async () => {
    try {
      setIsValidating(true);
      const res = await endpoints.runValidation();
      if (res.data?.success) {
        showToast(`3-Way Match Executed: ${res.data.summary?.passedChecks} passed, ${res.data.summary?.criticalCount} critical discrepancies.`);
        fetchPendingReviews();
        if (currentTab !== 'validation') {
          setCurrentTab('validation');
        }
      }
    } catch (err: any) {
      showToast('Validation execution error: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsValidating(false);
    }
  };

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const handleEnterApp = async () => {
    if (!user) {
      // Auto sign in to demo account or open modal
      await loginAsDemo();
    }
    setView('app');
    showToast('Welcome to DocVision AI Workspace');
  };

  // If unauthenticated or user navigated to landing view
  if (!user || view === 'landing') {
    return (
      <>
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-indigo-600 text-white px-4 py-2.5 rounded-xl shadow-lg border border-indigo-400/30 text-xs font-medium flex items-center gap-2">
            <span>{toastMessage}</span>
          </div>
        )}
        <LandingPage
          onEnterApp={handleEnterApp}
          onOpenAuth={handleOpenAuth}
        />
        <AuthModal
          isOpen={isAuthOpen}
          initialMode={authMode}
          onClose={() => setIsAuthOpen(false)}
          onSuccess={() => {
            setView('app');
            showToast('Authenticated successfully. Welcome back!');
          }}
        />
      </>
    );
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-indigo-600 text-white px-4 py-2.5 rounded-xl shadow-lg border border-indigo-400/30 text-xs font-medium flex items-center gap-2 animate-bounce">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenUpload={() => setIsUploadOpen(true)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        pendingReviewsCount={pendingReviewsCount}
        onSignOut={handleSignOut}
      />

      {/* Main Viewport Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header
          currentTab={currentTab}
          onRunValidation={handleRunValidation}
          isValidating={isValidating}
          onOpenSettings={() => setCurrentTab('settings')}
          pendingReviewsCount={pendingReviewsCount}
          onSelectTab={setCurrentTab}
          onSignOut={handleSignOut}
        />

        {/* Dynamic View Router */}
        <main className="flex-1 overflow-y-auto bg-slate-950">
          {currentTab === 'dashboard' && (
            <DashboardOverview
              onSelectTab={setCurrentTab}
              onSelectDocument={(id) => {
                setSelectedDocId(id);
                setCurrentTab('documents');
              }}
            />
          )}

          {currentTab === 'documents' && (
            <DocumentList
              onOpenUpload={() => setIsUploadOpen(true)}
              selectedDocId={selectedDocId}
              onSelectDoc={setSelectedDocId}
            />
          )}

          {currentTab === 'validation' && (
            <ValidationCenter
              onSelectTab={setCurrentTab}
            />
          )}

          {currentTab === 'relationships' && (
            <RelationshipGraph />
          )}

          {currentTab === 'review' && (
            <ReviewQueue />
          )}

          {currentTab === 'assistant' && (
            <AIAssistantView />
          )}

          {currentTab === 'reports' && (
            <ReportsView />
          )}

          {currentTab === 'settings' && (
            <SettingsView />
          )}
        </main>
      </div>

      {/* Upload Document Modal */}
      <DocumentUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={() => {
          showToast('Document uploaded and structured fields extracted');
          fetchPendingReviews();
        }}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        initialMode={authMode}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => {
          showToast('Authenticated successfully');
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApplication />
    </AuthProvider>
  );
}
