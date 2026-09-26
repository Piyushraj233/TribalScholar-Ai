import React from 'react';
import { 
  CheckCircle2, AlertTriangle, Clock, FileText, 
  Search, ShieldAlert, ArrowRightCircle, Award, XCircle 
} from 'lucide-react';

export default function StatusBadge({ status, className = "" }) {
  const s = status || 'Draft';

  const config = {
    'Draft': { bg: 'bg-slate-100 text-slate-700 border-slate-300', icon: Clock },
    'Submitted': { bg: 'bg-blue-50 text-blue-700 border-blue-200', icon: FileText },
    'Document Verification': { bg: 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse-subtle', icon: Search },
    'Eligibility Check': { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: ArrowRightCircle },
    'Scrutiny': { bg: 'bg-purple-50 text-purple-700 border-purple-200', icon: Clock },
    'Deficiency': { bg: 'bg-amber-100 text-amber-900 border-amber-400 font-semibold', icon: AlertTriangle },
    'Issues Detected': { bg: 'bg-amber-100 text-amber-900 border-amber-400 font-semibold', icon: AlertTriangle },
    'Resubmitted': { bg: 'bg-cyan-50 text-cyan-800 border-cyan-300', icon: ArrowRightCircle },
    'Selected': { bg: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold', icon: Award },
    'Approved': { bg: 'bg-emerald-50 text-emerald-800 border-emerald-300', icon: CheckCircle2 },
    'Verified': { bg: 'bg-emerald-50 text-emerald-800 border-emerald-300', icon: CheckCircle2 },
    'Not Selected': { bg: 'bg-rose-50 text-rose-700 border-rose-200', icon: XCircle },
    'Completed': { bg: 'bg-teal-50 text-teal-800 border-teal-300', icon: CheckCircle2 },
  };

  const item = config[s] || { bg: 'bg-slate-100 text-slate-700 border-slate-200', icon: Clock };
  const IconComponent = item.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border ${item.bg} ${className}`}>
      <IconComponent className="w-3.5 h-3.5" />
      <span>{s}</span>
    </span>
  );
}
