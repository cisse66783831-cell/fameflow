export interface Event {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  event_date: string;
  venue: string;
  city: string;
  cover_image: string | null;
  frame_image: string;
  qr_position_x: number | null;
  qr_position_y: number | null;
  ticket_price: number | null;
  currency: string | null;
  max_tickets: number | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
  // Photo zone positioning - all nullable like in Supabase
  photo_zone_x: number | null;
  photo_zone_y: number | null;
  photo_zone_width: number | null;
  photo_zone_height: number | null;
  photo_zone_shape: string | null;
  name_zone_enabled: boolean | null;
  name_zone_y: number | null;
}

export interface PublicVisual {
  id: string;
  event_id: string;
  user_id: string | null;
  creator_name: string;
  creator_photo: string | null;
  visual_url: string;
  is_approved: boolean | null;
  is_featured: boolean | null;
  views: number | null;
  created_at: string;
  event?: Event;
}
