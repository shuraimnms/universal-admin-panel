'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useSite } from '@/contexts/SiteContext';
import {
  Users, FileText, Eye, Download, TrendingUp, Calendar, BarChart3,
  Settings, Activity, AlertTriangle, CheckCircle, Megaphone, Zap,
  Clock, FilePlus, Award, DollarSign, BookOpen, ArrowRight,
  Search, RefreshCw, Globe, Plus, Star, Shield
} from 'lucide-react';

interface Stats {
  overview: {
    totalUsers: number; totalPapers: number; totalReviews: number;
    totalDownloads: number; activeUsers: number; bannedUsers: number;
    publishedPapers: number; submittedPapers: number; averageRating: number;
  };
  recentActivity: Array<{ id: string; type: string; description: string; timestamp: string; user: { name: string } }>;
  systemHealth: { status: string; uptime: number; memoryUsage: { heapUsed: number; heapTotal: number } };
  papersByStatus: Record<string, number>;
}

const quickActions = [
  { label: 'Add Paper', icon: FilePlus, href: '/admin/papers/new', color: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-500/20' },
  { label: 'Generate Certificate', icon: Award, href: '/admin/certificates/generate', color: 'from-violet-500 to-purple-600', shadow: 'shadow-violet-500/20' },
  { label: 'New Announcement', icon: Megaphone, href: '/admin/announcements/new', color: 'from-orange-500 to-amber-600', shadow: 'shadow-orange-500/20' },
  { label: 'Add Conference', icon: Calendar, href: '/admin/conferences/new', color: 'from-green-500 to-emerald-600', shadow: 'shadow-green-500/20' },
  { label: 'Manage Users', icon: Users, href: '/admin/users', color: 'from-cyan-500 to-sky-600', shadow: 'shadow-cyan-500/20' },
  { label: 'View Analytics', icon: BarChart3, href: '/admin/analytics', color: 'from-pink-500 to-rose-600', shadow: 'shadow-pink-500/20' },
  { label: 'SEO Settings', icon: Globe, href: '/admin/seo', color: 'from-indigo-500 to-indigo-600', shadow: 'shadow-indigo-500/20' },
  { label: 'System Settings', icon: Settings, href: '/admin/settings', color: 'from-slate-600 to-slate-700', shadow: 'shadow-slate-500/20' },
];

const paperStatusColors: Record<string, string> = {
  SUBMITTED: 'bg-blue-500',
  UNDER_REVIEW: 'bg-yellow-500',
  REVISION_REQUIRED: 'bg-orange-500',
  ACCEPTED: 'bg-emerald-500',
  PUBLISHED: 'bg-green-500',
  REJECTED: 'bg-red-500',
};

export default function AdminDashboard() {
  const { data: session } = useSession();
  const { activeSite } = useSite();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const url = activeSite ? `/api/admin/stats?siteId=${activeSite.id}` : '/api/admin/stats';
      const res = await fetch(url);
      if (res.ok) setStats(await res.json());
    } catch (e) { console.error(e); }
    finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchStats(); }, [activeSite]);

  const kpis = [
    {
      label: 'Total Users', value: stats?.overview.totalUsers ?? 0,
      sub: `${stats?.overview.activeUsers ?? 0} active`,
      icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20',
      href: '/admin/users',
    },
    {
      label: 'Total Papers', value: stats?.overview.totalPapers ?? 0,
      sub: `${stats?.overview.publishedPapers ?? 0} published`,
      icon: FileText, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20',
      href: '/admin/papers',
    },
    {
      label: 'Total Reviews', value: stats?.overview.totalReviews ?? 0,
      sub: `Avg ${stats?.overview.averageRating?.toFixed(1) ?? '0'}/5`,
      icon: Eye, color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20',
      href: '/admin/papers',
    },
    {
      label: 'Total Downloads', value: stats?.overview.totalDownloads ?? 0,
      sub: '↗ Growing',
      icon: Download, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20',
      href: '/admin/analytics',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const memPct = stats?.systemHealth?.memoryUsage
    ? Math.round((stats.systemHealth.memoryUsage.heapUsed / stats.systemHealth.memoryUsage.heapTotal) * 100)
    : 0;

  const healthColor = {
    healthy: 'text-emerald-400', good: 'text-emerald-400',
    warning: 'text-amber-400', critical: 'text-red-400',
  }[stats?.systemHealth?.status ?? 'healthy'] ?? 'text-emerald-400';

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-slate-400 mt-1 text-sm">
            Welcome back, <span className="text-blue-400 font-semibold">{session?.user?.name?.split(' ')[0]}</span>!
            Here&apos;s what&apos;s happening in your system.
          </p>
        </div>
        <button
          onClick={() => fetchStats(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-all"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Link
            key={kpi.label}
            href={kpi.href}
            className={`rounded-2xl border ${kpi.border} ${kpi.bg} p-5 flex flex-col gap-3 hover:scale-[1.02] transition-transform group`}
          >
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">{kpi.label}</span>
              <div className={`w-8 h-8 rounded-xl ${kpi.bg} flex items-center justify-center`}>
                <kpi.icon size={16} className={kpi.color} />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{kpi.value.toLocaleString()}</p>
            <p className={`text-xs ${kpi.color}`}>{kpi.sub}</p>
          </Link>
        ))}
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2 bg-slate-900 rounded-2xl border border-slate-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold text-base">Quick Actions</h2>
            <span className="text-slate-500 text-xs">Shortcuts to common tasks</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className={`flex flex-col items-center gap-2.5 p-4 rounded-xl bg-gradient-to-br ${action.color} shadow-lg ${action.shadow} hover:scale-105 hover:shadow-xl transition-all duration-200 group`}
              >
                <action.icon size={22} className="text-white" />
                <span className="text-white text-xs font-medium text-center leading-tight">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* System Health */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 flex flex-col gap-4">
          <h2 className="text-white font-semibold text-base">System Health</h2>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${healthColor.replace('text-', 'bg-')} animate-pulse`} />
            <span className={`font-semibold capitalize ${healthColor}`}>
              {stats?.systemHealth?.status ?? 'Healthy'}
            </span>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-400">Memory Usage</span>
                <span className="text-slate-300">{memPct}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${memPct > 80 ? 'bg-red-500' : memPct > 60 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{ width: `${memPct}%` }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
              {[
                { label: 'Submitted', value: stats?.overview.submittedPapers ?? 0, icon: Clock },
                { label: 'Published', value: stats?.overview.publishedPapers ?? 0, icon: CheckCircle },
                { label: 'Banned', value: stats?.overview.bannedUsers ?? 0, icon: AlertTriangle },
                { label: 'Active', value: stats?.overview.activeUsers ?? 0, icon: Activity },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 bg-slate-800 rounded-xl p-2.5">
                  <item.icon size={14} className="text-slate-400" />
                  <div>
                    <p className="text-white text-sm font-semibold">{item.value}</p>
                    <p className="text-slate-500 text-xs">{item.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Paper Status Breakdown */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5">
          <h2 className="text-white font-semibold text-base mb-4">Papers by Status</h2>
          <div className="space-y-3">
            {stats?.papersByStatus && Object.entries(stats.papersByStatus).map(([status, count]) => {
              const total = Object.values(stats.papersByStatus).reduce((a, b) => a + b, 0);
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={status}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400 capitalize">{status.replace(/_/g, ' ')}</span>
                    <span className="text-slate-300">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${paperStatusColors[status] ?? 'bg-slate-500'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {!stats?.papersByStatus && (
              <p className="text-slate-500 text-sm text-center py-4">No data available</p>
            )}
          </div>
          <Link href="/admin/papers" className="mt-4 flex items-center gap-1 text-blue-400 text-sm hover:text-blue-300 transition-colors">
            View all papers <ArrowRight size={14} />
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-slate-900 rounded-2xl border border-slate-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold text-base">Recent Activity</h2>
            <Link href="/admin/analytics" className="text-blue-400 text-xs hover:text-blue-300 flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {stats?.recentActivity?.length ? (
              stats.recentActivity.slice(0, 6).map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-800/50 transition-colors">
                  <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center flex-shrink-0">
                    <Activity size={14} className="text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-300 text-sm truncate">{activity.description}</p>
                    <p className="text-slate-500 text-xs mt-0.5 flex items-center gap-1">
                      <span>{activity.user?.name ?? 'System'}</span>
                      <span>·</span>
                      <span>{new Date(activity.timestamp).toLocaleString()}</span>
                    </p>
                  </div>
                  <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded-lg capitalize flex-shrink-0">
                    {activity.type?.toLowerCase().replace(/_/g, ' ')}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Activity size={32} className="text-slate-700 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}