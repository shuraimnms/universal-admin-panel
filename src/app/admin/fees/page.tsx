"use client";

import { useState, useEffect } from "react";
import { CreditCard, Edit2, CheckCircle, Clock, FileText, Trash2, Plus, AlertCircle, X } from "lucide-react";

interface FeeTier {
  id: string;
  authorType: string;
  amount: number;
  currency: string;
  description: string;
}

interface PaymentRecord {
  id: string;
  paperTitle: string;
  author: string;
  amount: number;
  status: 'PAID' | 'PENDING' | 'WAIVED';
  date: string;
}

export default function FeesPage() {
  const [feeTiers, setFeeTiers] = useState<FeeTier[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isTierModalOpen, setIsTierModalOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<FeeTier | null>(null);
  const [tierForm, setTierForm] = useState<Partial<FeeTier>>({
    authorType: "", amount: 0, currency: "USD", description: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Mock data
      setFeeTiers([
        { id: "1", authorType: "International Author", amount: 150, currency: "USD", description: "Standard APC for international submissions" },
        { id: "2", authorType: "National Author (India)", amount: 2500, currency: "INR", description: "Discounted APC for Indian authors" },
        { id: "3", authorType: "Student / Ph.D Scholar", amount: 100, currency: "USD", description: "Valid ID proof required" },
      ]);
      
      setPayments([
        { id: "p1", paperTitle: "AI in Healthcare: A Review", author: "John Doe", amount: 150, status: "PAID", date: new Date().toISOString() },
        { id: "p2", paperTitle: "Quantum Mechanics Fundamentals", author: "Jane Smith", amount: 100, status: "PENDING", date: new Date(Date.now() - 86400000).toISOString() },
        { id: "p3", paperTitle: "Renewable Energy Economics", author: "Raj Patel", amount: 2500, status: "WAIVED", date: new Date(Date.now() - 86400000 * 2).toISOString() },
      ]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTier = () => {
    if (editingTier) {
      setFeeTiers(tiers => tiers.map(t => t.id === editingTier.id ? { ...t, ...tierForm } as FeeTier : t));
    } else {
      setFeeTiers([...feeTiers, { ...tierForm, id: Math.random().toString() } as FeeTier]);
    }
    setIsTierModalOpen(false);
  };

  const handleDeleteTier = (id: string) => {
    if(confirm("Delete this fee tier?")) {
      setFeeTiers(tiers => tiers.filter(t => t.id !== id));
    }
  };

  const openAddTier = () => {
    setEditingTier(null);
    setTierForm({ authorType: "", amount: 0, currency: "USD", description: "" });
    setIsTierModalOpen(true);
  };

  const openEditTier = (tier: FeeTier) => {
    setEditingTier(tier);
    setTierForm({ ...tier });
    setIsTierModalOpen(true);
  };

  const updatePaymentStatus = (id: string, newStatus: 'PAID' | 'PENDING' | 'WAIVED') => {
    setPayments(payments.map(p => p.id === id ? { ...p, status: newStatus } : p));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full text-xs font-medium"><CheckCircle className="h-3 w-3" /> Paid</span>;
      case 'PENDING':
        return <span className="inline-flex items-center gap-1 text-amber-400 bg-amber-400/10 px-2 py-1 rounded-full text-xs font-medium"><Clock className="h-3 w-3" /> Pending</span>;
      case 'WAIVED':
        return <span className="inline-flex items-center gap-1 text-slate-400 bg-slate-800 px-2 py-1 rounded-full text-xs font-medium"><AlertCircle className="h-3 w-3" /> Waived</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <CreditCard className="h-6 w-6 text-blue-400" />
          Article Processing Charges (APC)
        </h1>
        <p className="text-slate-400 text-sm mt-1">Manage fee structures and track author payments.</p>
      </div>

      {/* Fee Structure Section */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white">Fee Structure & Tiers</h2>
          <button 
            onClick={openAddTier}
            className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 text-sm rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="h-4 w-4" /> Add Tier
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {feeTiers.map(tier => (
            <div key={tier.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative group">
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <button onClick={() => openEditTier(tier)} className="text-slate-400 hover:text-blue-400 bg-slate-800 p-1.5 rounded-lg"><Edit2 className="h-3.5 w-3.5" /></button>
                <button onClick={() => handleDeleteTier(tier.id)} className="text-slate-400 hover:text-red-400 bg-slate-800 p-1.5 rounded-lg"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
              <h3 className="text-white font-medium pr-16">{tier.authorType}</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-emerald-400">{tier.amount}</span>
                <span className="text-slate-400 font-medium">{tier.currency}</span>
              </div>
              <p className="mt-3 text-sm text-slate-500">{tier.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Payments Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Recent Payment Records</h2>
        
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-800/50 text-slate-300 border-b border-slate-800">
                <tr>
                  <th className="p-4 font-medium">Paper Details</th>
                  <th className="p-4 font-medium">Author</th>
                  <th className="p-4 font-medium">Amount</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-400">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2 max-w-xs">
                        <FileText className="h-4 w-4 text-blue-400 flex-shrink-0" />
                        <span className="text-white font-medium truncate">{payment.paperTitle}</span>
                      </div>
                    </td>
                    <td className="p-4">{payment.author}</td>
                    <td className="p-4 font-medium">{payment.amount}</td>
                    <td className="p-4">{getStatusBadge(payment.status)}</td>
                    <td className="p-4 text-xs">{new Date(payment.date).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                      <select 
                        value={payment.status}
                        onChange={(e) => updatePaymentStatus(payment.id, e.target.value as any)}
                        className="bg-slate-800 border border-slate-700 text-white rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-blue-500"
                      >
                        <option value="PENDING">Mark Pending</option>
                        <option value="PAID">Mark Paid</option>
                        <option value="WAIVED">Mark Waived</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Tier Modal */}
      {isTierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">
                {editingTier ? "Edit Fee Tier" : "Add Fee Tier"}
              </h2>
              <button onClick={() => setIsTierModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">Author Type / Category</label>
                <input 
                  type="text" 
                  value={tierForm.authorType}
                  onChange={(e) => setTierForm({...tierForm, authorType: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 focus:outline-none focus:border-blue-500"
                  placeholder="e.g. International Author"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-300">Amount</label>
                  <input 
                    type="number" 
                    value={tierForm.amount}
                    onChange={(e) => setTierForm({...tierForm, amount: parseInt(e.target.value)})}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-300">Currency</label>
                  <select 
                    value={tierForm.currency}
                    onChange={(e) => setTierForm({...tierForm, currency: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 focus:outline-none focus:border-blue-500"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">Description</label>
                <textarea 
                  value={tierForm.description}
                  onChange={(e) => setTierForm({...tierForm, description: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 focus:outline-none focus:border-blue-500 h-20 resize-none"
                  placeholder="Optional details about this tier..."
                />
              </div>
            </div>

            <div className="p-5 border-t border-slate-800 flex justify-end gap-3">
              <button 
                onClick={() => setIsTierModalOpen(false)}
                className="px-4 py-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveTier}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors"
              >
                Save Tier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
