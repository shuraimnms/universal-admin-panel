"use client";

import { useState, useEffect } from "react";
import { Plus, BookOpen, Edit2, Trash2, X, Check, Calendar } from "lucide-react";
import { useSite } from "@/contexts/SiteContext";

export default function JournalIssuesPage() {
  const { activeSite } = useSite();
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    volume: "",
    issueNumber: "",
    year: new Date().getFullYear().toString(),
    description: "",
    publicationDate: new Date().toISOString().split("T")[0],
    coverImageUrl: "",
    isPublished: false
  });

  useEffect(() => {
    fetchIssues();
  }, [activeSite]);

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const url = activeSite ? `/api/admin/issues?siteId=${activeSite.id}` : "/api/admin/issues";
      const res = await fetch(url);
      const data = await res.json();
      setIssues(Array.isArray(data) ? data : data.issues || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (issue?: any) => {
    if (issue) {
      setEditingId(issue.id || issue._id);
      setFormData({
        title: issue.title || "",
        volume: issue.volume?.toString() || "",
        issueNumber: issue.issueNumber?.toString() || "",
        year: issue.year?.toString() || new Date().getFullYear().toString(),
        description: issue.description || "",
        publicationDate: issue.publicationDate ? new Date(issue.publicationDate).toISOString().split("T")[0] : "",
        coverImageUrl: issue.coverImageUrl || "",
        isPublished: issue.isPublished || false
      });
    } else {
      setEditingId(null);
      setFormData({
        title: "",
        volume: "",
        issueNumber: "",
        year: new Date().getFullYear().toString(),
        description: "",
        publicationDate: new Date().toISOString().split("T")[0],
        coverImageUrl: "",
        isPublished: false
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/admin/issues/${editingId}` : "/api/admin/issues";
      const method = editingId ? "PATCH" : "POST";
      
      const payload = {
        ...formData,
        volume: parseInt(formData.volume),
        issueNumber: parseInt(formData.issueNumber),
        year: parseInt(formData.year)
      };
      
      if (activeSite && method === "POST") {
        (payload as any).siteId = activeSite.id;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to save issue");
      
      setModalOpen(false);
      fetchIssues();
    } catch (err) {
      alert("Error saving issue");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this issue?")) return;
    try {
      const res = await fetch(`/api/admin/issues/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      fetchIssues();
    } catch (err) {
      alert("Error deleting issue");
    }
  };

  return (
    <div className="p-6 min-h-screen bg-slate-950 text-slate-300 relative">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Journal Issues</h1>
          <p className="text-slate-400 text-sm mt-1">Manage volumes, issues, and publications.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl transition-colors"
        >
          <Plus size={18} />
          <span>New Issue</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading issues...</div>
      ) : issues.length === 0 ? (
        <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-2xl">
          <BookOpen size={48} className="mx-auto text-slate-600 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No Issues Found</h3>
          <p className="text-slate-400 text-sm">Create your first journal issue to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {issues.map(issue => (
            <div key={issue.id || issue._id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
              <div className="p-6 flex-grow">
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                    issue.isPublished ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {issue.isPublished ? 'Published' : 'Draft'}
                  </span>
                  <div className="flex gap-2">
                    <button onClick={() => handleOpenModal(issue)} className="text-slate-400 hover:text-white transition-colors">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(issue.id || issue._id)} className="text-slate-400 hover:text-red-400 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-1">Volume {issue.volume}, Issue {issue.issueNumber}</h3>
                {issue.title && <p className="text-slate-300 font-medium mb-3">{issue.title}</p>}
                
                <p className="text-sm text-slate-400 mb-4 line-clamp-2">{issue.description || "No description provided."}</p>
                
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Calendar size={14} /> <span>Year: {issue.year}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <BookOpen size={14} /> <span>{issue.paperCount || 0} Papers</span>
                  </div>
                </div>
              </div>
              <div className="bg-slate-950/50 p-4 border-t border-slate-800 text-xs text-slate-500">
                Pub Date: {issue.publicationDate ? new Date(issue.publicationDate).toLocaleDateString() : 'N/A'}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl my-auto">
            <div className="flex justify-between items-center p-6 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white">{editingId ? 'Edit Issue' : 'New Issue'}</h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Title (Optional)</label>
                <input 
                  type="text" name="title" value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none"
                  placeholder="e.g., Special Issue on AI"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Volume</label>
                  <input 
                    type="number" required value={formData.volume} 
                    onChange={(e) => setFormData({...formData, volume: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Issue</label>
                  <input 
                    type="number" required value={formData.issueNumber} 
                    onChange={(e) => setFormData({...formData, issueNumber: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Year</label>
                  <input 
                    type="number" required value={formData.year} 
                    onChange={(e) => setFormData({...formData, year: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
                <textarea 
                  rows={3} value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white focus:border-blue-500 focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Publication Date</label>
                  <input 
                    type="date" value={formData.publicationDate} 
                    onChange={(e) => setFormData({...formData, publicationDate: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Cover Image URL</label>
                  <input 
                    type="text" value={formData.coverImageUrl} 
                    onChange={(e) => setFormData({...formData, coverImageUrl: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input 
                      type="checkbox" className="sr-only" 
                      checked={formData.isPublished}
                      onChange={(e) => setFormData({...formData, isPublished: e.target.checked})}
                    />
                    <div className={`block w-10 h-6 rounded-full transition-colors ${formData.isPublished ? 'bg-blue-600' : 'bg-slate-700'}`}></div>
                    <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.isPublished ? 'translate-x-4' : ''}`}></div>
                  </div>
                  <span className="text-sm font-medium text-slate-300">Publish this issue</span>
                </label>
              </div>

              <div className="pt-6 border-t border-slate-800 flex justify-end gap-3">
                <button 
                  type="button" onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 flex items-center gap-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors"
                >
                  <Check size={18} /> Save Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
