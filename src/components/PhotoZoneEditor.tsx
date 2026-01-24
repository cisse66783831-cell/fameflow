import { useState, useRef, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Move, Save, RotateCcw, Eye, Square, Circle, User, Type } from 'lucide-react';

interface PhotoZoneEditorProps {
  frameImage: string;
  initialX?: number;
  initialY?: number;
  initialWidth?: number;
  initialHeight?: number;
  initialShape?: 'rect' | 'circle';
  nameZoneEnabled?: boolean;
  nameZoneY?: number;
  onChange?: (zone: {
    x: number;
    y: number;
    width: number;
    height: number;
    shape: 'rect' | 'circle';
    nameEnabled: boolean;
    nameY: number;
  }) => void;
  onSave?: (zone: {
    x: number;
    y: number;
    width: number;
    height: number;
    shape: 'rect' | 'circle';
    nameEnabled: boolean;
    nameY: number;
  }) => void;
  showActions?: boolean;
}

export function PhotoZoneEditor({
  frameImage,
  initialX = 50,
  initialY = 50,
  initialWidth = 30,
  initialHeight = 30,
  initialShape = 'circle',
  nameZoneEnabled = true,
  nameZoneY = 85,
  onChange,
  onSave,
  showActions = true,
}: PhotoZoneEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [size, setSize] = useState({ width: initialWidth, height: initialHeight });
  const [shape, setShape] = useState<'rect' | 'circle'>(initialShape);
  const [nameEnabled, setNameEnabled] = useState(nameZoneEnabled);
  const [nameY, setNameY] = useState(nameZoneY);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isDraggingName, setIsDraggingName] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const notifyChange = useCallback(() => {
    onChange?.({
      x: Math.round(position.x),
      y: Math.round(position.y),
      width: Math.round(size.width),
      height: Math.round(size.height),
      shape,
      nameEnabled,
      nameY: Math.round(nameY),
    });
  }, [position, size, shape, nameEnabled, nameY, onChange]);

  useEffect(() => {
    notifyChange();
  }, [position, size, shape, nameEnabled, nameY, notifyChange]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    if (isDragging) {
      const halfW = size.width / 2;
      const halfH = size.height / 2;
      const newX = Math.max(halfW, Math.min(100 - halfW, x));
      const newY = Math.max(halfH, Math.min(100 - halfH, y));
      setPosition({ x: newX, y: newY });
    } else if (isResizing) {
      const dx = Math.abs(x - position.x) * 2;
      const dy = Math.abs(y - position.y) * 2;
      const newSize = Math.max(15, Math.min(80, Math.max(dx, dy)));
      setSize({ width: newSize, height: newSize });
    } else if (isDraggingName) {
      const newNameY = Math.max(50, Math.min(95, y));
      setNameY(newNameY);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setIsDraggingName(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!containerRef.current) return;
    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;

    if (isDragging) {
      const halfW = size.width / 2;
      const halfH = size.height / 2;
      const newX = Math.max(halfW, Math.min(100 - halfW, x));
      const newY = Math.max(halfH, Math.min(100 - halfH, y));
      setPosition({ x: newX, y: newY });
    } else if (isResizing) {
      const dx = Math.abs(x - position.x) * 2;
      const dy = Math.abs(y - position.y) * 2;
      const newSize = Math.max(15, Math.min(80, Math.max(dx, dy)));
      setSize({ width: newSize, height: newSize });
    } else if (isDraggingName) {
      const newNameY = Math.max(50, Math.min(95, y));
      setNameY(newNameY);
    }
  };

  const handleReset = () => {
    setPosition({ x: 50, y: 50 });
    setSize({ width: 30, height: 30 });
    setShape('circle');
    setNameEnabled(true);
    setNameY(85);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setIsDraggingName(false);
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('touchend', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('touchend', handleGlobalMouseUp);
    };
  }, []);

  return (
    <Card className="p-6 space-y-6 bg-card border-border">
      <div className="space-y-2">
        <Label className="text-lg font-semibold flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          Zone Photo des Participants
        </Label>
        <p className="text-sm text-muted-foreground">
          Définissez où les photos des participants apparaîtront sur votre affiche.
        </p>
      </div>

      {/* Shape selector */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Forme de la zone</Label>
        <RadioGroup
          value={shape}
          onValueChange={(v) => setShape(v as 'rect' | 'circle')}
          className="flex gap-4"
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="circle" id="circle" />
            <Label htmlFor="circle" className="flex items-center gap-1 cursor-pointer">
              <Circle className="w-4 h-4" />
              Cercle
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="rect" id="rect" />
            <Label htmlFor="rect" className="flex items-center gap-1 cursor-pointer">
              <Square className="w-4 h-4" />
              Rectangle
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Name zone toggle */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
        <div className="flex items-center gap-2">
          <Type className="w-4 h-4 text-primary" />
          <Label>Afficher le nom du participant</Label>
        </div>
        <Switch
          checked={nameEnabled}
          onCheckedChange={setNameEnabled}
        />
      </div>

      {/* Editor Canvas */}
      <div
        ref={containerRef}
        className="relative aspect-[3/4] bg-secondary rounded-xl overflow-hidden cursor-crosshair select-none border-2 border-dashed border-border"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
      >
        {/* Frame Image */}
        <img
          src={frameImage}
          alt="Ticket frame"
          className="absolute inset-0 w-full h-full object-contain"
          onLoad={() => setImageLoaded(true)}
          draggable={false}
        />

        {/* Photo Zone Placeholder */}
        {imageLoaded && (
          <div
            className={`absolute border-2 border-primary bg-primary/20 transition-transform ${
              isDragging ? 'scale-105 cursor-grabbing' : 'cursor-grab hover:bg-primary/30'
            } ${shape === 'circle' ? 'rounded-full' : 'rounded-lg'}`}
            style={{
              left: `${position.x - size.width / 2}%`,
              top: `${position.y - size.height / 2}%`,
              width: `${size.width}%`,
              height: `${size.height}%`,
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onTouchStart={() => setIsDragging(true)}
          >
            {/* Center icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <User className="w-8 h-8 text-primary opacity-60" />
            </div>
            
            {/* Resize handle */}
            <div
              className="absolute -bottom-2 -right-2 w-5 h-5 bg-primary rounded-full cursor-se-resize flex items-center justify-center shadow-lg"
              onMouseDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setIsResizing(true);
              }}
              onTouchStart={(e) => {
                e.stopPropagation();
                setIsResizing(true);
              }}
            >
              <Move className="w-3 h-3 text-primary-foreground" />
            </div>
            
            {/* Size indicator */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-primary text-primary-foreground text-xs rounded font-mono whitespace-nowrap">
              {Math.round(size.width)}%
            </div>
          </div>
        )}

        {/* Name Zone */}
        {imageLoaded && nameEnabled && (
          <div
            className={`absolute left-1/2 -translate-x-1/2 w-4/5 h-8 border-2 border-accent bg-accent/20 rounded-lg flex items-center justify-center cursor-ns-resize ${
              isDraggingName ? 'scale-105' : 'hover:bg-accent/30'
            }`}
            style={{ top: `${nameY}%` }}
            onMouseDown={(e) => {
              e.preventDefault();
              setIsDraggingName(true);
            }}
            onTouchStart={() => setIsDraggingName(true)}
          >
            <Type className="w-4 h-4 text-accent mr-1" />
            <span className="text-xs font-medium text-accent">NOM DU PARTICIPANT</span>
          </div>
        )}

        {/* Grid overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <div className="w-full h-full" style={{
            backgroundImage: 'linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)',
            backgroundSize: '10% 10%',
          }} />
        </div>
      </div>

      {/* Preview Toggle */}
      <div className="flex items-center justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowPreview(!showPreview)}
          className="gap-2"
        >
          <Eye className="w-4 h-4" />
          {showPreview ? 'Masquer' : 'Voir'} l'aperçu avec photo test
        </Button>
      </div>

      {/* Preview with test photo */}
      {showPreview && (
        <div className="aspect-[3/4] bg-secondary rounded-xl overflow-hidden relative">
          <img
            src={frameImage}
            alt="Preview"
            className="absolute inset-0 w-full h-full object-contain"
          />
          
          {/* Test photo in zone */}
          <div
            className={`absolute overflow-hidden ${shape === 'circle' ? 'rounded-full' : 'rounded-lg'}`}
            style={{
              left: `${position.x - size.width / 2}%`,
              top: `${position.y - size.height / 2}%`,
              width: `${size.width}%`,
              height: `${size.height}%`,
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop"
              alt="Test portrait"
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Test name */}
          {nameEnabled && (
            <div
              className="absolute left-1/2 -translate-x-1/2 text-center"
              style={{ top: `${nameY}%` }}
            >
              <span className="text-white font-bold text-lg drop-shadow-lg" style={{
                textShadow: '0 0 10px rgba(255,20,147,0.8), 0 0 20px rgba(255,20,147,0.6)'
              }}>
                MARIE DUPONT
              </span>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex-1 gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Réinitialiser
          </Button>
          {onSave && (
            <Button
              onClick={() => onSave({
                x: Math.round(position.x),
                y: Math.round(position.y),
                width: Math.round(size.width),
                height: Math.round(size.height),
                shape,
                nameEnabled,
                nameY: Math.round(nameY),
              })}
              className="flex-1 gap-2 gradient-primary text-white"
            >
              <Save className="w-4 h-4" />
              Enregistrer
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}