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
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
}

interface PageView {
  id: string;
  campaign_id: string | null;
  event_id: string | null;
  session_id: string | null;
  page_path: string;
  time_on_page: number | null;
  created_at: string;
}

interface CampaignData {
  id: string;
  title: string;
  views: number;
  downloads: number;
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

interface BrowserBreakdown {
  browser: string;
  count: number;
  percentage: number;
}

interface OSBreakdown {
  os: string;
  count: number;
  percentage: number;
}

interface LocationBreakdown {
  location: string;
  count: number;
  percentage: number;
}

interface ReferrerBreakdown {
  source: string;
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
  views: number;
  conversionRate: number;
  trend: 'up' | 'down' | 'stable';
}

interface EventStats {
  eventId: string;
  eventTitle: string;
  downloads: number;
  trend: 'up' | 'down' | 'stable';
}

interface PerformanceComparison {
  currentDownloads: number;
  previousDownloads: number;
  changePercent: number;
  currentVisitors: number;
  previousVisitors: number;
  visitorsChangePercent: number;
}

export const useDownloadStats = (periodDays: number = 14) => {
  const { user } = useAuth();

  // Fetch all download stats for user's campaigns
  const { data: rawData, isLoading, refetch } = useQuery({
    queryKey: ['download-stats', user?.id, periodDays],
    queryFn: async (): Promise<{ 
      stats: DownloadStat[]; 
      campaigns: CampaignData[];
      pageViews: PageView[];
      events: { id: string; title: string }[];
    }> => {
      if (!user?.id) return { stats: [], campaigns: [], pageViews: [], events: [] };
      
      // Fetch campaigns, events, and their stats in parallel
      const [campaignsRes, eventsRes] = await Promise.all([
        supabase
          .from('campaigns')
          .select('id, title, views, downloads')
          .eq('user_id', user.id),
        supabase
          .from('events')
          .select('id, title')
          .eq('user_id', user.id),
      ]);

      const campaigns = campaignsRes.data || [];
      const events = eventsRes.data || [];
      
      if (campaigns.length === 0 && events.length === 0) {
        return { stats: [], campaigns: [], pageViews: [], events: [] };
      }

      const campaignIds = campaigns.map(c => c.id);
      const eventIds = events.map(e => e.id);

      // Fetch download stats and page views in parallel
      const [statsRes, pageViewsRes] = await Promise.all([
        supabase
          .from('download_stats')
          .select('*')
          .or(`campaign_id.in.(${campaignIds.join(',')}),event_id.in.(${eventIds.join(',')})`)
          .order('created_at', { ascending: false }),
        supabase
          .from('page_views')
          .select('*')
          .or(`campaign_id.in.(${campaignIds.join(',')}),event_id.in.(${eventIds.join(',')})`)
          .order('created_at', { ascending: false }),
      ]);

      return { 
        stats: (statsRes.data || []) as DownloadStat[], 
        campaigns,
        pageViews: (pageViewsRes.data || []) as PageView[],
        events,
      };
    },
    enabled: !!user?.id,
  });

  const stats: DownloadStat[] = rawData?.stats || [];
  const campaigns = rawData?.campaigns || [];
  const pageViews: PageView[] = rawData?.pageViews || [];
  const events = rawData?.events || [];

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

  // Calculate total views from campaigns
  const totalViews = campaigns.reduce((sum, c) => sum + (c.views || 0), 0);

  // Calculate conversion rate
  const conversionRate = totalViews > 0 ? Math.round((totalDownloads / totalViews) * 100) : 0;

  // Calculate average time on page
  const avgTimeOnPage = pageViews.length > 0
    ? Math.round(pageViews.reduce((sum, pv) => sum + (pv.time_on_page || 0), 0) / pageViews.length)
    : 0;

  // Get most popular media type
  const mediaTypeCounts: Record<string, number> = stats.reduce((acc, s) => {
    acc[s.media_type] = (acc[s.media_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const popularMediaType = Object.entries(mediaTypeCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  // Calculate daily trends
  const getDailyTrends = (): DailyTrend[] => {
    const trends: DailyTrend[] = [];
    const today = new Date();

    for (let i = periodDays - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const displayDate = date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
      
      const dayStats = stats.filter(s => {
        const statDate = new Date(s.created_at || '').toISOString().split('T')[0];
        return statDate === dateStr;
      });

      trends.push({
        date: displayDate,
        downloads: dayStats.length,
        uniqueVisitors: new Set(dayStats.filter(s => s.session_id).map(s => s.session_id)).size,
      });
    }

    return trends;
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

  // Get device breakdown
  const getDeviceBreakdown = (): DeviceBreakdown[] => {
    const devices: Record<string, number> = { Mobile: 0, Desktop: 0, Tablet: 0 };

    stats.forEach(s => {
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
      }))
      .sort((a, b) => b.count - a.count);
  };

  // Get browser breakdown
  const getBrowserBreakdown = (): BrowserBreakdown[] => {
    const browsers: Record<string, number> = {};

    stats.forEach(s => {
      const browser = s.browser || 'Unknown';
      browsers[browser] = (browsers[browser] || 0) + 1;
    });

    const total = stats.length;
    if (total === 0) return [];

    return Object.entries(browsers)
      .map(([browser, count]) => ({
        browser,
        count,
        percentage: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count);
  };

  // Get OS breakdown
  const getOSBreakdown = (): OSBreakdown[] => {
    const osMap: Record<string, number> = {};

    stats.forEach(s => {
      const os = s.os || 'Unknown';
      osMap[os] = (osMap[os] || 0) + 1;
    });

    const total = stats.length;
    if (total === 0) return [];

    return Object.entries(osMap)
      .map(([os, count]) => ({
        os,
        count,
        percentage: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count);
  };

  // Get location breakdown
  const getLocationBreakdown = (): LocationBreakdown[] => {
    const locations: Record<string, number> = {};

    stats.forEach(s => {
      const location = s.country || 'Unknown';
      locations[location] = (locations[location] || 0) + 1;
    });

    const total = stats.length;
    if (total === 0) return [];

    return Object.entries(locations)
      .map(([location, count]) => ({
        location,
        count,
        percentage: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count);
  };

  // Get referrer breakdown
  const getReferrerBreakdown = (): ReferrerBreakdown[] => {
    const referrers: Record<string, number> = {};

    stats.forEach(s => {
      let source = s.referrer || 'Direct';
      
      // Categorize common sources
      if (s.utm_source) {
        source = s.utm_source;
      } else if (source.includes('google')) {
        source = 'Google';
      } else if (source.includes('facebook') || source.includes('fb.')) {
        source = 'Facebook';
      } else if (source.includes('instagram')) {
        source = 'Instagram';
      } else if (source.includes('twitter') || source.includes('t.co')) {
        source = 'Twitter/X';
      } else if (source.includes('linkedin')) {
        source = 'LinkedIn';
      } else if (source.includes('whatsapp')) {
        source = 'WhatsApp';
      } else if (source === 'Direct') {
        source = 'Direct';
      } else {
        source = 'Autre';
      }
      
      referrers[source] = (referrers[source] || 0) + 1;
    });

    const total = stats.length;
    if (total === 0) return [];

    return Object.entries(referrers)
      .map(([source, count]) => ({
        source,
        count,
        percentage: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count);
  };

  // Get hourly distribution
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

  // Get campaign stats with conversion rates
  const getCampaignStats = (): CampaignStats[] => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return campaigns.map(c => {
      const campaignDownloads = stats.filter(s => s.campaign_id === c.id);
      const recentDownloads = campaignDownloads.filter(s => 
        new Date(s.created_at || '') >= sevenDaysAgo
      ).length;
      
      const total = campaignDownloads.length;
      const trend: 'up' | 'down' | 'stable' = 
        recentDownloads > total / 2 ? 'up' : 
        recentDownloads < total / 4 ? 'down' : 'stable';

      return {
        campaignId: c.id,
        campaignTitle: c.title,
        downloads: total,
        views: c.views || 0,
        conversionRate: c.views > 0 ? Math.round((total / c.views) * 100) : 0,
        trend,
      };
    }).sort((a, b) => b.downloads - a.downloads);
  };

  // Get event stats
  const getEventStats = (): EventStats[] => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return events.map(e => {
      const eventDownloads = stats.filter(s => s.event_id === e.id);
      const recentDownloads = eventDownloads.filter(s => 
        new Date(s.created_at || '') >= sevenDaysAgo
      ).length;
      
      const total = eventDownloads.length;
      const trend: 'up' | 'down' | 'stable' = 
        recentDownloads > total / 2 ? 'up' : 
        recentDownloads < total / 4 ? 'down' : 'stable';

      return {
        eventId: e.id,
        eventTitle: e.title,
        downloads: total,
        trend,
      };
    }).sort((a, b) => b.downloads - a.downloads);
  };

  // Get performance comparison between current and previous period
  const getPerformanceComparison = (days: number = 7): PerformanceComparison => {
    const now = new Date();
    const currentPeriodStart = new Date(now);
    currentPeriodStart.setDate(currentPeriodStart.getDate() - days);
    
    const previousPeriodStart = new Date(currentPeriodStart);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - days);
    
    const currentStats = stats.filter(s => 
      new Date(s.created_at || '') >= currentPeriodStart
    );
    
    const previousStats = stats.filter(s => {
      const date = new Date(s.created_at || '');
      return date >= previousPeriodStart && date < currentPeriodStart;
    });
    
    const currentDownloads = currentStats.length;
    const previousDownloads = previousStats.length;
    const changePercent = previousDownloads > 0 
      ? Math.round(((currentDownloads - previousDownloads) / previousDownloads) * 100)
      : currentDownloads > 0 ? 100 : 0;
    
    const currentVisitors = new Set(currentStats.filter(s => s.session_id).map(s => s.session_id)).size;
    const previousVisitors = new Set(previousStats.filter(s => s.session_id).map(s => s.session_id)).size;
    const visitorsChangePercent = previousVisitors > 0
      ? Math.round(((currentVisitors - previousVisitors) / previousVisitors) * 100)
      : currentVisitors > 0 ? 100 : 0;
      
    return { 
      currentDownloads, 
      previousDownloads, 
      changePercent,
      currentVisitors,
      previousVisitors,
      visitorsChangePercent,
    };
  };

  // Get summary for export
  const getExportSummary = () => {
    const deviceBreakdown = getDeviceBreakdown();
    const browserBreakdown = getBrowserBreakdown();
    const locationBreakdown = getLocationBreakdown();
    
    return {
      totalDownloads,
      uniqueVisitors,
      dailyAverage,
      conversionRate,
      avgTimeOnPage,
      topCountry: locationBreakdown[0]?.location || 'N/A',
      topBrowser: browserBreakdown[0]?.browser || 'N/A',
      topDevice: deviceBreakdown[0]?.device || 'N/A',
    };
  };

  // Get campaign titles map for export
  const getCampaignTitles = (): Record<string, string> => {
    return campaigns.reduce((acc, c) => {
      acc[c.id] = c.title;
      return acc;
    }, {} as Record<string, string>);
  };

  return {
    isLoading,
    refetch,
    // Summary stats
    totalDownloads,
    uniqueVisitors,
    dailyAverage,
    popularMediaType,
    totalViews,
    conversionRate,
    avgTimeOnPage,
    // Detailed data functions
    getDailyTrends,
    getMediaTypeDistribution,
    getDeviceBreakdown,
    getBrowserBreakdown,
    getOSBreakdown,
    getLocationBreakdown,
    getReferrerBreakdown,
    getHourlyDistribution,
    getCampaignStats,
    getEventStats,
    getPerformanceComparison,
    // Export helpers
    getExportSummary,
    getCampaignTitles,
    // Raw data
    rawStats: stats,
    pageViews,
  };
};

// Helper function to format media type labels
const formatMediaType = (type: string): string => {
  const labels: Record<string, string> = {
    photo: 'Photo',
    video: 'Vidéo',
    document: 'Document',
    pdf: 'PDF',
    image: 'Image',
  };
  return labels[type.toLowerCase()] || type;
};