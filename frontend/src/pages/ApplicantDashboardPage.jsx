import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import StageTimeline from '../components/StageTimeline';
import { 
  FolderKanban, Clock, CheckCircle2, AlertTriangle, 
  Award, Bell, ArrowRight, Eye, FileSearch, Sparkles, PlusCircle, RefreshCw
} from 'lucide-react';

export default function ApplicantDashboardPage({ onNavigate, onSelectApplication }) {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTimelineApp, setActiveTimelineApp] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/applications');
      setApplications(data || []);
      if (data && data.length > 0) {
        // Set first or hero app as active timeline
        setActiveTimelineApp(data[0]);
      }
    } catch (e) {
      console.error("Error loading applicant applications:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Metric counts
  const totalApps = applications.length;
  const underReview = applications.filter(a => ['Document Verification', 'Scrutiny', 'Eligibility Check'].includes(a.status)).length;
  const eligible = applications.filter(a => a.eligibility_status?.includes('Eligible')).length;
  const deficiency = applications.filter(a => a.status === 'Deficiency' || a.document_status === 'Issues Detected').length;
  const selected = applications.filter(a => a.status === 'Selected').length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-6 sm:p-8 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-200 text-xs font-bold uppercase tracking-wider mb-1">
            <span>Scholar Portal</span>
            <span>•</span>
            <span>Scheduled Tribe Welfare Division</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            Namaste, {user?.full_name || 'Scholar'}
          </h1>
          <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
            Track your national fellowship applications, review automated AI Document Intelligence extractions, and address any administrative scrutiny items.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('explore-schemes')}
            className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow flex items-center gap-1.5 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Apply New Scheme</span>
          </button>
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Refresh Status"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 6 Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold">Total Applications</span>
            <FolderKanban className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalApps}</div>
          <div className="text-[10px] text-slate-400 mt-1">Lodged in portal</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold">Under Review</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700">{underReview}</div>
          <div className="text-[10px] text-slate-400 mt-1">In scrutiny pipeline</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold">Eligible Applications</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">{eligible}</div>
          <div className="text-[10px] text-slate-400 mt-1">Rules validated</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold">Deficiency Raised</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-700">{deficiency}</div>
          <div className="text-[10px] text-rose-600 mt-1 font-semibold">Action required</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold">Selected / Awarded</span>
            <Award className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-700">{selected}</div>
          <div className="text-[10px] text-slate-400 mt-1">Final fellowship</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold">AI Assistant</span>
            <Sparkles className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xs font-bold text-indigo-900 mt-1">24/7 RAG Support</div>
          <button 
            onClick={() => onNavigate('ai-assistant')}
            className="text-[10px] text-indigo-600 font-bold hover:underline mt-2 flex items-center gap-0.5"
          >
            <span>Ask question</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Active Application Stage Timeline Card */}
      {activeTimelineApp && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
            <div>
              <span className="text-slate-400 text-xs">Live Stage Timeline:</span>
              <h3 className="text-base font-bold text-slate-900">
                Application <span className="font-mono text-blue-700">{activeTimelineApp.application_no}</span> ({activeTimelineApp.scheme?.name || 'NFST'})
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={activeTimelineApp.status} />
              <button
                onClick={() => {
                  onSelectApplication(activeTimelineApp);
                  onNavigate('documents');
                }}
                className="px-3 py-1.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-600 rounded-lg flex items-center gap-1 shadow-xs"
              >
                <FileSearch className="w-3.5 h-3.5" />
                <span>AI Document Intelligence</span>
              </button>
            </div>
          </div>

          <StageTimeline 
            currentStage={activeTimelineApp.stage} 
            hasDeficiency={activeTimelineApp.status === 'Deficiency'}
          />

          {activeTimelineApp.status === 'Deficiency' && (
            <div className="mt-4 p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <strong>Potential Issue Detected by AI Agent:</strong> Name abbreviation variation on ST Certificate.
                  <span className="text-slate-600 ml-1">Manual review recommended or upload clarifying affidavit.</span>
                </div>
              </div>
              <button
                onClick={() => {
                  onSelectApplication(activeTimelineApp);
                  onNavigate('documents');
                }}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg shrink-0 shadow-xs"
              >
                Resolve Deficiency
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main "My Applications" Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-900">My Applications</h3>
            <p className="text-slate-500 text-xs mt-0.5">Comprehensive tracking and AI verification status</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Application ID</th>
                <th className="py-3 px-4">Scheme</th>
                <th className="py-3 px-4">Submitted Date</th>
                <th className="py-3 px-4">Current Stage</th>
                <th className="py-3 px-4">Eligibility</th>
                <th className="py-3 px-4">Document Status</th>
                <th className="py-3 px-4">Last Updated</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">Loading your applications...</td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No active applications found. Click "Apply New Scheme" above to begin.
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr 
                    key={app.id} 
                    className={`hover:bg-blue-50/40 transition-colors ${
                      activeTimelineApp?.id === app.id ? 'bg-blue-50/30' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-blue-900">
                      {app.application_no}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {app.scheme?.name || 'NFST Fellowship'}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {app.submission_date ? new Date(app.submission_date).toLocaleDateString() : 'Draft'}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        app.eligibility_status?.includes('Pending')
                          ? 'bg-amber-100 text-amber-900'
                          : app.eligibility_status === 'Eligible'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {app.eligibility_status || 'Pending'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[11px] font-semibold ${
                        app.document_status === 'Issues Detected' ? 'text-amber-700 font-bold' : 'text-slate-600'
                      }`}>
                        {app.document_status || 'Pending'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {new Date(app.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setActiveTimelineApp(app)}
                          className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-blue-900 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                          title="View Stage Timeline"
                        >
                          Timeline
                        </button>
                        <button
                          onClick={() => {
                            onSelectApplication(app);
                            onNavigate('documents');
                          }}
                          className="px-3 py-1 text-xs font-bold text-blue-700 hover:text-white hover:bg-blue-700 border border-blue-600 rounded transition-all flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>AI Scrutiny</span>
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
    </div>
  );
}
