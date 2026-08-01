'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Users, X, Loader2, Search } from 'lucide-react';

interface Patron {
  id: string;
  name: string;
  title: string;
  organization: string;
  bio: string;
  photoUrl: string;
  displayOrder: number;
}

export default function ChiefPatronsPage() {
  const [patrons, setPatrons] = useState<Patron[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatron, setEditingPatron] = useState<Patron | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    organization: '',
    bio: '',
    photoUrl: '',
    displayOrder: 0
  });

  const fetchPatrons = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/chief-patrons');
      if (res.ok) {
        const data = await res.json();
        setPatrons(data.chiefPatrons || data.patrons || (Array.isArray(data) ? data : []));
      }
    } catch (error) {
      console.error('Error fetching patrons:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatrons();
  }, []);

  const handleOpenModal = (patron?: Patron) => {
    if (patron) {
      setEditingPatron(patron);
      setFormData({
        name: patron.name,
        title: patron.title || '',
        organization: patron.organization || '',
        bio: patron.bio || '',
        photoUrl: patron.photoUrl || '',
        displayOrder: patron.displayOrder || 0
      });
    } else {
      setEditingPatron(null);
      setFormData({
        name: '',
        title: '',
        organization: '',
        bio: '',
        photoUrl: '',
        displayOrder: 0
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingPatron 
        ? `/api/admin/chief-patrons/${editingPatron.id}` 
        : '/api/admin/chief-patrons';
      
      const method = editingPatron ? 'PATCH' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setIsModalOpen(false);
        fetchPatrons();
      }
    } catch (error) {
      console.error('Error saving patron:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this patron?')) return;
    try {
      const res = await fetch(`/api/admin/chief-patrons/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchPatrons();
      }
    } catch (error) {
      console.error('Error deleting patron:', error);
    }
  };

  const safePatrons = Array.isArray(patrons) ? patrons : [];
  const filteredPatrons = safePatrons.filter(p => 
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.organization?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen bg-slate-950 text-white">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Chief Patrons & Sponsors</h1>
          <p className="text-slate-400 mt-2">Manage the journal&apos;s chief patrons and sponsors</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl transition-colors"
        >
          <Plus size={20} />
          Add Patron
        </button>
      </div>

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={20} />
        <input 
          type="text"
          placeholder="Search patrons..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-blue-500"
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-blue-500" size={40} />
        </div>
      ) : filteredPatrons.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
          <Users className="mx-auto text-slate-600 mb-4" size={48} />
          <h3 className="text-xl font-semibold mb-2">No patrons found</h3>
          <p className="text-slate-400">Click the Add Patron button to create one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatrons.map((patron) => (
            <div key={patron.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
              <div className="p-6 flex flex-col items-center flex-grow text-center">
                <div className="w-24 h-24 rounded-full bg-slate-800 mb-4 overflow-hidden border-2 border-slate-700 flex items-center justify-center">
                  {patron.photoUrl ? (
                    <img src={patron.photoUrl} alt={patron.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-slate-400">
                      {patron.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold mb-1">{patron.name}</h3>
                <p className="text-blue-400 font-medium text-sm mb-2">{patron.title}</p>
                <p className="text-slate-400 text-sm mb-4">{patron.organization}</p>
                
                <div className="mt-auto flex items-center gap-2">
                  <span className="text-xs text-slate-500">Order: {patron.displayOrder}</span>
                </div>
              </div>
              <div className="bg-slate-950 border-t border-slate-800 p-4 flex justify-between gap-2">
                <button 
                  onClick={() => handleOpenModal(patron)}
                  className="flex-1 flex justify-center items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-xl transition-colors text-sm"
                >
                  <Edit2 size={16} /> Edit
                </button>
                <button 
                  onClick={() => handleDelete(patron.id)}
                  className="flex-1 flex justify-center items-center gap-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 hover:text-red-300 py-2 rounded-xl transition-colors text-sm"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center sticky top-0 bg-slate-900 z-10">
              <h2 className="text-2xl font-bold">{editingPatron ? 'Edit Patron' : 'Add Patron'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Name</label>
                  <input 
                    type="text" required
                    value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Title</label>
                  <input 
                    type="text" required
                    value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-400 mb-1">Organization</label>
                  <input 
                    type="text"
                    value={formData.organization} onChange={(e) => setFormData({...formData, organization: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-400 mb-1">Photo / Logo URL</label>
                  <input 
                    type="url"
                    value={formData.photoUrl} onChange={(e) => setFormData({...formData, photoUrl: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-400 mb-1">Bio</label>
                  <textarea 
                    rows={3}
                    value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 focus:outline-none focus:border-blue-500"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Display Order</label>
                  <input 
                    type="number"
                    value={formData.displayOrder} onChange={(e) => setFormData({...formData, displayOrder: parseInt(e.target.value) || 0})}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="pt-6 mt-6 border-t border-slate-800 flex justify-end gap-3">
                <button 
                  type="button" onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors"
                >
                  Save Patron
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
