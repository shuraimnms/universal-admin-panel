'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Filter, Shield, User, GraduationCap, 
  Ban, AlertTriangle, Eye, ChevronLeft, ChevronRight, Edit
} from 'lucide-react';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  institution: string;
  joinedAt: string;
}

interface Stats {
  total: number;
  active: number;
  banned: number;
  admins: number;
}

export default function UsersListPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, banned: 0, admins: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [role, setRole] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        search,
        role: role !== 'ALL' ? role : '',
        status: statusFilter !== 'ALL' ? statusFilter : '',
        page: page.toString(),
        limit: '10'
      });
      const res = await fetch(`/api/admin/users?${query}`);
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data.users || []);
      setTotalPages(data.totalPages || 1);
      if (data.stats) setStats(data.stats);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, role, statusFilter, page]);

  const handleBanToggle = async (id: string, currentStatus: string) => {
    try {
      const isBanned = currentStatus !== 'BANNED';
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBanned })
      });
      if (res.ok) {
        fetchUsers();
      } else {
        throw new Error('Failed to update user status');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const getRoleBadge = (r: string) => {
    switch (r) {
      case 'ADMIN': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'REVIEWER': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">User Management</h1>
          <p className="text-slate-400 mt-1">Manage platform users, roles, and access.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Users', value: stats.total, icon: Users, color: 'text-blue-400' },
          { label: 'Active', value: stats.active, icon: User, color: 'text-green-400' },
          { label: 'Banned', value: stats.banned, icon: Ban, color: 'text-red-400' },
          { label: 'Admins', value: stats.admins, icon: Shield, color: 'text-purple-400' }
        ].map((s, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">{s.label}</p>
              <p className="text-3xl font-bold text-white mt-2">{s.value}</p>
            </div>
            <div className={`p-4 bg-slate-950 rounded-xl ${s.color}`}>
              <s.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search users..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <select 
            value={role} onChange={(e) => setRole(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="REVIEWER">Reviewer</option>
            <option value="AUTHOR">Author</option>
          </select>
          <select 
            value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="BANNED">Banned</option>
            <option value="WARNED">Warned</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-3 font-medium px-4">User</th>
                <th className="pb-3 font-medium px-4">Role</th>
                <th className="pb-3 font-medium px-4">Status</th>
                <th className="pb-3 font-medium px-4">Institution</th>
                <th className="pb-3 font-medium px-4">Joined</th>
                <th className="pb-3 font-medium px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-800/50">
                    <td className="py-4 px-4"><div className="flex gap-3"><div className="h-10 w-10 bg-slate-800 rounded-full animate-pulse"></div><div className="space-y-2"><div className="h-4 bg-slate-800 rounded w-24 animate-pulse"></div><div className="h-3 bg-slate-800 rounded w-32 animate-pulse"></div></div></div></td>
                    <td className="py-4 px-4"><div className="h-6 bg-slate-800 rounded-full w-20 animate-pulse"></div></td>
                    <td className="py-4 px-4"><div className="h-4 bg-slate-800 rounded w-16 animate-pulse"></div></td>
                    <td className="py-4 px-4"><div className="h-4 bg-slate-800 rounded w-24 animate-pulse"></div></td>
                    <td className="py-4 px-4"><div className="h-4 bg-slate-800 rounded w-20 animate-pulse"></div></td>
                    <td className="py-4 px-4"><div className="h-8 bg-slate-800 rounded w-24 ml-auto animate-pulse"></div></td>
                  </tr>
                ))
              ) : error ? (
                <tr><td colSpan={6} className="py-8 text-center text-red-400">{error}</td></tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Users className="mx-auto h-12 w-12 mb-4 text-slate-600" />
                    <p>No users found.</p>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b border-slate-800 hover:bg-slate-800/20 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-medium">
                          {getInitials(user.name)}
                        </div>
                        <div>
                          <p className="font-medium text-white">{user.name}</p>
                          <p className="text-sm text-slate-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadge(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`flex items-center gap-1 text-sm ${user.status === 'BANNED' ? 'text-red-400' : 'text-green-400'}`}>
                        {user.status === 'BANNED' ? <Ban size={14} /> : <div className="w-2 h-2 rounded-full bg-green-400" />}
                        {user.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-300">{user.institution || '-'}</td>
                    <td className="py-4 px-4 text-slate-400">
                      {new Date(user.joinedAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors" title="View details">
                          <Eye size={18} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-colors" title="Warn user">
                          <AlertTriangle size={18} />
                        </button>
                        <button 
                          onClick={() => handleBanToggle(user.id, user.status)}
                          className={`p-2 rounded-lg transition-colors ${
                            user.status === 'BANNED' 
                              ? 'text-green-400 hover:bg-green-500/10' 
                              : 'text-red-400 hover:bg-red-500/10'
                          }`}
                          title={user.status === 'BANNED' ? 'Unban user' : 'Ban user'}
                        >
                          <Ban size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && users.length > 0 && (
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-800">
            <p className="text-sm text-slate-400">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 hover:bg-slate-800 disabled:opacity-50 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 hover:bg-slate-800 disabled:opacity-50 transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
