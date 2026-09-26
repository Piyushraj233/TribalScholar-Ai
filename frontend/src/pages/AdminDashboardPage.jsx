import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api/client';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area 
} from 'recharts';
import { 
  Users, FolderKanban, CheckCircle2, AlertTriangle, 
  Award, Clock, Filter, ArrowUpRight, ShieldCheck, Sparkles 
} from 'lucide-react';

const COLORS = ['#1d4ed8', '#0284c7', '#059669', '#d97706', '#7c3aed', '#db2777'];

export default function AdminDashboardPage({ onNavigate }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedScheme, setSelectedScheme] = useState('All');
  const [selectedState, setSelectedState] = useState('All');

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await apiRequest('/admin/dashboard');
        setStats(data);
      } catch (e) {
        console.error("Error loading admin stats:", e);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500">
        <Clock className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
        <p className="font-semibold text-sm">Aggregating National ST Fellowship Analytics...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Title & Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-800 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Ministry Official & Scrutiny Administration</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            National Scholarship & Fellowship Command Center
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Real-time pipeline monitoring, automated verification analytics, and deficiency resolution.
          </p>
        </div>

        {/* Global Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedScheme}
              onChange={(e) => setSelectedScheme(e.target.value)}
              className="bg-transparent font-medium text-slate-700 focus:outline-hidden"
            >
              <option value="All">All Schemes</option>
              <option value="NFST">NFST Fellowship</option>
              <option value="NOS">National Overseas (NOS)</option>
              <option value="TCES">Top Class Education</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="bg-transparent font-medium text-slate-700 focus:outline-hidden"
            >
              <option value="All">All States (Pan-India)</option>
              <option value="Jharkhand">Jharkhand</option>
              <option value="Odisha">Odisha</option>
              <option value="Madhya Pradesh">Madhya Pradesh</option>
              <option value="Chhattisgarh">Chhattisgarh</option>
              <option value="Assam">Assam</option>
            </select>
          </div>

          <button
            onClick={() => onNavigate('admin-split-review')}
            className="px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white font-bold rounded-lg shadow-xs flex items-center gap-1.5"
          >
            <span>Launch Split Scrutiny</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Top 5 Primary Government Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold text-slate-600">Total Applications</span>
            <FolderKanban className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.total_applications.toLocaleString()}</div>
          <span className="text-[10px] text-emerald-600 font-semibold mt-1 inline-block">+14.2% YoY growth</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold text-slate-600">Under Review</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-700">{stats.under_review.toLocaleString()}</div>
          <span className="text-[10px] text-amber-600 font-semibold mt-1 inline-block">Active scrutiny queue</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold text-slate-600">Eligible Dossiers</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">{stats.eligible.toLocaleString()}</div>
          <span className="text-[10px] text-slate-400 mt-1 inline-block">71.1% Pass rate</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold text-slate-600">Deficiency Raised</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-700">{stats.deficiency.toLocaleString()}</div>
          <span className="text-[10px] text-rose-600 font-semibold mt-1 inline-block">Assisted resolution</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold text-slate-600">Final Selected</span>
            <Award className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-700">{stats.selected.toLocaleString()}</div>
          <span className="text-[10px] text-purple-600 font-semibold mt-1 inline-block">Award letters issued</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold text-slate-600">Avg Turnaround</span>
            <Sparkles className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-indigo-900">{stats.processing_time_avg_days} Days</div>
          <span className="text-[10px] text-emerald-600 font-semibold mt-1 inline-block">Reduced from 28d</span>
        </div>
      </div>

      {/* Row 1 Charts: State-wise Applications & Scheme Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Applications by State */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Applications by Major Tribal States</h3>
              <p className="text-[11px] text-slate-500">Scheduled Tribe candidate concentration across central states</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.state_breakdown}>
                <XAxis dataKey="state" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="count" name="Total Applied" fill="#1e3a8a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="eligible" name="Verified Eligible" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Scheme Distribution */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Applications by Scheme Distribution</h3>
              <p className="text-[11px] text-slate-500">Dossier volume across Ph.D., Overseas, and Premier UG/PG programs</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.scheme_breakdown}
                  dataKey="applications"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  innerRadius={50}
                  label={({ code, percent }) => `${code} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {stats.scheme_breakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2 Charts: Processing Funnel & Monthly Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 3: Processing Funnel */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Application Processing Funnel</h3>
            <p className="text-[11px] text-slate-500">Retention and attrition through each statutory scrutiny stage</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={stats.funnel_breakdown}>
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="stage" type="category" width={130} tick={{ fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
                <Bar dataKey="count" name="Applications" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Monthly Submission & Approval Trend */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Monthly Application Inflow & Approvals</h3>
            <p className="text-[11px] text-slate-500">Six-month longitudinal trend showing peak application windows</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.monthly_trends}>
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Area type="monotone" dataKey="applications" name="Applications Submitted" stroke="#1d4ed8" fill="#dbeafe" />
                <Area type="monotone" dataKey="approved" name="Sanctioned Awards" stroke="#059669" fill="#d1fae5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Deficiency Categories Breakdown */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-1">Common AI Deficiency Flags Breakdown</h3>
        <p className="text-[11px] text-slate-500 mb-4">
          System automatically assists applicants in rectifying discrepancies prior to formal officer rejection
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {stats.deficiency_types.map((d, i) => (
            <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-semibold text-slate-800 line-clamp-1">{d.type}</span>
              <div className="text-xl font-black text-slate-900 mt-2">{d.count}</div>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded mt-1 inline-block ${
                d.severity === 'High' || d.severity === 'Critical' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {d.severity} Severity
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
