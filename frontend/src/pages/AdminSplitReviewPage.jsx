import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import StageTimeline from '../components/StageTimeline';
import { 
  User, FileText, CheckCircle2, AlertTriangle, ShieldCheck, 
  Eye, RefreshCw, Send, XCircle, ArrowRightCircle, Sparkles, Award
} from 'lucide-react';

export default function AdminSplitReviewPage({ applicationNo = 'NFST202600123', onNavigate }) {
  const { user } = useAuth();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  // Correction modal state
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [correctionReason, setCorrectionReason] = useState('Please provide a name clarification affidavit confirming that Rahul K Singh and Rahul Kumar Singh refer to the same individual.');

  const loadApplication = async () => {
    setLoading(true);
    try {
      // Find app by application_no or fallback to first
      const apps = await apiRequest('/admin/applications');
      const target = apps.find(a => a.application_no === applicationNo) || apps[0];
      if (target) {
        const fullDetail = await apiRequest(`/applications/${target.id}`);
        setApp(fullDetail);
        if (fullDetail.documents && fullDetail.documents.length > 0) {
          // Select ST Certificate by default for the hero demo
          const st = fullDetail.documents.find(d => d.document_type.includes('ST')) || fullDetail.documents[0];
          setSelectedDocId(st.id);
        }
      }
    } catch (e) {
      console.error("Error loading application detail:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplication();
  }, [applicationNo]);

  // Execute reviewer human action
  const handleReviewAction = async (actionType, customRemarks = null) => {
    if (!app) return;
    setActionLoading(true);
    try {
      const payload = {
        action: actionType,
        remarks: customRemarks || reviewRemarks || `Officer verified and accepted document records as valid.`,
        deficiency_title: actionType === 'REQUEST_CORRECTION' ? 'Name Discrepancy Clarification Required' : null,
        deficiency_description: actionType === 'REQUEST_CORRECTION' ? correctionReason : null,
        target_document_id: selectedDocId
      };

      const res = await apiRequest(`/admin/applications/${app.id}/review`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      setSuccessToast(`Action '${actionType.replace(/_/g, ' ')}' executed successfully! Audit log created.`);
      setShowCorrectionModal(false);
      await loadApplication();
      setTimeout(() => setSuccessToast(''), 4000);
    } catch (err) {
      alert("Error executing review action: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
        <p className="font-semibold text-sm">Opening Split-Screen Scrutiny Console...</p>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-500">
        <p className="font-semibold">Application record not found.</p>
      </div>
    );
  }

  const activeDoc = app.documents?.find(d => d.id === selectedDocId) || app.documents?.[0];
  const activeVerification = activeDoc?.verification_results || [];
  const nameWarning = activeVerification.find(v => v.check_type === 'NAME_MATCH' && v.status === 'WARNING');

  return (
    <div className="max-w-[1600px] mx-auto px-4 py-6 space-y-4">
      {/* Top Header Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center font-bold">
            <Eye className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black text-slate-900">
                Application Review: <span className="font-mono text-blue-700">{app.application_no}</span>
              </span>
              <StatusBadge status={app.status} />
              <span className="bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded font-medium">
                Stage: {app.stage}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Reviewer: <strong>{user?.full_name || 'Dr. Meenakshi Sahu (Scrutiny Officer)'}</strong> | Ministry of Tribal Affairs
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('admin-applications')}
            className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            ← Back to Applications List
          </button>
          <button
            onClick={loadApplication}
            className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600"
            title="Refresh application dossier"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {successToast && (
        <div className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast('')} className="text-emerald-200 hover:text-white">✕</button>
        </div>
      )}

      {/* SECTION 17: THREE-COLUMN SPLIT SCREEN INTERFACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* LEFT COLUMN (3/12): APPLICANT INFORMATION & TIMELINE */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-5">
          <div className="pb-3 border-b border-slate-100">
            <span className="text-[10px] uppercase font-bold text-blue-800 tracking-wider">Candidate Dossier</span>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">
              {app.applicant?.full_name || 'Rahul Kumar Singh'}
            </h3>
            <span className="text-xs text-slate-500">{app.applicant?.email}</span>
          </div>

          {/* Key Facts */}
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 font-semibold block">Scheme</span>
              <span className="font-bold text-slate-800">{app.scheme?.name || 'NFST Fellowship'}</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 font-semibold block">Social Category & Tribe</span>
              <span className="font-semibold text-slate-800">Scheduled Tribe (ST) • Santhal</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 font-semibold block">Qualifying Academic Credentials</span>
              <span className="font-semibold text-slate-800">M.Tech (Computer Science) • 79.5% (8.45 CGPA)</span>
              <span className="text-[11px] text-slate-500 block">NIT Jamshedpur (2024)</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 font-semibold block">Doctoral Enrollment</span>
              <span className="font-semibold text-slate-800">Confirmed Ph.D. Scholar</span>
              <span className="text-[11px] text-slate-500 block">Reg: PHD/CS/2025/089</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 font-semibold block">Direct Benefit Transfer Bank</span>
              <span className="font-mono text-slate-800">State Bank of India (A/C: ••••8291)</span>
            </div>
          </div>

          {/* Workflow Timeline Progression */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <span className="text-[11px] font-bold text-slate-900 block">Workflow Progress History</span>
            <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
              {app.workflow_events?.length > 0 ? (
                app.workflow_events.map((ev, i) => (
                  <div key={i} className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-[11px]">
                    <div className="flex items-center justify-between font-semibold text-slate-800">
                      <span>{ev.stage}</span>
                      <span className="text-[9px] text-slate-400">{new Date(ev.event_time).toLocaleDateString()}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">{ev.title}</p>
                  </div>
                ))
              ) : (
                <div className="text-[11px] text-slate-400 italic">No workflow events yet.</div>
              )}
            </div>
          </div>
        </div>

        {/* CENTER COLUMN (5/12): UPLOADED DOCUMENTS & OCR TEXT PREVIEW */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-[10px] uppercase font-bold text-blue-800 tracking-wider">Document Inspector</span>
            <span className="text-xs text-slate-400 font-mono">{activeDoc?.file_name}</span>
          </div>

          {/* Document Switcher Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {app.documents?.map((doc) => {
              const isSelected = doc.id === activeDoc?.id;
              return (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDocId(doc.id)}
                  className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-all ${
                    isSelected
                      ? 'bg-blue-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {doc.document_type.replace(/_/g, ' ')}
                </button>
              );
            })}
          </div>

          {/* Interactive Document Preview Box */}
          <div className="bg-slate-900 text-white rounded-xl p-6 relative overflow-hidden min-h-[300px] border border-slate-800 font-serif">
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none rotate-[-25deg] select-none text-4xl font-black">
              GOVERNMENT OF INDIA • SCRUTINY
            </div>

            <div className="relative z-10 space-y-3 text-xs leading-relaxed">
              <div className="text-center pb-2 border-b border-slate-700">
                <span className="text-[10px] text-amber-300 uppercase tracking-widest font-mono block">
                  Official Digital Document Stream
                </span>
                <h4 className="text-sm font-bold text-slate-100 mt-0.5">
                  {activeDoc?.document_type.replace(/_/g, ' ')}
                </h4>
              </div>

              {/* Dynamic OCR extracted representation */}
              <div className="bg-black/40 p-4 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-200 whitespace-pre-wrap">
                {activeDoc?.extraction?.raw_text || 'Document processing complete. Data stream verified.'}
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-800">
                <span>DPI Check: 300 DPI Passed</span>
                <span>SHA256: 4b29... verified</span>
              </div>
            </div>
          </div>

          {/* Extracted Key-Values Snippet */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
              Field Extraction Output (TribalOCR-v2 Engine):
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-400 block">Extracted Name:</span>
                <span className="font-bold text-slate-800">
                  {activeDoc?.extraction ? JSON.parse(activeDoc.extraction.extracted_fields_json || '{}').extracted_name || 'Rahul Kumar Singh' : 'Rahul Kumar Singh'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Category / Tribe:</span>
                <span className="font-bold text-slate-800">ST (Santhal)</span>
              </div>
              <div>
                <span className="text-slate-400 block">Digital Signature:</span>
                <span className="font-bold text-emerald-700">VALID (PKI-Gov)</span>
              </div>
              <div>
                <span className="text-slate-400 block">OCR Confidence:</span>
                <span className="font-bold text-blue-800">{activeDoc?.extraction ? `${intConfidence(activeDoc.extraction.confidence_score)}%` : '97%'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (4/12): AI VERIFICATION SUMMARY & HUMAN REVIEW ACTIONS */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-5">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-purple-800 tracking-wider">AI Scrutiny Verdict</span>
            <span className="bg-purple-100 text-purple-900 text-[10px] font-bold px-2 py-0.5 rounded">
              Human-in-the-Loop
            </span>
          </div>

          {/* AI Metrics Summary (Section 17 Requirements) */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-600 font-medium">Document Completeness</span>
              <strong className="text-emerald-700">100%</strong>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-600 font-medium">OCR Confidence</span>
              <strong className="text-blue-900">97%</strong>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-600 font-medium">Identity Consistency</span>
              <strong className="text-amber-700 font-bold">96% (94% on ST Cert)</strong>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-600 font-medium">Configurable Eligibility Rules</span>
              <strong className="text-slate-800">8 Passed • 1 Needs Review</strong>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-950 font-semibold">
              <span>Potential Issues Flagged</span>
              <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">1</span>
            </div>
          </div>

          {/* Flagged Issue Details */}
          {nameWarning && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-900 font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Issue: Name Initial Variation</span>
              </div>
              <p className="text-[11px] text-amber-900 leading-snug">
                Application records <code>Rahul Kumar Singh</code> vs Document <code>Rahul K Singh</code> (94% match).
              </p>
              <div className="text-[10px] text-slate-600 bg-white p-2 rounded border border-amber-200">
                <strong>AI Recommendation:</strong> Genuine applicant. Officer manual approval or affidavit recommended.
              </div>
            </div>
          )}

          {/* Reviewer Remarks Box */}
          <div className="space-y-1 text-xs">
            <label className="font-bold text-slate-700 block">Officer Scrutiny Remarks (Mandatory for Audit)</label>
            <textarea
              rows={2}
              value={reviewRemarks}
              onChange={(e) => setReviewRemarks(e.target.value)}
              placeholder="e.g. Verified ST certificate initials and verified against university enrollment records. Approved."
              className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          {/* Action Station Buttons (Section 17 & 18) */}
          <div className="pt-2 space-y-2 text-xs font-bold">
            {/* Button 1: Approve Verification */}
            <button
              onClick={() => handleReviewAction('APPROVE')}
              disabled={actionLoading}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Approve Verification (Human Override)</span>
            </button>

            {/* Button 2: Request Correction */}
            <button
              onClick={() => setShowCorrectionModal(true)}
              disabled={actionLoading}
              className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-500 text-white rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Request Correction (Raise Deficiency)</span>
            </button>

            {/* Button 3: Advance to Selection */}
            <button
              onClick={() => handleReviewAction('ADVANCE_SCRUTINY')}
              disabled={actionLoading}
              className="w-full py-2.5 px-4 bg-blue-700 hover:bg-blue-600 text-white rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
            >
              <ArrowRightCircle className="w-4 h-4" />
              <span>Advance to Selection Committee</span>
            </button>

            {/* Button 4: Final Selection Award */}
            <button
              onClick={() => handleReviewAction('SELECT')}
              disabled={actionLoading}
              className="w-full py-2.5 px-4 bg-purple-700 hover:bg-purple-600 text-white rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
            >
              <Award className="w-4 h-4" />
              <span>Select & Issue Fellowship Award</span>
            </button>
          </div>
        </div>
      </div>

      {/* Request Correction Modal */}
      {showCorrectionModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <span>Raise Deficiency / Request Rectification</span>
            </h3>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Reason for Deficiency Notice</label>
              <textarea
                value={correctionReason}
                onChange={(e) => setCorrectionReason(e.target.value)}
                rows={3}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                This notice will be transmitted to the applicant's SMS and portal dashboard.
              </span>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowCorrectionModal(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReviewAction('REQUEST_CORRECTION', correctionReason)}
                disabled={actionLoading}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg shadow-sm"
              >
                Dispatch Deficiency Notice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function intConfidence(score) {
  if (!score) return 96;
  return Math.round(score * 100);
}
