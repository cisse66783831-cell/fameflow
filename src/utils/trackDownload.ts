import { supabase } from '@/integrations/supabase/client';

interface TrackDownloadParams {
  campaignId?: string;
  eventId?: string;
  mediaType: 'photo' | 'video' | 'document' | 'pdf';
}

// Parse user agent to extract device info
const parseUserAgent = (ua: string) => {
  const uaLower = ua.toLowerCase();
  
  // Device type
  let deviceType = 'Desktop';
  if (/mobile|android|iphone|ipod/.test(uaLower)) {
    deviceType = 'Mobile';
  } else if (/tablet|ipad/.test(uaLower)) {
    deviceType = 'Tablet';
  }
  
  // Browser
  let browser = 'Unknown';
  if (uaLower.includes('firefox')) {
    browser = 'Firefox';
  } else if (uaLower.includes('edg')) {
    browser = 'Edge';
  } else if (uaLower.includes('chrome')) {
    browser = 'Chrome';
  } else if (uaLower.includes('safari')) {
    browser = 'Safari';
  } else if (uaLower.includes('opera') || uaLower.includes('opr')) {
    browser = 'Opera';
  }
  
  // OS
  let os = 'Unknown';
  if (uaLower.includes('windows')) {
    os = 'Windows';
  } else if (uaLower.includes('mac')) {
    os = 'macOS';
  } else if (uaLower.includes('linux') && !uaLower.includes('android')) {
    os = 'Linux';
  } else if (uaLower.includes('android')) {
    os = 'Android';
  } else if (uaLower.includes('iphone') || uaLower.includes('ipad')) {
    os = 'iOS';
  }
  
  return { deviceType, browser, os };
};

// Get or create session ID for anonymous tracking
const getSessionId = (): string => {
  let sessionId = localStorage.getItem('download_session');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('download_session', sessionId);
  }
  return sessionId;
};

export const trackDownload = async ({ campaignId, eventId, mediaType }: TrackDownloadParams) => {
  try {
    const userAgent = navigator.userAgent;
    const { deviceType, browser, os } = parseUserAgent(userAgent);
    const sessionId = getSessionId();
    
    await supabase.from('download_stats').insert({
      campaign_id: campaignId || null,
      event_id: eventId || null,
      media_type: mediaType,
      user_agent: userAgent,
      session_id: sessionId,
      device_type: deviceType,
      browser: browser,
      os: os,
    });
    
    console.log('Download tracked:', { mediaType, deviceType, browser, os });
  } catch (error) {
    console.warn('Could not track download stats:', error);
  }
};
