import { TextElement } from '@/types/campaign';
import { Button } from '@/components/ui/button';
import { 
  Plus, Trash2, AlignCenter, Type
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DocumentFieldEditorProps {
  textElements: TextElement[];
  onChange: (elements: TextElement[]) => void;
  canvasWidth: number;
  canvasHeight: number;
  selectedFieldId?: string | null;
  onSelectField?: (id: string | null) => void;
}

// Polices avec variantes - affichage visuel
const FONT_OPTIONS = [
  // Élégantes / Serif
  { value: 'Playfair Display', label: 'Playfair Display', weight: '400', category: 'Élégante' },
  { value: 'Playfair Display', label: 'Playfair Display Bold', weight: '700', category: 'Élégante' },
  { value: 'Playfair Display', label: 'Playfair Display Black', weight: '900', category: 'Élégante' },
  { value: 'Merriweather', label: 'Merriweather', weight: '400', category: 'Élégante' },
  { value: 'Merriweather', label: 'Merriweather Bold', weight: '700', category: 'Élégante' },
  
  // Modernes / Sans-serif
  { value: 'Montserrat', label: 'Montserrat Light', weight: '300', category: 'Moderne' },
  { value: 'Montserrat', label: 'Montserrat', weight: '400', category: 'Moderne' },
  { value: 'Montserrat', label: 'Montserrat Bold', weight: '700', category: 'Moderne' },
  { value: 'Montserrat', label: 'Montserrat Black', weight: '900', category: 'Moderne' },
  { value: 'Poppins', label: 'Poppins Light', weight: '300', category: 'Moderne' },
  { value: 'Poppins', label: 'Poppins', weight: '400', category: 'Moderne' },
  { value: 'Poppins', label: 'Poppins Bold', weight: '700', category: 'Moderne' },
  { value: 'Outfit', label: 'Outfit', weight: '400', category: 'Moderne' },
  { value: 'Outfit', label: 'Outfit Bold', weight: '700', category: 'Moderne' },
  
  // Classiques
  { value: 'Roboto', label: 'Roboto Light', weight: '300', category: 'Classique' },
  { value: 'Roboto', label: 'Roboto', weight: '400', category: 'Classique' },
  { value: 'Roboto', label: 'Roboto Bold', weight: '700', category: 'Classique' },
  { value: 'Open Sans', label: 'Open Sans', weight: '400', category: 'Classique' },
  { value: 'Open Sans', label: 'Open Sans Bold', weight: '700', category: 'Classique' },
  { value: 'Lato', label: 'Lato', weight: '400', category: 'Classique' },
  { value: 'Lato', label: 'Lato Bold', weight: '700', category: 'Classique' },
  
  // Impact
  { value: 'Oswald', label: 'Oswald', weight: '400', category: 'Impact' },
  { value: 'Oswald', label: 'Oswald Bold', weight: '700', category: 'Impact' },
  { value: 'Raleway', label: 'Raleway', weight: '400', category: 'Impact' },
  { value: 'Raleway', label: 'Raleway Bold', weight: '700', category: 'Impact' },
  
  // Manuscrites
  { value: 'Dancing Script', label: 'Dancing Script', weight: '400', category: 'Manuscrite' },
  { value: 'Dancing Script', label: 'Dancing Script Bold', weight: '700', category: 'Manuscrite' },
  { value: 'Great Vibes', label: 'Great Vibes', weight: '400', category: 'Manuscrite' },
  
  // Standards
  { value: 'Arial', label: 'Arial', weight: '400', category: 'Standard' },
  { value: 'Arial', label: 'Arial Bold', weight: '700', category: 'Standard' },
  { value: 'Georgia', label: 'Georgia', weight: '400', category: 'Standard' },
  { value: 'Georgia', label: 'Georgia Bold', weight: '700', category: 'Standard' },
];

// 6 couleurs prédéfinies simples
const COLORS = [
  '#000000', // Noir
  '#ffffff', // Blanc
  '#1e40af', // Bleu
  '#dc2626', // Rouge
  '#16a34a', // Vert
  '#7c3aed', // Violet
];

// 3 tailles simples
const SIZES = [
  { value: 18, label: 'P', title: 'Petit' },
  { value: 28, label: 'M', title: 'Moyen' },
  { value: 42, label: 'G', title: 'Grand' },
];

export const DocumentFieldEditor = ({ 
  textElements, 
  onChange, 
  canvasWidth, 
  canvasHeight,
  selectedFieldId,
  onSelectField
}: DocumentFieldEditorProps) => {

  const addField = () => {
    const newField: TextElement = {
      id: `field-${Date.now()}`,
      label: 'Texte',
      value: 'Nouveau texte',
      x: canvasWidth / 2,
      y: textElements.length * 60 + 150,
      fontSize: 28,
      fontFamily: 'Montserrat',
      color: '#000000',
      fontWeight: '400',
      isDraggable: true,
      fieldType: 'custom',
      required: false,
      placeholder: '',
    };
    onChange([...textElements, newField]);
    onSelectField?.(newField.id);
  };

  const updateField = (id: string, updates: Partial<TextElement>) => {
    onChange(textElements.map(elem => 
      elem.id === id ? { ...elem, ...updates } : elem
    ));
  };

  const removeField = (id: string) => {
    onChange(textElements.filter(elem => elem.id !== id));
    if (selectedFieldId === id) onSelectField?.(null);
  };

  const centerField = (id: string) => {
    updateField(id, { x: canvasWidth / 2 });
  };

  const selectedField = textElements.find(e => e.id === selectedFieldId);

  // Trouver la police+poids actuelle
  const getCurrentFontKey = (field: TextElement) => {
    const match = FONT_OPTIONS.find(
      f => f.value === field.fontFamily && f.weight === field.fontWeight
    );
    return match ? `${match.value}|${match.weight}` : `${field.fontFamily}|${field.fontWeight}`;
  };

  return (
    <div className="space-y-4">
      {/* Header simple */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <Type className="w-4 h-4" />
          Textes ({textElements.length})
        </h3>
        <Button variant="outline" size="sm" onClick={addField}>
          <Plus className="w-4 h-4 mr-1" />
          Ajouter
        </Button>
      </div>

      {/* État vide */}
      {textElements.length === 0 && (
        <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-xl">
          <Type className="w-6 h-6 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Aucun texte</p>
          <p className="text-xs mt-1">Cliquez sur "Ajouter"</p>
        </div>
      )}

      {/* Liste compacte des champs */}
      <div className="space-y-2">
        {textElements.map((elem) => (
          <div
            key={elem.id}
            onClick={() => onSelectField?.(elem.id)}
            className={cn(
              "p-3 rounded-lg border cursor-pointer transition-all",
              selectedFieldId === elem.id
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            )}
          >
            {/* Nom du champ éditable */}
            <input
              type="text"
              value={elem.value}
              onChange={(e) => updateField(elem.id, { value: e.target.value })}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-transparent text-sm font-medium focus:outline-none"
              placeholder="Texte..."
            />
          </div>
        ))}
      </div>

      {/* Barre d'options - visible seulement si un champ est sélectionné */}
      {selectedField && (
        <div className="p-3 rounded-xl bg-secondary/50 border space-y-3">
          {/* Ligne 1: Taille */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-12">Taille</span>
            <div className="flex gap-1 flex-1">
              {SIZES.map((size) => (
                <button
                  key={size.value}
                  onClick={() => updateField(selectedField.id, { fontSize: size.value })}
                  title={size.title}
                  className={cn(
                    "flex-1 py-1.5 rounded text-sm font-medium transition-all",
                    selectedField.fontSize === size.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-background border hover:bg-muted"
                  )}
                  style={{ fontSize: size.value === 18 ? 12 : size.value === 28 ? 14 : 16 }}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </div>

          {/* Ligne 2: Police */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-12">Police</span>
            <Select
              value={getCurrentFontKey(selectedField)}
              onValueChange={(v) => {
                const [font, weight] = v.split('|');
                updateField(selectedField.id, { fontFamily: font, fontWeight: weight });
              }}
            >
              <SelectTrigger className="flex-1 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {FONT_OPTIONS.map((font, idx) => (
                  <SelectItem 
                    key={`${font.value}-${font.weight}-${idx}`} 
                    value={`${font.value}|${font.weight}`}
                    style={{ fontFamily: font.value, fontWeight: font.weight }}
                  >
                    {font.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Ligne 3: Couleur + Actions */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-12">Couleur</span>
            <div className="flex gap-1 flex-1">
              {COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => updateField(selectedField.id, { color })}
                  className={cn(
                    "w-7 h-7 rounded-full border-2 transition-transform hover:scale-110",
                    selectedField.color === color ? "border-primary ring-2 ring-primary/30" : "border-muted",
                    color === '#ffffff' && "border-gray-300"
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            
            {/* Boutons actions */}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => centerField(selectedField.id)}
              title="Centrer"
            >
              <AlignCenter className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => removeField(selectedField.id)}
              title="Supprimer"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Hint pour drag & drop */}
      {textElements.length > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          👆 Glissez les textes sur l'aperçu pour les positionner
        </p>
      )}
    </div>
  );
};