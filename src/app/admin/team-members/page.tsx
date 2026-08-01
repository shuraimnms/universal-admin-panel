'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Users, X, Loader2, Search } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  position: string;
  department: string;
  email: string;
  bio: string;
  photoUrl: string;
  displayOrder: number;
}

export default function TeamMembersPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    department: '',
    email: '',
    bio: '',
    photoUrl: '',
    displayOrder: 0
  });

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/team-members');
      if (res.ok) {
        const data = await res.json();
        setMembers(data.teamMembers || []);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleOpenModal = (member?: TeamMember) => {
    if (member) {
      setEditingMember(member);
      setFormData({
        name: member.name,
        position: member.position || '',
        department: member.department || '',
        email: member.email || '',
        bio: member.bio || '',
        photoUrl: member.photoUrl || '',
        displayOrder: member.displayOrder || 0
      });
    } else {
      setEditingMember(null);
      setFormData({
        name: '',
        position: '',
        department: '',
        email: '',
        bio: '',
        photoUrl: '',
        displayOrder: 0
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingMember 
        ? `/api/team-members/${editingMember.id}` 
        : '/api/team-members';
      
      const method = editingMember ? 'PATCH' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setIsModalOpen(false);
        fetchMembers();
      }
    } catch (error) {
      console.error('Error saving member:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this team member?')) return;
    try {
      const res = await fetch(`/api/team-members/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchMembers();
      }
    } catch (error) {
      console.error('Error deleting member:', error);
    }
  };

  const safeMembers = Array.isArray(members) ? members : [];
  const filteredMembers = safeMembers.filter(m => 
    m.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.position?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.department?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen bg-slate-950 text-white">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Team Members</h1>
          <p className="text-slate-400 mt-2">Manage the internal team members</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl transition-colors"
        >
          <Plus size={20} />
          Add Member
        </button>
      </div>

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={20} />
        <input 
          type="text"
          placeholder="Search members by name, role, or department..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-blue-500"
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-blue-500" size={40} />
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
          <Users className="mx-auto text-slate-600 mb-4" size={48} />
          <h3 className="text-xl font-semibold mb-2">No members found</h3>
          <p className="text-slate-400">Click the Add Member button to create one.</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 text-sm uppercase">
                <tr>
                  <th className="px-6 py-4 font-medium">Member</th>
                  <th className="px-6 py-4 font-medium">Role/Position</th>
                  <th className="px-6 py-4 font-medium">Department</th>
                  <th className="px-6 py-4 font-medium">Email</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden border border-slate-700 flex items-center justify-center shrink-0">
                          {member.photoUrl ? (
                            <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-sm font-bold text-slate-400">
                              {member.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                            </span>
                          )}
                        </div>
                        <div className="font-medium text-white">{member.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-300">{member.position}</td>
                    <td className="px-6 py-4 text-slate-400">{member.department}</td>
                    <td className="px-6 py-4 text-blue-400 text-sm">{member.email}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleOpenModal(member)}
                          className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(member.id)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center sticky top-0 bg-slate-900 z-10">
              <h2 className="text-2xl font-bold">{editingMember ? 'Edit Team Member' : 'Add Team Member'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Name</label>
                  <input 
                    type="text" required
                    value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Role/Position</label>
                  <input 
                    type="text" required
                    value={formData.position} onChange={(e) => setFormData({...formData, position: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Department</label>
                  <input 
                    type="text"
                    value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
                  <input 
                    type="email"
                    value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-400 mb-1">Photo URL</label>
                  <input 
                    type="url"
                    value={formData.photoUrl} onChange={(e) => setFormData({...formData, photoUrl: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-400 mb-1">Bio</label>
                  <textarea 
                    rows={3}
                    value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 focus:outline-none focus:border-blue-500"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Display Order</label>
                  <input 
                    type="number"
                    value={formData.displayOrder} onChange={(e) => setFormData({...formData, displayOrder: parseInt(e.target.value) || 0})}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="pt-6 mt-6 border-t border-slate-800 flex justify-end gap-3">
                <button 
                  type="button" onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors"
                >
                  Save Team Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
