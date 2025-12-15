import { useState, useEffect, useCallback } from 'react';
import { Campaign } from '@/types/campaign';
import { demoTemplates } from '@/data/demoTemplates';

const STORAGE_KEY = 'frameflow_campaigns';

export const useCampaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setCampaigns(parsed.map((c: any) => ({
          ...c,
          createdAt: new Date(c.createdAt),
        })));
      } catch (e) {
        console.error('Error parsing campaigns:', e);
      }
    }
    setIsLoading(false);
  }, []);

  const saveCampaigns = useCallback((newCampaigns: Campaign[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newCampaigns));
    setCampaigns(newCampaigns);
  }, []);

  const addCampaign = useCallback((campaign: Campaign) => {
    const updated = [campaign, ...campaigns];
    saveCampaigns(updated);
    return campaign;
  }, [campaigns, saveCampaigns]);

  const updateCampaign = useCallback((id: string, updates: Partial<Campaign>) => {
    const updated = campaigns.map(c => 
      c.id === id ? { ...c, ...updates } : c
    );
    saveCampaigns(updated);
  }, [campaigns, saveCampaigns]);

  const deleteCampaign = useCallback((id: string) => {
    const updated = campaigns.filter(c => c.id !== id);
    saveCampaigns(updated);
  }, [campaigns, saveCampaigns]);

  const loadDemoTemplates = useCallback(() => {
    const existingDemos = campaigns.filter(c => c.isDemo);
    if (existingDemos.length === 0) {
      const updated = [...demoTemplates, ...campaigns];
      saveCampaigns(updated);
    }
    return demoTemplates;
  }, [campaigns, saveCampaigns]);

  const incrementStats = useCallback((id: string, type: 'views' | 'downloads') => {
    const updated = campaigns.map(c => 
      c.id === id 
        ? { ...c, [type]: c[type] + 1 } 
        : c
    );
    saveCampaigns(updated);
  }, [campaigns, saveCampaigns]);

  const getTotalStats = useCallback(() => {
    return campaigns.reduce(
      (acc, c) => ({
        views: acc.views + c.views,
        downloads: acc.downloads + c.downloads,
      }),
      { views: 0, downloads: 0 }
    );
  }, [campaigns]);

  return {
    campaigns,
    isLoading,
    addCampaign,
    updateCampaign,
    deleteCampaign,
    loadDemoTemplates,
    incrementStats,
    getTotalStats,
  };
};
