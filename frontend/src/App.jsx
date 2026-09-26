import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HeroDemoBanner from './components/HeroDemoBanner';

import LandingPage from './pages/LandingPage';
import ApplicantDashboardPage from './pages/ApplicantDashboardPage';
import ExploreSchemesPage from './pages/ExploreSchemesPage';
import ApplicationWizardPage from './pages/ApplicationWizardPage';
import DocumentAgentPage from './pages/DocumentAgentPage';
import AIAssistantPage from './pages/AIAssistantPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminApplicationsPage from './pages/AdminApplicationsPage';
import AdminSplitReviewPage from './pages/AdminSplitReviewPage';
import SchemeConfiguratorPage from './pages/SchemeConfiguratorPage';
import KnowledgeBasePage from './pages/KnowledgeBasePage';
import AuditTrailPage from './pages/AuditTrailPage';

function AppContent() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState('landing');
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);

  const navigateTo = (page, params = {}) => {
    if (params.scheme) setSelectedScheme(params.scheme);
    if (params.application) setSelectedApplication(params.application);
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectSchemeToApply = (scheme) => {
    setSelectedScheme(scheme);
    setCurrentPage('application-wizard');
  };

  const handleApplicationSubmitted = (submittedApp) => {
    setSelectedApplication(submittedApp);
    setCurrentPage('documents');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900">
      {/* SIH Hackathon Live Scenario Quick Selector Banner */}
      <HeroDemoBanner onNavigate={navigateTo} />

      {/* Main Government Navbar */}
      <Navbar currentPage={currentPage} onNavigate={navigateTo} />

      {/* Main Content Router */}
      <main className="flex-1">
        {currentPage === 'landing' && (
          <LandingPage onNavigate={navigateTo} />
        )}

        {currentPage === 'applicant-dashboard' && (
          <ApplicantDashboardPage 
            onNavigate={navigateTo} 
            onSelectApplication={(app) => setSelectedApplication(app)} 
          />
        )}

        {currentPage === 'my-applications' && (
          <ApplicantDashboardPage 
            onNavigate={navigateTo} 
            onSelectApplication={(app) => setSelectedApplication(app)} 
          />
        )}

        {currentPage === 'explore-schemes' && (
          <ExploreSchemesPage onSelectScheme={handleSelectSchemeToApply} />
        )}

        {currentPage === 'application-wizard' && (
          <ApplicationWizardPage
            scheme={selectedScheme}
            onApplicationSubmitted={handleApplicationSubmitted}
            onCancel={() => setCurrentPage('explore-schemes')}
          />
        )}

        {currentPage === 'documents' && (
          <DocumentAgentPage
            application={selectedApplication}
            onNavigate={navigateTo}
            onRefresh={() => {}}
          />
        )}

        {currentPage === 'ai-assistant' && (
          <AIAssistantPage />
        )}

        {currentPage === 'admin-dashboard' && (
          <AdminDashboardPage onNavigate={navigateTo} />
        )}

        {currentPage === 'admin-applications' && (
          <AdminApplicationsPage
            onSelectApplication={(app) => setSelectedApplication(app)}
            onNavigate={navigateTo}
          />
        )}

        {currentPage === 'admin-split-review' && (
          <AdminSplitReviewPage
            applicationNo={selectedApplication?.application_no || 'NFST202600123'}
            onNavigate={navigateTo}
          />
        )}

        {currentPage === 'schemes-rules' && (
          <SchemeConfiguratorPage />
        )}

        {currentPage === 'knowledge-base' && (
          <KnowledgeBasePage />
        )}

        {currentPage === 'audit-trail' && (
          <AuditTrailPage />
        )}
      </main>

      {/* Official Government Footer */}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
