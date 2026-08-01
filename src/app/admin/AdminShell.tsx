'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSite } from '@/contexts/SiteContext';
import {
  LayoutDashboard, Users, FileText, Calendar, Archive, Settings,
  BarChart3, LogOut, Menu, X, BookOpen, DollarSign, Award, Eye,
  Megaphone, Image, Zap, Key, Globe, Users2, ChevronRight,
  Shield, BookMarked, Star, ChevronDown, Building, Check, ExternalLink
} from 'lucide-react';

const navGroups = [
  {
    label: 'Overview',
    items: [{ name: 'Dashboard', href: '/admin', icon: LayoutDashboard }],
  },
  {
    label: 'People',
    items: [
      { name: 'Users', href: '/admin/users', icon: Users },
      { name: 'Team Members', href: '/admin/team-members', icon: Users2 },
      { name: 'Editorial Board', href: '/admin/editorial-board', icon: BookMarked },
      { name: 'Advisory Board', href: '/admin/advisory-board', icon: Star },
      { name: 'Reviewer Board', href: '/admin/reviewer-board', icon: Eye },
      { name: 'Chief Patrons', href: '/admin/chief-patrons', icon: Shield },
    ],
  },
  {
    label: 'Publication',
    items: [
      { name: 'Papers', href: '/admin/papers', icon: FileText },
      { name: 'Issues', href: '/admin/issues', icon: LayoutDashboard },
      { name: 'Archives', href: '/admin/archives', icon: Archive },
      { name: 'Certificates', href: '/admin/certificates', icon: Award },
      { name: 'Citations', href: '/admin/citations', icon: BookOpen },
      { name: 'Peer Review', href: '/admin/peer-review-process', icon: Eye },
    ],
  },
  {
    label: 'Content',
    items: [
      { name: 'Announcements', href: '/admin/announcements', icon: Megaphone },
      { name: 'Conferences', href: '/admin/conferences', icon: Calendar },
      { name: 'E-Books', href: '/admin/ebooks', icon: BookOpen },
      { name: 'Advertisements', href: '/admin/ads', icon: Image },
      { name: 'Sub. Guidelines', href: '/admin/submission-guidelines', icon: FileText },
    ],
  },
  {
    label: 'Finance',
    items: [
      { name: 'Fees & APC', href: '/admin/fees', icon: DollarSign },
      { name: 'Impact Factors', href: '/admin/impact-factors', icon: BarChart3 },
    ],
  },
  {
    label: 'System',
    items: [
      { name: 'Sites / Journals', href: '/admin/sites', icon: Globe },
      { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
      { name: 'SEO', href: '/admin/seo', icon: Globe },
      { name: 'API Keys', href: '/admin/api-keys', icon: Key },
      { name: 'Animations', href: '/admin/animations', icon: Zap },
      { name: 'Deployment', href: '/admin/deployment', icon: Globe },
      { name: 'Settings', href: '/admin/settings', icon: Settings },
    ],
  },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const { activeSite, setActiveSite, availableSites } = useSite();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [journalDropdownOpen, setJournalDropdownOpen] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const selectedJournal = activeSite ? activeSite.abbreviation : 'VA-RA Global';

  const toggleGroup = (label: string) => {
    setCollapsedGroups(prev => ({ ...prev, [label]: !prev[label] }));
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/');
    }
  }, [status, session, router]);

  /* ── Loading / auth pending ── */
  if (status === 'loading') {
    return (
      <div className="fixed inset-0 z-[200] bg-[#030712] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl" />
        </div>
        <div className="flex flex-col items-center gap-6 z-10 p-8 rounded-3xl bg-slate-900/50 border border-slate-800/50 backdrop-blur-xl shadow-2xl">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
            <div className="absolute inset-0 w-16 h-16 rounded-full border-2 border-violet-500/10 border-b-violet-500/50 animate-[spin_2s_linear_infinite_reverse]" />
          </div>
          <div className="text-center">
            <p className="text-slate-300 text-sm font-medium tracking-wide">Loading Admin Panel...</p>
            <p className="text-slate-500 text-xs mt-2 font-mono">Initializing components...</p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="fixed inset-0 z-[200] bg-[#030712] flex items-center justify-center overflow-hidden">
        <div className="flex flex-col items-center gap-6 z-10 p-8 rounded-3xl bg-slate-900/50 border border-slate-800/50 backdrop-blur-xl shadow-2xl">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
          </div>
          <div className="text-center">
            <p className="text-slate-300 text-sm font-medium tracking-wide">Redirecting to login...</p>
          </div>
        </div>
      </div>
    );
  }

  if (session?.user?.role !== 'ADMIN') {
    return (
      <div className="fixed inset-0 z-[200] bg-[#030712] flex items-center justify-center">
        <p className="text-slate-400">Access denied. Redirecting...</p>
      </div>
    );
  }

  const name = session.user.name || 'Admin';
  const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="fixed inset-0 z-[200] flex bg-[#030712] overflow-hidden">
      {/* ── Ambient Gradient Orbs ── */}
      <div className="absolute top-[-15%] left-[-5%] w-[500px] h-[500px] rounded-full bg-indigo-600/[0.07] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-5%] w-[400px] h-[400px] rounded-full bg-violet-600/[0.05] blur-[120px] pointer-events-none" />
      <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-blue-600/[0.03] blur-[150px] pointer-events-none" />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside
        className={`absolute inset-y-0 left-0 z-50 w-72 glass-sidebar flex flex-col transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 lg:flex`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.04] flex-shrink-0">
          <Link href="/admin" className="flex items-center gap-3.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 group-hover:scale-105 transition-all duration-300">
              <span className="text-white font-bold text-sm tracking-tight">VR</span>
            </div>
            <div>
              <p className="text-white font-semibold text-[15px] leading-none tracking-tight font-heading">VA-RA</p>
              <p className="text-slate-500 text-[11px] mt-1 tracking-wide uppercase">Global Admin</p>
            </div>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-500 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-all">
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-5 px-3 custom-scrollbar">
          <div className="space-y-6">
            {navGroups.map((group) => {
              const isCollapsed = collapsedGroups[group.label];
              return (
                <div key={group.label}>
                  <button
                    onClick={() => toggleGroup(group.label)}
                    className="flex items-center justify-between w-full px-3 mb-2 group/label"
                  >
                    <p className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.15em]">
                      {group.label}
                    </p>
                    <ChevronDown
                      size={12}
                      className={`text-slate-700 group-hover/label:text-slate-500 transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`}
                    />
                  </button>
                  {!isCollapsed && (
                    <div className="space-y-0.5">
                      {group.items.map((item) => {
                        const isActive =
                          pathname === item.href ||
                          (item.href !== '/admin' && pathname.startsWith(item.href));
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setSidebarOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 group relative
                              ${isActive
                                ? 'bg-gradient-to-r from-indigo-500/15 to-violet-500/5 text-white border-l-2 border-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.1)] ml-0'
                                : 'text-slate-500 hover:text-slate-200 hover:bg-white/[0.03] border-l-2 border-transparent'}`}
                          >
                            <item.icon
                              size={18}
                              className={`flex-shrink-0 transition-colors duration-200 ${
                                isActive ? 'text-indigo-400' : 'text-slate-600 group-hover:text-slate-400'
                              }`}
                            />
                            <span className="truncate">{item.name}</span>
                            {isActive && (
                              <ChevronRight size={14} className="ml-auto text-indigo-400/60 flex-shrink-0" />
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {/* User Footer */}
        <div className="border-t border-white/[0.04] p-4 flex-shrink-0">
          <div className="glass-card p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-lg shadow-violet-500/20">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{name}</p>
              <p className="text-slate-500 text-[11px] truncate">{session.user.email}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-slate-600 hover:text-red-400 transition-all duration-200 p-2 rounded-lg hover:bg-red-500/10 hover:shadow-[0_0_12px_rgba(239,68,68,0.1)]"
              title="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Topbar */}
        <header className="flex-shrink-0 h-16 glass-header flex items-center gap-4 px-4 lg:px-6 relative z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-slate-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-all"
          >
            <Menu size={20} />
          </button>

          <div className="flex-1 hidden sm:flex items-center gap-3">
            {/* Journal Dropdown */}
            <div className="relative z-[160]">
              {journalDropdownOpen && (
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setJournalDropdownOpen(false)} 
                />
              )}
              <button 
                onClick={() => setJournalDropdownOpen(!journalDropdownOpen)}
                className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg glass-card hover:bg-white/[0.06] transition-all duration-200 group"
              >
                <div className="w-5 h-5 rounded bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0">
                  <Building size={11} className="text-white" />
                </div>
                <span className="text-slate-300 text-sm font-medium">{selectedJournal}</span>
                <ChevronDown size={14} className={`text-slate-500 transition-transform duration-200 ${journalDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {journalDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-80 glass-panel shadow-elevated overflow-hidden py-1 max-h-[60vh] overflow-y-auto custom-scrollbar animate-fade-in-down z-50 bg-slate-900 border border-slate-700">
                  <div className="sticky top-0 bg-slate-900/90 backdrop-blur-md px-4 py-2.5 mb-1 z-10 border-b border-slate-800">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Select Context</p>
                  </div>
                  
                  {/* Global Context */}
                  <button
                    onClick={() => {
                      setActiveSite(null);
                      setJournalDropdownOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-800 transition-all duration-150 border-b border-slate-800"
                  >
                    <div>
                      <p className={`text-sm font-semibold ${!activeSite ? 'text-indigo-400' : 'text-slate-200'}`}>
                        VA-RA Global
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">All Journals (Global)</p>
                    </div>
                    {!activeSite && (
                      <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center">
                        <Check size={12} className="text-indigo-400" />
                      </div>
                    )}
                  </button>

                  {/* Available Sites */}
                  {availableSites.length > 0 && (
                    <div className="mt-1">
                      <div className="px-4 py-2 bg-slate-800/50">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Your Sites</p>
                      </div>
                      {availableSites.map(site => (
                        <button
                          key={site.id}
                          onClick={() => {
                            setActiveSite(site);
                            setJournalDropdownOpen(false);
                          }}
                          className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-slate-800 transition-all duration-150"
                        >
                          <div className="flex-1 min-w-0 pr-2">
                            <p className={`text-sm font-medium truncate ${activeSite?.id === site.id ? 'text-indigo-400' : 'text-slate-300'}`}>
                              {site.abbreviation}
                            </p>
                            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 leading-snug" title={site.name}>
                              {site.name}
                            </p>
                          </div>
                          {activeSite?.id === site.id && (
                            <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                              <Check size={12} className="text-indigo-400" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <span className="text-slate-700/50 text-lg font-light">/</span>
            <span className="text-slate-400 text-sm capitalize font-medium">
              {pathname === '/admin'
                ? 'Dashboard'
                : pathname.replace('/admin/', '').replace(/-/g, ' ').replace(/\//g, ' › ')}
            </span>
          </div>

          <div className="flex items-center gap-2.5 ml-auto">
            <Link
              href="/"
              target="_blank"
              className="hidden sm:flex items-center gap-2 text-slate-500 hover:text-slate-200 text-sm px-3 py-2 rounded-lg hover:bg-white/[0.04] transition-all duration-200 group"
            >
              <ExternalLink size={14} className="group-hover:text-indigo-400 transition-colors" />
              <span>View Site</span>
            </Link>
            <div className="w-px h-5 bg-white/[0.06]" />
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl glass-card">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-violet-500/20">
                {initials}
              </div>
              <span className="text-slate-300 text-sm hidden sm:block font-medium">{name.split(' ')[0]}</span>
              <span className="text-[10px] bg-gradient-to-r from-indigo-500 to-violet-600 text-white px-2 py-0.5 rounded-md font-bold uppercase tracking-wider shadow-sm shadow-indigo-500/20">Admin</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
