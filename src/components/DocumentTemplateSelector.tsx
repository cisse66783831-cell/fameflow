import { Campaign, TextElement } from '@/types/campaign';
import { cn } from '@/lib/utils';
import { Award, GraduationCap, FileCheck, Users, Ticket } from 'lucide-react';

interface DocumentTemplateSelectorProps {
  onSelect: (template: Partial<Campaign>) => void;
}

interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  format: 'a4-landscape' | 'a4-portrait' | 'square' | 'badge';
  category: 'certificate' | 'attestation' | 'diploma' | 'badge' | 'invitation';
  textElements: TextElement[];
  backgroundSvg: string;
}

const createBackgroundSvg = (width: number, height: number, style: 'classic' | 'modern' | 'elegant' | 'minimal'): string => {
  const styles = {
    classic: `
      <rect width="${width}" height="${height}" fill="#fffdf7"/>
      <rect x="20" y="20" width="${width - 40}" height="${height - 40}" stroke="#6366f1" stroke-width="3" fill="none"/>
      <rect x="30" y="30" width="${width - 60}" height="${height - 60}" stroke="#a855f7" stroke-width="1" fill="none"/>
      <circle cx="${width / 2}" cy="60" r="25" fill="#6366f1"/>
      <path d="M${width / 2 - 10} 60L${width / 2 - 3} 67L${width / 2 + 12} 52" stroke="white" stroke-width="3" fill="none" stroke-linecap="round"/>
    `,
    modern: `
      <rect width="${width}" height="${height}" fill="#ffffff"/>
      <rect x="0" y="0" width="${width}" height="80" fill="url(#grad1)"/>
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#a855f7;stop-opacity:1" />
        </linearGradient>
      </defs>
    `,
    elegant: `
      <rect width="${width}" height="${height}" fill="#1e1b4b"/>
      <rect x="15" y="15" width="${width - 30}" height="${height - 30}" stroke="#fbbf24" stroke-width="2" fill="none"/>
      <circle cx="40" cy="40" r="15" stroke="#fbbf24" stroke-width="1" fill="none"/>
      <circle cx="${width - 40}" cy="40" r="15" stroke="#fbbf24" stroke-width="1" fill="none"/>
      <circle cx="40" cy="${height - 40}" r="15" stroke="#fbbf24" stroke-width="1" fill="none"/>
      <circle cx="${width - 40}" cy="${height - 40}" r="15" stroke="#fbbf24" stroke-width="1" fill="none"/>
    `,
    minimal: `
      <rect width="${width}" height="${height}" fill="#ffffff"/>
      <line x1="40" y1="${height - 80}" x2="${width - 40}" y2="${height - 80}" stroke="#e5e7eb" stroke-width="1"/>
    `,
  };

  return `data:image/svg+xml;base64,${btoa(`<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">${styles[style]}</svg>`)}`;
};

