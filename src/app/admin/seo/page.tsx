"use client";

import { useState, useEffect } from "react";
import { 
  Globe, Search, Edit2, Check, X, AlertCircle, Save
} from "lucide-react";

interface SEOConfig {
  id: string;
  pageIdentifier: string;
  title: string;
  description: string;
  keywords: string;
  ogImage?: string;
  canonicalUrl?: string;
  isActive: boolean;
  updatedAt: string;
}

export default function SEOManagementPage() {
  const [seoConfigs, setSeoConfigs] = useState<SEOConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SEOConfig | null>(null);
  const [formData, setFormData] = useState<Partial<SEOConfig>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/seo").catch(() => null);
      if (res?.ok) {
        const data = await res.json();
        setSeoConfigs(data);
      } else {
        // Fallback mock data
        setSeoConfigs([
          { id: "1", pageIdentifier: "home", title: "IJARCM | International Journal of Advanced Research", description: "The official IJARCM journal portal. Publish your research in our peer-reviewed open access journal.", keywords: "journal, research, paper, publish, open access", isActive: true, updatedAt: new Date().toISOString() },
          { id: "2", pageIdentifier: "about", title: "About Us - IJARCM", description: "Learn about the mission, vision, and editorial board of the International Journal of Advanced Research.", keywords: "about journal, editorial board, mission", isActive: true, updatedAt: new Date().toISOString() },
          { id: "3", pageIdentifier: "papers", title: "Browse Papers - IJARCM", description: "Search and browse published research papers, articles, and volumes across various disciplines.", keywords: "browse papers, published articles, research database", isActive: true, updatedAt: new Date().toISOString() },
        ]);
      }
    } catch (error) {
      console.error("Failed to fetch SEO configs", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: SEOConfig) => {
    setEditingItem(item);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({
      pageIdentifier: "",
      title: "",
      description: "",
      keywords: "",
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const method = editingItem ? "PATCH" : "POST";
      const url = editingItem ? `/api/seo/${editingItem.id}` : "/api/seo";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      }).catch(() => null);

      // Simulate save for demo if no real API
      if (!res || !res.ok) {
        if (editingItem) {
          setSeoConfigs(configs => configs.map(c => c.id === editingItem.id ? { ...c, ...formData } as SEOConfig : c));
        } else {
          setSeoConfigs(configs => [...configs, { ...formData, id: Math.random().toString(), updatedAt: new Date().toISOString() } as SEOConfig]);
        }
      } else {
        await fetchConfigs();
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to save SEO config", error);
    } finally {
      setSaving(false);
    }
  };

  const getTitleColor = (len: number) => {
    if (len === 0) return "text-slate-400";
    if (len > 60) return "text-red-400";
    if (len > 50) return "text-amber-400";
    return "text-emerald-400";
  };

  const getDescriptionColor = (len: number) => {
    if (len === 0) return "text-slate-400";
    if (len > 160) return "text-red-400";
    if (len > 150) return "text-amber-400";
    return "text-emerald-400";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Globe className="h-6 w-6 text-blue-400" />
            SEO Configuration
          </h1>
          <p className="text-slate-400 text-sm mt-1">Manage meta tags and SEO attributes for site pages.</p>
        </div>
        <button 
          onClick={handleAdd}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors"
        >
          <Search className="h-4 w-4" />
          Add Page Config
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-800/50 text-slate-300 border-b border-slate-800">
              <tr>
                <th className="p-4 font-medium">Page Identifier</th>
                <th className="p-4 font-medium">Meta Title</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Last Updated</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-400">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">Loading...</td>
                </tr>
              ) : seoConfigs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">No SEO configurations found.</td>
                </tr>
              ) : (
                seoConfigs.map((config) => (
                  <tr key={config.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-4">
                      <span className="text-white font-medium bg-slate-800 px-2 py-1 rounded-md text-xs">/{config.pageIdentifier}</span>
                    </td>
                    <td className="p-4 truncate max-w-xs" title={config.title}>
                      <div className="text-slate-200">{config.title}</div>
                      <div className="text-xs text-slate-500 truncate mt-0.5">{config.description}</div>
                    </td>
                    <td className="p-4">
                      {config.isActive ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full text-xs font-medium">
                          <Check className="h-3 w-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-400 bg-slate-800 px-2 py-1 rounded-full text-xs font-medium">
                          <X className="h-3 w-3" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-xs">
                      {new Date(config.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleEdit(config)}
                        className="text-blue-400 hover:text-blue-300 p-2 rounded-lg hover:bg-slate-800 transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <h2 className="text-xl font-bold text-white">
                {editingItem ? "Edit SEO Configuration" : "Add SEO Configuration"}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-5 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-medium text-slate-300">Page Identifier (e.g., &apos;home&apos;, &apos;about&apos;, &apos;contact&apos;)</label>
                  <input 
                    type="text" 
                    value={formData.pageIdentifier || ""}
                    onChange={(e) => setFormData({...formData, pageIdentifier: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Enter page path or identifier"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium text-slate-300">Meta Title</label>
                    <span className={`text-xs ${getTitleColor(formData.title?.length || 0)}`}>
                      {formData.title?.length || 0} / 60
                    </span>
                  </div>
                  <input 
                    type="text" 
                    value={formData.title || ""}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="SEO friendly title"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium text-slate-300">Meta Description</label>
                    <span className={`text-xs ${getDescriptionColor(formData.description?.length || 0)}`}>
                      {formData.description?.length || 0} / 160
                    </span>
                  </div>
                  <textarea 
                    value={formData.description || ""}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 focus:outline-none focus:border-blue-500 transition-colors h-24 resize-none"
                    placeholder="Brief description of the page content"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-medium text-slate-300">Keywords (Comma separated)</label>
                  <input 
                    type="text" 
                    value={formData.keywords || ""}
                    onChange={(e) => setFormData({...formData, keywords: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="journal, science, research..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-300">Canonical URL (Optional)</label>
                  <input 
                    type="text" 
                    value={formData.canonicalUrl || ""}
                    onChange={(e) => setFormData({...formData, canonicalUrl: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="https://..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-300">OG Image URL (Optional)</label>
                  <input 
                    type="text" 
                    value={formData.ogImage || ""}
                    onChange={(e) => setFormData({...formData, ogImage: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="https://..."
                  />
                </div>

                <div className="md:col-span-2 flex items-center gap-3 pt-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={formData.isActive !== false}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                  </label>
                  <span className="text-sm font-medium text-slate-300">Active</span>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-800 flex justify-end gap-3 bg-slate-900/50">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <span className="flex items-center gap-2"><AlertCircle className="h-4 w-4 animate-spin" /> Saving...</span>
                ) : (
                  <span className="flex items-center gap-2"><Save className="h-4 w-4" /> Save Config</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
