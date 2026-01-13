import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface DownloadStat {
  id: string;
  campaign_id: string | null;
  event_id: string | null;
  media_type: string;
  user_agent: string | null;
  session_id: string | null;
  created_at: string | null;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  country: string | null;
  city: string | null;
}

interface DailyTrend {
  date: string;
  downloads: number;
  uniqueVisitors: number;
}

interface MediaTypeDistribution {
  type: string;
  count: number;
  percentage: number;
}

interface DeviceBreakdown {
  device: string;
  count: number;
  percentage: number;
}

interface HourlyDistribution {
  hour: number;
  downloads: number;
}

interface CampaignStats {
  campaignId: string;
  campaignTitle: string;
  downloads: number;
  trend: 'up' | 'down' | 'stable';
}

export const useDownloadStats = () => {
  const { user } = useAuth();

  // Fetch all download stats for user's campaigns
  const { data: rawStats, isLoading, refetch } = useQuery({
    queryKey: ['download-stats', user?.id],
    queryFn: async (): Promise<{ stats: DownloadStat[]; campaigns: { id: string; title: string }[] }> => {
      if (!user?.id) return { stats: [], campaigns: [] };
      
      // First get user's campaigns
      const { data: campaigns } = await supabase
        .from('campaigns')
        .select('id, title')
        .eq('user_id', user.id);

      if (!campaigns || campaigns.length === 0) return { stats: [], campaigns: [] };

      const campaignIds = campaigns.map(c => c.id);

      // Get download stats for these campaigns
      const { data: stats, error } = await supabase
        .from('download_stats')
        .select('*')
        .in('campaign_id', campaignIds)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { stats: (stats || []) as DownloadStat[], campaigns };
    },
    enabled: !!user?.id,
  });

  const stats: DownloadStat[] = rawStats?.stats || [];
  const campaigns = rawStats?.campaigns || [];

  // Calculate total downloads
  const totalDownloads = stats.length;

  // Calculate unique visitors (by session_id)
  const uniqueVisitors = new Set(stats.filter(s => s.session_id).map(s => s.session_id)).size;

  // Calculate daily average
  const getDaysInRange = () => {
    if (stats.length === 0) return 1;
    const dates = stats.map(s => new Date(s.created_at || '').toDateString());
    const uniqueDates = new Set(dates);
    return Math.max(uniqueDates.size, 1);
  };
  const dailyAverage = Math.round(totalDownloads / getDaysInRange());

  // Get most popular media type
  const mediaTypeCounts: Record<string, number> = stats.reduce((acc, s) => {
    acc[s.media_type] = (acc[s.media_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const popularMediaType = Object.entries(mediaTypeCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  // Calculate daily trends (last 14 days)
  const getDailyTrends = (): DailyTrend[] => {
    const last14Days: DailyTrend[] = [];
    const today = new Date();

    for (let i = 13; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const displayDate = date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
      
      const dayStats = stats.filter(s => {
        const statDate = new Date(s.created_at || '').toISOString().split('T')[0];
        return statDate === dateStr;
      });

      last14Days.push({
        date: displayDate,
        downloads: dayStats.length,
        uniqueVisitors: new Set(dayStats.filter(s => s.session_id).map(s => s.session_id)).size,
      });
    }

    return last14Days;
  };

  // Get media type distribution
  const getMediaTypeDistribution = (): MediaTypeDistribution[] => {
    const total = stats.length;
    if (total === 0) return [];

    return Object.entries(mediaTypeCounts).map(([type, count]) => ({
      type: formatMediaType(type),
      count: count,
      percentage: Math.round((count / total) * 100),
    }));
  };

  // Get device breakdown from device_type column (or fallback to user_agent parsing)
  const getDeviceBreakdown = (): DeviceBreakdown[] => {
    const devices: Record<string, number> = { Mobile: 0, Desktop: 0, Tablet: 0 };

    stats.forEach(s => {
      // Use device_type if available, otherwise parse user_agent
      if (s.device_type) {
        const device = s.device_type;
        if (devices[device] !== undefined) {
          devices[device]++;
        } else {
          devices.Desktop++;
        }
      } else {
        const ua = (s.user_agent || '').toLowerCase();
        if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
          devices.Mobile++;
        } else if (ua.includes('tablet') || ua.includes('ipad')) {
          devices.Tablet++;
        } else {
          devices.Desktop++;
        }
      }
    });

    const total = stats.length;
    if (total === 0) return [];

    return Object.entries(devices)
      .filter(([_, count]) => count > 0)
      .map(([device, count]) => ({
        device,
        count,
        percentage: Math.round((count / total) * 100),
      }));
  };

  // Get hourly distribution (peak hours)
  const getHourlyDistribution = (): HourlyDistribution[] => {
    const hours: Record<number, number> = {};
    
    for (let i = 0; i < 24; i++) {
      hours[i] = 0;
    }

    stats.forEach(s => {
      const hour = new Date(s.created_at || '').getHours();
      hours[hour]++;
    });

    return Object.entries(hours).map(([hour, downloads]) => ({
      hour: parseInt(hour),
      downloads,
    }));
  };

  // Get campaign stats with trends
  const getCampaignStats = (): CampaignStats[] => {
    const campaignStats: Record<string, { total: number; recent: number; title: string }> = {};

    campaigns.forEach(c => {
      campaignStats[c.id] = { total: 0, recent: 0, title: c.title };
    });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    stats.forEach(s => {
      if (s.campaign_id && campaignStats[s.campaign_id]) {
        campaignStats[s.campaign_id].total++;
        
        const statDate = new Date(s.created_at || '');
        if (statDate >= sevenDaysAgo) {
          campaignStats[s.campaign_id].recent++;
        }
      }
    });

    return Object.entries(campaignStats)
      .map(([id, data]) => ({
        campaignId: id,
        campaignTitle: data.title,
        downloads: data.total,
        trend: data.recent > data.total / 2 ? 'up' : data.recent < data.total / 4 ? 'down' : 'stable' as 'up' | 'down' | 'stable',
      }))
      .sort((a, b) => b.downloads - a.downloads);
  };

  return {
    isLoading,
    refetch,
    // Summary stats
    totalDownloads,
    uniqueVisitors,
    dailyAverage,
    popularMediaType,
    // Detailed data
    getDailyTrends,
    getMediaTypeDistribution,
    getDeviceBreakdown,
    getHourlyDistribution,
    getCampaignStats,
    // Raw data
    rawStats: stats,
  };
};

// Helper function to format media type labels
const formatMediaType = (type: string): string => {
  const labels: Record<string, string> = {
    photo: 'Photo',
    video: 'Vidéo',
    document: 'Document',
    image: 'Image',
  };
  return labels[type.toLowerCase()] || type;
};
