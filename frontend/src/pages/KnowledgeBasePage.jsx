import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api/client';
import { 
  Database, UploadCloud, FileText, CheckCircle2, 
  Trash2, RefreshCw, BookOpen, Layers, Sparkles 
} from 'lucide-react';

export default function KnowledgeBasePage() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState('Scheme Guidelines');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');

  const loadDocs = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/knowledge-base');
      setDocs(data || []);
    } catch (e) {
      console.error("Error fetching knowledge docs:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocs();
  }, []);

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile || !uploadTitle) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('title', uploadTitle);
    formData.append('category', uploadCategory);
    formData.append('file', uploadFile);

    try {
      await apiRequest('/ai/upload-guideline', {
        method: 'POST',
        body: formData
      });
      setUploadSuccess(`"${uploadTitle}" chunked, embedded, and indexed into RAG vector repository.`);
      setUploadTitle('');
      setUploadFile(null);
      await loadDocs();
      setTimeout(() => setUploadSuccess(''), 5000);
    } catch (err) {
      alert("Error indexing document: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm("Remove document and its vector chunks from RAG index?")) return;
    try {
      await apiRequest(`/knowledge-base/${docId}`, { method: 'DELETE' });
      await loadDocs();
    } catch (err) {
      alert("Error deleting document: " + err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Title Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Database className="w-4 h-4" />
            <span>RAG Document Corpus Administration</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Knowledge Base & Official Gazette Repository
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Administer verified scheme guidelines, circulars, and FAQs powering the AI Scholarship Assistant.
          </p>
        </div>

        <button
          onClick={loadDocs}
          className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {uploadSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 text-xs text-emerald-800 flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{uploadSuccess}</span>
        </div>
      )}

      {/* RAG Pipeline Flow Indicator */}
      <div className="bg-purple-950 text-white rounded-2xl p-5 shadow-xs border border-purple-900 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-800 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h4 className="font-bold text-sm">Automated Vector Pipeline</h4>
            <p className="text-purple-200 text-xs">
              Upload Document → Extract Text → Semantic Chunking → Embeddings → Vector Index → Factual Retrieval
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono bg-purple-900 px-3 py-1.5 rounded-lg border border-purple-700 text-purple-200 shrink-0">
          Anti-Hallucination Active
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8/12): Indexed Documents Table */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-base text-slate-900">
              Approved Government Reference Documents ({docs.length})
            </h3>
            <span className="text-xs text-slate-400 font-mono">Semantic Chunks Active</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {loading ? (
              <div className="py-8 text-center text-slate-400">Loading indexed corpus...</div>
            ) : docs.length === 0 ? (
              <div className="py-8 text-center text-slate-400">No knowledge documents indexed yet.</div>
            ) : (
              docs.map((doc) => (
                <div key={doc.id} className="py-3.5 flex items-start justify-between gap-4 hover:bg-slate-50/60 p-2 rounded-xl transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{doc.title}</span>
                      <span className="bg-purple-100 text-purple-900 text-[10px] font-bold px-2 py-0.5 rounded">
                        {doc.category}
                      </span>
                    </div>
                    <p className="text-slate-500 text-xs">{doc.summary}</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1 font-mono">
                      <span>File: {doc.file_name}</span>
                      <span>•</span>
                      <span className="text-purple-700 font-semibold">{doc.chunk_count} Semantic Chunks</span>
                      <span>•</span>
                      <span>Indexed: {new Date(doc.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
                    title="Delete document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column (4/12): Upload New Document */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <UploadCloud className="w-4 h-4 text-purple-700" />
              <span>Index Approved Circular / Manual</span>
            </h3>
            <span className="text-[11px] text-slate-500">Adds grounding source for AI Assistant</span>
          </div>

          <form onSubmit={handleUploadSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Document Title</label>
              <input
                type="text"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                placeholder="e.g. NFST Operational Guidelines 2026"
                className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Category</label>
              <select
                value={uploadCategory}
                onChange={(e) => setUploadCategory(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 font-medium"
              >
                <option value="Scheme Guidelines">Scheme Guidelines</option>
                <option value="Government Notification">Government Notification</option>
                <option value="Official Circulars">Official Circulars</option>
                <option value="FAQs">FAQs & Operational Manual</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Document File (PDF/DOCX/TXT)</label>
              <input
                type="file"
                onChange={(e) => setUploadFile(e.target.files[0])}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                required
              />
            </div>

            <button
              type="submit"
              disabled={uploading || !uploadFile}
              className="w-full py-2.5 bg-purple-700 hover:bg-purple-600 text-white font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <UploadCloud className="w-4 h-4" />
              <span>{uploading ? 'Chunking & Embedding...' : 'Upload & Index into RAG'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
