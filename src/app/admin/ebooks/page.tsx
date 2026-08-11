'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, Plus, Edit2, Trash2, Search, X, Loader2, 
  Image as ImageIcon, Upload, FileText, Check, DollarSign, Globe, Eye
} from 'lucide-react';
import { useSite } from '@/contexts/SiteContext';

interface EBook {
  id: string;
  title: string;
  author: string;
  description: string;
  category: string;
  tags: string[] | string;
  accessType: string;
  price: number;
  coverImage: string;
  filePath: string;
  fileUrl?: string;
  isPublished: boolean;
  isbn: string;
  scribdUrl: string;
  trialPages: number;
  totalPages: number;
  downloads?: number;
}

export default function EBooksPage() {
  const { activeSite } = useSite();
  const [ebooks, setEbooks] = useState<EBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEbook, setEditingEbook] = useState<EBook | null>(null);

  // Upload states
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    category: '',
    tags: '',
    accessType: 'PUBLIC',
    price: 0,
    coverImage: '',
    fileUrl: '',
    isPublished: false,
    isbn: '',
    scribdUrl: '',
    trialPages: 5,
    totalPages: 0
  });

  const fetchEbooks = async () => {
    try {
      setLoading(true);
      const url = activeSite ? `/api/admin/ebooks?siteId=${activeSite.id}&limit=100` : '/api/admin/ebooks?limit=100';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const items = data.ebooks || (Array.isArray(data) ? data : []);
        // Map filePath to fileUrl for consistency
        const mapped = items.map((item: any) => ({
          ...item,
          fileUrl: item.filePath || item.fileUrl || ''
        }));
        setEbooks(mapped);
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'ebook') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = type === 'image';
    if (isImage) {
      setUploadingCover(true);
    } else {
      setUploadingPdf(true);
    }
    setUploadError(null);

    const uploadData = new FormData();
    uploadData.append('file', file);
    uploadData.append('type', type);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadData,
      });

      const result = await res.json();

      if (res.ok && result.success) {
        if (isImage) {
          setFormData(prev => ({ ...prev, coverImage: result.url }));
        } else {
          setFormData(prev => ({ ...prev, fileUrl: result.url }));
        }
      } else {
        setUploadError(result.error || 'Failed to upload file');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('An error occurred during file upload');
    } finally {
      setUploadingCover(false);
      setUploadingPdf(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingEbook ? `/api/admin/ebooks/${editingEbook.id}` : '/api/admin/ebooks';
    const method = editingEbook ? 'PATCH' : 'POST';

    const payload = {
      ...formData,
      // Handle tag formatting
      tags: formData.tags
    };

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
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Failed to save e-book');
      }
    } catch (error) {
      console.error('Failed to save ebook', error);
      alert('Network error. Failed to save e-book.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this e-book? This will also remove the uploaded files.')) return;
    try {
      const res = await fetch(`/api/admin/ebooks/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchEbooks();
      } else {
        alert('Failed to delete e-book');
      }
    } catch (error) {
      console.error('Failed to delete', error);
    }
  };

  const openModal = (ebook?: EBook) => {
    setUploadError(null);
    if (ebook) {
      setEditingEbook(ebook);
      setFormData({
        title: ebook.title || '',
        author: ebook.author || '',
        description: ebook.description || '',
        category: ebook.category || '',
        tags: Array.isArray(ebook.tags) ? ebook.tags.join(', ') : (ebook.tags || ''),
        accessType: ebook.accessType || 'PUBLIC',
        price: ebook.price || 0,
        coverImage: ebook.coverImage || '',
        fileUrl: ebook.fileUrl || ebook.filePath || '',
        isPublished: ebook.isPublished || false,
        isbn: ebook.isbn || '',
        scribdUrl: ebook.scribdUrl || '',
        trialPages: ebook.trialPages || 5,
        totalPages: ebook.totalPages || 0
      });
    } else {
      setEditingEbook(null);
      setFormData({
        title: '',
        author: '',
        description: '',
        category: '',
        tags: '',
        accessType: 'PUBLIC',
        price: 0,
        coverImage: '',
        fileUrl: '',
        isPublished: false,
        isbn: '',
        scribdUrl: '',
        trialPages: 5,
        totalPages: 0
      });
    }
    setIsModalOpen(true);
  };

  const safeEbooks = Array.isArray(ebooks) ? ebooks : [];
  const filteredEbooks = safeEbooks.filter(e => 
    (e.title.toLowerCase().includes(search.toLowerCase()) || 
     e.author.toLowerCase().includes(search.toLowerCase())) &&
    (categoryFilter ? e.category === categoryFilter : true)
  );

  // Gather unique categories for filter dropdown
  const categoriesList = Array.from(new Set(safeEbooks.map(e => e.category).filter(Boolean)));

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-slate-200">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3 font-heading">
            <BookOpen className="text-indigo-400" />
            E-Books Library
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage e-books, upload PDFs, and update publication listings.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-indigo-600/20 active:scale-[0.98] self-start sm:self-auto"
        >
          <Plus size={20} /> Add E-Book
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text"
            placeholder="Search by title or author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-white pl-11 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500 placeholder-slate-600 transition-colors"
          />
        </div>
        <select 
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-slate-900 border border-slate-800 text-slate-300 px-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
        >
          <option value="">All Categories</option>
          {categoriesList.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
          {categoriesList.length === 0 && (
            <>
              <option value="Research Handbooks">Research Handbooks</option>
              <option value="Discipline Volumes">Discipline Volumes</option>
              <option value="Interactive Guides">Interactive Guides</option>
            </>
          )}
        </select>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 className="animate-spin text-indigo-500" size={40} />
          <p className="text-slate-500 text-sm">Fetching e-books...</p>
        </div>
      ) : filteredEbooks.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-slate-900 flex flex-col items-center justify-center">
          <BookOpen size={48} className="text-slate-700 mb-4" />
          <p className="text-lg font-medium text-slate-400">No e-books found</p>
          <p className="text-sm text-slate-600 mt-1">Get started by creating your first digital publication.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredEbooks.map((ebook) => (
            <div key={ebook.id} className="bg-slate-900/40 border border-slate-900 rounded-3xl overflow-hidden flex flex-col group hover:border-slate-800 transition-all duration-300">
              <div className="h-52 bg-slate-900 relative overflow-hidden flex items-center justify-center border-b border-slate-900">
                {ebook.coverImage ? (
                  <img src={ebook.coverImage} alt={ebook.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-700 bg-slate-900/80 gap-2">
                    <ImageIcon size={40} />
                    <span className="text-xs font-mono">No cover artwork</span>
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <span className={`px-2.5 py-1 text-[11px] font-bold rounded-lg ${ebook.isPublished ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                    {ebook.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
                {ebook.accessType === 'PAID' && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-indigo-600 text-white px-2.5 py-1 text-xs font-bold rounded-lg shadow-md shadow-indigo-600/30 flex items-center gap-0.5">
                      <DollarSign size={12} />
                      {ebook.price.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                      {ebook.category || 'Uncategorized'}
                    </span>
                    {ebook.isbn && (
                      <span className="text-[10px] font-mono text-slate-500">ISBN: {ebook.isbn}</span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1 line-clamp-2 leading-snug group-hover:text-indigo-300 transition-colors" title={ebook.title}>
                    {ebook.title}
                  </h3>
                  <p className="text-slate-400 text-sm mb-3 font-medium">By {ebook.author}</p>
                  <p className="text-slate-500 text-xs line-clamp-3 leading-relaxed mb-4">{ebook.description}</p>
                </div>
                
                <div className="flex flex-wrap gap-2 text-[10px] font-mono text-slate-400 mb-4">
                  {ebook.totalPages && (
                    <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">{ebook.totalPages} pages</span>
                  )}
                  {ebook.trialPages && (
                    <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">{ebook.trialPages} pages trial</span>
                  )}
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-900/60">
                  <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                    <FileText size={14} className="text-slate-600" />
                    <span>{ebook.fileUrl || ebook.filePath ? 'PDF Attached' : 'No file'}</span>
                  </div>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => openModal(ebook)} 
                      className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-800/50 rounded-lg transition-colors"
                      title="Edit e-book"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(ebook.id)} 
                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800/50 rounded-lg transition-colors"
                      title="Delete e-book"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[250] p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in-up">
            <div className="flex justify-between items-center p-6 border-b border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-white font-heading">{editingEbook ? 'Edit E-Book' : 'Add New E-Book'}</h2>
                <p className="text-slate-500 text-xs mt-0.5">Fill out the details and upload the PDF file.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              
              {uploadError && (
                <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-medium">
                  {uploadError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* PDF File Upload */}
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">PDF Document File</label>
                  <div className="flex gap-3">
                    <input 
                      type="text" 
                      required
                      placeholder="/uploads/ebooks/example.pdf"
                      value={formData.fileUrl} 
                      onChange={e => setFormData({...formData, fileUrl: e.target.value})} 
                      className="flex-1 bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
                    />
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={(e) => handleFileUpload(e, 'ebook')} 
                      accept=".pdf" 
                      className="hidden" 
                    />
                    <button 
                      type="button"
                      disabled={uploadingPdf}
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 font-semibold px-4 rounded-xl border border-indigo-500/20 flex items-center justify-center gap-2 transition-colors disabled:opacity-50 text-xs shrink-0"
                    >
                      {uploadingPdf ? (
                        <Loader2 className="animate-spin" size={14} />
                      ) : (
                        <Upload size={14} />
                      )}
                      Upload PDF
                    </button>
                  </div>
                </div>

                {/* Cover Image Upload */}
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Cover Image artwork</label>
                  <div className="flex gap-3">
                    <input 
                      type="text" 
                      placeholder="https://example.com/cover.jpg or /uploads/images/cover.jpg"
                      value={formData.coverImage} 
                      onChange={e => setFormData({...formData, coverImage: e.target.value})} 
                      className="flex-1 bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
                    />
                    <input 
                      type="file" 
                      ref={coverInputRef} 
                      onChange={(e) => handleFileUpload(e, 'image')} 
                      accept="image/*" 
                      className="hidden" 
                    />
                    <button 
                      type="button"
                      disabled={uploadingCover}
                      onClick={() => coverInputRef.current?.click()}
                      className="bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 font-semibold px-4 rounded-xl border border-indigo-500/20 flex items-center justify-center gap-2 transition-colors disabled:opacity-50 text-xs shrink-0"
                    >
                      {uploadingCover ? (
                        <Loader2 className="animate-spin" size={14} />
                      ) : (
                        <Upload size={14} />
                      )}
                      Upload Image
                    </button>
                  </div>
                  {formData.coverImage && (
                    <div className="mt-2.5 relative w-20 h-28 rounded-lg overflow-hidden border border-slate-800">
                      <img src={formData.coverImage} className="w-full h-full object-cover" />
                      <button 
                        type="button" 
                        onClick={() => setFormData({...formData, coverImage: ''})}
                        className="absolute top-1 right-1 p-0.5 bg-black/60 hover:bg-black text-white rounded-full transition-colors"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Book Title</label>
                  <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-955 bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Author / Editor</label>
                  <input required value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} className="w-full bg-slate-955 bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500" />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Description / Blurb</label>
                  <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-955 bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Category</label>
                  <select 
                    required 
                    value={formData.category} 
                    onChange={e => setFormData({...formData, category: e.target.value})} 
                    className="w-full bg-slate-955 bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">Select Category</option>
                    <option value="Research Handbooks">Research Handbooks</option>
                    <option value="Discipline Volumes">Discipline Volumes</option>
                    <option value="Interactive Guides">Interactive Guides</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Tags (comma-separated)</label>
                  <input placeholder="Bestseller, Free Download, New" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} className="w-full bg-slate-955 bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Access Authorization</label>
                  <select 
                    value={formData.accessType} 
                    onChange={e => setFormData({...formData, accessType: e.target.value})} 
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
                  >
                    <option value="PUBLIC">Public (Free Download)</option>
                    <option value="LOGGED_IN_ONLY">Logged-in Users Only</option>
                    <option value="PAID">Paid E-Book</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Price (USD)</label>
                  <input type="number" step="0.01" disabled={formData.accessType !== 'PAID'} value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value) || 0})} className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 disabled:opacity-40" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Total Pages</label>
                  <input type="number" value={formData.totalPages} onChange={e => setFormData({...formData, totalPages: parseInt(e.target.value) || 0})} className="w-full bg-slate-955 bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Trial Pages Preview</label>
                  <input type="number" value={formData.trialPages} onChange={e => setFormData({...formData, trialPages: parseInt(e.target.value) || 5})} className="w-full bg-slate-955 bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">ISBN Number</label>
                  <input placeholder="978-3-16-148410-0" value={formData.isbn} onChange={e => setFormData({...formData, isbn: e.target.value})} className="w-full bg-slate-955 bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Scribd Embed URL</label>
                  <input placeholder="https://www.scribd.com/embeds/..." value={formData.scribdUrl} onChange={e => setFormData({...formData, scribdUrl: e.target.value})} className="w-full bg-slate-955 bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500" />
                </div>
                <div className="flex items-center gap-2.5 col-span-1 md:col-span-2 py-2">
                  <input type="checkbox" checked={formData.isPublished} onChange={e => setFormData({...formData, isPublished: e.target.checked})} id="isPublished" className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-indigo-500 cursor-pointer" />
                  <label htmlFor="isPublished" className="text-xs font-bold uppercase tracking-wider text-slate-300 cursor-pointer select-none">Publish immediately on VA-RA Global</label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors text-xs font-bold uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-md shadow-indigo-600/10 text-xs font-bold uppercase tracking-wider"
                >
                  Save E-Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
