import { useState, useEffect, useCallback } from 'react';
import { Campaign, TextElement } from '@/types/campaign';
import { demoTemplates } from '@/data/demoTemplates';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Json } from '@/integrations/supabase/types';

const mapDbToCampaign = (db: {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  type: string;
  frame_image: string;
  background_image: string | null;
  text_elements: Json;
  hashtags: string[];
  views: number;
  downloads: number;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
}): Campaign => ({
  id: db.id,
  title: db.title,
  description: db.description || '',
  type: db.type as 'photo' | 'document',
  frameImage: db.frame_image,
  backgroundImage: db.background_image || undefined,
  textElements: db.text_elements as unknown as TextElement[],
  hashtags: db.hashtags,
  views: db.views,
  downloads: db.downloads,
  createdAt: new Date(db.created_at),
  isDemo: db.is_demo,
});

export const useCampaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchCampaigns = useCallback(async () => {
    if (!user) {
      setCampaigns([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching campaigns:', error);
    } else if (data) {
      setCampaigns(data.map(mapDbToCampaign));
    }
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const addCampaign = useCallback(async (campaign: Campaign) => {
    if (!user) return campaign;

    const { data, error } = await supabase
      .from('campaigns')
      .insert({
        user_id: user.id,
        title: campaign.title,
        description: campaign.description,
        type: campaign.type,
        frame_image: campaign.frameImage,
        background_image: campaign.backgroundImage || null,
        text_elements: campaign.textElements as unknown as Json,
        hashtags: campaign.hashtags,
        views: campaign.views,
        downloads: campaign.downloads,
        is_demo: campaign.isDemo || false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding campaign:', error);
    } else if (data) {
      setCampaigns(prev => [mapDbToCampaign(data), ...prev]);
    }
    return campaign;
  }, [user]);

  const updateCampaign = useCallback(async (id: string, updates: Partial<Campaign>) => {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.type !== undefined) dbUpdates.type = updates.type;
    if (updates.frameImage !== undefined) dbUpdates.frame_image = updates.frameImage;
    if (updates.backgroundImage !== undefined) dbUpdates.background_image = updates.backgroundImage;
    if (updates.textElements !== undefined) dbUpdates.text_elements = updates.textElements;
    if (updates.hashtags !== undefined) dbUpdates.hashtags = updates.hashtags;
    if (updates.views !== undefined) dbUpdates.views = updates.views;
    if (updates.downloads !== undefined) dbUpdates.downloads = updates.downloads;

    const { error } = await supabase
      .from('campaigns')
      .update(dbUpdates)
      .eq('id', id);

    if (error) {
      console.error('Error updating campaign:', error);
    } else {
      setCampaigns(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    }
  }, []);

  const deleteCampaign = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting campaign:', error);
    } else {
      setCampaigns(prev => prev.filter(c => c.id !== id));
    }
  }, []);

  const loadDemoTemplates = useCallback(async () => {
    if (!user) return demoTemplates;

    const existingDemos = campaigns.filter(c => c.isDemo);
    if (existingDemos.length === 0) {
      for (const demo of demoTemplates) {
        await addCampaign(demo);
      }
    }
    return demoTemplates;
  }, [campaigns, user, addCampaign]);

  const incrementStats = useCallback(async (id: string, type: 'views' | 'downloads') => {
    const campaign = campaigns.find(c => c.id === id);
    if (!campaign) return;

    const newValue = campaign[type] + 1;
    await updateCampaign(id, { [type]: newValue });
  }, [campaigns, updateCampaign]);

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
    refetch: fetchCampaigns,
  };
};
