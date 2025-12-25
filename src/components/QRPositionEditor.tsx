import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Move, Save, RotateCcw, Eye } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface QRPositionEditorProps {
  frameImage: string;
  initialX?: number;
  initialY?: number;
  onSave: (x: number, y: number) => void;
  onCancel?: () => void;
}

export function QRPositionEditor({
  frameImage,
  initialX = 50,
  initialY = 50,
  onSave,
  onCancel,
}: QRPositionEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [isDragging, setIsDragging] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setPosition({
      x: Math.max(5, Math.min(95, x)),
      y: Math.max(5, Math.min(95, y)),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!containerRef.current) return;
    e.preventDefault();

    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;

    setPosition({
      x: Math.max(5, Math.min(95, x)),
      y: Math.max(5, Math.min(95, y)),
    });
  };

  const handleReset = () => {
    setPosition({ x: 50, y: 50 });
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  return (
    <Card className="p-6 space-y-6 bg-card border-border">
      <div className="space-y-2">
        <Label className="text-lg font-semibold flex items-center gap-2">
          <Move className="w-5 h-5 text-primary" />
          Positionnement du QR Code
        </Label>
        <p className="text-sm text-muted-foreground">
          Glissez-déposez le QR Code pour définir son emplacement sur le ticket.
        </p>
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

        {/* QR Code Placeholder */}
        {imageLoaded && (
          <div
            className={`absolute w-20 h-20 -translate-x-1/2 -translate-y-1/2 transition-transform ${
              isDragging ? 'scale-110 cursor-grabbing' : 'cursor-grab hover:scale-105'
            }`}
            style={{
              left: `${position.x}%`,
              top: `${position.y}%`,
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={() => setIsDragging(true)}
          >
            <div className="w-full h-full p-1.5 bg-white rounded-lg shadow-lg border-2 border-primary ring-4 ring-primary/20">
              <QRCodeSVG
                value="SAMPLE-TICKET-QR"
                size={68}
                level="M"
                className="w-full h-full"
              />
            </div>
            
            {/* Position indicator */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-primary text-primary-foreground text-xs rounded font-mono whitespace-nowrap">
              {Math.round(position.x)}%, {Math.round(position.y)}%
            </div>
          </div>
        )}

        {/* Grid overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
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
          {showPreview ? 'Masquer' : 'Voir'} l'aperçu final
        </Button>
      </div>

      {/* Preview */}
      {showPreview && (
        <div className="aspect-[3/4] bg-secondary rounded-xl overflow-hidden relative">
          <img
            src={frameImage}
            alt="Preview"
            className="absolute inset-0 w-full h-full object-contain"
          />
          <div
            className="absolute w-16 h-16 -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${position.x}%`,
              top: `${position.y}%`,
            }}
          >
            <div className="w-full h-full p-1 bg-white rounded-lg shadow-lg">
              <QRCodeSVG
                value="TKT-ABCD1234"
                size={56}
                level="M"
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={handleReset}
          className="flex-1 gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Réinitialiser
        </Button>
        {onCancel && (
          <Button
            variant="ghost"
            onClick={onCancel}
            className="flex-1"
          >
            Annuler
          </Button>
        )}
        <Button
          onClick={() => onSave(Math.round(position.x), Math.round(position.y))}
          className="flex-1 gap-2 gradient-primary text-white"
        >
          <Save className="w-4 h-4" />
          Enregistrer
        </Button>
      </div>
    </Card>
  );
}
