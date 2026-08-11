'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSite } from '@/contexts/SiteContext';
import { 
  ArrowLeft, Upload, FileText, Bot, RefreshCw, Eye, Download, 
  Check, Play, Plus, Trash2, HelpCircle, FileDown, BookOpen, ExternalLink
} from 'lucide-react';
import mammoth from 'mammoth';
import { jsPDF } from 'jspdf';

interface Author {
  firstName: string;
  lastName: string;
  email: string;
  institution?: string;
}

interface Issue {
  id: string;
  title: string;
  volume: number;
  issueNumber: number;
  year: number;
}

const sectionHeadings = [
  { id: 'introduction', name: '1 Introduction', regex: /(?:1\s+)?Introduction/i },
  { id: 'literatureReview', name: '2 Review of Literature', regex: /(?:2\s+)?Review\s+of\s+Literature/i },
  { id: 'objectives', name: '3 Objectives of the Study', regex: /(?:3\s+)?Objectives(?:\s+of\s+the\s+Study)?/i },
  { id: 'hypothesis', name: '4 Hypothesis of the Study', regex: /(?:4\s+)?Hypothesis(?:\s+of\s+the\s+Study)?/i },
  { id: 'methodology', name: '5 Research Methodology', regex: /(?:5\s+)?(?:Research\s+)?Methodology/i },
  { id: 'demographic', name: '6 Demographic Profile', regex: /(?:6\s+)?Demographic\s+Profile/i },
  { id: 'dataAnalysis', name: '7 Data Analysis and interpretation', regex: /(?:7\s+)?Data\s+Analysis(?:\s+and\s+its\s+Interpretation)?/i },
  { id: 'verification', name: '8 Verification of Hypothesis', regex: /(?:8\s+)?Verification\s+of\s+Hypothesis/i },
  { id: 'results', name: '9 Results and Discussion', regex: /(?:9\s+)?Results\s+and\s+Discussion/i },
  { id: 'publicPerceptions', name: '10 Public Perceptions', regex: /(?:10\s+)?Public\s+Perceptions/i },
  { id: 'talibanImpact', name: '11 Impact of the Taliban Takeover', regex: /(?:11\s+)?Impact\s+of\s+the\s+Taliban/i },
  { id: 'futureProspects', name: '12 Future Prospects', regex: /(?:12\s+)?Future\s+Prospects/i },
  { id: 'discussion', name: '13 Overall Discussion', regex: /(?:13\s+)?Overall\s+Discussion/i },
  { id: 'findings', name: '14 Major Findings', regex: /(?:14\s+)?Major\s+Findings/i },
  { id: 'conclusion', name: '15 Conclusion', regex: /(?:15\s+)?Conclusion/i },
  { id: 'references', name: '16 References', regex: /(?:16\s+)?References/i },
];

