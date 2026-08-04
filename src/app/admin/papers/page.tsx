'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSite } from '@/contexts/SiteContext';
import { 
  FileText, Search, Plus, Filter, Eye, Edit, Trash2, 
  ChevronLeft, ChevronRight, AlertCircle, FileCheck, Clock, XCircle, ExternalLink
} from 'lucide-react';

interface Paper {
  id: string;
  title: string;
  authors: { name: string }[];
  category: string;
  status: string;
  submittedAt: string;
}

interface Stats {
  total: number;
  submitted: number;
  underReview: number;
  published: number;
}

export default function PapersListPage() {
  const { activeSite } = useSite();
  const [papers, setPapers] = useState<Paper[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, submitted: 0, underReview: 0, published: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [category, setCategory] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPapers = async () => {
    setLoading(true);
    try {
      const queryParams: Record<string, string> = {
        search,
        status: status !== 'ALL' ? status : '',
        category: category !== 'ALL' ? category : '',
        page: page.toString(),
        limit: '10'
      };
      if (activeSite) {
        queryParams.siteId = activeSite.id;
      }
      const query = new URLSearchParams(queryParams);

      const res = await fetch(`/api/admin/papers?${query}`);
      if (!res.ok) throw new Error('Failed to fetch papers');
      const data = await res.json();
      setPapers(data.papers || []);
      setTotalPages(data.totalPages || 1);
      if (data.stats) setStats(data.stats);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPapers();
  }, [search, status, category, page, activeSite]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this paper?')) return;
    try {
      const res = await fetch(`/api/admin/papers/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      fetchPapers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      SUBMITTED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      UNDER_REVIEW: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      ACCEPTED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      PUBLISHED: 'bg-green-500/10 text-green-400 border-green-500/20',
      REJECTED: 'bg-red-500/10 text-red-400 border-red-500/20',
      REVISION_REQUIRED: 'bg-orange-500/10 text-orange-400 border-orange-500/20'
    };
    return colors[status] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  };

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Papers Management</h1>
          <p className="text-slate-400 mt-1">Manage submitted manuscripts and reviews.</p>
        </div>
        <div className="flex items-center gap-4">
          <a href="https://journals.indexcopernicus.com/representative/app/profile" target="_blank" rel="noopener noreferrer" className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors">
            <ExternalLink size={20} />
            Index Copernicus Panel
          </a>
          <Link href="/admin/papers/new" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors">
            <Plus size={20} />
            Add Paper
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Papers', value: stats.total, icon: FileText, color: 'text-blue-400' },
          { label: 'Submitted', value: stats.submitted, icon: Clock, color: 'text-blue-400' },
          { label: 'Under Review', value: stats.underReview, icon: AlertCircle, color: 'text-yellow-400' },
          { label: 'Published', value: stats.published, icon: FileCheck, color: 'text-green-400' }
        ].map((s, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">{s.label}</p>
              <p className="text-3xl font-bold text-white mt-2">{s.value}</p>
            </div>
            <div className={`p-4 bg-slate-950 rounded-xl ${s.color}`}>
              <s.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by title or author..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <select 
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Status</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="PUBLISHED">Published</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <select 
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Categories</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Physics">Physics</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-3 font-medium px-4">Title</th>
                <th className="pb-3 font-medium px-4">Authors</th>
                <th className="pb-3 font-medium px-4">Category</th>
                <th className="pb-3 font-medium px-4">Status</th>
                <th className="pb-3 font-medium px-4">Submitted</th>
                <th className="pb-3 font-medium px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-800/50">
                    <td className="py-4 px-4"><div className="h-4 bg-slate-800 rounded w-3/4 animate-pulse"></div></td>
                    <td className="py-4 px-4"><div className="h-4 bg-slate-800 rounded w-1/2 animate-pulse"></div></td>
                    <td className="py-4 px-4"><div className="h-4 bg-slate-800 rounded w-1/2 animate-pulse"></div></td>
                    <td className="py-4 px-4"><div className="h-6 bg-slate-800 rounded-full w-24 animate-pulse"></div></td>
                    <td className="py-4 px-4"><div className="h-4 bg-slate-800 rounded w-24 animate-pulse"></div></td>
                    <td className="py-4 px-4"><div className="h-8 bg-slate-800 rounded w-24 ml-auto animate-pulse"></div></td>
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-red-400">{error}</td>
                </tr>
              ) : papers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <FileText className="mx-auto h-12 w-12 mb-4 text-slate-600" />
                    <p>No papers found matching your criteria.</p>
                  </td>
                </tr>
              ) : (
                papers.map((paper) => (
                  <tr key={paper.id} className="border-b border-slate-800 hover:bg-slate-800/20 transition-colors">
                    <td className="py-4 px-4">
                      <Link href={`/admin/papers/${paper.id}`} className="font-medium text-white hover:text-blue-400 transition-colors line-clamp-1 max-w-md">
                        {paper.title}
                      </Link>
                    </td>
                    <td className="py-4 px-4 text-slate-300">{paper.authors.map(a => a.name).join(', ')}</td>
                    <td className="py-4 px-4 text-slate-300">{paper.category}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(paper.status)}`}>
                        {paper.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-400">
                      {new Date(paper.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/papers/${paper.id}`} className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors">
                          <Eye size={18} />
                        </Link>
                        <Link href={`/admin/papers/${paper.id}/edit`} className="p-2 text-slate-400 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-colors">
                          <Edit size={18} />
                        </Link>
                        <button onClick={() => handleDelete(paper.id)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && papers.length > 0 && (
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-800">
            <p className="text-sm text-slate-400">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
