"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, X, Key, Shield, Check, Copy } from "lucide-react";
import { useSite } from "@/contexts/SiteContext";

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    key: "",
    provider: "sendgrid",
    isActive: true,
  });

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings/api-keys");
      const data = await res.json();
      setApiKeys(Array.isArray(data) ? data : data.apiKeys || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (apiKey?: any) => {
    if (apiKey) {
      setEditingId(apiKey.id);
      setFormData({
        name: apiKey.name || "",
        key: "", // Don't show existing key when editing for security
        provider: apiKey.provider || "sendgrid",
        isActive: apiKey.isActive !== undefined ? apiKey.isActive : true,
      });
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        key: "",
        provider: "sendgrid",
        isActive: true,
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/admin/settings/api-keys/${editingId}` : "/api/admin/settings/api-keys";
      const method = editingId ? "PATCH" : "POST";
      
      const payload = { ...formData };
      
      // If editing and key is empty, remove it so we don't overwrite with empty string
      if (editingId && !payload.key) {
        delete (payload as any).key;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to save API key");
      
      setModalOpen(false);
      fetchApiKeys();
    } catch (err) {
      alert("Error saving API key");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this API key?")) return;
    try {
      const res = await fetch(`/api/admin/settings/api-keys/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      fetchApiKeys();
    } catch (err) {
      alert("Error deleting API key");
    }
  };

  return (
    <div className="p-6 min-h-screen bg-slate-950 text-slate-300">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Key size={24} className="text-blue-500" /> API Keys
          </h1>
          <p className="text-slate-400 text-sm mt-1">Manage external integrations and API keys.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl transition-colors"
        >
          <Plus size={18} />
          <span>New API Key</span>
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-slate-400">Loading API keys...</div>
          ) : apiKeys.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Shield size={48} className="mx-auto mb-4 opacity-50 text-slate-600" />
              <p>No API keys configured yet.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950 text-slate-400">
                <tr>
                  <th className="p-4 font-medium">Name</th>
                  <th className="p-4 font-medium">Provider</th>
                  <th className="p-4 font-medium">Key (Masked)</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Created</th>
                  <th className="p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {apiKeys.map((apiKey) => (
                  <tr key={apiKey.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 font-medium text-white">{apiKey.name}</td>
                    <td className="p-4">
                      <span className="text-xs font-semibold bg-slate-800 text-slate-300 px-2 py-1 rounded capitalize">
                        {apiKey.provider}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-slate-400">{apiKey.key}</td>
                    <td className="p-4">
                      {apiKey.isActive ? (
                        <span className="text-emerald-400 text-xs px-2 py-1 rounded bg-emerald-400/10 border border-emerald-400/20">Active</span>
                      ) : (
                        <span className="text-slate-500 text-xs px-2 py-1 rounded bg-slate-800 border border-slate-700">Inactive</span>
                      )}
                    </td>
                    <td className="p-4 text-slate-400 text-xs">
                      {new Date(apiKey.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-3">
                        <button onClick={() => handleOpenModal(apiKey)} className="text-slate-400 hover:text-white transition-colors p-1 bg-slate-950 rounded">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(apiKey.id)} className="text-slate-400 hover:text-red-400 transition-colors p-1 bg-slate-950 rounded">
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
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg my-auto">
            <div className="flex justify-between items-center p-6 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Shield size={20} className="text-blue-500" />
                {editingId ? 'Edit API Key' : 'Add API Key'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Key Name</label>
                <input 
                  type="text" required value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none"
                  placeholder="e.g., SendGrid Production"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Provider</label>
                <select 
                  value={formData.provider} 
                  onChange={(e) => setFormData({...formData, provider: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="sendgrid">SendGrid</option>
                  <option value="stripe">Stripe</option>
                  <option value="aws">AWS</option>
                  <option value="openai">OpenAI</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">API Key</label>
                <input 
                  type={editingId ? "password" : "text"} 
                  required={!editingId} 
                  value={formData.key} 
                  onChange={(e) => setFormData({...formData, key: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none font-mono"
                  placeholder={editingId ? "Leave blank to keep current key" : "Enter the secret key..."}
                />
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
                  <span className="text-sm font-medium text-slate-300">Active</span>
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
                  <Check size={18} /> Save Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
