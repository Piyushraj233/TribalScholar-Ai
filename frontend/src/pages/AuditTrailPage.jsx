import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api/client';
import { 
  History, Search, ShieldCheck, Cpu, User, 
  RefreshCw, Filter, ArrowRight 
} from 'lucide-react';

export default function AuditTrailPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appSearch, setAppSearch] = useState('');
  const [actorFilter, setActorFilter] = useState('ALL');

  const loadLogs = async () => {
    setLoading(true);
    try {
      let url = '/admin/audit-logs?';
      if (appSearch) url += `application_no=${encodeURIComponent(appSearch)}&`;
      const data = await apiRequest(url);
      setLogs(data || []);
    } catch (e) {
      console.error("Error loading audit logs:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [appSearch]);

  const filteredLogs = logs.filter(log => {
    if (actorFilter === 'ALL') return true;
    return log.actor_type === actorFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Title */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-800 text-xs font-bold uppercase tracking-wider mb-1">
            <History className="w-4 h-4" />
            <span>Immutable Administrative Audit Trail</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Security & Workflow Audit Log
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Cryptographically chronological records of applicant uploads, AI Agent OCR actions, and officer scrutiny decisions.
          </p>
        </div>

        <button
          onClick={loadLogs}
          className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={appSearch}
            onChange={(e) => setAppSearch(e.target.value)}
            placeholder="Filter by Application No (e.g. NFST202600123)..."
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-medium">Actor Type:</span>
          <select
            value={actorFilter}
            onChange={(e) => setActorFilter(e.target.value)}
            className="p-2 border border-slate-300 rounded-lg text-xs font-bold bg-white"
          >
            <option value="ALL">All Actions (Human + AI)</option>
            <option value="AI_AGENT">AI Document Agent Only</option>
            <option value="HUMAN">Human Officers / Applicants Only</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">User & Role</th>
                <th className="py-3 px-4">Application</th>
                <th className="py-3 px-4">Action Taken</th>
                <th className="py-3 px-4">Status Transition</th>
                <th className="py-3 px-4">Details & Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">Loading audit trail...</td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">No matching audit events logged.</td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-3 px-4">
                      {log.actor_type === 'AI_AGENT' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-200">
                          <Cpu className="w-3 h-3 text-purple-700" />
                          <span>AI Agent</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-200">
                          <User className="w-3 h-3 text-blue-700" />
                          <span>Human</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      <div>{log.user_name || 'System'}</div>
                      <span className="text-[10px] text-slate-400 uppercase font-mono">{log.user_role}</span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-blue-900">
                      {log.application_no || '—'}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">
                      {log.action}
                    </td>
                    <td className="py-3 px-4">
                      {log.previous_status || log.new_status ? (
                        <div className="flex items-center gap-1 text-[11px] font-mono">
                          <span className="text-slate-400">{log.previous_status || 'None'}</span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                          <span className="font-bold text-slate-800">{log.new_status || 'Current'}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-[11px] max-w-xs truncate" title={log.details}>
                      {log.details || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
