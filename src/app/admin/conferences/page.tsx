"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, X, MapPin, Calendar as CalIcon, Video, Users } from "lucide-react";
import { useSite } from "@/contexts/SiteContext";

export default function ConferencesPage() {
  const { activeSite } = useSite();
  const [conferences, setConferences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    location: "",
    registrationUrl: "",
    isVirtual: false,
    videoUrl: "",
    maxParticipants: "",
    status: "UPCOMING"
  });

  useEffect(() => {
    fetchConferences();
  }, [activeSite]);

  const fetchConferences = async () => {
    setLoading(true);
    try {
      const url = activeSite ? `/api/admin/conferences?siteId=${activeSite.id}` : "/api/admin/conferences";
      const res = await fetch(url);
      const data = await res.json();
      setConferences(Array.isArray(data) ? data : data.conferences || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (conf?: any) => {
    if (conf) {
      setEditingId(conf.id || conf._id);
      setFormData({
        title: conf.title || "",
        description: conf.description || "",
        startDate: conf.startDate ? new Date(conf.startDate).toISOString().split("T")[0] : "",
        endDate: conf.endDate ? new Date(conf.endDate).toISOString().split("T")[0] : "",
        location: conf.location || "",
        registrationUrl: conf.registrationUrl || "",
        isVirtual: conf.isVirtual || false,
        videoUrl: conf.videoUrl || "",
        maxParticipants: conf.maxParticipants?.toString() || "",
        status: conf.status || "UPCOMING"
      });
    } else {
      setEditingId(null);
      setFormData({
        title: "",
        description: "",
        startDate: "",
        endDate: "",
        location: "",
        registrationUrl: "",
        isVirtual: false,
        videoUrl: "",
        maxParticipants: "",
        status: "UPCOMING"
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/admin/conferences/${editingId}` : "/api/admin/conferences";
      const method = editingId ? "PATCH" : "POST";
      
      const payload = {
        ...formData,
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null
      };

      if (activeSite && method === "POST") {
        (payload as any).siteId = activeSite.id;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to save conference");
      
      setModalOpen(false);
      fetchConferences();
    } catch (err) {
      alert("Error saving conference");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this conference?")) return;
    try {
      const res = await fetch(`/api/admin/conferences/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      fetchConferences();
    } catch (err) {
      alert("Error deleting conference");
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'UPCOMING': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'ONGOING': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'COMPLETED': return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      case 'CANCELLED': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-slate-500/10 text-slate-400';
    }
  };

  return (
    <div className="p-6 min-h-screen bg-slate-950 text-slate-300 relative">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Conferences</h1>
          <p className="text-slate-400 text-sm mt-1">Manage academic and research conferences.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl transition-colors"
        >
          <Plus size={18} />
          <span>Add Conference</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading conferences...</div>
      ) : conferences.length === 0 ? (
        <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-2xl">
          <Users size={48} className="mx-auto text-slate-600 mb-4" />
          <p className="text-slate-400">No conferences scheduled yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {conferences.map(conf => (
            <div key={conf.id || conf._id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative">
              <div className="absolute top-6 right-6 flex gap-2">
                <button onClick={() => handleOpenModal(conf)} className="text-slate-400 hover:text-white transition-colors bg-slate-950 p-1.5 rounded-lg">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => handleDelete(conf.id || conf._id)} className="text-slate-400 hover:text-red-400 transition-colors bg-slate-950 p-1.5 rounded-lg">
                  <Trash2 size={16} />
                </button>
              </div>

              <span className={`px-2.5 py-1 text-xs font-medium rounded-full border mb-4 inline-block ${getStatusColor(conf.status)}`}>
                {conf.status}
              </span>
              
              <h3 className="text-xl font-bold text-white mb-2 pr-20">{conf.title}</h3>
              <p className="text-sm text-slate-400 mb-5 line-clamp-2">{conf.description}</p>
              
              <div className="space-y-2.5 text-sm">
                <div className="flex items-center gap-2 text-slate-300">
                  <CalIcon size={16} className="text-blue-400" />
                  <span>
                    {new Date(conf.startDate).toLocaleDateString()} 
                    {conf.endDate && conf.endDate !== conf.startDate ? ` - ${new Date(conf.endDate).toLocaleDateString()}` : ''}
                  </span>
                </div>
                
                {conf.isVirtual ? (
                  <div className="flex items-center gap-2 text-slate-300">
                    <Video size={16} className="text-emerald-400" />
                    <span>Virtual Conference</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-slate-300">
                    <MapPin size={16} className="text-amber-400" />
                    <span>{conf.location || 'Location TBD'}</span>
                  </div>
                )}

                {conf.maxParticipants && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <Users size={16} className="text-purple-400" />
                    <span>Max Participants: {conf.maxParticipants}</span>
                  </div>
                )}
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
              <h2 className="text-xl font-bold text-white">{editingId ? 'Edit Conference' : 'New Conference'}</h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Title</label>
                <input 
                  type="text" required value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
                <textarea 
                  required rows={3} value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white focus:border-blue-500 focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Start Date</label>
                  <input 
                    type="date" required value={formData.startDate} 
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">End Date (Optional)</label>
                  <input 
                    type="date" value={formData.endDate} 
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Status</label>
                  <select 
                    value={formData.status} 
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="UPCOMING">Upcoming</option>
                    <option value="ONGOING">Ongoing</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Max Participants</label>
                  <input 
                    type="number" value={formData.maxParticipants} 
                    onChange={(e) => setFormData({...formData, maxParticipants: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input 
                      type="checkbox" className="sr-only" 
                      checked={formData.isVirtual}
                      onChange={(e) => setFormData({...formData, isVirtual: e.target.checked})}
                    />
                    <div className={`block w-10 h-6 rounded-full transition-colors ${formData.isVirtual ? 'bg-blue-600' : 'bg-slate-700'}`}></div>
                    <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.isVirtual ? 'translate-x-4' : ''}`}></div>
                  </div>
                  <span className="text-sm font-medium text-slate-300">This is a virtual conference</span>
                </label>
              </div>

              {!formData.isVirtual ? (
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Location</label>
                  <input 
                    type="text" value={formData.location} 
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none"
                    placeholder="e.g., University Name, City"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Meeting/Video URL</label>
                  <input 
                    type="text" value={formData.videoUrl} 
                    onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none"
                    placeholder="https://..."
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Registration/Website URL</label>
                <input 
                  type="text" value={formData.registrationUrl} 
                  onChange={(e) => setFormData({...formData, registrationUrl: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none"
                  placeholder="https://..."
                />
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
                  Save Conference
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
