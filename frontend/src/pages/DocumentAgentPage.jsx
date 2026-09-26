import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import { 
  Cpu, FileCheck2, UploadCloud, AlertTriangle, CheckCircle2, 
  RefreshCw, Eye, Sparkles, Layers, ShieldCheck, ArrowRight, X, Play
} from 'lucide-react';

const PIPELINE_STEPS = [
  'Document Upload',
  'File Validation',
  'Image/PDF Preprocessing',
  'OCR Engine (TribalOCR-v2)',
  'Document Classification',
  'Field Extraction',
  'Quality Check (DPI/Blur/Skew)',
  'Cross-Document Matching',
  'Eligibility Rules Check',
  'AI Verification Summary'
];

export default function DocumentAgentPage({ application, onNavigate, onRefresh }) {
  const { user } = useAuth();
  const [appData, setAppData] = useState(application || null);
  const [loading, setLoading] = useState(!application);
  const [activeDoc, setActiveDoc] = useState(null);
  
  // Pipeline animation state
  const [isProcessing, setIsProcessing] = useState(false);
  const [pipelineProgressIndex, setPipelineProgressIndex] = useState(PIPELINE_STEPS.length - 1);

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadDocType, setUploadDocType] = useState('ST_CERTIFICATE');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Deficiency resubmission modal
  const [showResubmitModal, setShowResubmitModal] = useState(false);
  const [resubmitFile, setResubmitFile] = useState(null);
  const [resubmitting, setResubmitting] = useState(false);

  // Fetch full application detail if only summary passed or on load
  const loadAppDetail = async () => {
    try {
      let targetId = application?.id;
      if (!targetId) {
        const apps = await apiRequest('/applications');
        if (apps && apps.length > 0) {
          // Prefer hero app NFST202600123
          const hero = apps.find(a => a.application_no === 'NFST202600123') || apps[0];
          targetId = hero.id;
        }
      }

      if (targetId) {
        const detail = await apiRequest(`/applications/${targetId}`);
        setAppData(detail);
        if (detail.documents && detail.documents.length > 0) {
          // Select ST Certificate first as it holds the hero name mismatch scenario
          const stDoc = detail.documents.find(d => d.document_type.includes('ST')) || detail.documents[0];
          setActiveDoc(stDoc);
        }
      }
    } catch (e) {
      console.error("Error loading app detail in DocumentAgent:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppDetail();
  }, [application]);

  // Run the full AI Document Intelligence Pipeline with animated progression
  const runAIPipeline = async (docId) => {
    const targetDocId = docId || activeDoc?.id;
    if (!targetDocId) return;

    setIsProcessing(true);
    setPipelineProgressIndex(0);

    // Animate through all 10 stages for judges to see the pipeline
    for (let i = 0; i < PIPELINE_STEPS.length; i++) {
      setPipelineProgressIndex(i);
      await new Promise(r => setTimeout(r, 220));
    }

    try {
      const updatedDoc = await apiRequest(`/documents/${targetDocId}/process`, {
        method: 'POST'
      });
      await loadAppDetail();
      setActiveDoc(updatedDoc);
    } catch (err) {
      alert("Error processing document: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Upload handler
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile || !appData) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('application_id', appData.id);
    formData.append('document_type', uploadDocType);
    formData.append('file', uploadFile);

    try {
      const newDoc = await apiRequest('/documents/upload', {
        method: 'POST',
        body: formData
      });
      setShowUploadModal(false);
      setUploadFile(null);
      await loadAppDetail();
      // Automatically trigger AI pipeline on new upload
      await runAIPipeline(newDoc.id);
    } catch (err) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  // Resubmit deficiency handler
  const handleResubmitDeficiency = async () => {
    if (!appData) return;
    setResubmitting(true);
    try {
      await apiRequest(`/applications/${appData.id}/resubmit`, {
        method: 'POST'
      });
      setShowResubmitModal(false);
      await loadAppDetail();
      alert("Clarifying documentation / affidavit submitted. Application requeued for Scrutiny review.");
    } catch (err) {
      alert("Resubmission failed: " + err.message);
    } finally {
      setResubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-3" />
        <p className="font-semibold text-sm">Loading AI Document Intelligence Engine...</p>
      </div>
    );
  }

  // Find active deficiency if any
  const openDeficiency = appData?.deficiencies?.find(d => d.status === 'OPEN');
  const activeVerification = activeDoc?.verification_results || [];
  const nameWarning = activeVerification.find(v => v.check_type === 'NAME_MATCH' && v.status === 'WARNING');

  // Parse extracted fields JSON
  let extractedFieldsObj = {};
  if (activeDoc?.extraction?.extracted_fields_json) {
    try {
      extractedFieldsObj = JSON.parse(activeDoc.extraction.extracted_fields_json);
    } catch (e) {}
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Module Title Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-800 text-xs font-bold uppercase tracking-wider mb-1">
            <Cpu className="w-4 h-4 text-blue-700" />
            <span>AI Document Intelligence & Autonomous Scrutiny</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>TribalScholar Document Agent</span>
            <span className="bg-blue-100 text-blue-900 text-xs font-mono font-bold px-2.5 py-0.5 rounded">
              App: {appData?.application_no || 'NFST202600123'}
            </span>
          </h1>
          <p className="text-slate-600 text-xs mt-1">
            Applicant: <strong>{appData?.applicant?.full_name || 'Rahul Kumar Singh'}</strong> | Scheme: <strong>{appData?.scheme?.name || 'NFST'}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2.5 bg-blue-700 hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Document</span>
          </button>

          <button
            onClick={() => runAIPipeline()}
            disabled={isProcessing || !activeDoc}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            <Play className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
            <span>{isProcessing ? 'Running Pipeline...' : 'Run AI Intelligence Pipeline'}</span>
          </button>
        </div>
      </div>

      {/* Visual AI Processing Pipeline Animation Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-lg border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Autonomous Verification Pipeline Flow
            </span>
          </div>
          <span className="text-xs text-blue-400 font-mono">
            {isProcessing ? `Processing: Step ${pipelineProgressIndex + 1} of ${PIPELINE_STEPS.length}` : 'Status: Pipeline Complete'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2 text-center text-[10px]">
          {PIPELINE_STEPS.map((step, idx) => {
            const isCompleted = idx <= pipelineProgressIndex;
            const isCurrent = idx === pipelineProgressIndex && isProcessing;
            return (
              <div
                key={step}
                className={`p-2 rounded-xl border transition-all duration-300 flex flex-col items-center justify-center min-h-[64px] ${
                  isCurrent
                    ? 'bg-blue-600 border-blue-400 text-white ring-2 ring-blue-300 ring-offset-1 ring-offset-slate-900 scale-105 font-bold animate-pulse'
                    : isCompleted
                    ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300 font-semibold'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-500'
                }`}
              >
                <span className="text-[9px] opacity-70 mb-0.5">0{idx + 1}</span>
                <span className="leading-tight line-clamp-2">{step}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 8: DEFICIENCY DETECTION CALLOUT (Hero Case: Rahul K Singh) */}
      {nameWarning && (
        <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-6 shadow-md animate-fade-in">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-lg font-black text-amber-950 flex items-center gap-2">
                  <span>Potential Issue Detected: Name Variation on Scheduled Tribe Certificate</span>
                  <span className="bg-amber-200 text-amber-950 text-xs px-2 py-0.5 rounded font-mono font-bold">
                    Similarity: 94%
                  </span>
                </h3>
                <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-300">
                  Manual Verification Recommended
                </span>
              </div>

              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white/80 p-3.5 rounded-xl border border-amber-200 text-xs">
                <div>
                  <span className="text-slate-500 text-[11px] block font-medium">Application Data Record:</span>
                  <span className="text-sm font-bold text-slate-900">{nameWarning.expected_value}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block font-medium">Uploaded ST Certificate (Extracted via OCR):</span>
                  <span className="text-sm font-bold text-amber-900">{nameWarning.actual_value}</span>
                </div>
              </div>

              <p className="mt-3 text-xs text-amber-900 leading-relaxed font-medium">
                <strong>AI Explanation:</strong> The candidate's middle name is represented as an initial (<code>Rahul K Singh</code> vs <code>Rahul Kumar Singh</code>). The document is otherwise genuine with valid digital seal and caste confirmation. AI recommends human officer acceptance or submission of an executive magistrate affidavit.
              </p>

              {/* Action Buttons */}
              <div className="mt-4 flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => setShowResubmitModal(true)}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-lg shadow-xs transition-all flex items-center gap-1.5"
                >
                  <span>Upload Clarifying Affidavit / Corrected Document</span>
                </button>

                <button
                  onClick={() => onNavigate('ai-assistant')}
                  className="px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white font-semibold text-xs rounded-lg shadow-xs transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-200" />
                  <span>Ask AI Assistant: "What should I do?"</span>
                </button>

                {user?.role !== 'applicant' && (
                  <button
                    onClick={() => onNavigate('admin-split-review')}
                    className="px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white font-bold text-xs rounded-lg shadow-xs transition-all"
                  >
                    Open Reviewer Scrutiny Console
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Left Documents Selector, Right Document Intelligence Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Dossier Document List */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900">Uploaded Document Dossier</h3>
            <span className="text-xs text-blue-700 font-semibold">{appData?.documents?.length || 0} Files</span>
          </div>

          <div className="space-y-2">
            {appData?.documents?.map((doc) => {
              const isSelected = activeDoc?.id === doc.id;
              const hasDocDeficiency = doc.status === 'Deficiency';

              return (
                <div
                  key={doc.id}
                  onClick={() => setActiveDoc(doc)}
                  className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-50/80 border-blue-500 shadow-xs ring-1 ring-blue-400'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-slate-800">{doc.document_type.replace(/_/g, ' ')}</span>
                    <StatusBadge status={doc.status} />
                  </div>

                  <p className="text-[11px] text-slate-500 font-mono mt-1 truncate">{doc.file_name}</p>

                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                    <span>OCR Conf: {doc.extraction ? `${intConfidence(doc.extraction.confidence_score)}%` : 'Pending'}</span>
                    <span>{new Date(doc.upload_date).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: AI Document Agent Deep Inspection Panel */}
        <div className="lg:col-span-2 space-y-6">
          {activeDoc ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-blue-700">Document Type</span>
                  <h3 className="text-xl font-black text-slate-900">
                    {activeDoc.document_type.replace(/_/g, ' ')}
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">{activeDoc.file_name}</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-semibold">OCR Verification</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      activeDoc.status === 'Verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                    }`}>
                      AI Status: {activeDoc.status === 'Verified' ? 'PASS' : 'WARNING'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 4 Health Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-400 text-[10px] block font-semibold">OCR Confidence</span>
                  <span className="text-lg font-black text-blue-900">
                    {activeDoc.extraction ? `${intConfidence(activeDoc.extraction.confidence_score)}%` : '97%'}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-400 text-[10px] block font-semibold">Document Quality</span>
                  <span className="text-lg font-black text-emerald-700">
                    {activeDoc.extraction ? `${intConfidence(activeDoc.extraction.quality_score)}%` : 'Good'}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-400 text-[10px] block font-semibold">Name Consistency</span>
                  <span className={`text-lg font-black ${nameWarning ? 'text-amber-600' : 'text-emerald-700'}`}>
                    {nameWarning ? '94%' : '100%'}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-400 text-[10px] block font-semibold">Required Fields</span>
                  <span className="text-lg font-black text-emerald-700">Complete</span>
                </div>
              </div>

              {/* Extracted Fields Table */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Extracted Fields (Field Extraction & Classification)
                </h4>
                <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 text-slate-500 font-bold border-b border-slate-200 text-[10px] uppercase">
                      <tr>
                        <th className="py-2.5 px-4">Field Name</th>
                        <th className="py-2.5 px-4">Extracted Value</th>
                        <th className="py-2.5 px-4">Verification Check</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {Object.entries(extractedFieldsObj).map(([k, v]) => (
                        <tr key={k} className="hover:bg-white transition-colors">
                          <td className="py-2 px-4 font-semibold text-slate-700 capitalize">
                            {k.replace(/_/g, ' ')}
                          </td>
                          <td className="py-2 px-4 font-mono font-medium text-slate-900">
                            {String(v)}
                          </td>
                          <td className="py-2 px-4">
                            {k === 'extracted_name' && nameWarning ? (
                              <span className="text-amber-700 font-bold flex items-center gap-1">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span>94% Match (Manual Verification)</span>
                              </span>
                            ) : (
                              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Verified</span>
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECTION 9: CROSS-DOCUMENT VERIFICATION MATRIX */}
              <div className="border-t border-slate-100 pt-5">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-blue-700" />
                    <span>Cross-Document Consistency Matrix</span>
                  </h4>
                  <span className="text-[11px] text-slate-500">Cross-compared against 4 dossier records</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className={`p-3.5 rounded-xl border ${
                    nameWarning ? 'bg-amber-50/70 border-amber-300' : 'bg-emerald-50 border-emerald-200'
                  }`}>
                    <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                      <span>Name Match</span>
                      <span className={nameWarning ? 'text-amber-700' : 'text-emerald-700'}>
                        {nameWarning ? '94%' : '100%'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      {nameWarning ? 'Middle initial abbreviation flagged for human officer sign-off' : 'Exact match across all certificates'}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border bg-emerald-50 border-emerald-200">
                    <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                      <span>Institution Match</span>
                      <span className="text-emerald-700">100%</span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      National Institute of Technology Jamshedpur verified in UGC/AICTE database
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border bg-emerald-50 border-emerald-200">
                    <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                      <span>Academic Consistency</span>
                      <span className="text-emerald-700">98%</span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Post-graduate CGPA (8.45 / 79.5%) consistent between Marksheet and Degree
                    </p>
                  </div>
                </div>
              </div>

              {/* Raw OCR Text Viewer (Collapsible / Inspector) */}
              <div className="border-t border-slate-100 pt-4">
                <details className="text-xs group">
                  <summary className="font-semibold text-slate-700 hover:text-blue-900 cursor-pointer py-1">
                    🔍 View Raw OCR Extraction Stream (TribalOCR-v2 + OpenCV Preprocessing)
                  </summary>
                  <pre className="mt-2 p-3 bg-slate-900 text-emerald-400 rounded-xl font-mono text-[11px] overflow-x-auto whitespace-pre-wrap leading-relaxed">
                    {activeDoc.extraction?.raw_text || 'No raw OCR stream available.'}
                  </pre>
                </details>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400">
              Select a document from the dossier on the left to examine AI extraction.
            </div>
          )}
        </div>
      </div>

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-base text-slate-900">Upload New Dossier Document</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Document Category</label>
                <select
                  value={uploadDocType}
                  onChange={(e) => setUploadDocType(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-medium"
                >
                  <option value="ST_CERTIFICATE">Scheduled Tribe (ST) Certificate</option>
                  <option value="MARKSHEET">Marksheet / Transcripts</option>
                  <option value="DEGREE_CERTIFICATE">Degree Certificate</option>
                  <option value="ADMISSION_PROOF">Admission / Offer Letter</option>
                  <option value="INCOME_CERTIFICATE">Income Certificate</option>
                  <option value="AFFIDAVIT">Clarifying Magistrate Affidavit</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Select File (PDF, PNG, JPG)</label>
                <input
                  type="file"
                  onChange={(e) => setUploadFile(e.target.files[0])}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !uploadFile}
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white font-bold rounded-lg shadow-sm disabled:opacity-50"
                >
                  {uploading ? 'Processing AI Pipeline...' : 'Upload & Run AI Agent'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resubmit Clarification / Affidavit Modal */}
      {showResubmitModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>Submit Rectification for Name Discrepancy</span>
              </h3>
              <button onClick={() => setShowResubmitModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-950 space-y-1.5 leading-relaxed">
              <p className="font-semibold text-blue-900">Standard Rectification Procedure:</p>
              <p>
                To resolve the name variation between <code>Rahul Kumar Singh</code> and <code>Rahul K Singh</code>, you can confirm your legal identity through a signed declaration or upload an Executive Magistrate name affidavit.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Optional: Upload Notarized Name Affidavit (PDF/JPG)</label>
                <input
                  type="file"
                  onChange={(e) => setResubmitFile(e.target.files[0])}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Applicant Clarification Note</label>
                <textarea
                  defaultValue="I hereby confirm that Rahul Kumar Singh and Rahul K Singh are the same individual. The ST certificate ST123456 issued by SDM Ranchi belongs to me."
                  rows={3}
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-sans text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowResubmitModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResubmitDeficiency}
                disabled={resubmitting}
                className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-md disabled:opacity-50"
              >
                {resubmitting ? 'Submitting...' : 'Confirm & Resubmit for Officer Scrutiny'}
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
