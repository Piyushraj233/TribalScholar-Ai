import React from 'react';
import { ShieldCheck, Heart, Sparkles, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 text-xs border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="font-bold text-base text-white">TribalScholar AI</span>
              <span className="bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">SIH 2026</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              AI-Enabled Integrated Scholarship & Fellowship Management System for Scheduled Tribes. Built for transparency, speed, and explainable decision support.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">Central Schemes</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>National Fellowship for ST (NFST)</li>
              <li>National Overseas Scholarship (NOS)</li>
              <li>Top Class Education for ST Students</li>
              <li>Post-Matric & Pre-Matric ST Scholarships</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">AI & Intelligence Pillars</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>TribalOCR-v2 Document Extraction</li>
              <li>Fuzzy Cross-Document Matching</li>
              <li>Deterministic Rules Engine</li>
              <li>RAG Guideline Q&A Agent</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">Compliance & Governance</h4>
            <p className="text-slate-400 text-xs mb-2">
              Human-in-the-Loop Architecture. AI never independently makes final statutory decisions.
            </p>
            <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Full Audit Trail & Encryption Active</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © 2026 Ministry of Tribal Affairs / Smart India Hackathon Prototype. Demonstration and Evaluation Only.
          </div>
          <div className="flex items-center gap-4">
            <span>Security Audited</span>
            <span>•</span>
            <span>REST API Ready</span>
            <span>•</span>
            <span>PostgreSQL & MinIO Architecture</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
