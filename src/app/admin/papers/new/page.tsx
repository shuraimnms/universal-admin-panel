'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSite } from '@/contexts/SiteContext';
import { ArrowLeft, Save, Plus, X, Upload } from 'lucide-react';

export default function NewPaperPage() {
  const router = useRouter();
  const { activeSite } = useSite();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [category, setCategory] = useState('Computer Science');
  const [status, setStatus] = useState('PUBLISHED');
  const [volume, setVolume] = useState('');
  const [issueNumber, setIssueNumber] = useState('');
  const [doi, setDoi] = useState('');
  const [scribdUrl, setScribdUrl] = useState('');
  const [keywordsInput, setKeywordsInput] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  
  const [authors, setAuthors] = useState([{ name: '', email: '', institution: '' }]);

  const handleAddKeyword = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const kw = keywordsInput.trim();
      if (kw && !keywords.includes(kw)) {
        setKeywords([...keywords, kw]);
      }
      setKeywordsInput('');
    }
  };

  const removeKeyword = (kw: string) => {
    setKeywords(keywords.filter(k => k !== kw));
  };

  const addAuthor = () => {
    setAuthors([...authors, { name: '', email: '', institution: '' }]);
  };

  const removeAuthor = (index: number) => {
    if (authors.length === 1) return;
    setAuthors(authors.filter((_, i) => i !== index));
  };

  const updateAuthor = (index: number, field: string, value: string) => {
    const newAuthors = [...authors];
    newAuthors[index] = { ...newAuthors[index], [field]: value };
    setAuthors(newAuthors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!title || !abstract || authors.some(a => !a.name)) {
      setError('Please fill in all required fields.');
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('abstract', abstract);
      formData.append('category', category);
      formData.append('volumeNumber', volume);
      formData.append('issueNumber', issueNumber);
      if (activeSite) formData.append('siteId', activeSite.id);
      if (doi) formData.append('doi', doi);
      if (scribdUrl) formData.append('scribdUrl', scribdUrl);
      formData.append('keywords', JSON.stringify(keywords));
      
      const formattedAuthors = authors.map(a => {
        const parts = a.name.trim().split(' ');
        const firstName = parts[0] || '';
        const lastName = parts.slice(1).join(' ') || ' ';
        return {
          firstName,
          lastName,
          email: a.email,
          institution: a.institution,
          isCorresponding: false
        };
      });
      formData.append('authors', JSON.stringify(formattedAuthors));
      
      // If we have a DOI, the API doesn't handle it in POST, we can PATCH it later or just pass it 
      // (ignoring it here as the backend API doesn't read it from FormData yet).
      
      const res = await fetch('/api/papers/submit', {
        method: 'POST',
        // DO NOT set Content-Type header when sending FormData, fetch will set it with the correct boundary
        body: formData
      });
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to create paper');
      }
      
      const data = await res.json();
      router.push(`/admin/papers/${data.paperId || data.id || ''}`);
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin/papers" className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Add New Paper</h1>
            <p className="text-slate-400 text-sm mt-1">Manually enter a new publication or submission.</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <h2 className="text-lg font-semibold text-white">Basic Information</h2>
            
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Title *</label>
              <input 
                type="text" required
                value={title} onChange={e => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Abstract *</label>
              <textarea 
                required rows={5}
                value={abstract} onChange={e => setAbstract(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Category</label>
                <select 
                  value={category} onChange={e => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics">Physics</option>
                  <option value="Engineering">Engineering</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Status</label>
                <select 
                  value={status} onChange={e => setStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="SUBMITTED">Submitted</option>
                  <option value="UNDER_REVIEW">Under Review</option>
                  <option value="ACCEPTED">Accepted</option>
                  <option value="PUBLISHED">Published</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Keywords (Press Enter to add)</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {keywords.map(kw => (
                  <span key={kw} className="bg-blue-500/10 border border-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs flex items-center gap-1">
                    {kw}
                    <button type="button" onClick={() => removeKeyword(kw)} className="hover:text-white"><X size={12} /></button>
                  </span>
                ))}
              </div>
              <input 
                type="text" 
                value={keywordsInput}
                onChange={e => setKeywordsInput(e.target.value)}
                onKeyDown={handleAddKeyword}
                placeholder="Add a keyword..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">Authors *</h2>
              <button type="button" onClick={addAuthor} className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1">
                <Plus size={16} /> Add Author
              </button>
            </div>

            <div className="space-y-4">
              {authors.map((author, index) => (
                <div key={index} className="p-4 bg-slate-950 border border-slate-800 rounded-xl relative">
                  {authors.length > 1 && (
                    <button type="button" onClick={() => removeAuthor(index)} className="absolute top-4 right-4 text-slate-500 hover:text-red-400">
                      <X size={18} />
                    </button>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mr-8">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Name *</label>
                      <input 
                        type="text" required value={author.name} onChange={e => updateAuthor(index, 'name', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Email</label>
                      <input 
                        type="email" value={author.email} onChange={e => updateAuthor(index, 'email', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-500 mb-1">Institution</label>
                      <input 
                        type="text" value={author.institution} onChange={e => updateAuthor(index, 'institution', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <h2 className="text-lg font-semibold text-white">Publication Details (Optional)</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Volume</label>
                <input 
                  type="text" value={volume} onChange={e => setVolume(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Issue</label>
                <input 
                  type="text" value={issueNumber} onChange={e => setIssueNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">DOI</label>
                <input 
                  type="text" value={doi} onChange={e => setDoi(e.target.value)}
                  placeholder="10.xxxx/xxxx"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-400 mb-1">Scribd Embed URL</label>
              <input 
                type="text" value={scribdUrl} onChange={e => setScribdUrl(e.target.value)}
                placeholder="https://www.scribd.com/embeds/xxxxxxxxx/content"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              />
              <p className="text-xs text-slate-500 mt-1">If provided, this will display the Scribd document viewer on the paper page instead of the default cover image.</p>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Link href="/admin/papers" className="px-6 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
              Cancel
            </Link>
            <button 
              type="submit" 
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl px-6 py-2 flex items-center gap-2 transition-colors"
            >
              <Save size={18} />
              {saving ? 'Saving...' : 'Save Paper'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
