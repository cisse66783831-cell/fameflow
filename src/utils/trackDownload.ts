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

// Get geolocation from IP
const getGeolocation = async (): Promise<{ country: string | null; city: string | null }> => {
  try {
    const response = await fetch('https://ipapi.co/json/', { 
      signal: AbortSignal.timeout(3000) // 3 second timeout
    });
    if (!response.ok) return { country: null, city: null };
    const data = await response.json();
    return { 
      country: data.country_name || null, 
      city: data.city || null 
    };
  } catch {
    return { country: null, city: null };
  }
};

// Get traffic source info
const getTrafficSource = () => {
  const referrer = document.referrer;
  const urlParams = new URLSearchParams(window.location.search);
  
  let referrerDomain: string | null = null;
  if (referrer) {
    try {
      referrerDomain = new URL(referrer).hostname;
    } catch {
      referrerDomain = referrer;
    }
  }
  
  return {
    referrer: referrerDomain || 'Direct',
    utm_source: urlParams.get('utm_source'),
    utm_medium: urlParams.get('utm_medium'),
    utm_campaign: urlParams.get('utm_campaign'),
  };
};

export const trackDownload = async ({ campaignId, eventId, mediaType }: TrackDownloadParams) => {
  try {
    const userAgent = navigator.userAgent;
    const { deviceType, browser, os } = parseUserAgent(userAgent);
    const sessionId = getSessionId();
    const trafficSource = getTrafficSource();
    
    // Fetch geolocation in parallel but don't block
    const geoPromise = getGeolocation();
    
    // Get geolocation (with fallback to null if it takes too long)
    const geo = await geoPromise;
    
    await supabase.from('download_stats').insert({
      campaign_id: campaignId || null,
      event_id: eventId || null,
      media_type: mediaType,
      user_agent: userAgent,
      session_id: sessionId,
      device_type: deviceType,
      browser: browser,
      os: os,
      country: geo.country,
      city: geo.city,
      referrer: trafficSource.referrer,
      utm_source: trafficSource.utm_source,
      utm_medium: trafficSource.utm_medium,
      utm_campaign: trafficSource.utm_campaign,
    });
    
    console.log('Download tracked:', { mediaType, deviceType, browser, os, geo, trafficSource });
  } catch (error) {
    console.warn('Could not track download stats:', error);
  }
};

export { getSessionId };