const DOCUMENT_TEMPLATES: DocumentTemplate[] = [
  {
    id: 'attestation-participation',
    name: 'Attestation de participation',
    description: 'Attestation officielle pour événements et formations',
    icon: <FileCheck className="w-5 h-5" />,
    format: 'a4-landscape',
    category: 'attestation',
    backgroundSvg: createBackgroundSvg(800, 566, 'classic'),
    textElements: [
      {
        id: 'title',
        label: 'Titre',
        value: 'ATTESTATION DE PARTICIPATION',
        x: 400,
        y: 120,
        fontSize: 28,
        fontFamily: 'Georgia',
        color: '#6366f1',
        fontWeight: 'bold',
        isDraggable: false,
        fieldType: 'custom',
        required: false,
      },
      {
        id: 'intro',
        label: 'Introduction',
        value: 'Nous certifions que',
        x: 400,
        y: 200,
        fontSize: 16,
        fontFamily: 'Arial',
        color: '#64748b',
        fontWeight: 'normal',
        isDraggable: false,
        fieldType: 'custom',
        required: false,
      },
      {
        id: 'name',
        label: 'Nom du participant',
        value: 'Nom du participant',
        x: 400,
        y: 260,
        fontSize: 36,
        fontFamily: 'Georgia',
        color: '#1e1b4b',
        fontWeight: 'bold',
        isDraggable: true,
        fieldType: 'name',
        required: true,
        placeholder: 'Entrez le nom complet',
      },
      {
        id: 'event',
        label: 'Événement/Formation',
        value: 'a participé à notre événement',
        x: 400,
        y: 330,
        fontSize: 18,
        fontFamily: 'Arial',
        color: '#64748b',
        fontWeight: 'normal',
        isDraggable: true,
        fieldType: 'custom',
        required: false,
      },
      {
        id: 'date',
        label: 'Date',
        value: 'Le 15 janvier 2025',
        x: 400,
        y: 420,
        fontSize: 14,
        fontFamily: 'Arial',
        color: '#64748b',
        fontWeight: 'normal',
        isDraggable: true,
        fieldType: 'date',
        required: true,
      },
      {
        id: 'signature',
        label: 'Signature',
        value: 'Le Directeur',
        x: 650,
        y: 500,
        fontSize: 12,
        fontFamily: 'Arial',
        color: '#64748b',
        fontWeight: 'normal',
        isDraggable: true,
        fieldType: 'custom',
        required: false,
      },
    ],
  },
  {
    id: 'certificat-formation',
    name: 'Certificat de formation',
    description: 'Certificat professionnel avec durée et formateur',
    icon: <GraduationCap className="w-5 h-5" />,
    format: 'a4-landscape',
    category: 'certificate',
    backgroundSvg: createBackgroundSvg(800, 566, 'modern'),
    textElements: [
      {
        id: 'title',
        label: 'Titre',
        value: 'CERTIFICAT DE FORMATION',
        x: 400,
        y: 50,
        fontSize: 24,
        fontFamily: 'Arial',
        color: '#ffffff',
        fontWeight: 'bold',
        isDraggable: false,
        fieldType: 'custom',
        required: false,
      },
      {
        id: 'name',
        label: 'Nom du participant',
        value: 'Nom du participant',
        x: 400,
        y: 180,
        fontSize: 36,
        fontFamily: 'Georgia',
        color: '#1e1b4b',
        fontWeight: 'bold',
        isDraggable: true,
        fieldType: 'name',
        required: true,
        placeholder: 'Entrez le nom complet',
      },
      {
        id: 'course',
        label: 'Nom de la formation',
        value: 'Nom de la formation',
        x: 400,
        y: 250,
        fontSize: 20,
        fontFamily: 'Arial',
        color: '#6366f1',
        fontWeight: 'bold',
        isDraggable: true,
        fieldType: 'title',
        required: true,
      },
      {
        id: 'duration',
        label: 'Durée',
        value: 'Durée: 20 heures',
        x: 400,
        y: 320,
        fontSize: 16,
        fontFamily: 'Arial',
        color: '#64748b',
        fontWeight: 'normal',
        isDraggable: true,
        fieldType: 'custom',
        required: false,
      },
      {
        id: 'date',
        label: 'Date',
        value: 'Délivré le 15 janvier 2025',
        x: 400,
        y: 380,
        fontSize: 14,
        fontFamily: 'Arial',
        color: '#64748b',
        fontWeight: 'normal',
        isDraggable: true,
        fieldType: 'date',
        required: true,
      },
      {
        id: 'trainer',
        label: 'Formateur',
        value: 'Formateur: Jean Dupont',
        x: 400,
        y: 450,
        fontSize: 14,
        fontFamily: 'Arial',
        color: '#64748b',
        fontWeight: 'normal',
        isDraggable: true,
        fieldType: 'custom',
        required: false,
      },
      {
        id: 'serial',
        label: 'Numéro de série',
        value: 'N° CERT-2025-0001',
        x: 700,
        y: 520,
        fontSize: 10,
        fontFamily: 'Courier New',
        color: '#9ca3af',
        fontWeight: 'normal',
        isDraggable: false,
        fieldType: 'serial',
        required: false,
      },
    ],
  },
  {
    id: 'diplome-honneur',
    name: 'Diplôme d\'honneur',
    description: 'Diplôme élégant style académique',
    icon: <Award className="w-5 h-5" />,
    format: 'a4-landscape',
    category: 'diploma',
    backgroundSvg: createBackgroundSvg(800, 566, 'elegant'),
    textElements: [
      {
        id: 'title',
        label: 'Titre',
        value: 'DIPLÔME D\'HONNEUR',
        x: 400,
        y: 100,
        fontSize: 32,
        fontFamily: 'Georgia',
        color: '#fbbf24',
        fontWeight: 'bold',
        isDraggable: false,
        fieldType: 'custom',
        required: false,
      },
      {
        id: 'subtitle',
        label: 'Sous-titre',
        value: 'Décerné à',
        x: 400,
        y: 180,
        fontSize: 16,
        fontFamily: 'Georgia',
        color: '#e5e7eb',
        fontWeight: 'normal',
        isDraggable: false,
        fieldType: 'custom',
        required: false,
      },
      {
        id: 'name',
        label: 'Nom du lauréat',
        value: 'Nom du lauréat',
        x: 400,
        y: 250,
        fontSize: 42,
        fontFamily: 'Georgia',
        color: '#ffffff',
        fontWeight: 'bold',
        isDraggable: true,
        fieldType: 'name',
        required: true,
        placeholder: 'Entrez le nom du lauréat',
      },
      {
        id: 'reason',
        label: 'Motif',
        value: 'Pour son excellence et son dévouement',
        x: 400,
        y: 330,
        fontSize: 18,
        fontFamily: 'Georgia',
        color: '#e5e7eb',
        fontWeight: 'normal',
        isDraggable: true,
        fieldType: 'custom',
        required: false,
      },
      {
        id: 'date',
        label: 'Date',
        value: '15 janvier 2025',
        x: 400,
        y: 450,
        fontSize: 14,
        fontFamily: 'Arial',
        color: '#9ca3af',
        fontWeight: 'normal',
        isDraggable: true,
        fieldType: 'date',
        required: true,
      },
    ],
  },
  {
    id: 'badge-membre',
    name: 'Badge membre',
    description: 'Carte de membre format badge',
    icon: <Users className="w-5 h-5" />,
    format: 'badge',
    category: 'badge',
    backgroundSvg: createBackgroundSvg(500, 300, 'modern'),
    textElements: [
      {
        id: 'org',
        label: 'Organisation',
        value: 'NOM DE L\'ORGANISATION',
        x: 250,
        y: 45,
        fontSize: 14,
        fontFamily: 'Arial',
        color: '#ffffff',
        fontWeight: 'bold',
        isDraggable: false,
        fieldType: 'custom',
        required: false,
      },
      {
        id: 'member-label',
        label: 'Label membre',
        value: 'MEMBRE',
        x: 250,
        y: 120,
        fontSize: 12,
        fontFamily: 'Arial',
        color: '#6366f1',
        fontWeight: 'bold',
        isDraggable: false,
        fieldType: 'custom',
        required: false,
      },
      {
        id: 'name',
        label: 'Nom',
        value: 'Prénom NOM',
        x: 250,
        y: 160,
        fontSize: 24,
        fontFamily: 'Georgia',
        color: '#1e1b4b',
        fontWeight: 'bold',
        isDraggable: true,
        fieldType: 'name',
        required: true,
        placeholder: 'Entrez le nom du membre',
      },
      {
        id: 'role',
        label: 'Fonction',
        value: 'Fonction/Titre',
        x: 250,
        y: 200,
        fontSize: 14,
        fontFamily: 'Arial',
        color: '#64748b',
        fontWeight: 'normal',
        isDraggable: true,
        fieldType: 'title',
        required: false,
      },
      {
        id: 'id',
        label: 'ID Membre',
        value: 'ID: MBR-2025-001',
        x: 250,
        y: 260,
        fontSize: 10,
        fontFamily: 'Courier New',
        color: '#9ca3af',
        fontWeight: 'normal',
        isDraggable: false,
        fieldType: 'serial',
        required: false,
      },
    ],
  },
  {
    id: 'invitation-event',
    name: 'Invitation événement',
    description: 'Invitation personnalisée',
    icon: <Ticket className="w-5 h-5" />,
    format: 'a4-portrait',
    category: 'invitation',
    backgroundSvg: createBackgroundSvg(566, 800, 'minimal'),
    textElements: [
      {
        id: 'vous-etes',
        label: 'Accroche',
        value: 'Vous êtes invité(e)',
        x: 283,
        y: 150,
        fontSize: 18,
        fontFamily: 'Georgia',
        color: '#64748b',
        fontWeight: 'normal',
        isDraggable: false,
        fieldType: 'custom',
        required: false,
      },
      {
        id: 'event-name',
        label: 'Nom de l\'événement',
        value: 'NOM DE L\'ÉVÉNEMENT',
        x: 283,
        y: 250,
        fontSize: 32,
        fontFamily: 'Georgia',
        color: '#1e1b4b',
        fontWeight: 'bold',
        isDraggable: true,
        fieldType: 'custom',
        required: true,
      },
      {
        id: 'guest-name',
        label: 'Nom de l\'invité',
        value: 'Nom de l\'invité',
        x: 283,
        y: 400,
        fontSize: 24,
        fontFamily: 'Georgia',
        color: '#6366f1',
        fontWeight: 'bold',
        isDraggable: true,
        fieldType: 'name',
        required: true,
        placeholder: 'Entrez le nom de l\'invité',
      },
      {
        id: 'date',
        label: 'Date et heure',
        value: '15 janvier 2025 à 19h00',
        x: 283,
        y: 500,
        fontSize: 16,
        fontFamily: 'Arial',
        color: '#64748b',
        fontWeight: 'normal',
        isDraggable: true,
        fieldType: 'date',
        required: true,
      },
      {
        id: 'lieu',
        label: 'Lieu',
        value: 'Lieu de l\'événement',
        x: 283,
        y: 550,
        fontSize: 14,
        fontFamily: 'Arial',
        color: '#64748b',
        fontWeight: 'normal',
        isDraggable: true,
        fieldType: 'custom',
        required: false,
      },
    ],
  },
];

