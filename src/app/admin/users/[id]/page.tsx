'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Shield, AlertTriangle, FileText, Ban, CheckCircle, Clock } from 'lucide-react';

export default function ViewUserPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [role, setRole] = useState('');
  const [warningMessage, setWarningMessage] = useState('');
  const [savingAction, setSavingAction] = useState(false);

  useEffect(() => {
    fetchUser();
  }, [params.id]);

  const fetchUser = async () => {
    try {
      const res = await fetch(`/api/admin/users/${params.id}`);
      if (!res.ok) throw new Error('Failed to fetch user');
      const data = await res.json();
      setUser(data);
      setRole(data.role);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (payload: any) => {
    setSavingAction(true);
    try {
      const res = await fetch(`/api/admin/users/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Action failed');
      fetchUser();
      if (payload.warningMessage) setWarningMessage('');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSavingAction(false);
    }
  };

  if (loading) return <div className="p-8 text-white">Loading...</div>;
  if (error) return <div className="p-8 text-red-400">Error: {error}</div>;
  if (!user) return <div className="p-8 text-white">User not found</div>;

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-white font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => router.push('/admin/users')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Users
          </button>
          <button 
            onClick={() => router.push(`/admin/users/${params.id}/edit`)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl transition-colors"
          >
            <User className="w-4 h-4" /> Edit User
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-blue-500 flex items-center justify-center text-3xl font-bold text-slate-300">
                {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">{user.firstName} {user.lastName}</h1>
                <p className="text-slate-400 mb-3">{user.email}</p>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-blue-900/50 text-blue-400 border border-blue-800 rounded-full text-sm font-medium">
                    {user.role}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${user.isBanned ? 'bg-red-900/50 text-red-400 border-red-800' : 'bg-emerald-900/50 text-emerald-400 border-emerald-800'}`}>
                    {user.isBanned ? 'Banned' : 'Active'}
                  </span>
                  {user.isVerified && (
                    <span className="px-3 py-1 bg-emerald-900/50 text-emerald-400 border border-emerald-800 rounded-full text-sm font-medium flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Verified
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <div className="text-sm text-slate-500 mb-1">Institution</div>
                <div className="font-medium">{user.institution || 'N/A'}</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <div className="text-sm text-slate-500 mb-1">Phone</div>
                <div className="font-medium">{user.phone || 'N/A'}</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <div className="text-sm text-slate-500 mb-1">Joined</div>
                <div className="font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  {new Date(user.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-xl font-semibold mb-4">Bio</h2>
              <p className="text-slate-300 leading-relaxed">{user.bio || 'No bio provided.'}</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" /> Papers Submitted
              </h2>
              {user.papers && user.papers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="text-xs uppercase bg-slate-800 text-slate-400">
                      <tr>
                        <th className="px-4 py-3 rounded-tl-lg">Title</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 rounded-tr-lg">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {user.papers.map((paper: any) => (
                        <tr key={paper.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                          <td className="px-4 py-3 font-medium text-white max-w-xs truncate">{paper.title}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 bg-slate-800 rounded-full text-xs">{paper.status}</span>
                          </td>
                          <td className="px-4 py-3">{new Date(paper.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-slate-400">No papers submitted yet.</p>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-400" /> Actions
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Change Role</label>
                  <div className="flex gap-2">
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="flex-1 bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none"
                    >
                      <option value="USER">User</option>
                      <option value="AUTHOR">Author</option>
                      <option value="REVIEWER">Reviewer</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                    <button
                      onClick={() => handleUpdate({ role })}
                      disabled={savingAction || role === user.role}
                      className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-xl text-sm transition-colors disabled:opacity-50"
                    >
                      Save
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-slate-300">Account Verification</span>
                    <button
                      onClick={() => handleUpdate({ isVerified: !user.isVerified })}
                      disabled={savingAction}
                      className={`px-3 py-1 rounded-xl text-sm font-medium transition-colors ${user.isVerified ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-emerald-600 text-white hover:bg-emerald-500'}`}
                    >
                      {user.isVerified ? 'Unverify' : 'Verify User'}
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-300">Account Access</span>
                    <button
                      onClick={() => handleUpdate({ isBanned: !user.isBanned })}
                      disabled={savingAction}
                      className={`flex items-center gap-1 px-3 py-1 rounded-xl text-sm font-medium transition-colors ${user.isBanned ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-red-600 text-white hover:bg-red-500'}`}
                    >
                      <Ban className="w-3 h-3" /> {user.isBanned ? 'Unban User' : 'Ban User'}
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <label className="block text-sm font-medium text-slate-400 mb-2">Issue Warning</label>
                  <textarea
                    value={warningMessage}
                    onChange={(e) => setWarningMessage(e.target.value)}
                    placeholder="Describe the reason for the warning..."
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none mb-2"
                    rows={3}
                  />
                  <button
                    onClick={() => handleUpdate({ warningMessage })}
                    disabled={savingAction || !warningMessage.trim()}
                    className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-3 py-2 rounded-xl text-sm transition-colors disabled:opacity-50"
                  >
                    <AlertTriangle className="w-4 h-4" /> Send Warning
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
