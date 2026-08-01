'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Building, Plus, MoreVertical, Edit, Trash2, Shield, Globe } from 'lucide-react';
import { toast } from 'sonner';

interface Site {
  id: string;
  name: string;
  abbreviation: string;
  domain: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function SitesManagementPage() {
  const { data: session } = useSession();
  const [sites, setSites] = useState<Site[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSites();
  }, []);

  const fetchSites = async () => {
    try {
      const res = await fetch('/api/admin/sites');
      if (res.ok) {
        const data = await res.json();
        setSites(data.sites || []);
      }
    } catch (error) {
      toast.error('Failed to load sites');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Building className="text-blue-500" />
            Sites Management
          </h1>
          <p className="text-slate-400 mt-1">Manage journals and their configurations across the multi-tenant system.</p>
        </div>
        
        <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
          <Plus size={16} />
          Create New Site
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <h2 className="text-lg font-semibold text-white">All Sites</h2>
          <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded text-xs font-medium">{sites.length} total</span>
        </div>
        
        {isLoading ? (
          <div className="p-8 text-center text-slate-400">Loading sites...</div>
        ) : (
          <div className="divide-y divide-slate-800">
            {sites.map((site) => (
              <div key={site.id} className="p-4 hover:bg-slate-800/50 transition-colors flex items-center justify-between group">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0 border border-slate-700">
                    <Building size={20} className="text-slate-400 group-hover:text-blue-400 transition-colors" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium flex items-center gap-2">
                      {site.name}
                      <span className="text-xs font-bold bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded uppercase tracking-wider">
                        {site.abbreviation}
                      </span>
                    </h3>
                    <div className="flex items-center gap-4 mt-1.5 text-sm text-slate-400">
                      <div className="flex items-center gap-1">
                        <Globe size={14} className="opacity-70" />
                        {site.domain || 'No custom domain'}
                      </div>
                      <div className="flex items-center gap-1">
                        <Shield size={14} className="opacity-70" />
                        {site.isActive ? <span className="text-emerald-400">Active</span> : <span className="text-slate-500">Inactive</span>}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
                    <Edit size={16} />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            {sites.length === 0 && (
              <div className="p-8 text-center text-slate-500">
                No sites found. Create one to get started.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
