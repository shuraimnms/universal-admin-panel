'use client';

import Link from 'next/link';
import { Mail, Facebook, Twitter, Linkedin } from 'lucide-react';
import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800 font-sans print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* About */}
          <div className="flex flex-col space-y-4">
            <Link href="/" className="inline-block">
               <div className="flex flex-col">
                  <span className="font-serif font-bold text-2xl text-white tracking-wide">IJARCM</span>
                  <span className="text-[0.65rem] uppercase tracking-widest text-slate-400 font-medium">International Academic Journal</span>
                </div>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Advancing knowledge in commerce, management, and technology through rigorous peer-reviewed research.
            </p>
            <div className="text-sm space-y-1 text-slate-400">
              <p>ISSN (Print): <span className="text-slate-300">2249-XXXX</span></p>
              <p>ISSN (Online): <span className="text-slate-300">2249-XXXX</span></p>
            </div>
            <div className="flex items-center space-x-2 text-sm mt-2">
              <Mail className="h-4 w-4 text-slate-500" />
              <a href="mailto:editor@ijarcm.com" className="hover:text-blue-400 transition-colors">editor@ijarcm.com</a>
            </div>
          </div>

          {/* Authors */}
          <div>
            <h3 className="text-white font-serif font-bold text-lg mb-4">Authors</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/submission-guidelines" className="hover:text-blue-400 transition-colors">Submission Guidelines</Link></li>
              <li><Link href="/copyright" className="hover:text-blue-400 transition-colors">Copyright Form</Link></li>
              <li><Link href="/ethics" className="hover:text-blue-400 transition-colors">Publication Ethics</Link></li>
              <li><Link href="/fees" className="hover:text-blue-400 transition-colors">APC (Article Processing Charges)</Link></li>
            </ul>
          </div>

          {/* Journal */}
          <div>
            <h3 className="text-white font-serif font-bold text-lg mb-4">Journal</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/editorial-board" className="hover:text-blue-400 transition-colors">Editorial Board</Link></li>
              <li><Link href="/aims-and-scope" className="hover:text-blue-400 transition-colors">Aims & Scope</Link></li>
              <li><Link href="/issues" className="hover:text-blue-400 transition-colors">Current Issue</Link></li>
              <li><Link href="/archives" className="hover:text-blue-400 transition-colors">Archives</Link></li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h3 className="text-white font-serif font-bold text-lg mb-4">Policies</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/privacy-policy" className="hover:text-blue-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms-of-service" className="hover:text-blue-400 transition-colors">Terms of Service</Link></li>
              <li><Link href="/open-access" className="hover:text-blue-400 transition-colors">Open Access Policy</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
          <p>© {currentYear} IJARCM. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="https://facebook.com/ijarcm" className="hover:text-blue-400 transition-colors" aria-label="Facebook">
              <Facebook className="h-5 w-5" />
            </a>
            <a href="https://twitter.com/ijarcm" className="hover:text-blue-400 transition-colors" aria-label="Twitter">
              <Twitter className="h-5 w-5" />
            </a>
            <a href="https://linkedin.com/company/ijarcm" className="hover:text-blue-400 transition-colors" aria-label="LinkedIn">
              <Linkedin className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