export const DocumentTemplateSelector = ({ onSelect }: DocumentTemplateSelectorProps) => {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Choisissez un modèle ou partez de zéro
      </p>
      
      <div className="grid grid-cols-2 gap-3">
        {/* Start from scratch */}
        <button
          onClick={() => onSelect({
            type: 'document',
            documentFormat: 'a4-landscape',
            documentCategory: 'attestation',
            textElements: [],
          })}
          className={cn(
            "p-4 rounded-xl border-2 border-dashed transition-all text-left",
            "hover:border-primary hover:bg-primary/5"
          )}
        >
          <div className="p-2 rounded-lg bg-muted w-fit mb-2">
            <FileCheck className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="font-medium text-sm">Vierge</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Partir de zéro
          </p>
        </button>

        {/* Templates */}
        {DOCUMENT_TEMPLATES.map(template => (
          <button
            key={template.id}
            onClick={() => onSelect({
              type: 'document',
              documentFormat: template.format,
              documentCategory: template.category,
              textElements: template.textElements,
              backgroundImage: template.backgroundSvg,
            })}
            className={cn(
              "p-4 rounded-xl border-2 border-dashed transition-all text-left",
              "hover:border-primary hover:bg-primary/5"
            )}
          >
            <div className="p-2 rounded-lg bg-primary/10 w-fit mb-2">
              {template.icon}
            </div>
            <p className="font-medium text-sm">{template.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
              {template.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};

export { DOCUMENT_TEMPLATES };
