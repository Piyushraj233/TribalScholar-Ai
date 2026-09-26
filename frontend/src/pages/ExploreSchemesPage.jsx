import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api/client';
import { 
  Compass, GraduationCap, MapPin, Award, Calendar, 
  FileText, CheckCircle2, AlertCircle, ArrowRight, ExternalLink, X, Info
} from 'lucide-react';

export default function ExploreSchemesPage({ onSelectScheme }) {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSchemeDetail, setSelectedSchemeDetail] = useState(null);

  useEffect(() => {
    async function loadSchemes() {
      try {
        const data = await apiRequest('/schemes');
        setSchemes(data || []);
      } catch (e) {
        console.error("Error fetching schemes:", e);
      } finally {
        setLoading(false);
      }
    }
    loadSchemes();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-blue-800 text-xs font-bold uppercase tracking-wider mb-1">
          <Compass className="w-4 h-4" />
          <span>Central & State Opportunities</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Explore Fellowship & Scholarship Schemes</h1>
        <p className="text-slate-600 text-sm mt-1 max-w-3xl">
          Apply for government research fellowships, overseas university grants, and institutional fee reimbursement programs for Scheduled Tribe scholars.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse space-y-4">
              <div className="h-6 bg-slate-200 rounded w-3/4"></div>
              <div className="h-4 bg-slate-200 rounded w-full"></div>
              <div className="h-4 bg-slate-200 rounded w-2/3"></div>
              <div className="h-10 bg-slate-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {schemes.map((scheme) => (
            <div 
              key={scheme.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group"
            >
              {/* Prototype Scheme Label Indicator */}
              {scheme.is_prototype && (
                <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 font-bold text-[10px] px-3 py-1 rounded-bl-xl uppercase tracking-wider flex items-center gap-1 shadow-xs">
                  <Info className="w-3 h-3" />
                  <span>Prototype / Example Scheme</span>
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-blue-100 text-blue-900 text-xs font-black px-2 py-0.5 rounded">
                    {scheme.code}
                  </span>
                  <span className="text-emerald-700 text-xs font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    {scheme.status}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-900 transition-colors">
                  {scheme.name}
                </h3>

                <p className="text-slate-600 text-xs mt-2 line-clamp-3 leading-relaxed">
                  {scheme.description}
                </p>

                {/* Metadata Pills */}
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <GraduationCap className="w-4 h-4 text-blue-700 shrink-0" />
                    <span className="truncate">{scheme.education_level}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <MapPin className="w-4 h-4 text-blue-700 shrink-0" />
                    <span className="truncate">{scheme.study_location}</span>
                  </div>
                </div>

                {/* Financial Support */}
                <div className="mt-3 p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-blue-950">
                  <div className="font-semibold text-blue-900 mb-0.5 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-blue-700" />
                    <span>Financial Grant & Allowances:</span>
                  </div>
                  <div className="font-medium">{scheme.financial_assistance}</div>
                </div>

                {/* Important Requirements Preview */}
                <div className="mt-3 text-xs text-slate-600">
                  <span className="font-semibold text-slate-800">Mandatory Rules: </span>
                  {scheme.rules && scheme.rules.length > 0 ? (
                    <span className="text-slate-600">
                      {scheme.rules.slice(0, 2).map(r => r.description).join(' • ')}
                      {scheme.rules.length > 2 && ` +${scheme.rules.length - 2} more`}
                    </span>
                  ) : (
                    <span>ST Category, Qualifying percentage, admission offer.</span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Deadline: <strong>{scheme.deadline}</strong></span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedSchemeDetail(scheme)}
                    className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-blue-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    View Details
                  </button>

                  <button
                    onClick={() => onSelectScheme(scheme)}
                    className="px-4 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-600 rounded-lg shadow-sm flex items-center gap-1 transition-all"
                  >
                    <span>Apply Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Scheme Detail Modal */}
      {selectedSchemeDetail && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <span className="bg-blue-100 text-blue-900 text-xs font-black px-2 py-0.5 rounded">
                  {selectedSchemeDetail.code}
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">
                  {selectedSchemeDetail.name}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedSchemeDetail(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              {selectedSchemeDetail.description}
            </p>

            <div className="space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-2">Eligibility Rules (Configurable Engine)</h4>
                <ul className="space-y-1.5 text-slate-700">
                  {selectedSchemeDetail.rules?.map((r, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{r.description}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-2">Required Upload Documents</h4>
                <ul className="space-y-1.5 text-slate-700">
                  {selectedSchemeDetail.doc_requirements?.map((d, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                      <span>{d.display_name} {d.is_mandatory && <strong className="text-rose-600">*Mandatory</strong>}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedSchemeDetail(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const s = selectedSchemeDetail;
                  setSelectedSchemeDetail(null);
                  onSelectScheme(s);
                }}
                className="px-5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-600 rounded-lg shadow-sm flex items-center gap-1.5"
              >
                <span>Proceed to Application</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
