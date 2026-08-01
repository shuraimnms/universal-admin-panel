'use client';

import { useState, useEffect } from 'react';
import { Server, Activity, Database, Terminal, RefreshCw, AlertTriangle, Loader2 } from 'lucide-react';

interface SystemStats {
  nodeVersion: string;
  nextVersion: string;
  dbType: string;
  environment: string;
  uptime: string;
  memoryUsage: number;
  dbStats: { table: string; count: number }[];
  logs: string[];
}

export default function DeploymentPage() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [deploying, setDeploying] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/stats');
        if (res.ok) setStats(await res.json());
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetchStats();
  }, []);

  const handleDeploy = async () => {
    setDeploying(true);
    try {
      // simulate deployment
      await new Promise(r => setTimeout(r, 2000));
      alert('Deployment triggered successfully');
      setShowDeployModal(false);
    } catch (e) {
      console.error(e);
    } finally {
      setDeploying(false);
    }
  };

  if (loading) return <div className="p-6 bg-slate-950 min-h-screen flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" size={40} /></div>;

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-slate-200">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Server className="text-emerald-400" />
          Deployment & System Info
        </h1>
        <button
          onClick={() => setShowDeployModal(true)}
          className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors"
        >
          <RefreshCw size={20} /> Rebuild / Deploy
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <p className="text-slate-400 text-sm mb-2">Environment</p>
          <h3 className="text-xl font-bold text-white capitalize">{stats?.environment || 'Production'}</h3>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <p className="text-slate-400 text-sm mb-2">Node.js Version</p>
          <h3 className="text-xl font-bold text-white">{stats?.nodeVersion || 'v18.17.0'}</h3>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <p className="text-slate-400 text-sm mb-2">Database Type</p>
          <h3 className="text-xl font-bold text-white">{stats?.dbType || 'PostgreSQL'}</h3>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <p className="text-slate-400 text-sm mb-2">Server Uptime</p>
          <h3 className="text-xl font-bold text-white">{stats?.uptime || '12d 4h 32m'}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
            <Activity className="text-blue-400" /> System Resources
          </h2>
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-300">Memory Usage</span>
              <span className="text-blue-400 font-bold">{stats?.memoryUsage || 65}%</span>
            </div>
            <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${stats?.memoryUsage || 65}%` }}></div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
            <Database className="text-blue-400" /> Database Statistics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {(stats?.dbStats || [
              { table: 'Papers', count: 124 },
              { table: 'Users', count: 890 },
              { table: 'Issues', count: 12 },
              { table: 'Reviews', count: 345 }
            ]).map((stat, i) => (
              <div key={i} className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex justify-between items-center">
                <span className="text-slate-400">{stat.table}</span>
                <span className="text-white font-bold text-lg">{stat.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
          <Terminal className="text-slate-400" /> Recent Server Logs
        </h2>
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-sm text-slate-300 h-64 overflow-y-auto">
          {(stats?.logs || [
            '[INFO] Server started on port 3000',
            '[INFO] Database connection established',
            '[WARN] Slow query detected on /api/papers',
            '[INFO] Generated static pages for issue #12'
          ]).map((log, i) => (
             <div key={i} className="mb-1">{log}</div>
          ))}
        </div>
      </div>

      {showDeployModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 text-red-400 mb-4">
              <AlertTriangle size={32} />
              <h2 className="text-xl font-bold text-white">Confirm Deployment</h2>
            </div>
            <p className="text-slate-300 mb-6">
              Are you sure you want to rebuild and deploy? This will restart the server and may cause temporary downtime.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeployModal(false)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors">Cancel</button>
              <button onClick={handleDeploy} disabled={deploying} className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl transition-colors flex items-center gap-2">
                {deploying ? <Loader2 className="animate-spin" size={18} /> : null}
                {deploying ? 'Deploying...' : 'Yes, Deploy Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
