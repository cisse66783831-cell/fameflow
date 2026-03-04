import { Campaign, TextElement } from '@/types/campaign';
import { Json } from '@/integrations/supabase/types';

/**
 * Single source of truth for mapping a Supabase campaign row to the Campaign type.
 */
export const mapDbToCampaign = (db: {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  type: string;
  frame_image: string;
  frame_image_portrait?: string | null;
  frame_image_landscape?: string | null;
  background_image: string | null;
  text_elements: Json;
  hashtags: string[];
  views: number;
  downloads: number;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
  slug?: string | null;
  photo_zone_x?: number | null;
  photo_zone_y?: number | null;
  photo_zone_width?: number | null;
  photo_zone_height?: number | null;
  photo_zone_shape?: string | null;
  name_zone_enabled?: boolean | null;
  name_zone_y?: number | null;
  payment_status?: string | null;
  transaction_code?: string | null;
  payment_country?: string | null;
  payment_amount?: number | null;
  watermark_status?: string | null;
  watermark_payment_amount?: number | null;
  watermark_removal_requested_at?: string | null;
}): Campaign => ({
  id: db.id,
  title: db.title,
  description: db.description || '',
  type: db.type as 'photo' | 'document' | 'video_filter',
  frameImage: db.frame_image,
  frameImagePortrait: db.frame_image_portrait || undefined,
  frameImageLandscape: db.frame_image_landscape || undefined,
  backgroundImage: db.background_image || undefined,
  textElements: db.text_elements as unknown as TextElement[],
  hashtags: db.hashtags,
  views: db.views,
  downloads: db.downloads,
  createdAt: new Date(db.created_at),
  isDemo: db.is_demo,
  slug: db.slug || undefined,
  photoZoneX: db.photo_zone_x,
  photoZoneY: db.photo_zone_y,
  photoZoneWidth: db.photo_zone_width,
  photoZoneHeight: db.photo_zone_height,
  photoZoneShape: db.photo_zone_shape as 'rect' | 'circle' | null,
  nameZoneEnabled: db.name_zone_enabled,
  nameZoneY: db.name_zone_y,
  paymentStatus: (db.payment_status as Campaign['paymentStatus']) || 'free',
  transactionCode: db.transaction_code,
  paymentCountry: db.payment_country,
  paymentAmount: db.payment_amount,
  watermarkStatus: (db.watermark_status as Campaign['watermarkStatus']) || 'active',
  watermarkPaymentAmount: db.watermark_payment_amount,
  watermarkRemovalRequestedAt: db.watermark_removal_requested_at ? new Date(db.watermark_removal_requested_at) : null,
});
