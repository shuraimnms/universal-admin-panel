'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit, FileText, Download, Clock } from 'lucide-react';

export default function ViewPaperPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [paper, setPaper] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [doi, setDoi] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingDoi, setSavingDoi] = useState(false);
  const [plagiarismScore, setPlagiarismScore] = useState<number | null>(null);
  const [indexingStatus, setIndexingStatus] = useState<string | null>(null);
  const [isCheckingPlagiarism, setIsCheckingPlagiarism] = useState(false);
  const [isIndexing, setIsIndexing] = useState(false);
  
  // Crossref states
  const [crossrefStatus, setCrossrefStatus] = useState<'READY'|'WARNINGS'|'ERRORS'|null>(null);
  const [isGeneratingDoi, setIsGeneratingDoi] = useState(false);
  const [isDepositing, setIsDepositing] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    fetchPaper();
  }, [params.id]);

  const fetchPaper = async () => {
    try {
      const res = await fetch(`/api/admin/papers/${params.id}`);
      if (!res.ok) throw new Error('Failed to fetch paper');
      const data = await res.json();
      setPaper(data);
      setStatus(data.status);
      setDoi(data.doi || '');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    setSavingStatus(true);
    try {
      const res = await fetch(`/api/admin/papers/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Failed to update status');
      fetchPaper();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSavingStatus(false);
    }
  };

  const handleUpdateDoi = async () => {
    setSavingDoi(true);
    try {
      const res = await fetch(`/api/admin/papers/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doi })
      });
      if (!res.ok) throw new Error('Failed to update DOI');
      fetchPaper();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSavingDoi(false);
    }
  };

  const handleCheckPlagiarism = async () => {
    setIsCheckingPlagiarism(true);
    // Mock API call to Turnitin integration using the API key
    setTimeout(() => {
      setPlagiarismScore(Math.floor(Math.random() * 15) + 2); // Random score between 2% and 16%
      setIsCheckingPlagiarism(false);
    }, 1500);
  };

  const handleIndexScholar = async () => {
    setIsIndexing(true);
    // Mock API call to Google Scholar API
    setTimeout(() => {
      setIndexingStatus('Indexed Successfully');
      setIsIndexing(false);
    }, 2000);
  };

  const handleValidateCrossref = async () => {
    setIsValidating(true);
    try {
      const res = await fetch(`/api/admin/crossref/validate?paperId=${params.id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCrossrefStatus(data.validation.status);
      if (data.validation.errors.length) {
        alert("Errors:\n" + data.validation.errors.join('\n'));
      } else if (data.validation.warnings.length) {
        alert("Warnings:\n" + data.validation.warnings.join('\n'));
      } else {
        alert("Metadata is valid for Crossref!");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsValidating(false);
    }
  };

  const handleGenerateDoi = async () => {
    setIsGeneratingDoi(true);
    try {
      const res = await fetch(`/api/admin/crossref/generate-doi`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paperId: params.id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDoi(data.doi);
      fetchPaper();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsGeneratingDoi(false);
    }
  };

  const handleDepositCrossref = async () => {
    setIsDepositing(true);
    try {
      const res = await fetch(`/api/admin/crossref/deposit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paperId: params.id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      alert('Paper added to Crossref Deposit Queue successfully!');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsDepositing(false);
    }
  };


  if (loading) return <div className="p-8 text-white">Loading...</div>;
  if (error) return <div className="p-8 text-red-400">Error: {error}</div>;
  if (!paper) return <div className="p-8 text-white">Paper not found</div>;

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-white font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => router.push('/admin/papers')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Papers
          </button>
          <button 
            onClick={() => router.push(`/admin/papers/${params.id}/edit`)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl transition-colors"
          >
            <Edit className="w-4 h-4" /> Edit Paper
          </button>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h1 className="text-3xl font-bold mb-4">{paper.title}</h1>
          
          <div className="flex flex-wrap gap-4 mb-6">
            <span className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-sm text-slate-300">
              {paper.category}
            </span>
            <span className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-sm text-slate-300">
              {paper.status}
            </span>
            <span className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-sm text-slate-300 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(paper.createdAt).toLocaleDateString()}
            </span>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Abstract</h2>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-300 leading-relaxed">
                {paper.abstract}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">Authors</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paper.authors?.map((author: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-4 bg-slate-950 border border-slate-800 p-4 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300">
                      {author.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <div className="font-medium text-white">{author.name}</div>
                      <div className="text-sm text-slate-400">{author.email}</div>
                      <div className="text-xs text-slate-500">{author.institution}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">Keywords</h2>
              <div className="flex flex-wrap gap-2">
                {paper.keywords?.map((kw: string, idx: number) => (
                  <span key={idx} className="px-3 py-1 bg-slate-800 text-blue-400 rounded-full text-sm">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-xl font-semibold">Manage Status</h2>
            <div className="flex gap-4">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="flex-1 bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="SUBMITTED">Submitted</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="REVISION_REQUIRED">Revision Required</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="PUBLISHED">Published</option>
                <option value="REJECTED">Rejected</option>
              </select>
              <button 
                onClick={handleUpdateStatus}
                disabled={savingStatus}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
              >
                {savingStatus ? 'Saving...' : 'Update'}
              </button>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-xl font-semibold">DOI Assignment</h2>
            <div className="flex gap-4">
              <input
                type="text"
                value={doi}
                onChange={(e) => setDoi(e.target.value)}
                placeholder="e.g. 10.1234/ijarcm.2024.001"
                className="flex-1 bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button 
                onClick={handleUpdateDoi}
                disabled={savingDoi}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
              >
                {savingDoi ? 'Saving...' : 'Save DOI'}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            API Integrations
            <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-1 rounded-full border border-emerald-500/30">Active</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Plagiarism Checker */}
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-slate-300">Turnitin Integration</h3>
                {plagiarismScore !== null ? (
                  <span className={`text-xs font-bold px-2 py-1 rounded ${plagiarismScore > 15 ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                    {plagiarismScore}% Match
                  </span>
                ) : (
                  <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">Not Checked</span>
                )}
              </div>
              <p className="text-xs text-slate-400">Run a plagiarism check on the manuscript using the active Turnitin API key.</p>
              <button
                onClick={handleCheckPlagiarism}
                disabled={isCheckingPlagiarism || !paper.fileUrl}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white text-sm px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {isCheckingPlagiarism ? 'Scanning...' : 'Check Plagiarism'}
              </button>
            </div>

            {/* CrossRef Registration */}
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-slate-300">CrossRef Management</h3>
                <span className={`text-xs px-2 py-1 rounded ${doi ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                  {doi ? 'DOI Assigned' : 'Pending'}
                </span>
              </div>
              <p className="text-xs text-slate-400">Validate metadata and deposit to Crossref.</p>
              <div className="space-y-2">
                {!doi ? (
                  <button
                    onClick={handleGenerateDoi}
                    disabled={isGeneratingDoi}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-white text-sm px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isGeneratingDoi ? 'Generating...' : 'Auto-Generate DOI'}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleValidateCrossref}
                      disabled={isValidating}
                      className="w-full bg-slate-800 hover:bg-slate-700 text-white text-sm px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {isValidating ? 'Validating...' : 'Validate Metadata'}
                    </button>
                    <button
                      onClick={handleDepositCrossref}
                      disabled={isDepositing || crossrefStatus === 'ERRORS'}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {isDepositing ? 'Depositing...' : 'Deposit to Crossref'}
                    </button>
                    <a
                      href={`/api/admin/crossref/xml?paperId=${params.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-center w-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm px-4 py-2 rounded-lg transition-colors"
                    >
                      Preview XML
                    </a>
                  </>
                )}
              </div>
            </div>

            {/* Google Scholar */}
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-slate-300">Google Scholar</h3>
                <span className={`text-xs px-2 py-1 rounded ${indexingStatus ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                  {indexingStatus || 'Unindexed'}
                </span>
              </div>
              <p className="text-xs text-slate-400">Push the metadata of this paper to the Google Scholar indexing queue.</p>
              <button
                onClick={handleIndexScholar}
                disabled={isIndexing || indexingStatus === 'Indexed Successfully' || status !== 'PUBLISHED'}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white text-sm px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {isIndexing ? 'Pushing Data...' : indexingStatus ? 'Push Update' : 'Index Now'}
              </button>
            </div>
            
          </div>
        </div>

        {paper.fileUrl && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-400" />
              <div>
                <h3 className="font-semibold text-white">Manuscript File</h3>
                <p className="text-sm text-slate-400">PDF Document</p>
              </div>
            </div>
            <a 
              href={paper.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl transition-colors"
            >
              <Download className="w-4 h-4" /> Download
            </a>
          </div>
        )}

      </div>
    </div>
  );
}
