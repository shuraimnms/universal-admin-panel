"use client";

import { useState, useEffect } from "react";
import { Key, Plus, Trash2, Copy, Check, X, AlertCircle } from "lucide-react";

interface ApiKey {
  id: string;
  name: string;
  service: string;
  keyPrefix: string;
  createdAt: string;
  status: 'active' | 'revoked';
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKeyId, setEditingKeyId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    service: "",
    keyValue: ""
  });

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/api-keys").catch(() => null);
      if (res?.ok) {
        setKeys(await res.json());
      } else {
        setKeys([
          { id: "1", name: "Production CrossRef", service: "CrossRef API", keyPrefix: "cr_live_8f92...", createdAt: new Date().toISOString(), status: 'active' },
          { id: "2", name: "Turnitin Integration", service: "Plagiarism Checker", keyPrefix: "ti_test_4b2c...", createdAt: new Date(Date.now() - 86400000 * 30).toISOString(), status: 'active' },
          { id: "3", name: "Old SendGrid", service: "Email Service", keyPrefix: "sg_old_99xa...", createdAt: new Date(Date.now() - 86400000 * 90).toISOString(), status: 'revoked' },
          { id: "4", name: "Google Scholar Pending", service: "Google Scholar", keyPrefix: "gs_pending_...", createdAt: new Date().toISOString(), status: 'active' },
          { id: "5", name: "Pending Other Integration", service: "Other Integration", keyPrefix: "pending_key_...", createdAt: new Date().toISOString(), status: 'active' }
        ]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (prefix: string, id: string) => {
    navigator.clipboard.writeText(prefix);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to revoke and delete this API key? This action cannot be undone.")) return;
    
    try {
      // Mock delete
      setKeys(keys.filter(k => k.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const openEditModal = (key: ApiKey) => {
    setEditingKeyId(key.id);
    setFormData({
      name: key.name,
      service: key.service,
      keyValue: "" // We don't show the full key, but allow them to overwrite it
    });
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingKeyId(null);
    setFormData({ name: "", service: "", keyValue: "" });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.service) return;
    
    try {
      if (editingKeyId) {
        // Mock update
        setKeys(keys.map(k => {
          if (k.id === editingKeyId) {
            return {
              ...k,
              name: formData.name,
              service: formData.service,
              keyPrefix: formData.keyValue ? formData.keyValue.substring(0, 8) + "..." : k.keyPrefix
            };
          }
          return k;
        }));
      } else {
        if (!formData.keyValue) return;
        // Mock add
        const newKey: ApiKey = {
          id: Math.random().toString(),
          name: formData.name,
          service: formData.service,
          keyPrefix: formData.keyValue.substring(0, 8) + "...",
          createdAt: new Date().toISOString(),
          status: 'active'
        };
        setKeys([newKey, ...keys]);
      }
      setIsModalOpen(false);
      setEditingKeyId(null);
      setFormData({ name: "", service: "", keyValue: "" });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Key className="h-6 w-6 text-blue-400" />
            API Keys Management
          </h1>
          <p className="text-slate-400 text-sm mt-1">Manage integration keys for external services.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add API Key
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-800/50 text-slate-300 border-b border-slate-800">
              <tr>
                <th className="p-4 font-medium">Key Name</th>
                <th className="p-4 font-medium">Service</th>
                <th className="p-4 font-medium">Key Prefix</th>
                <th className="p-4 font-medium">Created Date</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-400">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">Loading API keys...</td>
                </tr>
              ) : keys.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">No API keys found.</td>
                </tr>
              ) : (
                keys.map((key) => (
                  <tr key={key.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 text-white font-medium">{key.name}</td>
                    <td className="p-4">
                      <span className="bg-slate-800 px-2 py-1 rounded-md text-xs text-slate-300 border border-slate-700">
                        {key.service}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-xs text-slate-500 flex items-center gap-2">
                      {key.keyPrefix}
                      <button 
                        onClick={() => handleCopy(key.keyPrefix, key.id)}
                        className="text-slate-400 hover:text-white transition-colors p-1"
                        title="Copy"
                      >
                        {copiedId === key.id ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </td>
                    <td className="p-4 text-xs">
                      {new Date(key.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      {key.status === 'active' ? (
                        <span className="text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full text-xs font-medium">Active</span>
                      ) : (
                        <span className="text-red-400 bg-red-400/10 px-2 py-1 rounded-full text-xs font-medium">Revoked</span>
                      )}
                    </td>
                    <td className="p-4 text-right flex items-center justify-end gap-2">
                      <button 
                        onClick={() => openEditModal(key)}
                        className="text-blue-400 hover:text-blue-300 p-2 rounded-lg hover:bg-slate-800 transition-colors"
                        title="Edit API Key"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                      </button>
                      <button 
                        onClick={() => handleDelete(key.id)}
                        className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-slate-800 transition-colors"
                        title="Revoke and Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">Add New API Key</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 p-3 rounded-xl flex gap-2 text-sm">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p>Keys are stored securely. You will only be able to see the full key once after creation.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">Key Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 focus:outline-none focus:border-blue-500"
                  placeholder="e.g. Production SendGrid"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">Service Integration</label>
                <select
                  value={formData.service}
                  onChange={(e) => setFormData({...formData, service: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 focus:outline-none focus:border-blue-500 appearance-none"
                >
                  <option value="">Select Service...</option>
                  <option value="CrossRef API">CrossRef API</option>
                  <option value="Plagiarism Checker">Plagiarism Checker</option>
                  <option value="Email Service">Email Service (SendGrid/AWS)</option>
                  <option value="Google Scholar">Google Scholar</option>
                  <option value="Analytics">Analytics</option>
                  <option value="Other Integration">Other Integration</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">API Key Value {editingKeyId && '(Leave blank to keep existing)'}</label>
                <input 
                  type="text" 
                  value={formData.keyValue}
                  onChange={(e) => setFormData({...formData, keyValue: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 focus:outline-none focus:border-blue-500 font-mono text-sm"
                  placeholder={editingKeyId ? "Enter new key to replace..." : "Paste your API key here"}
                />
              </div>
            </div>

            <div className="p-5 border-t border-slate-800 flex justify-end gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={!formData.name || !formData.service || (!editingKeyId && !formData.keyValue)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors disabled:opacity-50"
              >
                {editingKeyId ? "Update Key" : "Save Key"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
