import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api/client';
import StatusBadge from '../components/StatusBadge';
import { 
  FolderKanban, Search, Filter, Eye, Download, 
  RefreshCw, CheckCircle2, AlertTriangle, ArrowRight 
} from 'lucide-react';

export default function AdminApplicationsPage({ onSelectApplication, onNavigate }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [schemeFilter, setSchemeFilter] = useState('All');
  const [stateFilter, setStateFilter] = useState('All');

  const loadApps = async () => {
    setLoading(true);
    try {
      let url = '/admin/applications?';
      if (statusFilter !== 'All') url += `status=${encodeURIComponent(statusFilter)}&`;
      if (schemeFilter !== 'All') url += `scheme_code=${encodeURIComponent(schemeFilter)}&`;
      if (stateFilter !== 'All') url += `state=${encodeURIComponent(stateFilter)}&`;
      if (search) url += `search=${encodeURIComponent(search)}&`;

      const data = await apiRequest(url);
      setApplications(data || []);
    } catch (e) {
      console.error("Error fetching admin applications:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApps();
  }, [statusFilter, schemeFilter, stateFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadApps();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Title */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-800 text-xs font-bold uppercase tracking-wider mb-1">
            <FolderKanban className="w-4 h-4" />
            <span>National Central Repository</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            All Scholarship & Fellowship Applications
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Total Dossiers: <strong>{applications.length}</strong> matching current criteria.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadApps}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* Search Box */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Application No, Name, or District..."
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs font-medium"
            >
              <option value="All">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Document Verification">Document Verification</option>
              <option value="Eligibility Check">Eligibility Check</option>
              <option value="Deficiency">Deficiency</option>
              <option value="Scrutiny">Scrutiny</option>
              <option value="Selected">Selected</option>
            </select>
          </div>

          {/* Scheme Filter */}
          <div>
            <select
              value={schemeFilter}
              onChange={(e) => setSchemeFilter(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs font-medium"
            >
              <option value="All">All Schemes</option>
              <option value="NFST">NFST Fellowship</option>
              <option value="NOS">National Overseas (NOS)</option>
              <option value="TCES">Top Class Education</option>
              <option value="ST-HF">Tribal Research Fellowship</option>
            </select>
          </div>

          {/* State Filter */}
          <div>
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs font-medium"
            >
              <option value="All">All States</option>
              <option value="Jharkhand">Jharkhand</option>
              <option value="Odisha">Odisha</option>
              <option value="Madhya Pradesh">Madhya Pradesh</option>
              <option value="Chhattisgarh">Chhattisgarh</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Assam">Assam</option>
              <option value="Rajasthan">Rajasthan</option>
            </select>
          </div>
        </form>
      </div>

      {/* Applications Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Application No</th>
                <th className="py-3 px-4">Candidate Name</th>
                <th className="py-3 px-4">Scheme</th>
                <th className="py-3 px-4">State & District</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Eligibility</th>
                <th className="py-3 px-4">Document Status</th>
                <th className="py-3 px-4 text-right">Scrutiny Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">Loading applicant applications...</td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">No matching applications found.</td>
                </tr>
              ) : (
                applications.map((a) => (
                  <tr key={a.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-900">
                      {a.application_no}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {a.applicant?.full_name || 'Scholar'}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <span className="font-bold text-blue-800">{a.scheme?.code}</span>
                      <span className="text-[10px] text-slate-400 block truncate max-w-[150px]">{a.scheme?.name}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {a.applicant?.state || 'Jharkhand'}, {a.applicant?.district || 'Ranchi'}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={a.status} />
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        a.eligibility_status?.includes('Pending')
                          ? 'bg-amber-100 text-amber-900'
                          : a.eligibility_status === 'Eligible'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {a.eligibility_status || 'Pending'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[11px] font-semibold ${
                        a.document_status === 'Issues Detected' ? 'text-amber-700 font-bold' : 'text-slate-600'
                      }`}>
                        {a.document_status || 'Verified'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          if (onSelectApplication) onSelectApplication(a);
                          onNavigate('admin-split-review');
                        }}
                        className="px-3 py-1.5 bg-blue-700 hover:bg-blue-600 text-white font-bold text-xs rounded-lg shadow-2xs inline-flex items-center gap-1 transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Split Review</span>
                      </button>
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
