'use client';

import { useState, useEffect } from 'react';
import { GitMerge, Users, Plus, Edit2, Trash2, X, Calendar, Loader2 } from 'lucide-react';

interface ProcessStep {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
}

interface ReviewAssignment {
  id: string;
  paperTitle: string;
  reviewerName: string;
  dueDate: string;
  status: 'PENDING' | 'COMPLETED' | 'OVERDUE';
  score?: number;
  recommendation?: string;
}

export default function PeerReviewProcessPage() {
  const [activeTab, setActiveTab] = useState<'steps' | 'assignments'>('steps');
  
  const [steps, setSteps] = useState<ProcessStep[]>([]);
  const [assignments, setAssignments] = useState<ReviewAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  const [isStepModalOpen, setIsStepModalOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<ProcessStep | null>(null);
  const [stepFormData, setStepFormData] = useState({ stepNumber: 1, title: '', description: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stepsRes, assignRes] = await Promise.all([
          fetch('/api/peer-review-process').catch(() => null),
          fetch('/api/review-assignments').catch(() => null)
        ]);
        if (stepsRes?.ok) setSteps(await stepsRes.json());
        if (assignRes?.ok) setAssignments(await assignRes.json());
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const handleSaveStep = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingStep ? `/api/peer-review-process/${editingStep.id}` : '/api/peer-review-process';
    const method = editingStep ? 'PATCH' : 'POST';
    try {
      await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(stepFormData) });
      setIsStepModalOpen(false);
      // refetch steps
    } catch (e) { console.error(e); }
  };

  const handleDeleteStep = async (id: string) => {
    if (!confirm('Delete this step?')) return;
    try {
      await fetch(`/api/peer-review-process/${id}`, { method: 'DELETE' });
    } catch (e) { console.error(e); }
  };

  const openStepModal = (step?: ProcessStep) => {
    if (step) {
      setEditingStep(step);
      setStepFormData(step);
    } else {
      setEditingStep(null);
      setStepFormData({ stepNumber: steps.length + 1, title: '', description: '' });
    }
    setIsStepModalOpen(true);
  };

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-slate-200">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <GitMerge className="text-purple-400" />
          Peer Review Process
        </h1>
        {activeTab === 'steps' && (
          <button onClick={() => openStepModal()} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl flex items-center gap-2">
            <Plus size={20} /> Add Step
          </button>
        )}
      </div>

      <div className="flex gap-4 mb-6 border-b border-slate-800">
        <button
          onClick={() => setActiveTab('steps')}
          className={`pb-4 px-2 font-semibold transition-colors ${activeTab === 'steps' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-white'}`}
        >
          Process Steps
        </button>
        <button
          onClick={() => setActiveTab('assignments')}
          className={`pb-4 px-2 font-semibold transition-colors ${activeTab === 'assignments' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-white'}`}
        >
          Review Assignments
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" size={40} /></div>
      ) : activeTab === 'steps' ? (
        <div className="space-y-4">
          {steps.length === 0 ? <p className="text-slate-400">No process steps defined.</p> : steps.sort((a, b) => a.stepNumber - b.stepNumber).map(step => (
            <div key={step.id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-xl font-bold text-blue-400">{step.stepNumber}</div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white">{step.title}</h3>
                <p className="text-slate-400 text-sm mt-1">{step.description}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openStepModal(step)} className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg"><Edit2 size={18} /></button>
                <button onClick={() => handleDeleteStep(step.id)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg"><Trash2 size={18} /></button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-800/50 border-b border-slate-800">
              <tr>
                <th className="p-4 font-semibold text-slate-300">Paper Title</th>
                <th className="p-4 font-semibold text-slate-300">Reviewer</th>
                <th className="p-4 font-semibold text-slate-300">Due Date</th>
                <th className="p-4 font-semibold text-slate-300">Status</th>
                <th className="p-4 font-semibold text-slate-300">Outcome</th>
                <th className="p-4 font-semibold text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {assignments.length === 0 ? (
                <tr><td colSpan={6} className="p-4 text-center text-slate-500">No assignments found</td></tr>
              ) : assignments.map(a => (
                <tr key={a.id} className="hover:bg-slate-800/20">
                  <td className="p-4 font-medium text-white max-w-[200px] truncate">{a.paperTitle}</td>
                  <td className="p-4 text-slate-300 flex items-center gap-2"><Users size={16} className="text-slate-500" /> {a.reviewerName}</td>
                  <td className="p-4 text-slate-300 flex items-center gap-2"><Calendar size={16} className="text-slate-500" /> {new Date(a.dueDate).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-lg text-xs ${
                      a.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' :
                      a.status === 'OVERDUE' ? 'bg-red-500/20 text-red-400' :
                      'bg-amber-500/20 text-amber-400'
                    }`}>{a.status}</span>
                  </td>
                  <td className="p-4 text-slate-300">{a.status === 'COMPLETED' ? `${a.score}/10 - ${a.recommendation}` : '-'}</td>
                  <td className="p-4">
                    <button className="text-blue-400 hover:underline text-xs">Reassign</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isStepModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">{editingStep ? 'Edit Step' : 'Add Step'}</h2>
              <button onClick={() => setIsStepModalOpen(false)} className="text-slate-400 hover:text-white"><X /></button>
            </div>
            <form onSubmit={handleSaveStep} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Step Number</label>
                <input type="number" required value={stepFormData.stepNumber} onChange={e => setStepFormData({...stepFormData, stepNumber: parseInt(e.target.value)})} className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Title</label>
                <input required value={stepFormData.title} onChange={e => setStepFormData({...stepFormData, title: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Description</label>
                <textarea rows={3} required value={stepFormData.description} onChange={e => setStepFormData({...stepFormData, description: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsStepModalOpen(false)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl">Save Step</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
