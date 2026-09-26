import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api/client';
import { 
  Settings, Plus, Trash2, CheckCircle2, AlertTriangle, 
  Layers, ShieldCheck, RefreshCw, FileText, Code2 
} from 'lucide-react';

export default function SchemeConfiguratorPage() {
  const [schemes, setSchemes] = useState([]);
  const [selectedSchemeId, setSelectedSchemeId] = useState(null);
  const [loading, setLoading] = useState(true);

  // New Rule Form State
  const [newRule, setNewRule] = useState({
    field_name: 'percentage',
    operator: 'gte',
    target_value: '55',
    severity: 'Mandatory',
    description: 'Minimum 55% marks in qualifying post-graduate degree'
  });
  const [addingRule, setAddingRule] = useState(false);

  const loadSchemes = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/schemes');
      setSchemes(data || []);
      if (data && data.length > 0 && !selectedSchemeId) {
        setSelectedSchemeId(data[0].id);
      }
    } catch (e) {
      console.error("Error fetching schemes:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchemes();
  }, []);

  const currentScheme = schemes.find(s => s.id === selectedSchemeId) || schemes[0];

  const handleAddRule = async (e) => {
    e.preventDefault();
    if (!currentScheme) return;
    setAddingRule(true);
    try {
      await apiRequest(`/schemes/${currentScheme.id}/rules`, {
        method: 'POST',
        body: JSON.stringify(newRule)
      });
      await loadSchemes();
      alert("Eligibility rule added successfully to deterministic engine.");
      setNewRule({
        field_name: '',
        operator: 'equals',
        target_value: '',
        severity: 'Mandatory',
        description: ''
      });
    } catch (err) {
      alert("Error adding rule: " + err.message);
    } finally {
      setAddingRule(false);
    }
  };

  const handleDeleteRule = async (ruleId) => {
    if (!window.confirm("Remove this eligibility rule from scheme engine?")) return;
    try {
      await apiRequest(`/schemes/${currentScheme.id}/rules/${ruleId}`, {
        method: 'DELETE'
      });
      await loadSchemes();
    } catch (err) {
      alert("Error deleting rule: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
        <p className="font-semibold text-sm">Loading Scheme & JSON Rules Engine...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Title */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-800 text-xs font-bold uppercase tracking-wider mb-1">
            <Settings className="w-4 h-4" />
            <span>Configurable Policy Engine</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Scheme & Deterministic Rules Engine
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Configure eligibility criteria, operator logic, and required document matrices without touching application code.
          </p>
        </div>
      </div>

      {/* Scheme Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {schemes.map((s) => (
          <button
            key={s.id}
            onClick={() => setSelectedSchemeId(s.id)}
            className={`px-4 py-2 rounded-xl font-bold transition-all shrink-0 ${
              selectedSchemeId === s.id
                ? 'bg-blue-900 text-white shadow-sm ring-1 ring-blue-700'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {s.code} ({s.name.split('(')[0].trim()})
          </button>
        ))}
      </div>

      {/* Scheme Detail & Rule Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8/12): Current Configured Rules & Required Documents */}
        <div className="lg:col-span-8 space-y-6">
          {/* Rules Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Active Eligibility Rules for {currentScheme?.code}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Deterministic JSON comparisons evaluated at application verification time
                </p>
              </div>
              <span className="text-xs font-mono font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded">
                {currentScheme?.rules?.length || 0} Rules
              </span>
            </div>

            <div className="space-y-3">
              {currentScheme?.rules?.map((rule) => (
                <div
                  key={rule.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex items-start justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-blue-950 bg-blue-100 px-2 py-0.5 rounded">
                        {rule.field_name}
                      </span>
                      <span className="text-slate-500 uppercase font-semibold text-[10px]">
                        [{rule.operator}]
                      </span>
                      <span className="font-mono font-bold text-slate-900">
                        {rule.target_value ? `"${rule.target_value}"` : 'EXISTS'}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        rule.severity === 'Mandatory' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {rule.severity}
                      </span>
                    </div>
                    <p className="text-slate-600 text-xs font-medium">{rule.description}</p>
                  </div>

                  <button
                    onClick={() => handleDeleteRule(rule.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete rule"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Required Documents Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-slate-900">
              Required Document Dossier Configuration
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {currentScheme?.doc_requirements?.map((doc, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2.5">
                  <FileText className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800 block">{doc.display_name}</span>
                    <span className="text-[10px] font-mono text-slate-400 block">{doc.document_type}</span>
                    <span className={`text-[10px] font-semibold mt-1 inline-block ${
                      doc.is_mandatory ? 'text-rose-600' : 'text-slate-500'
                    }`}>
                      {doc.is_mandatory ? '• Mandatory Statutory Requirement' : '• Optional / Auxiliary'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (4/12): Add Rule Form */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-blue-700" />
              <span>Configure New Eligibility Rule</span>
            </h3>
            <span className="text-[11px] text-slate-500">Injects into deterministic validation engine</span>
          </div>

          <form onSubmit={handleAddRule} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Field Name (Payload Key)</label>
              <input
                type="text"
                value={newRule.field_name}
                onChange={(e) => setNewRule({ ...newRule, field_name: e.target.value })}
                placeholder="e.g. percentage, category, admission_status"
                className="w-full p-2.5 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Comparison Operator</label>
              <select
                value={newRule.operator}
                onChange={(e) => setNewRule({ ...newRule, operator: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-300 font-medium"
              >
                <option value="equals">equals (== Exact string match)</option>
                <option value="gte">&gt;= (Greater than or equal numeric)</option>
                <option value="lte">&lt;= (Less than or equal numeric)</option>
                <option value="in">in (Comma-separated inclusion)</option>
                <option value="required">required (Field presence check)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Target Threshold / Value</label>
              <input
                type="text"
                value={newRule.target_value}
                onChange={(e) => setNewRule({ ...newRule, target_value: e.target.value })}
                placeholder="e.g. 55, ST, Confirmed"
                className="w-full p-2.5 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Severity</label>
              <select
                value={newRule.severity}
                onChange={(e) => setNewRule({ ...newRule, severity: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-300 font-medium"
              >
                <option value="Mandatory">Mandatory (Fails application if unmet)</option>
                <option value="Recommended">Recommended (Raises warning flag)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Rule Plain-English Description</label>
              <textarea
                value={newRule.description}
                onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                placeholder="e.g. Minimum 55% marks in qualifying post-graduate degree"
                rows={2}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={addingRule}
              className="w-full py-2.5 bg-blue-700 hover:bg-blue-600 text-white font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{addingRule ? 'Saving Rule...' : 'Add Rule to Engine'}</span>
            </button>
          </form>

          {/* JSON Rule Structure Preview */}
          <div className="pt-3 border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
              <Code2 className="w-3.5 h-3.5" />
              <span>Config JSON Structure (Requirement 10)</span>
            </span>
            <pre className="p-3 bg-slate-900 text-amber-300 rounded-xl font-mono text-[10px] overflow-x-auto leading-relaxed">
{JSON.stringify({
  scheme: currentScheme?.code || 'NFST',
  field: newRule.field_name || 'category',
  operator: newRule.operator,
  value: newRule.target_value || 'ST',
  severity: newRule.severity
}, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
