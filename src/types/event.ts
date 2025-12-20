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
  qr_position_x: number;
  qr_position_y: number;
  ticket_price: number;
  currency: string;
  max_tickets: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PublicVisual {
  id: string;
  event_id: string;
  user_id: string | null;
  creator_name: string;
  creator_photo: string | null;
  visual_url: string;
  is_approved: boolean;
  views: number;
  created_at: string;
  event?: Event;
}
