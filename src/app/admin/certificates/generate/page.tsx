"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Award } from "lucide-react";

export default function GenerateCertificatePage() {
  const router = useRouter();
  const [type, setType] = useState<"PUBLICATION" | "CONFERENCE">("PUBLICATION");
  const [papers, setPapers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [papersLoading, setPapersLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    paperId: "",
    conferenceName: "",
    topic: "",
    prize: "",
    authorName: "",
    institution: "",
    issuedDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    if (type === "PUBLICATION") {
      fetchPapers();
    }
  }, [type]);

  const fetchPapers = async () => {
    setPapersLoading(true);
    try {
      const res = await fetch("/api/papers?status=PUBLISHED");
      if (res.ok) {
        const data = await res.json();
        setPapers(Array.isArray(data) ? data : data.papers || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPapersLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const payload = { ...formData, type };
      const res = await fetch("/api/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) throw new Error("Failed to generate certificate");
      
      const data = await res.json();
      setSuccess(data.certificateNumber || "Successfully generated");
    } catch (err: any) {
      alert(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="p-6 min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Certificate Generated</h2>
          <p className="text-slate-400 mb-6">The certificate has been successfully issued.</p>
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 mb-8">
            <p className="text-sm text-slate-500 mb-1">Certificate Number</p>
            <p className="text-xl font-mono font-medium text-white">{success}</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => { setSuccess(null); setFormData(f => ({...f, authorName: "", paperId: ""})); }}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-xl transition-colors"
            >
              Generate Another
            </button>
            <Link 
              href="/admin/certificates"
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-xl transition-colors block text-center leading-[1.5]"
            >
              View All
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-slate-950 text-slate-300">
      <div className="max-w-3xl mx-auto">
        <Link 
          href="/admin/certificates" 
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Certificates
        </Link>
        
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Generate Certificate</h1>
          <p className="text-slate-400 text-sm mt-1">Issue a new certificate for a publication or conference.</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8">
          <div className="flex p-1 bg-slate-950 rounded-xl mb-8">
            <button
              type="button"
              onClick={() => setType("PUBLICATION")}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                type === "PUBLICATION" ? "bg-slate-800 text-white shadow-sm" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              Publication Certificate
            </button>
            <button
              type="button"
              onClick={() => setType("CONFERENCE")}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                type === "CONFERENCE" ? "bg-slate-800 text-white shadow-sm" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              Conference Certificate
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {type === "PUBLICATION" ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Select Paper</label>
                  <select 
                    name="paperId" 
                    required 
                    value={formData.paperId} 
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select a published paper...</option>
                    {papersLoading ? (
                      <option disabled>Loading papers...</option>
                    ) : (
                      papers.map(p => (
                        <option key={p.id || p._id} value={p.id || p._id}>
                          {p.title}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Conference Name</label>
                  <input 
                    type="text" 
                    name="conferenceName" 
                    required 
                    value={formData.conferenceName} 
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                    placeholder="e.g., International Conference on..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Topic / Presentation Title</label>
                  <input 
                    type="text" 
                    name="topic" 
                    required 
                    value={formData.topic} 
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Prize / Recognition (Optional)</label>
                  <input 
                    type="text" 
                    name="prize" 
                    value={formData.prize} 
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                    placeholder="e.g., Best Paper Award"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Author / Recipient Name</label>
                <input 
                  type="text" 
                  name="authorName" 
                  required 
                  value={formData.authorName} 
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Institution</label>
                <input 
                  type="text" 
                  name="institution" 
                  required 
                  value={formData.institution} 
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Issue Date</label>
              <input 
                type="date" 
                name="issuedDate" 
                required 
                value={formData.issuedDate} 
                onChange={handleInputChange}
                className="w-full md:w-1/2 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 block"
              />
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
              <Link
                href="/admin/certificates"
                className="px-5 py-2.5 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 flex items-center gap-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl transition-colors"
              >
                {loading ? "Generating..." : (
                  <>
                    <Award size={18} />
                    Generate Certificate
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
