'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Site {
  id: string;
  name: string;
  abbreviation: string;
}

interface SiteContextType {
  activeSite: Site | null;
  setActiveSite: (site: Site | null) => void;
  availableSites: Site[];
  setAvailableSites: (sites: Site[]) => void;
  isLoading: boolean;
}

const SiteContext = createContext<SiteContextType | undefined>(undefined);

export function SiteProvider({ children }: { children: ReactNode }) {
  const [activeSite, setActiveSiteState] = useState<Site | null>(null);
  const [availableSites, setAvailableSites] = useState<Site[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('universal_admin_active_site');
      if (stored) {
        setActiveSiteState(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load active site from local storage', e);
    }
    
    // Fetch available sites from API
    fetchSites();
  }, []);

  const fetchSites = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/sites');
      if (res.ok) {
        const data = await res.json();
        setAvailableSites(data.sites || []);
        
        // If we don't have an active site but we have available sites, select the first one
        if (!activeSite && data.sites && data.sites.length > 0) {
          const stored = localStorage.getItem('universal_admin_active_site');
          if (!stored) {
             setActiveSite(data.sites[0]);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch sites', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setActiveSite = (site: Site | null) => {
    setActiveSiteState(site);
    if (site) {
      localStorage.setItem('universal_admin_active_site', JSON.stringify(site));
    } else {
      localStorage.removeItem('universal_admin_active_site');
    }
  };

  return (
    <SiteContext.Provider value={{ activeSite, setActiveSite, availableSites, setAvailableSites, isLoading }}>
      {children}
    </SiteContext.Provider>
  );
}

export function useSite() {
  const context = useContext(SiteContext);
  if (context === undefined) {
    throw new Error('useSite must be used within a SiteProvider');
  }
  return context;
}