export default function NewPaperPage() {
  const router = useRouter();
  const { activeSite } = useSite();
  const [issues, setIssues] = useState<Issue[]>([]);
  
  // Form State
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [category, setCategory] = useState('Computer Science');
  const [selectedIssueId, setSelectedIssueId] = useState('');
  const [status, setStatus] = useState('SUBMITTED');
  const [paperType, setPaperType] = useState('Research Paper');
  const [doi, setDoi] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [authors, setAuthors] = useState<Author[]>([
    { firstName: '', lastName: '', email: '', institution: '' }
  ]);

  // Document & Parsing State
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState('');
  const [aiMode, setAiMode] = useState<'AUTO' | 'GEMINI' | 'ZAI' | 'NO_AI'>('GEMINI');
  const [parsing, setParsing] = useState(false);
  const [parsedBadge, setParsedBadge] = useState(false);
  
  // Sections outline editor
  const [sections, setSections] = useState<Record<string, string>>({
    introduction: '',
    literatureReview: '',
    objectives: '',
    hypothesis: '',
    methodology: '',
    demographic: '',
    dataAnalysis: '',
    verification: '',
    results: '',
    publicPerceptions: '',
    talibanImpact: '',
    futureProspects: '',
    discussion: '',
    findings: '',
    conclusion: '',
    references: ''
  });
  const [activeSectionId, setActiveSectionId] = useState('introduction');
  const [isSubmitSaving, setIsSubmitSaving] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState('');

  // Fetch issues
  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const url = activeSite ? `/api/admin/issues?siteId=${activeSite.id}&limit=100` : '/api/admin/issues?limit=100';
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          const issList = data.issues || [];
          setIssues(issList);
          if (issList.length > 0) {
            setSelectedIssueId(issList[0].id);
          }
        }
      } catch (err) {
        console.error('Error fetching issues:', err);
      }
    };
    fetchIssues();
  }, [activeSite]);

  // Handle docx parsing
  const handleReadFile = async () => {
    if (!file) {
      alert('Please upload a DOCX file first.');
      return;
    }
    
    setParsing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      const rawText = result.value;
      
      // Auto extraction algorithm
      // 1. Try to extract Title (first non-empty line)
      const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length > 0 && !title) {
        setTitle(lines[0]);
      }
      
      // 2. Try to extract Abstract
      let extractedAbstract = '';
      const abstractIndex = rawText.search(/abstract/i);
      const keywordsIndex = rawText.search(/keywords/i);
      const introductionIndex = rawText.search(/introduction/i);
      
      if (abstractIndex !== -1) {
        const endIdx = keywordsIndex !== -1 ? keywordsIndex : (introductionIndex !== -1 ? introductionIndex : abstractIndex + 1000);
        extractedAbstract = rawText.substring(abstractIndex + 8, endIdx).trim();
        // Remove leading colons or hyphens
        extractedAbstract = extractedAbstract.replace(/^[:\-\s\r\n]+/, '');
        setAbstract(extractedAbstract);
      }

      // 3. Try to extract Keywords
      if (keywordsIndex !== -1) {
        const nextHeadingIndex = introductionIndex !== -1 ? introductionIndex : keywordsIndex + 200;
        const keywordsText = rawText.substring(keywordsIndex + 8, nextHeadingIndex).trim();
        const kwList = keywordsText
          .replace(/^[:\-\s\r\n]+/, '')
          .split(/[,;\n]/)
          .map(k => k.trim())
          .filter(Boolean);
        if (kwList.length > 0) {
          setKeywords(kwList);
        }
      }
      
      // 4. Extract Outline Sections
      const extractedSections: Record<string, string> = { ...sections };
      
      // Find character positions of all headings in the text
      const headingPositions = sectionHeadings.map(h => {
        const pos = rawText.search(h.regex);
        return { id: h.id, name: h.name, pos };
      }).filter(h => h.pos !== -1)
        .sort((a, b) => a.pos - b.pos);
        
      // Slice text between heading positions
      for (let i = 0; i < headingPositions.length; i++) {
        const current = headingPositions[i];
        const next = headingPositions[i + 1];
        
        const startPos = current.pos + current.name.length;
        const endPos = next ? next.pos : rawText.length;
        
        let sectionText = rawText.substring(startPos, endPos).trim();
        // Clean leading symbols/whitespace
        sectionText = sectionText.replace(/^[:\-\s\r\n]+/, '');
        
        extractedSections[current.id] = sectionText;
      }
      
      setSections(extractedSections);
      setParsedBadge(true);
      
    } catch (err: any) {
      alert('Error parsing document: ' + err.message);
    } finally {
      setParsing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setFileUrl(URL.createObjectURL(uploadedFile));
      setParsedBadge(false);
    }
  };

  // Add author field
  const addAuthor = () => {
    setAuthors([...authors, { firstName: '', lastName: '', email: '', institution: '' }]);
  };

  const removeAuthor = (index: number) => {
    setAuthors(authors.filter((_, idx) => idx !== index));
  };

  const updateAuthor = (index: number, field: keyof Author, value: string) => {
    const updated = [...authors];
    updated[index][field] = value;
    setAuthors(updated);
  };

  // Keywords handlers
  const addKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      setKeywords([...keywords, newKeyword.trim()]);
      setNewKeyword('');
    }
  };

  const removeKeyword = (kw: string) => {
    setKeywords(keywords.filter(k => k !== kw));
  };

  // Generate jsPDF Preview
  const handlePdfPreview = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Premium Styling
    doc.setFont("times", "normal");
    
    // Document Title
    doc.setFontSize(20);
    doc.setFont("times", "bold");
    const splitTitle = doc.splitTextToSize(title || "Untitled Research Paper", 170);
    doc.text(splitTitle, 20, 25);
    
    // Authors
    doc.setFontSize(11);
    doc.setFont("times", "italic");
    const authorsText = authors
      .map(a => `${a.firstName} ${a.lastName}${a.institution ? ` (${a.institution})` : ''}`)
      .join(', ');
    doc.text(authorsText || "Anonymous Author", 20, 25 + (splitTitle.length * 6) + 4);
    
    let y = 25 + (splitTitle.length * 6) + 14;
    
    // Abstract Header
    doc.setFontSize(12);
    doc.setFont("times", "bold");
    doc.text("Abstract", 20, y);
    y += 5;
    
    // Abstract Text
    doc.setFontSize(10);
    doc.setFont("times", "normal");
    const splitAbstract = doc.splitTextToSize(abstract || "No abstract provided.", 170);
    doc.text(splitAbstract, 20, y);
    y += (splitAbstract.length * 5) + 6;
    
    // Keywords
    if (keywords.length > 0) {
      doc.setFont("times", "bold");
      doc.text("Keywords: ", 20, y);
      doc.setFont("times", "normal");
      doc.text(keywords.join(', '), 40, y);
      y += 12;
    }
    
    // Outline sections
    sectionHeadings.forEach((heading) => {
      const content = sections[heading.id];
      if (!content) return;
      
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
      
      // Section Heading
      doc.setFontSize(12);
      doc.setFont("times", "bold");
      doc.text(heading.name, 20, y);
      y += 6;
      
      // Section Text
      doc.setFontSize(10);
      doc.setFont("times", "normal");
      const splitText = doc.splitTextToSize(content, 170);
      
      splitText.forEach((line: string) => {
        if (y > 275) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, 20, y);
        y += 5;
      });
      y += 8;
    });

    const blobUrl = doc.output('bloburl');
    setPdfPreviewUrl(blobUrl.toString());
    setShowPreviewModal(true);
  };

  const handleDownloadPdf = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    doc.setFont("times", "normal");
    doc.setFontSize(20);
    doc.setFont("times", "bold");
    const splitTitle = doc.splitTextToSize(title || "Untitled Research Paper", 170);
    doc.text(splitTitle, 20, 25);
    
    doc.setFontSize(11);
    doc.setFont("times", "italic");
    const authorsText = authors
      .map(a => `${a.firstName} ${a.lastName}${a.institution ? ` (${a.institution})` : ''}`)
      .join(', ');
    doc.text(authorsText || "Anonymous Author", 20, 25 + (splitTitle.length * 6) + 4);
    
    let y = 25 + (splitTitle.length * 6) + 14;
    
    doc.setFontSize(12);
    doc.setFont("times", "bold");
    doc.text("Abstract", 20, y);
    y += 5;
    
    doc.setFontSize(10);
    doc.setFont("times", "normal");
    const splitAbstract = doc.splitTextToSize(abstract || "No abstract provided.", 170);
    doc.text(splitAbstract, 20, y);
    y += (splitAbstract.length * 5) + 6;
    
    if (keywords.length > 0) {
      doc.setFont("times", "bold");
      doc.text("Keywords: ", 20, y);
      doc.setFont("times", "normal");
      doc.text(keywords.join(', '), 40, y);
      y += 12;
    }
    
    sectionHeadings.forEach((heading) => {
      const content = sections[heading.id];
      if (!content) return;
      
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
      
      doc.setFontSize(12);
      doc.setFont("times", "bold");
      doc.text(heading.name, 20, y);
      y += 6;
      
      doc.setFontSize(10);
      doc.setFont("times", "normal");
      const splitText = doc.splitTextToSize(content, 170);
      
      splitText.forEach((line: string) => {
        if (y > 275) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, 20, y);
        y += 5;
      });
      y += 8;
    });

    doc.save(`${title.substring(0, 30) || 'manuscript'}.pdf`);
  };

  // Submit Paper to Backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      alert('Paper Title is required.');
      return;
    }

    setIsSubmitSaving(true);
    try {
      // Find selected issue details to send
      const issueDetails = issues.find(i => i.id === selectedIssueId);
      
      // Compile PDF using jsPDF
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      doc.setFont("times", "normal");
      doc.setFontSize(20);
      doc.setFont("times", "bold");
      const splitTitle = doc.splitTextToSize(title || "Untitled Research Paper", 170);
      doc.text(splitTitle, 20, 25);
      
      doc.setFontSize(11);
      doc.setFont("times", "italic");
      const authorsText = authors
        .map(a => `${a.firstName} ${a.lastName}${a.institution ? ` (${a.institution})` : ''}`)
        .join(', ');
      doc.text(authorsText || "Anonymous Author", 20, 25 + (splitTitle.length * 6) + 4);
      
      let y = 25 + (splitTitle.length * 6) + 14;
      doc.setFontSize(12);
      doc.setFont("times", "bold");
      doc.text("Abstract", 20, y);
      y += 5;
      
      doc.setFontSize(10);
      doc.setFont("times", "normal");
      const splitAbstract = doc.splitTextToSize(abstract || "No abstract provided.", 170);
      doc.text(splitAbstract, 20, y);
      y += (splitAbstract.length * 5) + 6;
      
      if (keywords.length > 0) {
        doc.setFont("times", "bold");
        doc.text("Keywords: ", 20, y);
        doc.setFont("times", "normal");
        doc.text(keywords.join(', '), 40, y);
        y += 12;
      }
      
      sectionHeadings.forEach((heading) => {
        const content = sections[heading.id];
        if (!content) return;
        if (y > 260) {
          doc.addPage();
          y = 20;
        }
        doc.setFontSize(12);
        doc.setFont("times", "bold");
        doc.text(heading.name, 20, y);
        y += 6;
        doc.setFontSize(10);
        doc.setFont("times", "normal");
        const splitText = doc.splitTextToSize(content, 170);
        splitText.forEach((line: string) => {
          if (y > 275) {
            doc.addPage();
            y = 20;
          }
          doc.text(line, 20, y);
          y += 5;
        });
        y += 8;
      });

      const pdfBlob = doc.output('blob');
      
      const formData = new FormData();
      formData.append('title', title);
      formData.append('abstract', abstract);
      formData.append('category', category);
      formData.append('status', status);
      formData.append('paperType', paperType === 'Review Paper' ? 'REVIEW' : 'IMPLEMENTATION');
      if (doi) formData.append('doi', doi);
      formData.append('keywords', keywords.join(', '));
      formData.append('authors', JSON.stringify(authors.map(a => ({
        firstName: a.firstName,
        lastName: a.lastName,
        email: a.email,
        institution: a.institution,
        isCorresponding: true
      }))));
      if (selectedIssueId) formData.append('issueId', selectedIssueId);
      if (activeSite) formData.append('siteId', activeSite.id);
      
      formData.append('file', pdfBlob, 'manuscript.pdf');
      
      formData.append('introduction', sections.introduction || '');
      formData.append('literatureReview', sections.literatureReview || '');
      formData.append('methodology', [
        sections.objectives, 
        sections.hypothesis, 
        sections.methodology
      ].filter(Boolean).join('\n\n'));
      formData.append('results', [
        sections.demographic, 
        sections.dataAnalysis, 
        sections.verification
      ].filter(Boolean).join('\n\n'));
      formData.append('discussion', [
        sections.results, 
        sections.publicPerceptions, 
        sections.talibanImpact, 
        sections.futureProspects, 
        sections.discussion
      ].filter(Boolean).join('\n\n'));
      formData.append('conclusion', [
        sections.findings, 
        sections.conclusion
      ].filter(Boolean).join('\n\n'));
      formData.append('references', sections.references || '');

      const res = await fetch('/api/admin/papers', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to submit paper');
      }

      alert('Research paper published successfully!');
      router.push('/admin/papers');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-8 text-slate-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/papers" className="p-2 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-serif font-semibold text-white tracking-tight">Add Research Paper</h1>
            <p className="text-slate-400 text-xs mt-0.5">Upload, parse, edit and prepare manuscripts for journal formatting</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={() => {
              setTitle(''); setAbstract(''); setKeywords([]); setAuthors([{ firstName: '', lastName: '', email: '', institution: '' }]);
              setFile(null); setFileUrl(''); setParsedBadge(false);
              setSections({
                introduction: '', literatureReview: '', objectives: '', hypothesis: '', methodology: '',
                demographic: '', dataAnalysis: '', verification: '', results: '', publicPerceptions: '',
                talibanImpact: '', futureProspects: '', discussion: '', findings: '', conclusion: '', references: ''
              });
            }}
            className="border border-slate-800 hover:bg-slate-900 text-slate-400 px-4 py-2 rounded-xl text-sm font-medium transition-all"
          >
            Reset
          </button>
          <button 
            type="button"
            onClick={handleDownloadPdf}
            className="border border-slate-800 hover:bg-slate-900 text-slate-300 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-1.5 transition-all"
          >
            <FileDown size={16} />
            Export PDF
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN - Upload / Metadata */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Uploader Card */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 md:p-6 backdrop-blur-xl">
            <h2 className="text-base font-serif font-semibold text-white mb-4">Manuscript File</h2>
            <div className="border border-dashed border-slate-800 hover:border-blue-500/50 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-950/40 relative">
              <input 
                type="file" 
                accept=".doc,.docx"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <Upload className="mx-auto h-8 w-8 text-slate-500 mb-2" />
              <p className="text-sm text-slate-300 font-medium">{file ? file.name : 'DOC or DOCX file'}</p>
              <p className="text-xs text-slate-500 mt-1">Accepted: .doc, .docx</p>
            </div>

            {/* AI Selector & Read File */}
            <div className="mt-5 space-y-4">
              <div className="flex bg-slate-950/80 p-1 border border-slate-800 rounded-xl">
                {(['AUTO', 'GEMINI', 'ZAI', 'NO_AI'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setAiMode(mode)}
                    className={`flex-1 text-center py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      aiMode === mode 
                        ? 'bg-blue-600 text-white shadow' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {mode === 'NO_AI' ? 'No AI' : mode === 'AUTO' ? 'Auto' : mode === 'GEMINI' ? 'Gemini' : 'Z.AI'}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleReadFile}
                  disabled={parsing || !file}
                  className="flex-1 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-semibold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                >
                  <RefreshCw size={14} className={parsing ? 'animate-spin' : ''} />
                  {parsing ? 'Reading...' : 'Read file'}
                </button>
                <a 
                  href="https://universal-admin-backend.vercel.app/admin/papers/pdf-template" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-xs text-blue-400 hover:underline flex items-center gap-0.5"
                >
                  Template <ExternalLink size={10} />
                </a>
              </div>

              {parsedBadge && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs py-2 px-3 rounded-lg flex items-center gap-1.5">
                  <Check size={14} />
                  <span>Extracted with {aiMode === 'NO_AI' ? 'Local Text Parser' : `${aiMode} AI`}</span>
                </div>
              )}
            </div>
          </div>

          {/* Abstract Box */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 md:p-6 backdrop-blur-xl">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-base font-serif font-semibold text-white">Abstract</h2>
              <span className="text-xs text-slate-500">{abstract ? abstract.split(/\s+/).length : 0} words</span>
            </div>
            <textarea
              value={abstract}
              onChange={(e) => setAbstract(e.target.value)}
              placeholder="Provide paper abstract..."
              rows={6}
              className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all leading-relaxed"
            />
          </div>

          {/* Keywords */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 md:p-6 backdrop-blur-xl">
            <h2 className="text-base font-serif font-semibold text-white mb-3">Keywords</h2>
            <div className="flex gap-2 mb-3">
              <input 
                type="text"
                placeholder="Add keyword..."
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addKeyword(); } }}
                className="flex-1 bg-slate-950/80 border border-slate-800/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-all"
              />
              <button
                type="button"
                onClick={addKeyword}
                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-3 rounded-xl text-xs transition-all"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {keywords.map(kw => (
                <span key={kw} className="bg-slate-950 border border-slate-800 text-slate-300 text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                  {kw}
                  <button type="button" onClick={() => removeKeyword(kw)} className="text-slate-500 hover:text-red-400">×</button>
                </span>
              ))}
            </div>
          </div>

          {/* Publishing Dropdowns */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 md:p-6 backdrop-blur-xl space-y-4">
            <h2 className="text-base font-serif font-semibold text-white mb-2">Publishing Details</h2>
            
            <div>
              <label className="block text-xs text-slate-400 mb-1">Journal Context</label>
              <select 
                disabled
                className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none"
              >
                <option>{activeSite ? activeSite.name : 'VA-RA Global'}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Issue</label>
              <select 
                value={selectedIssueId}
                onChange={(e) => setSelectedIssueId(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
              >
                {issues.length === 0 ? (
                  <option value="">No Active Issues Found</option>
                ) : (
                  issues.map(iss => (
                    <option key={iss.id} value={iss.id}>
                      Vol. {iss.volume}, Issue {iss.issueNumber} ({iss.year})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Status</label>
                <select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
                >
                  <option value="SUBMITTED">Submitted</option>
                  <option value="UNDER_REVIEW">Under Review</option>
                  <option value="ACCEPTED">Accepted</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs text-slate-400 mb-1">Paper Type</label>
                <select 
                  value={paperType}
                  onChange={(e) => setPaperType(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
                >
                  <option value="Research Paper">Research Paper</option>
                  <option value="Review Paper">Review Paper</option>
                  <option value="Case Study">Case Study</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">DOI (Optional)</label>
              <input 
                type="text" 
                placeholder="e.g. 10.1234/ijarcm.2026.001"
                value={doi}
                onChange={(e) => setDoi(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Authors List */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 md:p-6 backdrop-blur-xl space-y-4">
            <div className="flex justify-between items-center mb-1">
              <h2 className="text-base font-serif font-semibold text-white">Authors</h2>
              <button 
                type="button" 
                onClick={addAuthor}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
              >
                <Plus size={14} /> Add Author
              </button>
            </div>
            
            {authors.map((author, index) => (
              <div key={index} className="border border-slate-800 p-4 rounded-xl space-y-3 bg-slate-950/40 relative">
                {authors.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeAuthor(index)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">First Name</label>
                    <input 
                      type="text" 
                      value={author.firstName}
                      onChange={(e) => updateAuthor(index, 'firstName', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">Last Name</label>
                    <input 
                      type="text" 
                      value={author.lastName}
                      onChange={(e) => updateAuthor(index, 'lastName', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">Email Address</label>
                    <input 
                      type="email" 
                      value={author.email}
                      onChange={(e) => updateAuthor(index, 'email', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">Institution</label>
                    <input 
                      type="text" 
                      value={author.institution || ''}
                      onChange={(e) => updateAuthor(index, 'institution', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* RIGHT COLUMN - Split Outlines Editor */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Title and Category */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 md:p-6 backdrop-blur-xl grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3">
              <label className="block text-xs text-slate-400 mb-1.5">Paper Title</label>
              <input 
                type="text" 
                placeholder="Enter or extract research paper title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-all font-serif"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Category</label>
              <input 
                type="text" 
                placeholder="e.g. Computer Science"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Document Section Content Editor */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 md:p-6 backdrop-blur-xl flex flex-col h-[700px]">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-800/60">
              <h2 className="text-base font-serif font-semibold text-white">Paper Outline & Sections</h2>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Dynamic Layout</span>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0">
              {/* Outline Navigation (left side) */}
              <div className="col-span-4 overflow-y-auto border-r border-slate-800/50 pr-4 space-y-1.5 custom-scrollbar">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-2 px-2">OUTLINE</div>
                {sectionHeadings.map((heading) => {
                  const hasContent = !!sections[heading.id];
                  const isActive = activeSectionId === heading.id;
                  return (
                    <button
                      key={heading.id}
                      type="button"
                      onClick={() => setActiveSectionId(heading.id)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all flex items-center justify-between ${
                        isActive 
                          ? 'bg-blue-600/10 border border-blue-500/30 text-blue-400 font-medium' 
                          : 'hover:bg-slate-850 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="truncate pr-2">{heading.name}</span>
                      {hasContent ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Has content"></span>
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-800" title="Empty"></span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Outline Content Editor (right side) */}
              <div className="col-span-8 flex flex-col h-full">
                <div className="mb-2">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Active Section Content</div>
                  <h3 className="text-sm font-serif font-semibold text-white mt-0.5">
                    {sectionHeadings.find(h => h.id === activeSectionId)?.name}
                  </h3>
                </div>
                <textarea
                  value={sections[activeSectionId]}
                  onChange={(e) => setSections({ ...sections, [activeSectionId]: e.target.value })}
                  placeholder={`Write or paste content for ${sectionHeadings.find(h => h.id === activeSectionId)?.name}...`}
                  className="flex-1 w-full bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 text-xs text-slate-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none font-sans leading-relaxed custom-scrollbar"
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handlePdfPreview}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-semibold px-5 py-3 rounded-xl text-xs flex items-center gap-1.5 transition-all"
            >
              <Eye size={14} />
              Preview PDF
            </button>
            <button
              type="submit"
              disabled={isSubmitSaving}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-blue-500/20 hover:scale-[1.01] disabled:opacity-50"
            >
              <Check size={14} />
              {isSubmitSaving ? 'Publishing...' : 'Publish Paper'}
            </button>
          </div>

        </div>

      </form>

      {/* PDF Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-5xl h-[85vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-800/60 flex justify-between items-center bg-slate-950/50">
              <div>
                <h3 className="font-serif font-semibold text-white">Academic Manuscript Preview</h3>
                <p className="text-xs text-slate-400 mt-0.5">Dynamically compiled from text editor blocks</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDownloadPdf}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all"
                >
                  <Download size={14} /> Download PDF
                </button>
                <button
                  onClick={() => { setShowPreviewModal(false); setPdfPreviewUrl(''); }}
                  className="text-slate-400 hover:text-slate-200 text-lg font-semibold px-2"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="flex-1 bg-slate-950 p-1">
              {pdfPreviewUrl ? (
                <iframe 
                  src={pdfPreviewUrl} 
                  className="w-full h-full border-0 rounded-xl"
                  title="PDF Preview"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500">
                  Failed to render preview.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
