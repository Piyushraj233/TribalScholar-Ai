import React from 'react';
import { 
  ArrowRight, ShieldCheck, Cpu, FileCheck2, Search, 
  Sparkles, CheckCircle2, Award, Users, Bot, Layers, ArrowUpRight
} from 'lucide-react';

export default function LandingPage({ onNavigate }) {
  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-950 via-slate-900 to-slate-900 text-white py-16 md:py-24 px-4 border-b border-blue-900/50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-700/20 via-transparent to-transparent pointer-events-none" />
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-900/60 border border-blue-700/50 text-blue-200 text-xs font-semibold mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Ministry of Tribal Affairs • Smart India Hackathon 2026</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight md:leading-none">
            One Platform. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-300 via-sky-200 to-indigo-300 bg-clip-text text-transparent">
              Smarter Scholarship & Fellowship Administration.
            </span>
          </h1>

          <p className="mt-6 text-base md:text-xl text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
            AI-assisted application processing, document intelligence, configurable eligibility workflows, and transparent application tracking for Tribal scholarship and fellowship programs.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('explore-schemes')}
              className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 flex items-center gap-2 hover:scale-[1.02] transition-all"
            >
              <span>Apply for a Scheme</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('explore-schemes')}
              className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm border border-white/20 backdrop-blur-sm transition-all"
            >
              Explore Schemes
            </button>

            <button
              onClick={() => onNavigate('ai-assistant')}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold text-sm shadow-md flex items-center gap-2 transition-all"
            >
              <Bot className="w-4 h-4 text-purple-200" />
              <span>AI Scholarship Assistant</span>
            </button>
          </div>

          {/* Key Stat highlights */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-slate-800/80 text-left">
            <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl backdrop-blur-xs">
              <div className="text-2xl font-black text-amber-300">12,540+</div>
              <div className="text-xs text-slate-400 mt-0.5">Annual ST Applications</div>
            </div>
            <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl backdrop-blur-xs">
              <div className="text-2xl font-black text-emerald-400">96.8%</div>
              <div className="text-xs text-slate-400 mt-0.5">OCR Extraction Accuracy</div>
            </div>
            <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl backdrop-blur-xs">
              <div className="text-2xl font-black text-blue-300">3.4 Days</div>
              <div className="text-xs text-slate-400 mt-0.5">Avg Processing Time</div>
            </div>
            <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl backdrop-blur-xs">
              <div className="text-2xl font-black text-purple-300">100%</div>
              <div className="text-xs text-slate-400 mt-0.5">Human-in-the-Loop Scrutiny</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Core Pillars Section */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-blue-700 font-bold text-xs uppercase tracking-wider">Next-Generation Governance</span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-1">Core Intelligence Modules</h2>
          <p className="text-slate-600 text-sm mt-2">
            Designed to eliminate bureaucratic bottlenecks while preserving strict statutory compliance and affirmative action integrity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">AI Document Intelligence</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              Autonomous OCR and document classification across Caste Certificates, Marksheets, and University Admission letters. Detects subtle name variations and image artifacts.
            </p>
            <div className="text-xs font-semibold text-blue-700 flex items-center gap-1">
              <span>94% Fuzzy Similarity Matching</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Configurable Eligibility Engine</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              Zero hallucination policy. Statutory criteria configured as deterministic JSON rules by ministry administrators, providing plain-language explainability.
            </p>
            <div className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
              <span>Explainable Rule Breakdown</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Transparent Application Tracking</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              Step-by-step progress tracking for scholars. Immediate deficiency alerting with assisted digital resubmission and complete cryptographic audit trail.
            </p>
            <div className="text-xs font-semibold text-purple-700 flex items-center gap-1">
              <span>Real-Time Stage Timeline</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </section>

      {/* 6-Stage Workflow Architecture Section */}
      <section className="bg-slate-100 py-16 px-4 border-y border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-blue-800 font-bold text-xs uppercase tracking-wider">End-to-End Workflow</span>
            <h2 className="text-2xl font-extrabold text-slate-900 mt-1">From Submission to Fellowship Disbursement</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {[
              { step: '01', title: 'Apply', desc: 'Dynamic scheme application with digital declaration' },
              { step: '02', title: 'Verify', desc: 'AI Document Intelligence & OCR extraction' },
              { step: '03', title: 'Check Eligibility', desc: 'Deterministic JSON rule engine evaluation' },
              { step: '04', title: 'Scrutiny', desc: 'Officer review with deficiency rectification' },
              { step: '05', title: 'Selection', desc: 'Ministry committee approval & award letter' },
              { step: '06', title: 'Track & DBT', desc: 'Direct Benefit Transfer disbursement tracking' },
            ].map((st, i) => (
              <div key={st.step} className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs relative">
                <span className="text-blue-600 font-black text-lg block">{st.step}</span>
                <h4 className="font-bold text-slate-800 text-sm mt-1">{st.title}</h4>
                <p className="text-slate-500 text-xs mt-1 leading-snug">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live SIH Demo Walkthrough Banner */}
      <section className="py-12 px-4 max-w-5xl mx-auto">
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Recommended SIH Demo Path</span>
            </div>
            <h3 className="text-2xl font-bold">Experience the Hero Case: NFST202600123</h3>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              Demonstrates OCR extraction for Rahul Kumar Singh, detection of the 94% name variation on the ST Certificate, human reviewer verification, and RAG document Q&A.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
            <button
              onClick={() => onNavigate('documents')}
              className="px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm shadow-md text-center transition-all"
            >
              Launch Hero Case
            </button>
            <button
              onClick={() => onNavigate('admin-split-review')}
              className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 text-center transition-all"
            >
              Reviewer Split Scrutiny
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
