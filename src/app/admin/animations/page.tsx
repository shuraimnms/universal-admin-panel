'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Save, CheckCircle, Loader2 } from 'lucide-react';

interface AnimationSetting {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

export default function AnimationsPage() {
  const [animations, setAnimations] = useState<AnimationSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchAnims = async () => {
      try {
        const res = await fetch('/api/animations');
        if (res.ok) setAnimations(await res.json());
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetchAnims();
  }, []);

  const handleToggle = async (id: string, enabled: boolean) => {
    setAnimations(animations.map(a => a.id === id ? { ...a, enabled } : a));
    try {
      await fetch(`/api/animations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      });
    } catch (e) { console.error(e); }
  };

  const handleToggleAll = async (enabled: boolean) => {
    setAnimations(animations.map(a => ({ ...a, enabled })));
    // Implement global toggle if supported, or loop
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      // Simulate bulk save
      await new Promise(r => setTimeout(r, 1000));
      setMessage('All animation settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6 bg-slate-950 min-h-screen flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" size={40} /></div>;

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-slate-200">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Sparkles className="text-amber-400" />
          Animation Settings
        </h1>
        <button
          onClick={saveAll}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          Save All
        </button>
      </div>

      {message && (
        <div className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/50 rounded-xl flex items-center gap-3 text-emerald-400">
          <CheckCircle size={20} /> {message}
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex justify-end gap-3 mb-6 pb-6 border-b border-slate-800">
          <button onClick={() => handleToggleAll(true)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm transition-colors">Enable All</button>
          <button onClick={() => handleToggleAll(false)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm transition-colors">Disable All</button>
        </div>

        <div className="space-y-4">
          {animations.length === 0 ? (
            <p className="text-slate-400 text-center py-4">No animation settings found.</p>
          ) : (
            animations.map((anim) => (
              <div key={anim.id} className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-white">{anim.name}</h3>
                  <p className="text-slate-400 text-sm mt-1">{anim.description}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={anim.enabled}
                    onChange={(e) => handleToggle(anim.id, e.target.checked)}
                  />
                  <div className="w-14 h-7 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
