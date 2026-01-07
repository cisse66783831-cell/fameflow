import { useState } from 'react';
import { TextElement } from '@/types/campaign';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Plus, Trash2, Type, GripVertical, ChevronDown, ChevronUp,
  Bold, Italic, AlignCenter
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface DocumentFieldEditorProps {
  textElements: TextElement[];
  onChange: (elements: TextElement[]) => void;
  canvasWidth: number;
  canvasHeight: number;
}

const FONT_FAMILIES = [
  'Arial',
  'Georgia',
  'Times New Roman',
  'Verdana',
  'Helvetica',
  'Courier New',
  'Impact',
];

const FIELD_TYPES = [
  { value: 'name', label: 'Nom du participant' },
  { value: 'date', label: 'Date' },
  { value: 'title', label: 'Titre/Fonction' },
  { value: 'serial', label: 'Numéro de série' },
  { value: 'custom', label: 'Texte libre' },
];

const DEFAULT_COLORS = [
  '#1e1b4b', // Dark blue
  '#6366f1', // Primary purple
  '#64748b', // Slate
  '#000000', // Black
  '#ffffff', // White
  '#dc2626', // Red
  '#16a34a', // Green
];

export const DocumentFieldEditor = ({ 
  textElements, 
  onChange, 
  canvasWidth, 
  canvasHeight 
}: DocumentFieldEditorProps) => {
  const [expandedField, setExpandedField] = useState<string | null>(null);

  const addField = () => {
    const newField: TextElement = {
      id: `field-${Date.now()}`,
      label: 'Nouveau champ',
      value: 'Texte par défaut',
      x: canvasWidth / 2,
      y: textElements.length * 60 + 150,
      fontSize: 24,
      fontFamily: 'Arial',
      color: '#1e1b4b',
      fontWeight: 'normal',
      isDraggable: true,
      fieldType: 'custom',
      required: false,
      placeholder: '',
    };
    onChange([...textElements, newField]);
    setExpandedField(newField.id);
  };

  const updateField = (id: string, updates: Partial<TextElement>) => {
    onChange(textElements.map(elem => 
      elem.id === id ? { ...elem, ...updates } : elem
    ));
  };

  const removeField = (id: string) => {
    onChange(textElements.filter(elem => elem.id !== id));
    if (expandedField === id) setExpandedField(null);
  };

  const moveField = (id: string, direction: 'up' | 'down') => {
    const index = textElements.findIndex(e => e.id === id);
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === textElements.length - 1)
    ) return;

    const newElements = [...textElements];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newElements[index], newElements[targetIndex]] = [newElements[targetIndex], newElements[index]];
    onChange(newElements);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <Type className="w-4 h-4" />
          Champs de texte ({textElements.length})
        </h3>
        <Button variant="outline" size="sm" onClick={addField}>
          <Plus className="w-4 h-4 mr-1" />
          Ajouter
        </Button>
      </div>

      {textElements.length === 0 && (
        <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-xl">
          <Type className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Aucun champ de texte</p>
          <p className="text-xs mt-1">Cliquez sur "Ajouter" pour créer un champ</p>
        </div>
      )}

      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
        {textElements.map((elem, index) => (
          <Collapsible
            key={elem.id}
            open={expandedField === elem.id}
            onOpenChange={(open) => setExpandedField(open ? elem.id : null)}
          >
            <div className="border rounded-lg bg-card">
              <CollapsibleTrigger asChild>
                <div className="flex items-center gap-2 p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{elem.label}</p>
                    <p className="text-xs text-muted-foreground truncate">{elem.value}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(e) => { e.stopPropagation(); moveField(elem.id, 'up'); }}
                      disabled={index === 0}
                    >
                      <ChevronUp className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(e) => { e.stopPropagation(); moveField(elem.id, 'down'); }}
                      disabled={index === textElements.length - 1}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={(e) => { e.stopPropagation(); removeField(elem.id); }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="p-3 pt-0 space-y-4 border-t">
                  {/* Field Type */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Type de champ</label>
                      <Select
                        value={elem.fieldType || 'custom'}
                        onValueChange={(v) => updateField(elem.id, { 
                          fieldType: v as TextElement['fieldType'],
                          label: FIELD_TYPES.find(t => t.value === v)?.label || elem.label
                        })}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FIELD_TYPES.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end gap-2">
                      <label className="flex items-center gap-2 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={elem.required || false}
                          onChange={(e) => updateField(elem.id, { required: e.target.checked })}
                          className="rounded border-input"
                        />
                        Obligatoire
                      </label>
                      <label className="flex items-center gap-2 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={elem.isDraggable}
                          onChange={(e) => updateField(elem.id, { isDraggable: e.target.checked })}
                          className="rounded border-input"
                        />
                        Déplaçable
                      </label>
                    </div>
                  </div>

                  {/* Label & Value */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Libellé</label>
                      <input
                        type="text"
                        value={elem.label}
                        onChange={(e) => updateField(elem.id, { label: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-background border border-input text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Valeur par défaut</label>
                      <input
                        type="text"
                        value={elem.value}
                        onChange={(e) => updateField(elem.id, { value: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-background border border-input text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      />
                    </div>
                  </div>

                  {/* Placeholder */}
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Placeholder (aide à la saisie)</label>
                    <input
                      type="text"
                      value={elem.placeholder || ''}
                      onChange={(e) => updateField(elem.id, { placeholder: e.target.value })}
                      placeholder="Ex: Entrez votre nom complet..."
                      className="w-full px-3 py-2 rounded-lg bg-background border border-input text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    />
                  </div>

                  {/* Font Settings */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Police</label>
                      <Select
                        value={elem.fontFamily}
                        onValueChange={(v) => updateField(elem.id, { fontFamily: v })}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FONT_FAMILIES.map(font => (
                            <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                              {font}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">
                        Taille ({elem.fontSize}px)
                      </label>
                      <Slider
                        value={[elem.fontSize]}
                        min={12}
                        max={72}
                        step={1}
                        onValueChange={([v]) => updateField(elem.id, { fontSize: v })}
                      />
                    </div>
                  </div>

                  {/* Style & Color */}
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      <Button
                        variant={elem.fontWeight === 'bold' ? 'default' : 'outline'}
                        size="icon"
                        className="h-9 w-9"
                        onClick={() => updateField(elem.id, { 
                          fontWeight: elem.fontWeight === 'bold' ? 'normal' : 'bold' 
                        })}
                      >
                        <Bold className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex-1 flex items-center gap-2">
                      <label className="text-xs text-muted-foreground">Couleur</label>
                      <div className="flex gap-1">
                        {DEFAULT_COLORS.map(color => (
                          <button
                            key={color}
                            onClick={() => updateField(elem.id, { color })}
                            className={cn(
                              "w-6 h-6 rounded-full border-2 transition-transform hover:scale-110",
                              elem.color === color ? "border-primary" : "border-transparent"
                            )}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                        <input
                          type="color"
                          value={elem.color}
                          onChange={(e) => updateField(elem.id, { color: e.target.value })}
                          className="w-6 h-6 rounded-full overflow-hidden cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Position */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">
                        Position X ({Math.round(elem.x)})
                      </label>
                      <Slider
                        value={[elem.x]}
                        min={0}
                        max={canvasWidth}
                        step={1}
                        onValueChange={([v]) => updateField(elem.id, { x: v })}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">
                        Position Y ({Math.round(elem.y)})
                      </label>
                      <Slider
                        value={[elem.y]}
                        min={0}
                        max={canvasHeight}
                        step={1}
                        onValueChange={([v]) => updateField(elem.id, { y: v })}
                      />
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        ))}
      </div>
    </div>
  );
};
