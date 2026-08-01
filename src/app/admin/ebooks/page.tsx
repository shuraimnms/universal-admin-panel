'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Plus, Edit2, Trash2, Search, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { useSite } from '@/contexts/SiteContext';

interface EBook {
  id: string;
  title: string;
  author: string;
  description: string;
  category: string;
  price: number;
  coverImage: string;
  fileUrl: string;
  isPublished: boolean;
  isbn: string;
  scribdUrl: string;
  downloads: number;
}

export default function EBooksPage() {
  const { activeSite } = useSite();
  const [ebooks, setEbooks] = useState<EBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEbook, setEditingEbook] = useState<EBook | null>(null);

  const [formData, setFormData] = useState({
    title: '', author: '', description: '', category: '', price: 0,
    coverImage: '', fileUrl: '', isPublished: false, isbn: '', scribdUrl: ''
  });

  const fetchEbooks = async () => {
    try {
      const url = activeSite ? `/api/admin/ebooks?siteId=${activeSite.id}` : '/api/admin/ebooks';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setEbooks(data.ebooks || (Array.isArray(data) ? data : []));
      }
    } catch (error) {
      console.error('Failed to fetch ebooks', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEbooks();
  }, [activeSite]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingEbook ? `/api/admin/ebooks/${editingEbook.id}` : '/api/admin/ebooks';
    const method = editingEbook ? 'PATCH' : 'POST';

    const payload = { ...formData };
    if (activeSite && method === 'POST') {
      (payload as any).siteId = activeSite.id;
    }

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchEbooks();
      }
    } catch (error) {
      console.error('Failed to save ebook', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this e-book?')) return;
    try {
      await fetch(`/api/admin/ebooks/${id}`, { method: 'DELETE' });
      fetchEbooks();
    } catch (error) {
      console.error('Failed to delete', error);
    }
  };

  const openModal = (ebook?: EBook) => {
    if (ebook) {
      setEditingEbook(ebook);
      setFormData(ebook);
    } else {
      setEditingEbook(null);
      setFormData({
        title: '', author: '', description: '', category: '', price: 0,
        coverImage: '', fileUrl: '', isPublished: false, isbn: '', scribdUrl: ''
      });
    }
    setIsModalOpen(true);
  };

  const safeEbooks = Array.isArray(ebooks) ? ebooks : [];
  const filteredEbooks = safeEbooks.filter(e => 
    e.title.toLowerCase().includes(search.toLowerCase()) &&
    (categoryFilter ? e.category === categoryFilter : true)
  );

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-slate-200">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <BookOpen className="text-blue-400" />
          E-Books Library
        </h1>
        <button 
          onClick={() => openModal()}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors"
        >
          <Plus size={20} /> Add E-Book
        </button>
      </div>

      <div className="flex gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text"
            placeholder="Search e-books..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-white pl-10 pr-4 py-2 rounded-xl focus:outline-none focus:border-blue-500"
          />
        </div>
        <select 
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-slate-900 border border-slate-800 text-white px-4 py-2 rounded-xl focus:outline-none focus:border-blue-500"
        >
          <option value="">All Categories</option>
          <option value="Science">Science</option>
          <option value="Technology">Technology</option>
          <option value="Medicine">Medicine</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" size={40} /></div>
      ) : filteredEbooks.length === 0 ? (
        <div className="text-center py-20 bg-slate-900 rounded-2xl border border-slate-800">
          <BookOpen size={64} className="mx-auto text-slate-700 mb-4" />
          <p className="text-xl text-slate-400">No e-books found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredEbooks.map((ebook) => (
            <div key={ebook.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
              <div className="h-48 bg-slate-800 relative">
                {ebook.coverImage ? (
                  <img src={ebook.coverImage} alt={ebook.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-600">
                    <ImageIcon size={48} />
                  </div>
                )}
                <div className={`absolute top-4 right-4 px-2 py-1 text-xs font-bold rounded-lg ${ebook.isPublished ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                  {ebook.isPublished ? 'Published' : 'Draft'}
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">{ebook.title}</h3>
                <p className="text-slate-400 text-sm mb-4">{ebook.author}</p>
                <div className="flex justify-between items-center text-sm mb-4 flex-1">
                  <span className="text-blue-400 bg-blue-500/10 px-2 py-1 rounded">{ebook.category}</span>
                  <span className="text-emerald-400 font-semibold">{ebook.price === 0 ? 'Free' : `$${ebook.price.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                  <span className="text-slate-500 text-sm">{ebook.downloads} downloads</span>
                  <div className="flex gap-2">
                    <button onClick={() => openModal(ebook)} className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(ebook.id)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white">{editingEbook ? 'Edit E-Book' : 'Add E-Book'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Title</label>
                  <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Author</label>
                  <input required value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm text-slate-400 mb-1">Description</label>
                  <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Category</label>
                  <input required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Price (0 for free)</label>
                  <input type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Cover Image URL</label>
                  <input value={formData.coverImage} onChange={e => setFormData({...formData, coverImage: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">File URL</label>
                  <input value={formData.fileUrl} onChange={e => setFormData({...formData, fileUrl: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">ISBN</label>
                  <input value={formData.isbn || ''} onChange={e => setFormData({...formData, isbn: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm text-slate-400 mb-1">Scribd Embed URL</label>
                  <input value={formData.scribdUrl || ''} onChange={e => setFormData({...formData, scribdUrl: e.target.value})} placeholder="https://www.scribd.com/embeds/xxxxxxxxx/content" className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2" />
                </div>
                <div className="flex items-center gap-2 col-span-2">
                  <input type="checkbox" checked={formData.isPublished} onChange={e => setFormData({...formData, isPublished: e.target.checked})} id="isPublished" className="w-4 h-4 rounded bg-slate-800 border-slate-700" />
                  <label htmlFor="isPublished" className="text-sm text-white">Publish this e-book</label>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t border-slate-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors">Save E-Book</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

