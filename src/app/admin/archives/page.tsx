"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Archive, ChevronRight, BookOpen, Calendar } from "lucide-react";

export default function ArchivesPage() {
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const res = await fetch("/api/issues?published=true");
        if (res.ok) {
          const data = await res.json();
          setIssues(Array.isArray(data) ? data : data.issues || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchIssues();
  }, []);

  // Group issues by year
  const groupedIssues = issues.reduce((acc: Record<string, any[]>, issue) => {
    const year = issue.year?.toString() || new Date(issue.publicationDate || Date.now()).getFullYear().toString();
    if (!acc[year]) acc[year] = [];
    acc[year].push(issue);
    return acc;
  }, {});

  // Sort years descending
  const sortedYears = Object.keys(groupedIssues).sort((a, b) => parseInt(b) - parseInt(a));

  return (
    <div className="p-6 min-h-screen bg-slate-950 text-slate-300">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Archive className="text-blue-500" />
          Journal Archives
        </h1>
        <p className="text-slate-400 text-sm mt-2">Browse and manage past published journal issues and volumes.</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading archives...</div>
      ) : sortedYears.length === 0 ? (
        <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-2xl">
          <Archive size={48} className="mx-auto text-slate-600 mb-4" />
          <p className="text-slate-400">No published issues found in the archive.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {sortedYears.map((year) => (
            <div key={year} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="bg-slate-800/50 px-6 py-4 border-b border-slate-800 flex items-center gap-3">
                <Calendar size={20} className="text-blue-400" />
                <h2 className="text-xl font-bold text-white">{year} Archives</h2>
              </div>
              
              <div className="divide-y divide-slate-800/50">
                {groupedIssues[year]
                  .sort((a, b) => b.volume - a.volume || b.issueNumber - a.issueNumber)
                  .map((issue) => (
                    <div key={issue.id || issue._id} className="p-6 hover:bg-slate-800/30 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-white mb-1">
                          Volume {issue.volume}, Issue {issue.issueNumber}
                        </h3>
                        {issue.title && <p className="text-slate-400 mb-2">{issue.title}</p>}
                        
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1.5">
                            <BookOpen size={14} /> {issue.paperCount || 0} Papers
                          </span>
                          <span>
                            Published: {new Date(issue.publicationDate || issue.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <Link 
                        href={`/admin/papers?issue=${issue.id || issue._id}`}
                        className="flex items-center gap-1 text-sm font-medium text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 px-4 py-2 rounded-xl transition-colors whitespace-nowrap"
                      >
                        View Papers <ChevronRight size={16} />
                      </Link>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
