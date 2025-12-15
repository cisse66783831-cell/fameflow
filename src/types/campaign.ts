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
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  type: 'photo' | 'document';
  frameImage: string; // Base64 encoded
  backgroundImage?: string; // For document type
  textElements: TextElement[];
  hashtags: string[];
  views: number;
  downloads: number;
  createdAt: Date;
  isDemo?: boolean;
}

export interface ParticipantData {
  photo?: string;
  textValues: Record<string, string>;
  zoom: number;
  rotation: number;
  offsetX: number;
  offsetY: number;
}
