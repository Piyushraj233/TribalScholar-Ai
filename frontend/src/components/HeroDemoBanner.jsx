import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, UserCheck, ShieldCheck, FileSearch, Bot, CheckCircle } from 'lucide-react';

export default function HeroDemoBanner({ onNavigate }) {
  const { user, quickDemoLogin } = useAuth();

  const handleSwitch = async (role, targetPage = null) => {
    await quickDemoLogin(role);
    if (targetPage && onNavigate) {
      onNavigate(targetPage);
    }
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white border-b border-blue-800/40 text-xs py-2 px-4 shadow-inner">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-amber-300 uppercase tracking-wider text-[11px] flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            SIH Grand Final Demo:
          </span>
          <span className="text-slate-200 hidden sm:inline">
            Active Role: <strong className="text-white capitalize">{user?.role || 'Applicant'}</strong> ({user?.full_name || 'Rahul Kumar Singh'})
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-slate-400 mr-1 text-[11px] hidden md:inline">Quick Scenario Switches:</span>
          
          <button
            onClick={() => handleSwitch('applicant', 'documents')}
            className={`px-2.5 py-1 rounded font-medium flex items-center gap-1 transition-all ${
              user?.role === 'applicant' 
                ? 'bg-blue-600 text-white shadow ring-1 ring-blue-300' 
                : 'bg-white/10 hover:bg-white/20 text-slate-200'
            }`}
            title="Applicant Rahul Kumar Singh (Demo NFST202600123 with ST Certificate 94% Name Variation)"
          >
            <UserCheck className="w-3.5 h-3.5 text-blue-300" />
            <span>Hero Case (Rahul K Singh)</span>
          </button>

          <button
            onClick={() => handleSwitch('reviewer', 'admin-split-review')}
            className={`px-2.5 py-1 rounded font-medium flex items-center gap-1 transition-all ${
              user?.role === 'reviewer' 
                ? 'bg-amber-600 text-white shadow ring-1 ring-amber-300' 
                : 'bg-white/10 hover:bg-white/20 text-slate-200'
            }`}
            title="Reviewer Scrutiny Station (Split-screen inspection, OCR verification & Approval)"
          >
            <FileSearch className="w-3.5 h-3.5 text-amber-300" />
            <span>Reviewer Split Scrutiny</span>
          </button>

          <button
            onClick={() => handleSwitch('admin', 'admin-dashboard')}
            className={`px-2.5 py-1 rounded font-medium flex items-center gap-1 transition-all ${
              user?.role === 'admin' 
                ? 'bg-emerald-600 text-white shadow ring-1 ring-emerald-300' 
                : 'bg-white/10 hover:bg-white/20 text-slate-200'
            }`}
            title="Ministry Dashboard with Recharts Analytics, State Distribution & Rules Engine"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            <span>Ministry Dashboard</span>
          </button>

          <button
            onClick={() => onNavigate && onNavigate('ai-assistant')}
            className="px-2.5 py-1 rounded bg-purple-600/80 hover:bg-purple-600 text-white font-medium flex items-center gap-1 transition-all"
            title="ChatGPT-style Assistant with RAG Document Q&A"
          >
            <Bot className="w-3.5 h-3.5 text-purple-200" />
            <span>RAG Q&A Assistant</span>
          </button>
        </div>
      </div>
    </div>
  );
}
