'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSite } from '@/contexts/SiteContext';
import { 
  FileText, Search, Plus, Eye, Edit, Trash2, 
  ChevronLeft, ChevronRight, AlertCircle, FileCheck, Clock, 
  Calendar, User, Tag, Download, BookOpen
} from 'lucide-react';

interface Paper {
  id: string;
  title: string;
  abstract: string;
  category: string;
  status: string;
  submittedAt: string;
  volumeNumber?: string;
  issueNumber?: string;
  doi?: string;
  paperAuthors: {
    user: {
      firstName: string;
      lastName: string;
      institution?: string;
    }
  }[];
  _count?: {
    downloads: number;
    reviews: number;
  };
}

interface Issue {
  id: string;
  title: string;
  volume: number;
  issueNumber: number;
  year: number;
}

export default function PapersListPage() {
  const { activeSite } = useSite();
  const [papers, setPapers] = useState<Paper[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [category, setCategory] = useState('ALL');
  const [selectedIssue, setSelectedIssue] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedPapers, setSelectedPapers] = useState<string[]>([]);

  // Fetch issues for the active site
  const fetchIssues = async () => {
    try {
      const url = activeSite ? `/api/admin/issues?siteId=${activeSite.id}&limit=100` : '/api/admin/issues?limit=100';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setIssues(data.issues || []);
      }
    } catch (err) {
      console.error('Error fetching issues:', err);
    }
  };

  const fetchPapers = async () => {
    setLoading(true);
    try {
      const queryParams: Record<string, string> = {
        search,
        status: status !== 'ALL' ? status : '',
        category: category !== 'ALL' ? category : '',
        issueId: selectedIssue !== 'ALL' ? selectedIssue : '',
        page: page.toString(),
        limit: '10'
      };
      
      // If activeSite is null (VA-RA Global), we want to strictly filter by global papers (siteId === null)
      if (activeSite) {
        queryParams.siteId = activeSite.id;
      } else {
        queryParams.siteId = 'global';
      }

      const query = new URLSearchParams(queryParams);
      const res = await fetch(`/api/admin/papers?${query}`);
      if (!res.ok) throw new Error('Failed to fetch papers');
      const data = await res.json();
      setPapers(data.papers || []);
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.totalCount || data.papers?.length || 0);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
    setPage(1);
  }, [activeSite]);

  useEffect(() => {
    fetchPapers();
  }, [search, status, category, selectedIssue, page, activeSite]);

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
      SUBMITTED: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      UNDER_REVIEW: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      ACCEPTED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      PUBLISHED: 'bg-green-500/10 text-green-400 border-green-500/20',
      REJECTED: 'bg-red-500/10 text-red-400 border-red-500/20',
      REVISION_REQUIRED: 'bg-orange-500/10 text-orange-400 border-orange-500/20'
    };
    return colors[status] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  };

  const toggleSelectPaper = (id: string) => {
    if (selectedPapers.includes(id)) {
      setSelectedPapers(selectedPapers.filter(pId => pId !== id));
    } else {
      setSelectedPapers([...selectedPapers, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedPapers.length === papers.length) {
      setSelectedPapers([]);
    } else {
      setSelectedPapers(papers.map(p => p.id));
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-8 text-slate-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-serif font-semibold text-white tracking-tight">Paper Management</h1>
          <p className="text-slate-400 text-sm mt-1">Manage all papers and publications in the system</p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href="/admin/papers/new" 
            className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20 hover:scale-[1.02]"
          >
            <Plus size={18} />
            Add Paper
          </Link>
          <Link 
            href="/admin/issues" 
            className="border border-slate-800 hover:bg-slate-900 text-slate-300 font-medium px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all"
          >
            <BookOpen size={18} />
            Manage Issues
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 md:p-6 mb-8 backdrop-blur-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search papers..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
            />
          </div>
          
          <select 
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-slate-950/80 border border-slate-800/80 rounded-xl px-4 py-2.5 text-slate-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
          >
            <option value="ALL">All Status</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="REVISION_REQUIRED">Revision Required</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="PUBLISHED">Published</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <select 
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-slate-950/80 border border-slate-800/80 rounded-xl px-4 py-2.5 text-slate-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
          >
            <option value="ALL">All Categories</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Physics">Physics</option>
            <option value="Engineering">Engineering</option>
          </select>

          <select 
            value={selectedIssue}
            onChange={(e) => setSelectedIssue(e.target.value)}
            className="bg-slate-950/80 border border-slate-800/80 rounded-xl px-4 py-2.5 text-slate-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
          >
            <option value="ALL">All Issues</option>
            {issues.map(iss => (
              <option key={iss.id} value={iss.id}>
                Vol. {iss.volume}, Issue {iss.issueNumber} ({iss.year})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* List Container */}
      <div className="bg-slate-900/30 border border-slate-900 rounded-2xl overflow-hidden backdrop-blur-xl">
        <div className="px-6 py-5 border-b border-slate-800/60 flex justify-between items-center bg-slate-900/20">
          <div className="flex items-center gap-3">
            <input 
              type="checkbox" 
              checked={papers.length > 0 && selectedPapers.length === papers.length}
              onChange={toggleSelectAll}
              className="rounded border-slate-800 bg-slate-950 text-blue-600 focus:ring-0 focus:ring-offset-0 w-4.5 h-4.5 cursor-pointer"
            />
            <h2 className="text-lg font-serif font-semibold text-white">
              Papers ({totalCount})
            </h2>
          </div>
          {selectedPapers.length > 0 && (
            <span className="text-xs font-semibold bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2.5 py-1 rounded-full">
              {selectedPapers.length} Selected
            </span>
          )}
        </div>

        {/* Papers list */}
        <div className="divide-y divide-slate-800/40">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-6 space-y-3 animate-pulse">
                <div className="h-6 bg-slate-800 rounded w-1/3"></div>
                <div className="h-4 bg-slate-800 rounded w-2/3"></div>
                <div className="h-4 bg-slate-800 rounded w-1/4"></div>
              </div>
            ))
          ) : error ? (
            <div className="p-12 text-center text-red-400">
              <AlertCircle className="mx-auto h-12 w-12 mb-3 text-red-500/80" />
              <p>{error}</p>
            </div>
          ) : papers.length === 0 ? (
            <div className="p-16 text-center text-slate-500">
              <FileText className="mx-auto h-14 w-14 mb-4 text-slate-700" />
              <p className="text-sm">No papers found matching your criteria.</p>
            </div>
          ) : (
            papers.map((paper) => (
              <div key={paper.id} className="p-6 hover:bg-slate-900/10 transition-colors flex gap-4">
                {/* Checkbox */}
                <div className="pt-1">
                  <input 
                    type="checkbox" 
                    checked={paper.id ? selectedPapers.includes(paper.id) : false}
                    onChange={() => toggleSelectPaper(paper.id)}
                    className="rounded border-slate-800 bg-slate-950 text-blue-600 focus:ring-0 focus:ring-offset-0 w-4.5 h-4.5 cursor-pointer"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 space-y-3">
                  <div className="flex justify-between items-start gap-4">
                    <Link 
                      href={`/admin/papers/${paper.id}`} 
                      className="text-lg font-serif font-semibold text-slate-100 hover:text-blue-400 transition-colors leading-snug"
                    >
                      {paper.title}
                    </Link>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(paper.status)}`}>
                        {paper.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {paper.abstract && (
                    <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 pr-12">
                      {paper.abstract}
                    </p>
                  )}

                  {/* Metadata */}
                  <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <User size={14} className="text-slate-500" />
                      <span>
                        {paper.paperAuthors?.length > 0 
                          ? paper.paperAuthors.map(a => `${a.user.firstName} ${a.user.lastName}`).join(', ') 
                          : 'Unknown Author'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-slate-500" />
                      <span>{new Date(paper.submittedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                    {paper.category && (
                      <div className="flex items-center gap-1.5">
                        <Tag size={14} className="text-slate-500" />
                        <span>{paper.category}</span>
                      </div>
                    )}
                  </div>

                  {/* Assign to Issue, Reviews & Downloads */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                    <div className="flex items-center gap-4">
                      {paper.status !== 'PUBLISHED' && (
                        <Link 
                          href={`/admin/papers/${paper.id}/edit`} 
                          className="text-xs font-medium text-blue-400 hover:text-blue-300 bg-blue-500/5 hover:bg-blue-500/10 px-3 py-1.5 border border-blue-500/10 rounded-lg transition-all"
                        >
                          Assign to Issue
                        </Link>
                      )}
                      <div className="flex gap-4 text-xs text-slate-500">
                        <span>Reviews: {paper._count?.reviews || 0}</span>
                        <span>Downloads: {paper._count?.downloads || 0}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <Link 
                        href={`/admin/papers/${paper.id}`} 
                        title="View details"
                        className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-800/60 rounded-lg transition-colors"
                      >
                        <Eye size={16} />
                      </Link>
                      {paper.filePath && (
                        <a 
                          href={`/api/admin/papers/${paper.id}/download`}
                          title="Download document"
                          className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-800/60 rounded-lg transition-colors"
                        >
                          <Download size={16} />
                        </a>
                      )}
                      <Link 
                        href={`/admin/papers/${paper.id}/edit`} 
                        title="Edit paper"
                        className="p-2 text-slate-400 hover:text-yellow-400 hover:bg-slate-800/60 rounded-lg transition-colors"
                      >
                        <Edit size={16} />
                      </Link>
                      <button 
                        onClick={() => handleDelete(paper.id)} 
                        title="Delete paper"
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800/60 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {!loading && papers.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 bg-slate-900/10 border-t border-slate-800/60">
            <p className="text-xs text-slate-400">
              Showing page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 bg-slate-950 border border-slate-800/80 rounded-xl text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 bg-slate-950 border border-slate-800/80 rounded-xl text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
