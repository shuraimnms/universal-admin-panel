'use client';

import React, { useState, useEffect, useRef, FormEvent } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  Search,
  Menu,
  X,
  Sun,
  Moon,
  ChevronDown,
  User,
  LogOut,
  Settings,
  BookOpen,
  Info,
  Shield,
  FileText,
  Library,
  PenTool,
  FileCheck,
  DollarSign,
  ChevronRight
} from 'lucide-react';

const navItems = [
  { name: 'Home', href: '/' },
  {
    name: 'About the Journal',
    dropdown: [
      { name: 'About IJARCM', href: '/about', icon: Info },
      { name: 'Aims & Scope', href: '/about#aims-scope', icon: BookOpen },
      { name: 'Publication Ethics & Policies', href: '/about#ethics', icon: Shield },
    ],
  },
  { name: 'Editorial Board', href: '/editorial-board' },
  { name: 'Current Issue', href: '/issues' },
  { name: 'Archives', href: '/archives' },
  {
    name: 'Papers / Articles',
    dropdown: [
      { name: 'Browse Papers', href: '/papers', icon: FileText },
      { name: 'Search Articles', href: '/papers?search=true', icon: Search },
      { name: 'Library', href: '/library', icon: Library },
    ],
  },
  {
    name: 'For Authors',
    megaMenu: true,
    columns: [
      {
        title: 'Submission',
        items: [
          { name: 'Submission Guidelines', href: '/submission-guidelines', icon: PenTool },
          { name: 'Author Guidelines', href: '/submission-guidelines#author-guidelines', icon: FileText },
          { name: 'Submit a Manuscript', href: '/submit', icon: FileCheck },
        ],
      },
      {
        title: 'Policies',
        items: [
          { name: 'Publication Ethics', href: '/about#ethics', icon: Shield },
          { name: 'Copyright & License', href: '/copyright', icon: FileText },
          { name: 'Copyright Form', href: '/copyright#form', icon: FileText },
          { name: 'APC (Article Processing Charges)', href: '/fees', icon: DollarSign },
        ],
      },
    ],
  },
  { name: 'Conferences', href: '/conferences' },
  { name: 'E-Books', href: '/ebooks' },
  { name: 'Contact Us', href: '/contact' },
];

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('theme');
    if (stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setUserDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [mobileMenuOpen]);

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/papers?q=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href.split('#')[0]);
  };

  const isParentActive = (item: any) => {
    if (item.href && isActive(item.href)) return true;
    if (item.dropdown && item.dropdown.some((child: any) => isActive(child.href))) return true;
    if (item.megaMenu) {
      for (const col of item.columns) {
        if (col.items.some((child: any) => isActive(child.href))) return true;
      }
    }
    return false;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-[100] bg-blue-600 text-white px-4 py-2 rounded-md outline-none focus:ring-2 focus:ring-blue-400"
      >
        Skip to main content
      </a>

      {/* FIXED WRAPPER FOR NAV */}
      <div className="fixed top-0 left-0 right-0 z-50 flex flex-col w-full transition-all duration-300">
        
        {/* TOP BAR - Hidden on mobile */}
        <div className="hidden lg:flex items-center justify-between px-6 lg:px-10 xl:px-12 py-2 bg-slate-900 text-slate-300 text-[13px] font-medium tracking-wide border-b border-amber-500/20">
          <div className="flex items-center space-x-6">
            <span className="flex items-center">
              <span className="text-amber-500 mr-2 font-bold">ISSN:</span> 
              2455-0116 (Print) | 2395-6410 (Online)
            </span>
          </div>
          <div className="flex items-center space-x-8">
            <Link href="/contact" className="hover:text-white transition-colors duration-200">
              Support
            </Link>
            <Link href="/contact" className="hover:text-white transition-colors duration-200">
              Contact
            </Link>
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 transition-colors"
              aria-label="Toggle Dark Mode"
              suppressHydrationWarning
            >
              {mounted ? (theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />) : <Moon size={16} />}
            </button>
          </div>
        </div>

        {/* MAIN NAVIGATION BAR */}
        <nav
          role="navigation"
          aria-label="Main Navigation"
          className={`w-full transition-all duration-300 border-b backdrop-blur-xl ${
            scrolled
              ? 'bg-white/90 dark:bg-slate-950/90 border-slate-200 dark:border-slate-800 shadow-sm py-4'
              : 'bg-white/80 dark:bg-slate-900/80 border-transparent py-5'
          }`}
        >
          <div className="max-w-[1440px] mx-auto px-6 lg:px-10 xl:px-12 flex items-center justify-between">
            
            {/* LOGO */}
            <Link href="/" className="flex items-center group flex-shrink-0">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center text-white font-bold text-2xl md:text-3xl tracking-tighter shadow-md group-hover:scale-105 transition-transform duration-300">
                IJ
              </div>
              <div className="ml-4 hidden sm:flex flex-col">
                <span className="font-serif text-2xl md:text-[26px] font-bold text-slate-900 dark:text-white leading-none tracking-tight">
                  IJARCM
                </span>
                <span className="text-xs md:text-[13px] text-slate-500 dark:text-slate-400 font-medium tracking-wider uppercase mt-1">
                  Academic Journal
                </span>
              </div>
            </Link>

            {/* DESKTOP NAV ITEMS */}
            <div className="hidden xl:flex items-center space-x-2 lg:space-x-4 flex-1 justify-center px-4">
              {navItems.map((item, index) => (
                <div
                  key={index}
                  className="relative group"
                  onMouseEnter={() => setActiveDropdown(item.name)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  {item.href ? (
                    <Link
                      href={item.href}
                      className={`px-3 py-2 rounded-md text-[15px] lg:text-[16px] font-medium hover:font-semibold transition-all duration-200 flex items-center whitespace-nowrap ${
                        isParentActive(item)
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      {item.name}
                      {isParentActive(item) && (
                        <span className="absolute bottom-1 left-3 right-3 h-[3px] bg-blue-600 dark:bg-blue-400 rounded-full" />
                      )}
                    </Link>
                  ) : (
                    <button
                      className={`px-3 py-2 rounded-md text-[15px] lg:text-[16px] font-medium hover:font-semibold transition-all duration-200 flex items-center gap-1 whitespace-nowrap ${
                        isParentActive(item) || activeDropdown === item.name
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                      aria-expanded={activeDropdown === item.name}
                      suppressHydrationWarning
                    >
                      {item.name}
                      <ChevronDown
                        size={16}
                        className={`transition-transform duration-200 ${
                          activeDropdown === item.name ? 'rotate-180' : ''
                        }`}
                      />
                      {isParentActive(item) && (
                        <span className="absolute bottom-1 left-3 right-7 h-[3px] bg-blue-600 dark:bg-blue-400 rounded-full" />
                      )}
                    </button>
                  )}

                  {/* STANDARD DROPDOWN */}
                  {item.dropdown && activeDropdown === item.name && (
                    <div className="absolute top-full left-0 pt-2 w-64 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden py-2">
                        {item.dropdown.map((child, idx) => (
                          <Link
                            key={idx}
                            href={child.href}
                            className={`flex items-center px-4 py-2.5 text-sm transition-colors ${
                              isActive(child.href)
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-medium'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400'
                            }`}
                          >
                            {child.icon && <child.icon size={16} className="mr-3 opacity-70" />}
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* MEGA MENU */}
                  {item.megaMenu && activeDropdown === item.name && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-[600px] z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden flex p-6 gap-8">
                        {item.columns?.map((col, colIdx) => (
                          <div key={colIdx} className="flex-1">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                              {col.title}
                            </h4>
                            <div className="space-y-1">
                              {col.items.map((child, idx) => (
                                <Link
                                  key={idx}
                                  href={child.href}
                                  className={`flex items-start px-3 py-2 rounded-lg text-sm transition-all group ${
                                    isActive(child.href)
                                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-medium'
                                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400'
                                  }`}
                                >
                                  {child.icon && (
                                    <child.icon
                                      size={18}
                                      className="mr-3 mt-0.5 opacity-60 group-hover:opacity-100 transition-opacity"
                                    />
                                  )}
                                  <span>{child.name}</span>
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* RIGHT CONTROLS */}
            <div className="flex items-center space-x-2 md:space-x-4 flex-shrink-0">
              
              {/* SEARCH TOGGLE & INPUT */}
              <div ref={searchContainerRef} className="relative flex items-center">
                {searchOpen ? (
                  <form onSubmit={handleSearchSubmit} className="absolute right-0 flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full shadow-lg overflow-hidden w-[240px] md:w-[320px] animate-in slide-in-from-right-4 fade-in duration-200">
                    <Search size={16} className="ml-3 text-slate-400" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search articles... (Cmd+K)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-transparent border-none focus:ring-0 text-sm py-2 px-3 text-slate-900 dark:text-white placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setSearchOpen(false)}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 rounded-full mr-1 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => setSearchOpen(true)}
                    className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center"
                    aria-label="Open search"
                  >
                    <Search size={22} />
                  </button>
                )}
              </div>

              {/* USER AUTH */}
              {session?.user ? (
                <div className="relative" ref={userDropdownRef}>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center space-x-2 focus:outline-none p-1.5 pr-3 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors bg-white dark:bg-slate-900 h-[48px]"
                  >
                    <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
                      {session.user.image ? (
                        <img src={session.user.image} alt={session.user.name || 'User'} className="w-9 h-9 rounded-full object-cover" />
                      ) : (
                        getInitials(session.user.name || 'User')
                      )}
                    </div>
                    <span className="text-sm font-medium hidden sm:block max-w-[100px] truncate text-slate-700 dark:text-slate-300">
                      {session.user.name?.split(' ')[0]}
                    </span>
                    <ChevronDown size={16} className="text-slate-500 hidden sm:block" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden py-1 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{session.user.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{session.user.email}</p>
                      </div>
                      
                      <Link href="/profile" className="flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 w-full text-left" onClick={() => setUserDropdownOpen(false)}>
                        <User size={16} className="mr-2 opacity-70" /> Profile & Submissions
                      </Link>
                      
                      {session.user.role === 'ADMIN' && (
                        <Link href="/admin" className="flex items-center px-4 py-2 text-sm text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 w-full text-left" onClick={() => setUserDropdownOpen(false)}>
                          <Settings size={16} className="mr-2 opacity-70" /> Admin Dashboard
                        </Link>
                      )}
                      
                      <div className="border-t border-slate-100 dark:border-slate-800 mt-1 pt-1">
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            signOut();
                          }}
                          className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left"
                        >
                          <LogOut size={16} className="mr-2 opacity-70" /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="hidden md:flex items-center justify-center h-[48px] px-6 text-[16px] font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Sign In
                </Link>
              )}

              {/* SUBMIT CTA */}
              <Link
                href="/submit"
                className="hidden md:inline-flex items-center justify-center h-[48px] px-7 text-[16px] font-semibold text-white transition-all bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-md hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transform hover:-translate-y-0.5"
              >
                Submit Paper
              </Link>

              {/* MOBILE MENU TOGGLE */}
              <button
                className="xl:hidden p-2 -mr-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open mobile menu"
              >
                <Menu size={28} />
              </button>
            </div>
          </div>
        </nav>
      </div>

      {/* SPACER to offset fixed layout */}
      <div className="h-[96px] md:h-[128px] w-full" aria-hidden="true" />

      {/* MOBILE MENU OVERLAY */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] xl:hidden flex justify-end">
          <div 
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in" 
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          
          <div className="relative w-full max-w-sm h-full bg-white dark:bg-slate-950 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <span className="font-serif text-xl font-bold text-slate-900 dark:text-white">Menu</span>
              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  suppressHydrationWarning
                >
                  {mounted ? (theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />) : <Moon size={18} />}
                </button>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Mobile Nav Links */}
            <div className="flex-1 overflow-y-auto py-4 px-4 custom-scrollbar">
              <nav className="flex flex-col space-y-1">
                {navItems.map((item, idx) => (
                  <div key={idx} className="flex flex-col">
                    {item.href ? (
                      <Link
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                          isActive(item.href)
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        {item.name}
                      </Link>
                    ) : (
                      <div className="flex flex-col">
                        <button
                          onClick={() => setMobileExpanded(mobileExpanded === item.name ? null : item.name)}
                          className={`flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium transition-colors w-full ${
                            isParentActive(item) || mobileExpanded === item.name
                              ? 'bg-blue-50/50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-400'
                              : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          {item.name}
                          <ChevronDown
                            size={18}
                            className={`transition-transform duration-200 ${
                              mobileExpanded === item.name ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                        
                        {/* Mobile Submenu */}
                        {mobileExpanded === item.name && (
                          <div className="mt-1 mb-2 pl-4 pr-2 flex flex-col space-y-1 border-l-2 border-slate-100 dark:border-slate-800 ml-6 animate-in slide-in-from-top-2 fade-in duration-200">
                            {item.dropdown?.map((child, childIdx) => (
                              <Link
                                key={childIdx}
                                href={child.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`flex items-center px-3 py-2.5 rounded-lg text-sm transition-colors ${
                                  isActive(child.href)
                                    ? 'text-blue-700 dark:text-blue-400 font-medium bg-blue-50/50 dark:bg-blue-900/20'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                              >
                                {child.icon && <child.icon size={16} className="mr-3 opacity-60" />}
                                {child.name}
                              </Link>
                            ))}
                            
                            {item.megaMenu && item.columns?.map((col, colIdx) => (
                              <div key={`col-${colIdx}`} className="pt-2 pb-1">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 px-3">
                                  {col.title}
                                </h4>
                                {col.items.map((child, childIdx) => (
                                  <Link
                                    key={childIdx}
                                    href={child.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                                      isActive(child.href)
                                        ? 'text-blue-700 dark:text-blue-400 font-medium bg-blue-50/50 dark:bg-blue-900/20'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 hover:bg-slate-50 dark:hover:bg-slate-800'
                                    }`}
                                  >
                                    {child.icon && <child.icon size={16} className="mr-3 opacity-60" />}
                                    {child.name}
                                  </Link>
                                ))}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            </div>

            {/* Mobile Footer Actions */}
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              {!session?.user && (
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center w-full py-3 mb-3 text-sm font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm"
                >
                  Sign In
                </Link>
              )}
              <Link
                href="/submit"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center w-full py-3 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-md"
              >
                Submit Paper <ChevronRight size={16} className="ml-1" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
