"use client";

import { useState, useEffect } from "react";
import { 
  BarChart, Activity, Users, Download, Eye, FileText, 
  MapPin, Clock, Calendar, ChevronDown, CheckCircle, Clock3, XCircle
} from "lucide-react";

export default function AnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [visitors, setVisitors] = useState<any[]>([]);
  const [topPapers, setTopPapers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("30days");

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Mock APIs or real APIs depending on availability
      const [statsRes, visitorsRes, papersRes] = await Promise.all([
        fetch("/api/admin/stats").catch(() => null),
        fetch("/api/admin/analytics").catch(() => null),
        fetch("/api/papers?sort=downloads&limit=5").catch(() => null)
      ]);

      // Handle real responses or fallback to mock data for layout purposes
      const statsData = statsRes?.ok ? await statsRes.json() : {
        totalVisitors: 15420,
        uniqueVisitors: 8932,
        totalDownloads: 4329,
        pageViews: 45210,
        usersByRole: { admin: 3, reviewer: 45, author: 320, reader: 1200 },
        papersByStatus: { published: 120, review: 35, rejected: 15, submitted: 20 }
      };
      setStats(statsData);

      const visitorsData = visitorsRes?.ok ? await visitorsRes.json() : [
        { id: 1, ip: "192.168.1.1", country: "United States", page: "/papers/123", time: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
        { id: 2, ip: "192.168.1.2", country: "India", page: "/", time: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
        { id: 3, ip: "192.168.1.3", country: "United Kingdom", page: "/about", time: new Date(Date.now() - 1000 * 60 * 35).toISOString() },
        { id: 4, ip: "192.168.1.4", country: "Germany", page: "/papers", time: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
      ];
      setVisitors(visitorsData);

      const papersData = papersRes?.ok ? await papersRes.json() : [
        { id: "1", title: "Machine Learning in Healthcare", downloads: 450 },
        { id: "2", title: "Quantum Computing Advances", downloads: 380 },
        { id: "3", title: "Renewable Energy Systems", downloads: 290 },
      ];
      setTopPapers(papersData.papers || papersData);

    } catch (error) {
      console.error("Failed to fetch analytics", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex h-96 items-center justify-center text-slate-400">
        <Activity className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const maxStatusCount = stats ? Math.max(...Object.values(stats.papersByStatus as Record<string, number>)) : 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart className="h-6 w-6 text-blue-400" />
            Analytics & Statistics
          </h1>
          <p className="text-slate-400 text-sm mt-1">Overview of journal performance and traffic.</p>
        </div>
        
        <div className="relative">
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="appearance-none bg-slate-900 border border-slate-800 text-white rounded-xl pl-10 pr-10 py-2 focus:outline-none focus:border-slate-700"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="alltime">All Time</option>
          </select>
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Visitors", value: stats?.totalVisitors, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "Unique Visitors", value: stats?.uniqueVisitors, icon: Activity, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Total Downloads", value: stats?.totalDownloads, icon: Download, color: "text-amber-400", bg: "bg-amber-500/10" },
          { label: "Page Views", value: stats?.pageViews, icon: Eye, color: "text-purple-400", bg: "bg-purple-500/10" },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${kpi.bg}`}>
              <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
            </div>
            <div>
              <p className="text-slate-400 text-sm">{kpi.label}</p>
              <h3 className="text-2xl font-bold text-white mt-1">{kpi.value?.toLocaleString() || 0}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Papers by Status (CSS Bar Chart) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-400" />
            Papers by Status
          </h2>
          <div className="space-y-4">
            {Object.entries(stats?.papersByStatus || {}).map(([status, count]: [string, any]) => {
              const percentage = (count / maxStatusCount) * 100;
              const statusColors: any = {
                published: "bg-emerald-500",
                review: "bg-amber-500",
                rejected: "bg-red-500",
                submitted: "bg-blue-500"
              };
              const statusIcons: any = {
                published: CheckCircle,
                review: Clock3,
                rejected: XCircle,
                submitted: FileText
              };
              const Icon = statusIcons[status] || FileText;
              
              return (
                <div key={status}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-300 capitalize flex items-center gap-1.5">
                      <Icon className="h-3 w-3" />
                      {status}
                    </span>
                    <span className="text-slate-400 font-medium">{count}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${statusColors[status] || "bg-slate-500"} rounded-full transition-all duration-1000`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Most Downloaded Papers */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Download className="h-5 w-5 text-blue-400" />
            Most Downloaded Papers
          </h2>
          <div className="flex-1 overflow-auto">
            <div className="space-y-3">
              {topPapers.map((paper, idx) => (
                <div key={idx} className="p-3 bg-slate-800/50 rounded-xl flex items-center justify-between border border-slate-800/50 hover:bg-slate-800 transition-colors">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 font-medium text-xs">
                      #{idx + 1}
                    </div>
                    <p className="text-slate-300 text-sm truncate font-medium">{paper.title}</p>
                  </div>
                  <div className="flex-shrink-0 ml-4 flex items-center gap-1.5 text-blue-400 text-sm font-medium">
                    <Download className="h-3.5 w-3.5" />
                    {paper.downloads}
                  </div>
                </div>
              ))}
              {topPapers.length === 0 && (
                <p className="text-slate-500 text-center py-4 text-sm">No download data available.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Users & Recent Visitors */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Roles */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-400" />
            Users by Role
          </h2>
          <div className="space-y-3">
            {Object.entries(stats?.usersByRole || {}).map(([role, count]: [string, any]) => (
              <div key={role} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl border border-slate-800/50">
                <span className="text-slate-300 capitalize">{role}s</span>
                <span className="text-white font-medium bg-slate-800 px-2.5 py-1 rounded-md text-xs">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Visitors Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:col-span-2 overflow-hidden flex flex-col">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-400" />
            Recent Visitors
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="pb-3 font-medium px-4">IP Address</th>
                  <th className="pb-3 font-medium px-4">Location</th>
                  <th className="pb-3 font-medium px-4">Page</th>
                  <th className="pb-3 font-medium px-4">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-slate-300">
                {visitors.map((visitor, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs">{visitor.ip}</td>
                    <td className="py-3 px-4 flex items-center gap-1.5">
                      <MapPin className="h-3 w-3 text-slate-500" />
                      {visitor.country}
                    </td>
                    <td className="py-3 px-4 text-blue-400 truncate max-w-[150px]">{visitor.page}</td>
                    <td className="py-3 px-4 flex items-center gap-1.5 text-slate-400">
                      <Clock className="h-3 w-3" />
                      {new Date(visitor.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </td>
                  </tr>
                ))}
                {visitors.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500">No recent visitors found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
