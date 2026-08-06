"use client";

import { useState, useEffect } from "react";
import { Settings, Save, AlertCircle, Shield, Mail, FileUp, Globe } from "lucide-react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [toast, setToast] = useState<{msg: string, type: 'success'|'error'} | null>(null);

  const [settings, setSettings] = useState({
    maintenance: {
      enabled: false,
      message: "We are currently undergoing maintenance. Please check back later."
    },
    site: {
      name: "IJARCM",
      tagline: "International Journal of Advanced Research",
      contactEmail: "contact@ijarcm.org",
      issnPrint: "1234-5678",
      issnOnline: "8765-4321"
    },
    submission: {
      allowSubmissions: true,
      maxFileSize: 10,
      acceptedTypes: ".pdf,.doc,.docx"
    },
    email: {
      notifySubmission: true,
      notifyPublished: true,
      notifyReviewAssigned: true
    }
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      // Mock fetch
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const showToast = (msg: string, type: 'success'|'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async (section: string) => {
    setSavingSection(section);
    try {
      // Mock save API
      await new Promise(r => setTimeout(r, 800));
      showToast(`${section} settings saved successfully!`, 'success');
    } catch (error) {
      showToast(`Failed to save ${section} settings`, 'error');
    } finally {
      setSavingSection(null);
    }
  };

  const updateSetting = (category: keyof typeof settings, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading settings...</div>;
  }

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="h-6 w-6 text-blue-400" />
          System Settings
        </h1>
        <p className="text-slate-400 text-sm mt-1">Configure core platform behaviors and information.</p>
      </div>

      {toast && (
        <div className={`fixed top-4 right-4 px-4 py-3 rounded-xl flex items-center gap-2 shadow-lg border ${
          toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
        } animate-in fade-in slide-in-from-top-2 z-50`}>
          <AlertCircle className="h-5 w-5" />
          {toast.msg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Crossref Settings */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-rose-500/10 rounded-xl text-rose-400">
                <Globe className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold text-white">Crossref Integration</h2>
            </div>
            <p className="text-sm text-slate-400 mb-6">
              Manage your publisher credentials, journal configurations, and automated DOI deposit settings for Crossref.
            </p>
          </div>
          
          <div className="pt-2">
            <a 
              href="/admin/crossref/settings"
              className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2 transition-colors border border-slate-700 w-full font-bold shadow-lg"
            >
              Configure Crossref ➔
            </a>
          </div>
        </div>

        {/* Maintenance Mode */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-400">
              <Shield className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold text-white">Maintenance Mode</h2>
          </div>
          
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Enable Maintenance Mode</p>
                <p className="text-sm text-slate-400">Disable public access to the site</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={settings.maintenance.enabled}
                  onChange={(e) => updateSetting('maintenance', 'enabled', e.target.checked)}
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Maintenance Message</label>
              <textarea 
                value={settings.maintenance.message}
                onChange={(e) => updateSetting('maintenance', 'message', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 focus:outline-none focus:border-amber-500 transition-colors h-24 resize-none"
                disabled={!settings.maintenance.enabled}
              />
            </div>
            
            <div className="pt-2">
              <button 
                onClick={() => handleSave('Maintenance')}
                disabled={savingSection === 'Maintenance'}
                className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <Save className="h-4 w-4" /> Save Maintenance
              </button>
            </div>
          </div>
        </div>

        {/* Site Information */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400">
              <Globe className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold text-white">Site Information</h2>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">Site Name</label>
                <input 
                  type="text" 
                  value={settings.site.name}
                  onChange={(e) => updateSetting('site', 'name', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">Contact Email</label>
                <input 
                  type="email" 
                  value={settings.site.contactEmail}
                  onChange={(e) => updateSetting('site', 'contactEmail', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Tagline</label>
              <input 
                type="text" 
                value={settings.site.tagline}
                onChange={(e) => updateSetting('site', 'tagline', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">ISSN (Print)</label>
                <input 
                  type="text" 
                  value={settings.site.issnPrint}
                  onChange={(e) => updateSetting('site', 'issnPrint', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">ISSN (Online)</label>
                <input 
                  type="text" 
                  value={settings.site.issnOnline}
                  onChange={(e) => updateSetting('site', 'issnOnline', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
            
            <div className="pt-2">
              <button 
                onClick={() => handleSave('Site')}
                disabled={savingSection === 'Site'}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <Save className="h-4 w-4" /> Save Information
              </button>
            </div>
          </div>
        </div>

        {/* Submission Settings */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400">
              <FileUp className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold text-white">Submission Settings</h2>
          </div>
          
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Allow New Submissions</p>
                <p className="text-sm text-slate-400">Enable authors to submit new papers</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={settings.submission.allowSubmissions}
                  onChange={(e) => updateSetting('submission', 'allowSubmissions', e.target.checked)}
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">Max File Size (MB)</label>
                <input 
                  type="number" 
                  value={settings.submission.maxFileSize}
                  onChange={(e) => updateSetting('submission', 'maxFileSize', parseInt(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">Accepted Types</label>
                <input 
                  type="text" 
                  value={settings.submission.acceptedTypes}
                  onChange={(e) => updateSetting('submission', 'acceptedTypes', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>
            
            <div className="pt-2">
              <button 
                onClick={() => handleSave('Submission')}
                disabled={savingSection === 'Submission'}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <Save className="h-4 w-4" /> Save Submissions
              </button>
            </div>
          </div>
        </div>

        {/* Email Notifications */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-400">
              <Mail className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold text-white">Email Notifications</h2>
          </div>
          
          <div className="space-y-5">
            {[
              { id: 'notifySubmission', label: 'Paper Submitted', desc: 'Notify admins when a new paper is submitted' },
              { id: 'notifyPublished', label: 'Paper Published', desc: 'Notify author when their paper is published' },
              { id: 'notifyReviewAssigned', label: 'Review Assigned', desc: 'Notify reviewers when assigned to a paper' }
            ].map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">{item.label}</p>
                  <p className="text-sm text-slate-400">{item.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={(settings.email as any)[item.id]}
                    onChange={(e) => updateSetting('email', item.id, e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                </label>
              </div>
            ))}
            
            <div className="pt-2">
              <button 
                onClick={() => handleSave('Email')}
                disabled={savingSection === 'Email'}
                className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <Save className="h-4 w-4" /> Save Emails
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
