import React, { useState, useRef, useEffect } from 'react';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { 
  Bot, Send, Sparkles, UploadCloud, FileText, 
  HelpCircle, CheckCircle2, AlertTriangle, ExternalLink, RefreshCw, Paperclip
} from 'lucide-react';

const SUGGESTED_QUERIES = [
  "What is the status of my application NFST202600123?",
  "What documents are required for NFST Fellowship?",
  "Why was a deficiency raised regarding my ST Certificate?",
  "What should I do after receiving a name mismatch deficiency?",
  "Summarize the eligibility requirements for tribal scholars."
];

export default function AIAssistantPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: `**Namaste! I am TribalScholar AI Assistant.**\n\nI can answer questions regarding scholarship guidelines, required documents, your live application status, and deficiency rectification protocols under the Ministry of Tribal Affairs.\n\n*How may I assist you today?*`,
      sources: []
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedFileForRAG, setSelectedFileForRAG] = useState(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [ragDocSuccess, setRagDocSuccess] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const query = textToSend || inputMessage;
    if (!query.trim()) return;

    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: query,
      sources: []
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await apiRequest('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: query,
          application_no: 'NFST202600123' // Link to demo hero app
        })
      });

      const assistantMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.content,
        intent: response.intent,
        sources: response.sources || []
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: `I encountered an issue connecting to the AI knowledge repository: ${err.message}. Please verify the backend service status.`,
          sources: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentUploadRAG = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingDoc(true);
    const formData = new FormData();
    formData.append('title', file.name.replace(/\.[^/.]+$/, ""));
    formData.append('category', 'Scheme Guidelines');
    formData.append('file', file);

    try {
      const res = await apiRequest('/ai/upload-guideline', {
        method: 'POST',
        body: formData
      });
      setRagDocSuccess(`Document "${file.name}" indexed successfully! You can now ask questions about it.`);
      setSelectedFileForRAG(file.name);
      setTimeout(() => setRagDocSuccess(''), 5000);
      
      // Auto trigger summary question
      handleSend(`Summarize the uploaded document: ${file.name}`);
    } catch (err) {
      alert("Failed to index document: " + err.message);
    } finally {
      setUploadingDoc(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>RAG-Powered Retrieval & Verification Support</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>TribalScholar AI Assistant</span>
            <span className="bg-purple-100 text-purple-900 text-xs px-2 py-0.5 rounded font-bold">
              Official Guidelines & Status Agent
            </span>
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Deterministic rule-backed assistance. Grounded in Ministry of Tribal Affairs circulars and live application records.
          </p>
        </div>

        {/* Upload guideline document for custom Q&A */}
        <div>
          <label className="px-4 py-2 bg-purple-50 text-purple-900 border border-purple-200 hover:bg-purple-100 font-bold text-xs rounded-xl shadow-2xs flex items-center gap-2 cursor-pointer transition-colors">
            <UploadCloud className="w-4 h-4 text-purple-700" />
            <span>{uploadingDoc ? 'Indexing File...' : 'Ask Questions About a Document (PDF)'}</span>
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleDocumentUploadRAG}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {ragDocSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 text-xs text-emerald-800 flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{ragDocSuccess}</span>
        </div>
      )}

      {/* Suggested Questions Carousel / Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 font-bold text-[11px] shrink-0">Try asking:</span>
        {SUGGESTED_QUERIES.map((q, i) => (
          <button
            key={i}
            onClick={() => handleSend(q)}
            className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-purple-300 hover:text-purple-900 hover:bg-purple-50/50 text-xs shrink-0 transition-colors shadow-2xs"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Main Chat Conversation Container */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col h-[560px] overflow-hidden">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  isUser ? 'bg-blue-600 text-white' : 'bg-purple-700 text-white shadow-xs'
                }`}>
                  {isUser ? user?.full_name?.[0] || 'U' : <Bot className="w-4 h-4" />}
                </div>

                {/* Content Bubble */}
                <div className={`space-y-2.5 ${isUser ? 'text-right' : ''}`}>
                  <div className={`inline-block p-4 rounded-2xl text-xs leading-relaxed shadow-2xs text-left ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-tr-xs'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                  }`}>
                    {/* Render basic markdown bold, lists and code */}
                    <div 
                      className="prose prose-xs max-w-none space-y-1.5"
                      dangerouslySetInnerHTML={{
                        __html: formatMarkdownToHTML(msg.content)
                      }}
                    />
                  </div>

                  {/* Grounded Source Citations (RAG) */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="bg-slate-100/90 border border-slate-200 rounded-xl p-3 text-left space-y-2 mt-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
                        <FileText className="w-3.5 h-3.5 text-purple-700" />
                        <span>Retrieved Official RAG Sources ({msg.sources.length} Verified References):</span>
                      </div>
                      <div className="space-y-1.5">
                        {msg.sources.map((s, idx) => (
                          <div key={idx} className="bg-white p-2 rounded-lg border border-slate-200 text-[11px]">
                            <div className="flex items-center justify-between font-bold text-slate-800">
                              <span>{s.document_title}</span>
                              <span className="text-[10px] text-purple-700 font-mono">
                                Match: {Math.round(s.confidence * 100)}%
                              </span>
                            </div>
                            <div className="text-slate-500 text-[10px] mt-0.5">
                              {s.section} {s.page && `• Page ${s.page}`}
                            </div>
                            <p className="text-slate-600 text-[10px] mt-1 bg-slate-50 p-1 rounded font-mono italic">
                              "{s.snippet}"
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 max-w-2xl">
              <div className="w-8 h-8 rounded-full bg-purple-700 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-2xs text-xs text-slate-500 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-600 animate-ping"></span>
                <span>Searching official guidelines and authenticated application records...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about NFST/NOS guidelines, required documents, or application status..."
              className="flex-1 text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
            />
            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="px-5 py-3 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-40"
            >
              <span>Send</span>
              <Send className="w-4 h-4" />
            </button>
          </form>

          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 px-1">
            <span>Deterministic RAG retrieval active. Does not hallucinate statutory eligibility.</span>
            <span>Ministry of Tribal Affairs AI Support</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple Markdown to HTML formatter for bold, code, lists, and linebreaks
function formatMarkdownToHTML(text) {
  if (!text) return '';
  let formatted = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code class="bg-slate-100 text-blue-900 px-1 py-0.5 rounded font-mono text-[11px]">$1</code>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>')
    .replace(/• (.*?)(<br\/>|$)/g, '• $1<br/>');
  return formatted;
}
