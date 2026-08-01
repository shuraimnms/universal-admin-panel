'use client';

import { useState, useEffect } from 'react';
import { Quote, Plus, Edit2, Trash2, X, Loader2 } from 'lucide-react';

interface Citation {
  id: string;
  paperTitle: string;
  citingSource: string;
  citationType: string;
  date: string;
}

export default function CitationsPage() {
  const [citations, setCitations] = useState<Citation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCitation, setEditingCitation] = useState<Citation | null>(null);

  const [formData, setFormData] = useState({
    paperTitle: '', citingSource: '', citationType: 'APA', date: new Date().toISOString().split('T')[0]
  });

  const fetchCitations = async () => {
    try {
      const res = await fetch('/api/citations');
      if (res.ok) setCitations(await res.json());
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchCitations(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingCitation ? `/api/citations/${editingCitation.id}` : '/api/citations';
    const method = editingCitation ? 'PATCH' : 'POST';
    try {
      await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      setIsModalOpen(false);
      fetchCitations();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete citation?')) return;
    try {
      await fetch(`/api/citations/${id}`, { method: 'DELETE' });
      fetchCitations();
    } catch (e) { console.error(e); }
  };

  const openModal = (c?: Citation) => {
    if (c) {
      setEditingCitation(c);
      setFormData(c);
    } else {
      setEditingCitation(null);
      setFormData({ paperTitle: '', citingSource: '', citationType: 'APA', date: new Date().toISOString().split('T')[0] });
    }
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-slate-200">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Quote className="text-orange-400" />
          Citations Management
        </h1>
        <button onClick={() => openModal()} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl flex items-center gap-2">
          <Plus size={20} /> Add Citation
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" size={40} /></div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-800/50 border-b border-slate-800">
              <tr>
                <th className="p-4 font-semibold text-slate-300">Paper Title</th>
                <th className="p-4 font-semibold text-slate-300">Citing Source</th>
                <th className="p-4 font-semibold text-slate-300">Type</th>
                <th className="p-4 font-semibold text-slate-300">Date</th>
                <th className="p-4 font-semibold text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {citations.length === 0 ? (
                <tr><td colSpan={5} className="p-4 text-center text-slate-500">No citations recorded</td></tr>
              ) : citations.map(c => (
                <tr key={c.id} className="hover:bg-slate-800/20">
                  <td className="p-4 font-medium text-white max-w-xs truncate">{c.paperTitle}</td>
                  <td className="p-4 text-slate-300 max-w-xs truncate">{c.citingSource}</td>
                  <td className="p-4"><span className="bg-slate-800 px-2 py-1 rounded text-xs">{c.citationType}</span></td>
                  <td className="p-4 text-slate-300">{new Date(c.date).toLocaleDateString()}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button onClick={() => openModal(c)} className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(c.id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg"><Trash2 size={16} /></button>
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
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">{editingCitation ? 'Edit Citation' : 'Add Citation'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Paper Title</label>
                <input required value={formData.paperTitle} onChange={e => setFormData({...formData, paperTitle: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Citing Source (URL or Name)</label>
                <input required value={formData.citingSource} onChange={e => setFormData({...formData, citingSource: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Type</label>
                  <select value={formData.citationType} onChange={e => setFormData({...formData, citationType: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2">
                    <option value="APA">APA</option>
                    <option value="MLA">MLA</option>
                    <option value="Chicago">Chicago</option>
                    <option value="Harvard">Harvard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Date</label>
                  <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl">Save Citation</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
