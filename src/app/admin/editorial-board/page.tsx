'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Users, X, Loader2, Search } from 'lucide-react';

interface Member {
  id: string;
  name: string;
  title: string;
  institution: string;
  country: string;
  expertise: string;
  bio: string;
  photoUrl: string;
  displayOrder: number;
  isActive: boolean;
}

export default function EditorialBoardPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    institution: '',
    country: '',
    expertise: '',
    bio: '',
    photoUrl: '',
    displayOrder: 0,
    isActive: true
  });

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/editorial-board');
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members || data.teamMembers || data.advisoryBoard || data.reviewerBoard || data.editorialBoard || (Array.isArray(data) ? data : []));
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

  const handleOpenModal = (member?: Member) => {
    if (member) {
      setEditingMember(member);
      setFormData({
        name: member.name,
        title: member.title,
        institution: member.institution || '',
        country: member.country || '',
        expertise: member.expertise || '',
        bio: member.bio || '',
        photoUrl: member.photoUrl || '',
        displayOrder: member.displayOrder || 0,
        isActive: member.isActive ?? true
      });
    } else {
      setEditingMember(null);
      setFormData({
        name: '',
        title: '',
        institution: '',
        country: '',
        expertise: '',
        bio: '',
        photoUrl: '',
        displayOrder: 0,
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingMember 
        ? `/api/editorial-board/${editingMember.id}` 
        : '/api/editorial-board';
      
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
    if (!confirm('Are you sure you want to delete this member?')) return;
    try {
      const res = await fetch(`/api/editorial-board/${id}`, {
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
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.institution?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen bg-slate-950 text-white">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Editorial Board</h1>
          <p className="text-slate-400 mt-2">Manage the editorial board members</p>
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
          placeholder="Search members..."
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => (
            <div key={member.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
              <div className="p-6 flex flex-col items-center flex-grow text-center">
                <div className="w-24 h-24 rounded-full bg-slate-800 mb-4 overflow-hidden border-2 border-slate-700 flex items-center justify-center">
                  {member.photoUrl ? (
                    <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-slate-400">
                      {member.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                <p className="text-blue-400 font-medium text-sm mb-2">{member.title}</p>
                <p className="text-slate-400 text-sm mb-1">{member.institution}</p>
                {member.country && <p className="text-slate-500 text-sm mb-3">{member.country}</p>}
                
                {member.expertise && (
                  <div className="mt-2 text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-full">
                    {member.expertise}
                  </div>
                )}
                
                <div className="mt-4 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${member.isActive ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                  <span className="text-xs text-slate-400">{member.isActive ? 'Active' : 'Inactive'}</span>
                  <span className="text-xs text-slate-500 ml-2">Order: {member.displayOrder}</span>
                </div>
              </div>
              <div className="bg-slate-950 border-t border-slate-800 p-4 flex justify-between gap-2">
                <button 
                  onClick={() => handleOpenModal(member)}
                  className="flex-1 flex justify-center items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-xl transition-colors text-sm"
                >
                  <Edit2 size={16} /> Edit
                </button>
                <button 
                  onClick={() => handleDelete(member.id)}
                  className="flex-1 flex justify-center items-center gap-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 hover:text-red-300 py-2 rounded-xl transition-colors text-sm"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center sticky top-0 bg-slate-900 z-10">
              <h2 className="text-2xl font-bold">{editingMember ? 'Edit Member' : 'Add Member'}</h2>
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
                  <label className="block text-sm font-medium text-slate-400 mb-1">Title</label>
                  <input 
                    type="text" required
                    value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Institution</label>
                  <input 
                    type="text"
                    value={formData.institution} onChange={(e) => setFormData({...formData, institution: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Country</label>
                  <input 
                    type="text"
                    value={formData.country} onChange={(e) => setFormData({...formData, country: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-400 mb-1">Expertise / Keywords</label>
                  <input 
                    type="text"
                    value={formData.expertise} onChange={(e) => setFormData({...formData, expertise: e.target.value})}
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
                <div className="flex items-center mt-6">
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input 
                        type="checkbox" className="sr-only" 
                        checked={formData.isActive}
                        onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                      />
                      <div className={`block w-14 h-8 rounded-full ${formData.isActive ? 'bg-emerald-500' : 'bg-slate-700'}`}></div>
                      <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition transform ${formData.isActive ? 'translate-x-6' : ''}`}></div>
                    </div>
                    <div className="ml-3 text-sm font-medium text-slate-300">
                      {formData.isActive ? 'Active' : 'Inactive'}
                    </div>
                  </label>
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
                  Save Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

