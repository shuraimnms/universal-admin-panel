'use client';

import { useState, useEffect } from 'react';
import { Megaphone, Plus, Edit2, Trash2, X, Loader2 } from 'lucide-react';

interface Ad {
  id: string;
  title: string;
  placement: 'HEADER' | 'SIDEBAR' | 'FOOTER' | 'INLINE';
  imageUrl: string;
  clickUrl: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  priority: number;
}

export default function AdsPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);

  const [formData, setFormData] = useState<Omit<Ad, 'id'>>({
    title: '', placement: 'SIDEBAR', imageUrl: '', clickUrl: '',
    startDate: '', endDate: '', isActive: true, priority: 0
  });

  const fetchAds = async () => {
    try {
      const res = await fetch('/api/ads');
      if (res.ok) setAds(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAds(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingAd ? `/api/ads/${editingAd.id}` : '/api/ads';
    const method = editingAd ? 'PATCH' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchAds();
      }
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this ad?')) return;
    try {
      await fetch(`/api/ads/${id}`, { method: 'DELETE' });
      fetchAds();
    } catch (e) { console.error(e); }
  };

  const openModal = (ad?: Ad) => {
    if (ad) {
      setEditingAd(ad);
      setFormData(ad);
    } else {
      setEditingAd(null);
      setFormData({
        title: '', placement: 'SIDEBAR', imageUrl: '', clickUrl: '',
        startDate: new Date().toISOString().split('T')[0], endDate: '', isActive: true, priority: 0
      });
    }
    setIsModalOpen(true);
  };

  const getStatus = (ad: Ad) => {
    if (!ad.isActive) return <span className="px-2 py-1 bg-slate-800 text-slate-400 rounded-lg text-xs">Inactive</span>;
    const now = new Date();
    const end = new Date(ad.endDate);
    if (end < now) return <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-lg text-xs">Expired</span>;
    return <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs">Active</span>;
  };

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-slate-200">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Megaphone className="text-blue-400" />
          Advertisements
        </h1>
        <button onClick={() => openModal()} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors">
          <Plus size={20} /> Add Ad
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" size={40} /></div>
      ) : ads.length === 0 ? (
        <div className="text-center py-20 bg-slate-900 rounded-2xl border border-slate-800">
          <Megaphone size={64} className="mx-auto text-slate-700 mb-4" />
          <p className="text-xl text-slate-400">No advertisements found</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-800/50 border-b border-slate-800">
              <tr>
                <th className="p-4 font-semibold text-slate-300">Preview</th>
                <th className="p-4 font-semibold text-slate-300">Title</th>
                <th className="p-4 font-semibold text-slate-300">Placement</th>
                <th className="p-4 font-semibold text-slate-300">Dates</th>
                <th className="p-4 font-semibold text-slate-300">Status</th>
                <th className="p-4 font-semibold text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {ads.map((ad) => (
                <tr key={ad.id} className="hover:bg-slate-800/20">
                  <td className="p-4">
                    {ad.imageUrl ? <img src={ad.imageUrl} alt={ad.title} className="w-20 h-12 object-cover rounded bg-slate-800" /> : <div className="w-20 h-12 bg-slate-800 rounded flex items-center justify-center text-xs text-slate-500">No Img</div>}
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-white">{ad.title}</div>
                    <a href={ad.clickUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-400 hover:underline truncate max-w-[200px] block">{ad.clickUrl}</a>
                  </td>
                  <td className="p-4 text-sm text-slate-300">{ad.placement}</td>
                  <td className="p-4 text-sm text-slate-300">
                    {new Date(ad.startDate).toLocaleDateString()} - <br/>
                    {ad.endDate ? new Date(ad.endDate).toLocaleDateString() : 'Forever'}
                  </td>
                  <td className="p-4">{getStatus(ad)}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button onClick={() => openModal(ad)} className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg"><Edit2 size={18} /></button>
                      <button onClick={() => handleDelete(ad.id)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white">{editingAd ? 'Edit Ad' : 'Add Ad'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm text-slate-400 mb-1">Title</label>
                  <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Placement</label>
                  <select value={formData.placement} onChange={e => setFormData({...formData, placement: e.target.value as Ad['placement']})} className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2">
                    <option value="HEADER">Header</option>
                    <option value="SIDEBAR">Sidebar</option>
                    <option value="FOOTER">Footer</option>
                    <option value="INLINE">Inline</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Priority</label>
                  <input type="number" value={formData.priority} onChange={e => setFormData({...formData, priority: parseInt(e.target.value) || 0})} className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm text-slate-400 mb-1">Image URL</label>
                  <input required value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm text-slate-400 mb-1">Click URL</label>
                  <input required value={formData.clickUrl} onChange={e => setFormData({...formData, clickUrl: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Start Date</label>
                  <input type="date" required value={formData.startDate.split('T')[0]} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">End Date</label>
                  <input type="date" value={formData.endDate?.split('T')[0] || ''} onChange={e => setFormData({...formData, endDate: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2" />
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} id="isActive" className="w-4 h-4 rounded bg-slate-800 border-slate-700" />
                  <label htmlFor="isActive" className="text-sm text-white">Active</label>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t border-slate-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors">Save Ad</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
