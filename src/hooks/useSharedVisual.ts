import { supabase } from '@/integrations/supabase/client';

interface CreateSharedVisualParams {
  eventId?: string;
  campaignId?: string;
  creatorName: string;
  visualBlob: Blob;
  description?: string;
}

export async function createSharedVisual({
  eventId,
  campaignId,
  creatorName,
  visualBlob,
  description,
}: CreateSharedVisualParams): Promise<string | null> {
  try {
    // Generate unique filename
    const fileName = `shared/${Date.now()}-${Math.random().toString(36).substring(7)}.png`;
    
    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('campaign-images')
      .upload(fileName, visualBlob, {
        contentType: 'image/png',
        cacheControl: '31536000', // 1 year cache
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return null;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('campaign-images')
      .getPublicUrl(fileName);

    // Create database record
    const { data: visualData, error: insertError } = await supabase
      .from('shared_visuals')
      .insert({
        event_id: eventId || null,
        campaign_id: campaignId || null,
        creator_name: creatorName,
        visual_url: urlData.publicUrl,
        description: description || null,
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return null;
    }

    // Return the share URL
    return `/share/${visualData.id}`;
  } catch (error) {
    console.error('Error creating shared visual:', error);
    return null;
  }
}

export function getShareUrl(visualId: string): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}/share/${visualId}`;
}
