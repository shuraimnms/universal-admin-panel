"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Plus, Edit2, X, Save } from "lucide-react";

interface ImpactFactor {
  id: string;
  year: number;
  impactFactor: number;
  hIndex: number;
  citationsCount: number;
  notes?: string;
  updatedAt: string;
}

export default function ImpactFactorsPage() {
  const [factors, setFactors] = useState<ImpactFactor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ImpactFactor | null>(null);
  
  const [formData, setFormData] = useState<Partial<ImpactFactor>>({
    year: new Date().getFullYear(),
    impactFactor: 0,
    hIndex: 0,
    citationsCount: 0,
    notes: ""
  });

  useEffect(() => {
    fetchFactors();
  }, []);

  const fetchFactors = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/impact-factors").catch(() => null);
      if (res?.ok) {
        setFactors(await res.json());
      } else {
        // Mock data sorted by year desc
        setFactors([
          { id: "1", year: 2023, impactFactor: 4.25, hIndex: 18, citationsCount: 1250, updatedAt: new Date().toISOString() },
          { id: "2", year: 2022, impactFactor: 3.85, hIndex: 15, citationsCount: 980, updatedAt: new Date().toISOString() },
          { id: "3", year: 2021, impactFactor: 3.10, hIndex: 12, citationsCount: 750, updatedAt: new Date().toISOString() },
          { id: "4", year: 2020, impactFactor: 2.45, hIndex: 9, citationsCount: 520, updatedAt: new Date().toISOString() },
        ]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: ImpactFactor) => {
    setEditingItem(item);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({
      year: new Date().getFullYear(),
      impactFactor: 0,
      hIndex: 0,
      citationsCount: 0,
      notes: ""
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingItem) {
        setFactors(factors.map(f => f.id === editingItem.id ? { ...f, ...formData, updatedAt: new Date().toISOString() } as ImpactFactor : f));
      } else {
        setFactors([{ ...formData, id: Math.random().toString(), updatedAt: new Date().toISOString() } as ImpactFactor, ...factors].sort((a,b) => b.year - a.year));
      }
      setIsModalOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  const maxIF = Math.max(...factors.map(f => f.impactFactor), 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-blue-400" />
            Impact Factors
          </h1>
          <p className="text-slate-400 text-sm mt-1">Manage journal metrics and historical impact factor records.</p>
        </div>
        <button 
          onClick={handleAdd}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Record
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Trend Graph */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:col-span-1">
          <h2 className="text-lg font-semibold text-white mb-6">Impact Factor Trend</h2>
          <div className="h-64 flex items-end justify-between gap-2 pb-6 relative">
            {factors.slice().reverse().map(f => {
              const height = (f.impactFactor / maxIF) * 100;
              return (
                <div key={f.id} className="w-full flex flex-col items-center gap-2 group">
                  <div className="text-xs text-blue-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    {f.impactFactor}
                  </div>
                  <div 
                    className="w-full bg-blue-500/80 rounded-t-sm hover:bg-blue-400 transition-colors relative"
                    style={{ height: `${height}%`, minHeight: '4px' }}
                  />
                  <div className="text-xs text-slate-400 font-medium mt-1">{f.year}</div>
                </div>
              );
            })}
            
            {/* Y-axis lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-12 opacity-20">
              <div className="border-b border-slate-500 w-full"></div>
              <div className="border-b border-slate-500 w-full"></div>
              <div className="border-b border-slate-500 w-full"></div>
              <div className="border-b border-slate-500 w-full"></div>
            </div>
          </div>
        </div>

        {/* Records Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden lg:col-span-2 flex flex-col">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-800/50 text-slate-300 border-b border-slate-800">
                <tr>
                  <th className="p-4 font-medium">Year</th>
                  <th className="p-4 font-medium">Impact Factor</th>
                  <th className="p-4 font-medium">H-Index</th>
                  <th className="p-4 font-medium">Citations</th>
                  <th className="p-4 font-medium">Last Updated</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-400">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">Loading metrics...</td>
                  </tr>
                ) : factors.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">No records found.</td>
                  </tr>
                ) : (
                  factors.map((factor) => (
                    <tr key={factor.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-4 text-white font-medium">{factor.year}</td>
                      <td className="p-4">
                        <span className="text-blue-400 font-bold bg-blue-400/10 px-2 py-1 rounded-md">
                          {factor.impactFactor.toFixed(3)}
                        </span>
                      </td>
                      <td className="p-4">{factor.hIndex}</td>
                      <td className="p-4">{factor.citationsCount.toLocaleString()}</td>
                      <td className="p-4 text-xs">
                        {new Date(factor.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => handleEdit(factor)}
                          className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
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
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">
                {editingItem ? `Edit ${editingItem.year} Metrics` : "Add Yearly Metrics"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">Year</label>
                <input 
                  type="number" 
                  value={formData.year}
                  onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-300">Impact Factor</label>
                  <input 
                    type="number" 
                    step="0.001"
                    value={formData.impactFactor}
                    onChange={(e) => setFormData({...formData, impactFactor: parseFloat(e.target.value)})}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-300">H-Index</label>
                  <input 
                    type="number" 
                    value={formData.hIndex}
                    onChange={(e) => setFormData({...formData, hIndex: parseInt(e.target.value)})}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">Total Citations Count</label>
                <input 
                  type="number" 
                  value={formData.citationsCount}
                  onChange={(e) => setFormData({...formData, citationsCount: parseInt(e.target.value)})}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 focus:outline-none focus:border-blue-500"
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
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors flex items-center gap-2"
              >
                <Save className="h-4 w-4" /> Save Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
