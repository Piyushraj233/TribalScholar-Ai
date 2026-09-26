import React from 'react';
import { CheckCircle2, Circle, AlertTriangle } from 'lucide-react';

const STAGES = [
  'Application Submitted',
  'Document Verification',
  'Eligibility Verification',
  'Scrutiny',
  'Selection',
  'Final Communication',
  'Post-Selection'
];

export default function StageTimeline({ currentStage, hasDeficiency = false }) {
  const currentIndex = STAGES.findIndex(s => s.toLowerCase() === (currentStage || '').toLowerCase());
  const activeIdx = currentIndex >= 0 ? currentIndex : 1;

  return (
    <div className="w-full py-4 overflow-x-auto">
      <div className="min-w-[720px] flex items-center justify-between relative px-4">
        {/* Continuous Track Line */}
        <div className="absolute top-1/2 left-8 right-8 -translate-y-1/2 h-1 bg-slate-200 z-0" />
        
        {/* Progress Line */}
        <div 
          className="absolute top-1/2 left-8 -translate-y-1/2 h-1 bg-blue-600 transition-all duration-500 z-0" 
          style={{ width: `${(activeIdx / (STAGES.length - 1)) * 90}%` }}
        />

        {STAGES.map((stage, idx) => {
          const isPassed = idx < activeIdx;
          const isCurrent = idx === activeIdx;
          const isPending = idx > activeIdx;

          return (
            <div key={stage} className="flex flex-col items-center relative z-10 max-w-[100px] text-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                isCurrent && hasDeficiency
                  ? 'bg-amber-500 text-white shadow-lg ring-4 ring-amber-100 ring-offset-1'
                  : isCurrent
                  ? 'bg-blue-600 text-white shadow-lg ring-4 ring-blue-100 ring-offset-1 scale-110'
                  : isPassed
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white border-2 border-slate-300 text-slate-400'
              }`}>
                {isCurrent && hasDeficiency ? (
                  <AlertTriangle className="w-4 h-4 animate-bounce" />
                ) : isPassed ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : isCurrent ? (
                  <span className="w-2.5 h-2.5 bg-white rounded-full animate-ping" />
                ) : (
                  <span className="text-xs font-semibold">{idx + 1}</span>
                )}
              </div>
              <span className={`text-[11px] mt-2 font-medium leading-tight ${
                isCurrent ? 'text-blue-900 font-bold' : isPassed ? 'text-slate-700' : 'text-slate-400'
              }`}>
                {stage}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
