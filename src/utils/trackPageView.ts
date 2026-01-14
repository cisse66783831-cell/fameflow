import { supabase } from '@/integrations/supabase/client';
import { getSessionId } from './trackDownload';

interface TrackPageViewParams {
  campaignId?: string;
  eventId?: string;
}

export const trackPageView = ({ campaignId, eventId }: TrackPageViewParams) => {
  const startTime = Date.now();
  const sessionId = getSessionId();
  const pagePath = window.location.pathname;
  
  let hasTracked = false;
  
  const sendPageView = async () => {
    if (hasTracked) return;
    hasTracked = true;
    
    const timeOnPage = Math.round((Date.now() - startTime) / 1000);
    
    // Only track if user spent at least 1 second on page
    if (timeOnPage < 1) return;
    
    try {
      await supabase.from('page_views').insert({
        campaign_id: campaignId || null,
        event_id: eventId || null,
        session_id: sessionId,
        page_path: pagePath,
        time_on_page: timeOnPage,
      });
      console.log('Page view tracked:', { timeOnPage, pagePath });
    } catch (error) {
      console.warn('Could not track page view:', error);
    }
  };
  
  // Track on page unload
  const handleBeforeUnload = () => {
    sendPageView();
  };
  
  // Track on visibility change (user switches tab/minimizes)
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      sendPageView();
    }
  };
  
  window.addEventListener('beforeunload', handleBeforeUnload);
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    // Also send when component unmounts (navigation)
    sendPageView();
  };
};