import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface FeaturedCampaign {
  id: string;
  title: string;
  frame_image: string;
  type: string;
  slug: string | null;
}

export function useFeaturedCampaigns() {
  return useQuery({
    queryKey: ['featured-campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select('id, title, frame_image, type, slug, payment_status')
        .eq('is_featured', true)
        .in('payment_status', ['free', 'approved']) // Only show active campaigns
        .order('display_order', { ascending: true })
        .limit(20);

      if (error) throw error;
      return (data || []) as FeaturedCampaign[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });
}

// Helper to fill array with duplicates to reach target count
export function fillWithDuplicates<T>(items: T[], targetCount: number): T[] {
  if (items.length === 0) return [];
  if (items.length >= targetCount) return items.slice(0, targetCount);
  
  const result: T[] = [];
  let index = 0;
  while (result.length < targetCount) {
    result.push(items[index % items.length]);
    index++;
  }
  return result;
}

// Add size parameter for low quality images
export function getLowQualityUrl(url: string, width: number = 200): string {
  if (!url) return '';
  
  // For Supabase storage URLs, add transform parameters
  if (url.includes('supabase') && url.includes('/storage/')) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}width=${width}&quality=60`;
  }
  
  return url;
}
