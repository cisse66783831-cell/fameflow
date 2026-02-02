export interface TextElement {
  id: string;
  label: string;
  value: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  fontWeight: string;
  isDraggable: boolean;
  // New fields for document system
  fieldType?: 'name' | 'date' | 'serial' | 'title' | 'custom';
  required?: boolean;
  placeholder?: string;
}

export type DocumentFormat = 'a4-landscape' | 'a4-portrait' | 'square' | 'badge';
export type DocumentCategory = 'certificate' | 'attestation' | 'diploma' | 'badge' | 'invitation';

export type PaymentStatus = 'free' | 'pending' | 'approved' | 'rejected';
export type WatermarkStatus = 'active' | 'pending' | 'removed';

export interface Campaign {
  id: string;
  title: string;
  description: string;
  type: 'photo' | 'document' | 'video_filter';
  frameImage: string; // Base64 encoded or URL
  frameImagePortrait?: string; // For video filters - portrait frame
  frameImageLandscape?: string; // For video filters - landscape frame
  backgroundImage?: string; // For document type
  textElements: TextElement[];
  hashtags: string[];
  views: number;
  downloads: number;
  createdAt: Date;
  isDemo?: boolean;
  slug?: string; // Personalized URL slug
  // New fields for document system
  documentFormat?: DocumentFormat;
  documentCategory?: DocumentCategory;
  // Photo zone fields for "J'y serai" campaigns
  photoZoneX?: number | null;
  photoZoneY?: number | null;
  photoZoneWidth?: number | null;
  photoZoneHeight?: number | null;
  photoZoneShape?: 'rect' | 'circle' | null;
  nameZoneEnabled?: boolean | null;
  nameZoneY?: number | null;
  // Payment tracking for video campaigns
  paymentStatus?: PaymentStatus;
  transactionCode?: string | null;
  paymentCountry?: string | null;
  paymentAmount?: number | null;
  // Watermark tracking for photo campaigns
  watermarkStatus?: WatermarkStatus;
  watermarkRemovalRequestedAt?: Date | null;
}

export interface ParticipantData {
  photo?: string;
  textValues: Record<string, string>;
  zoom: number;
  rotation: number;
  offsetX: number;
  offsetY: number;
}
