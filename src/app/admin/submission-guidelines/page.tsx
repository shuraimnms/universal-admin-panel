'use client';

import { useState, useEffect } from 'react';
import { FileText, Save, Eye, EyeOff, Clock, Loader2 } from 'lucide-react';

interface Guidelines {
  id?: string;
  general: string;
  author: string;
  formatting: string;
  reviewProcess: string;
  updatedAt?: string;
}

export default function SubmissionGuidelinesPage() {
  const [data, setData] = useState<Guidelines>({
    general: '', author: '', formatting: '', reviewProcess: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState<string | null>(null);

  useEffect(() => {
    const fetchGuidelines = async () => {
      try {
        const res = await fetch('/api/submission-guidelines');
        if (res.ok) {
          const fetched = await res.json();
          if (fetched) setData(fetched);
        }
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetchGuidelines();
  }, []);

  const handleSave = async (section: keyof Guidelines) => {
    setSaving(true);
    try {
      await fetch('/api/submission-guidelines', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [section]: data[section] })
      });
      // Optionally update timestamp or notify user
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const sections: { key: keyof Guidelines, title: string }[] = [
    { key: 'general', title: 'General Guidelines' },
    { key: 'author', title: 'Author Guidelines' },
    { key: 'formatting', title: 'Formatting Requirements' },
    { key: 'reviewProcess', title: 'Review Process' },
  ];

  if (loading) return <div className="p-6 bg-slate-950 min-h-screen flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" size={40} /></div>;

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-slate-200">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
            <FileText className="text-blue-400" />
            Submission Guidelines
          </h1>
          {data.updatedAt && (
            <p className="text-slate-400 text-sm flex items-center gap-1">
              <Clock size={14} /> Last updated: {new Date(data.updatedAt).toLocaleString()}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-8">
        {sections.map(({ key, title }) => (
          <div key={key} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="flex justify-between items-center p-4 bg-slate-800/50 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white">{title}</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setPreviewMode(previewMode === key ? null : key)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm flex items-center gap-2 transition-colors"
                >
                  {previewMode === key ? <><EyeOff size={16} /> Edit</> : <><Eye size={16} /> Preview</>}
                </button>
                <button
                  onClick={() => handleSave(key)}
                  disabled={saving}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Save size={16} /> {saving ? 'Saving...' : 'Save Section'}
                </button>
              </div>
            </div>
            <div className="p-4">
              {previewMode === key ? (
                <div className="prose prose-invert max-w-none p-4 bg-slate-950 rounded-xl min-h-[200px]" dangerouslySetInnerHTML={{ __html: data[key]?.replace(/\n/g, '<br/>') || 'No content' }} />
              ) : (
                <textarea
                  value={data[key] as string}
                  onChange={(e) => setData({ ...data, [key]: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-4 min-h-[200px] focus:outline-none focus:border-blue-500 font-mono text-sm"
                  placeholder={`Enter ${title.toLowerCase()}... (Markdown supported)`}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
