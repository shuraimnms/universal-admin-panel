"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Search, Plus, Award, AlertCircle, 
  FileText, Users, Ban, CheckCircle 
} from "lucide-react";

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/certificates");
      if (!res.ok) throw new Error("Failed to fetch certificates");
      const data = await res.json();
      setCertificates(Array.isArray(data) ? data : data.certificates || []);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const handleRevoke = async (id: string) => {
    if (!confirm("Are you sure you want to revoke this certificate?")) return;
    
    try {
      const res = await fetch(`/api/certificates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "REVOKED" }),
      });
      if (!res.ok) throw new Error("Failed to revoke");
      fetchCertificates();
    } catch (err) {
      alert("Error revoking certificate");
    }
  };

  const safeCerts = Array.isArray(certificates) ? certificates : [];
  const filteredCerts = safeCerts.filter(
    (c) =>
      c.certificateNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.authorName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: certificates.length,
    publication: safeCerts.filter((c) => c.type === "PUBLICATION").length,
    conference: safeCerts.filter((c) => c.type === "CONFERENCE").length,
    revoked: safeCerts.filter((c) => !c.isValid).length,
  };

  return (
    <div className="p-6 min-h-screen bg-slate-950 text-slate-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Certificates</h1>
          <p className="text-slate-400 text-sm mt-1">Manage issued certificates and verify authenticity.</p>
        </div>
        <Link 
          href="/admin/certificates/generate"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl transition-colors"
        >
          <Plus size={18} />
          <span>Generate Certificate</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="bg-slate-800 p-3 rounded-xl text-blue-400">
              <Award size={24} />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Total Issued</p>
              <h3 className="text-2xl font-bold text-white">{stats.total}</h3>
            </div>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="bg-slate-800 p-3 rounded-xl text-emerald-400">
              <FileText size={24} />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Publication</p>
              <h3 className="text-2xl font-bold text-white">{stats.publication}</h3>
            </div>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="bg-slate-800 p-3 rounded-xl text-amber-400">
              <Users size={24} />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Conference</p>
              <h3 className="text-2xl font-bold text-white">{stats.conference}</h3>
            </div>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="bg-slate-800 p-3 rounded-xl text-red-400">
              <Ban size={24} />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Revoked</p>
              <h3 className="text-2xl font-bold text-white">{stats.revoked}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text"
              placeholder="Search by certificate number or author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-slate-400">Loading certificates...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-400 flex items-center justify-center gap-2">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          ) : filteredCerts.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Award size={48} className="mx-auto mb-4 opacity-50" />
              <p>No certificates found.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950 text-slate-400">
                <tr>
                  <th className="p-4 font-medium">Certificate #</th>
                  <th className="p-4 font-medium">Type</th>
                  <th className="p-4 font-medium">Title/Paper</th>
                  <th className="p-4 font-medium">Author & Institution</th>
                  <th className="p-4 font-medium">Issued Date</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredCerts.map((cert) => (
                  <tr key={cert.id || cert._id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 font-mono text-white">{cert.certificateNumber}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        cert.type === "PUBLICATION" ? "bg-blue-500/10 text-blue-400" : "bg-amber-500/10 text-amber-400"
                      }`}>
                        {cert.type}
                      </span>
                    </td>
                    <td className="p-4 text-white max-w-[200px] truncate" title={cert.title || cert.paperTitle}>
                      {cert.title || cert.paperTitle || "-"}
                    </td>
                    <td className="p-4">
                      <div className="text-white">{cert.authorName}</div>
                      <div className="text-xs text-slate-500 truncate max-w-[150px]">{cert.institution}</div>
                    </td>
                    <td className="p-4">
                      {new Date(cert.issuedDate || cert.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      {!cert.isValid ? (
                        <span className="flex items-center gap-1 text-red-400 text-xs font-medium">
                          <Ban size={14} /> Revoked
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-emerald-400 text-xs font-medium">
                          <CheckCircle size={14} /> Valid
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      {cert.isValid && (
                        <button 
                          onClick={() => handleRevoke(cert.id || cert._id)}
                          className="text-red-400 hover:text-red-300 text-xs font-medium transition-colors"
                        >
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

