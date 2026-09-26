import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  GraduationCap, Bell, User, LogOut, Menu, X, 
  LayoutDashboard, Compass, FolderKanban, FileCheck2, 
  Bot, Settings, ShieldCheck, Database, History, Eye
} from 'lucide-react';

export default function Navbar({ currentPage, onNavigate }) {
  const { user, logout, notifications, unreadCount, markNotificationRead } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const isReviewerOrAdmin = user?.role === 'reviewer' || user?.role === 'admin' || user?.role === 'superadmin';

  const applicantLinks = [
    { id: 'applicant-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'explore-schemes', label: 'Explore Schemes', icon: Compass },
    { id: 'my-applications', label: 'My Applications', icon: FolderKanban },
    { id: 'documents', label: 'Documents & AI', icon: FileCheck2 },
    { id: 'ai-assistant', label: 'AI Assistant', icon: Bot },
  ];

  const adminLinks = [
    { id: 'admin-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'admin-applications', label: 'Applications', icon: FolderKanban },
    { id: 'admin-split-review', label: 'Split Scrutiny', icon: Eye },
    { id: 'schemes-rules', label: 'Schemes & Rules', icon: Settings },
    { id: 'knowledge-base', label: 'Knowledge Base', icon: Database },
    { id: 'audit-trail', label: 'Audit Trail', icon: History },
    { id: 'ai-assistant', label: 'AI Assistant', icon: Bot },
  ];

  const navLinks = isReviewerOrAdmin ? adminLinks : applicantLinks;

  const handleNav = (id) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Official Government Top Micro Bar */}
      <div className="bg-slate-100 border-b border-slate-200 text-slate-600 text-[11px] py-1 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-800">भारत सरकार | Government of India</span>
            <span className="text-slate-300">|</span>
            <span>जनजातीय कार्य मंत्रालय | Ministry of Tribal Affairs</span>
          </div>
          <div className="flex items-center gap-4 hidden sm:flex">
            <span className="text-blue-800 font-medium">Smart India Hackathon 2026</span>
            <span className="text-slate-300">|</span>
            <span>Digital India Initiative</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand */}
        <div 
          onClick={() => handleNav(isReviewerOrAdmin ? 'admin-dashboard' : 'landing')} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-900 to-indigo-800 flex items-center justify-center text-white shadow-md shadow-blue-900/20 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl tracking-tight text-blue-950">TribalScholar</span>
              <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">AI</span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium tracking-tight -mt-0.5">
              Integrated ST Scholarship & Fellowship Platform
            </p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = currentPage === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleNav(link.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-900 font-semibold border-b-2 border-blue-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-700' : 'text-slate-400'}`} />
                <span>{link.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Section: Notification & User Badge */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
              className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {notifDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="font-bold text-sm text-slate-800">Notifications & Alerts</span>
                  <span className="text-xs text-blue-600 font-medium">{unreadCount} unread</span>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 mt-2">
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">No notifications yet.</div>
                  ) : (
                    notifications.map((n) => (
                      <div 
                        key={n.id} 
                        onClick={() => markNotificationRead(n.id)}
                        className={`p-2.5 rounded-lg text-xs cursor-pointer transition-colors ${
                          !n.is_read ? 'bg-blue-50/70' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span className={`font-semibold ${!n.is_read ? 'text-blue-950 font-bold' : 'text-slate-700'}`}>
                            {n.title}
                          </span>
                          {!n.is_read && <span className="w-2 h-2 rounded-full bg-blue-600 mt-1 shrink-0" />}
                        </div>
                        <p className="text-slate-500 mt-1 text-[11px] leading-relaxed">{n.message}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill */}
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="text-right">
              <div className="text-xs font-bold text-slate-800 leading-tight">
                {user?.full_name || 'Guest User'}
              </div>
              <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded inline-block ${
                user?.role === 'admin' || user?.role === 'superadmin'
                  ? 'bg-purple-100 text-purple-800'
                  : user?.role === 'reviewer'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {user?.role || 'Applicant'}
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-700 font-bold text-xs">
              {user?.full_name ? user.full_name[0] : 'U'}
            </div>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1 shadow-lg">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = currentPage === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleNav(link.id)}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive ? 'bg-blue-50 text-blue-900 font-bold' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4 text-blue-600" />
                <span>{link.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
