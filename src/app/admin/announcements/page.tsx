"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, X, AlertTriangle, Bell, Clock, Users, Check } from "lucide-react";
import { useSite } from "@/contexts/SiteContext";

export default function AnnouncementsPage() {
  const { activeSite } = useSite();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "GENERAL",
    priority: "NORMAL",
    isActive: true,
    targetAudience: "ALL",
    expiresAt: ""
  });

  useEffect(() => {
    fetchAnnouncements();
  }, [activeSite]);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const url = activeSite ? `/api/admin/announcements?admin=true&siteId=${activeSite.id}` : "/api/admin/announcements?admin=true&siteId=global";
      const res = await fetch(url);
      const data = await res.json();
      setAnnouncements(Array.isArray(data) ? data : data.announcements || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (ann?: any) => {
    if (ann) {
      setEditingId(ann.id || ann._id);
      setFormData({
        title: ann.title || "",
        content: ann.content || "",
        type: ann.type || "GENERAL",
        priority: ann.priority || "NORMAL",
        isActive: ann.isActive !== undefined ? ann.isActive : true,
        targetAudience: ann.targetAudience || "ALL",
        expiresAt: ann.expiresAt ? new Date(ann.expiresAt).toISOString().split("T")[0] : ""
      });
    } else {
      setEditingId(null);
      setFormData({
        title: "",
        content: "",
        type: "GENERAL",
        priority: "NORMAL",
        isActive: true,
        targetAudience: "ALL",
        expiresAt: ""
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/admin/announcements/${editingId}` : "/api/admin/announcements";
      const method = editingId ? "PUT" : "POST";
      
      const payload = {
        ...formData,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null
      };

      if (activeSite && method === "POST") {
        (payload as any).siteId = activeSite.id;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to save announcement");
      
      setModalOpen(false);
      fetchAnnouncements();
    } catch (err) {
      alert("Error saving announcement");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;
    try {
      const res = await fetch(`/api/admin/announcements`, { 
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if (!res.ok) throw new Error("Failed to delete");
      fetchAnnouncements();
    } catch (err) {
      alert("Error deleting announcement");
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'URGENT': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'HIGH': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      case 'NORMAL': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'LOW': return 'text-slate-400 bg-slate-800 border-slate-700';
      default: return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  return (
    <div className="p-6 min-h-screen bg-slate-950 text-slate-300">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Announcements</h1>
          <p className="text-slate-400 text-sm mt-1">Manage platform notifications and alerts.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl transition-colors"
        >
          <Plus size={18} />
          <span>New Announcement</span>
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-slate-400">Loading announcements...</div>
          ) : announcements.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Bell size={48} className="mx-auto mb-4 opacity-50" />
              <p>No announcements found.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950 text-slate-400">
                <tr>
                  <th className="p-4 font-medium">Title</th>
                  <th className="p-4 font-medium">Type</th>
                  <th className="p-4 font-medium">Priority</th>
                  <th className="p-4 font-medium">Audience</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {announcements.map((ann) => (
                  <tr key={ann.id || ann._id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 font-medium text-white max-w-[250px] truncate" title={ann.title}>
                      {ann.title}
                    </td>
                    <td className="p-4">
                      <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded">
                        {ann.type}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded border ${getPriorityColor(ann.priority)}`}>
                        {ann.priority}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400 flex items-center gap-1.5">
                      <Users size={14} /> {ann.targetAudience}
                    </td>
                    <td className="p-4">
                      {ann.isActive ? (
                        <span className="text-emerald-400 flex items-center gap-1"><Check size={14}/> Active</span>
                      ) : (
                        <span className="text-slate-500 flex items-center gap-1"><Clock size={14}/> Inactive</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-3">
                        <button onClick={() => handleOpenModal(ann)} className="text-slate-400 hover:text-white">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(ann.id || ann._id)} className="text-slate-400 hover:text-red-400">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl my-auto">
            <div className="flex justify-between items-center p-6 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white">{editingId ? 'Edit Announcement' : 'New Announcement'}</h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Title</label>
                <input 
                  type="text" required value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Content</label>
                <textarea 
                  required rows={4} value={formData.content} 
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Type</label>
                  <select 
                    value={formData.type} 
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="GENERAL">General</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="FEATURE">Feature Update</option>
                    <option value="URGENT">Urgent Alert</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Priority</label>
                  <select 
                    value={formData.priority} 
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="LOW">Low</option>
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Target Audience</label>
                  <select 
                    value={formData.targetAudience} 
                    onChange={(e) => setFormData({...formData, targetAudience: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="ALL">All Users</option>
                    <option value="AUTHORS">Authors Only</option>
                    <option value="REVIEWERS">Reviewers Only</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Expiration Date (Optional)</label>
                  <input 
                    type="date" value={formData.expiresAt} 
                    onChange={(e) => setFormData({...formData, expiresAt: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input 
                      type="checkbox" className="sr-only" 
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    />
                    <div className={`block w-10 h-6 rounded-full transition-colors ${formData.isActive ? 'bg-blue-600' : 'bg-slate-700'}`}></div>
                    <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.isActive ? 'translate-x-4' : ''}`}></div>
                  </div>
                  <span className="text-sm font-medium text-slate-300">Active (Visible to users)</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button 
                  type="button" onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors"
                >
                  Save Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
