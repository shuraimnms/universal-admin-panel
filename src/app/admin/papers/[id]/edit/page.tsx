'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';

export default function EditPaperPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [issues, setIssues] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    abstract: '',
    keywords: '',
    category: '',
    status: '',
    doi: '',
    volumeNumber: '',
    issueNumber: '',
    publicationDate: '',
    issueId: ''
  });

  useEffect(() => {
    fetchData();
  }, [params.id]);

  const fetchData = async () => {
    try {
      const [paperRes, issuesRes] = await Promise.all([
        fetch(`/api/admin/papers/${params.id}`),
        fetch('/api/issues')
      ]);

      if (!paperRes.ok) throw new Error('Failed to fetch paper');
      
      const paperData = await paperRes.json();
      let issuesData = [];
      if (issuesRes.ok) {
        issuesData = await issuesRes.json();
        setIssues(issuesData);
      }

      setFormData({
        title: paperData.title || '',
        abstract: paperData.abstract || '',
        keywords: Array.isArray(paperData.keywords) ? paperData.keywords.join(', ') : (paperData.keywords || ''),
        category: paperData.category || '',
        status: paperData.status || '',
        doi: paperData.doi || '',
        volumeNumber: paperData.volumeNumber || '',
        issueNumber: paperData.issueNumber || '',
        publicationDate: paperData.publicationDate ? paperData.publicationDate.substring(0,10) : '',
        issueId: paperData.issueId || ''
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    setError('');

    try {
      const payload = {
        ...formData,
        keywords: formData.keywords.split(',').map(k => k.trim()).filter(Boolean)
      };

      const res = await fetch(`/api/admin/papers/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to update paper');
      setSuccess('Paper updated successfully!');
      setTimeout(() => {
        router.push(`/admin/papers/${params.id}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-white font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => router.push(`/admin/papers/${params.id}`)}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Cancel
          </button>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h1 className="text-2xl font-bold mb-6">Edit Paper Details</h1>

          {error && <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-xl mb-6">{error}</div>}
          {success && <div className="bg-emerald-900/50 border border-emerald-500 text-emerald-200 p-4 rounded-xl mb-6">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Title</label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Abstract</label>
              <textarea
                name="abstract"
                rows={5}
                required
                value={formData.abstract}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Keywords (comma-separated)</label>
              <input
                type="text"
                name="keywords"
                value={formData.keywords}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Category</option>
                  <option value="Research">Research</option>
                  <option value="Review">Review</option>
                  <option value="Case Study">Case Study</option>
                  <option value="Short Communication">Short Communication</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="SUBMITTED">Submitted</option>
                  <option value="UNDER_REVIEW">Under Review</option>
                  <option value="REVISION_REQUIRED">Revision Required</option>
                  <option value="ACCEPTED">Accepted</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">DOI</label>
                <input
                  type="text"
                  name="doi"
                  value={formData.doi}
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Assign to Issue</label>
                <select
                  name="issueId"
                  value={formData.issueId}
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Unassigned</option>
                  {issues.map(issue => (
                    <option key={issue.id} value={issue.id}>{issue.title || `Volume ${issue.volume} Issue ${issue.issue}`}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Volume Number</label>
                <input
                  type="text"
                  name="volumeNumber"
                  value={formData.volumeNumber}
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Issue Number</label>
                <input
                  type="text"
                  name="issueNumber"
                  value={formData.issueNumber}
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Publication Date</label>
                <input
                  type="date"
                  name="publicationDate"
                  value={formData.publicationDate}
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="pt-6 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
