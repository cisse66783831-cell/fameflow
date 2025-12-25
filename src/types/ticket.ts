export type AppRole = 'admin' | 'promoter' | 'staff' | 'scanner' | 'user';
export type TicketStatus = 'pending' | 'paid' | 'used' | 'cancelled' | 'expired';
export type PaymentMethod = 'orange_money' | 'mtn_money' | 'moov_money' | 'wave' | 'card' | 'free';

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  event_id: string | null;
  created_at: string;
}

export interface Ticket {
  id: string;
  event_id: string;
  owner_id: string | null;
  purchaser_id: string;
  qr_code: string;
  status: TicketStatus;
  is_gift: boolean;
  recipient_name: string | null;
  recipient_phone: string | null;
  recipient_email: string | null;
  scanned_at: string | null;
  scanned_by: string | null;
  price: number;
  currency: string;
  created_at: string;
  updated_at: string;
  event?: import('./event').Event;
}

export interface Transaction {
  id: string;
  ticket_id: string;
  user_id: string;
  amount: number;
  currency: string;
  payment_method: PaymentMethod;
  payment_reference: string | null;
  payment_phone: string | null;
  status: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}
