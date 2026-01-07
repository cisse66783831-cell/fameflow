import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Event } from '@/types/event';
import { Camera, Upload, Download, Share2, Loader2, Sparkles, X } from 'lucide-react';

interface VisualGeneratorProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
  onVisualCreated?: () => void;
}

export function VisualGenerator({ event, isOpen, onClose, onVisualCreated }: VisualGeneratorProps) {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [name, setName] = useState('');
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVisual, setGeneratedVisual] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Résolutions pour export HD
  const EXPORT_SIZE = 2160; // 2160x2160 pour une qualité Instagram HD
  const PREVIEW_SIZE = 540; // Aperçu rapide

  const generateVisual = useCallback(async (forExport = false) => {
    const canvas = canvasRef.current;
    if (!canvas || !userPhoto || !name) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsGenerating(true);

    try {
      // Utiliser la taille HD pour l'export, aperçu sinon
      const size = forExport ? EXPORT_SIZE : PREVIEW_SIZE;
      const scale = size / PREVIEW_SIZE;
      
      canvas.width = size;
      canvas.height = size;

      // Load and draw user photo first (background)
      const photoImg = new Image();
      photoImg.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        photoImg.onload = () => resolve();
        photoImg.onerror = reject;
        photoImg.src = userPhoto;
      });

      // Calculate dimensions to fit photo
      const photoAspect = photoImg.width / photoImg.height;
      let drawWidth = size * zoom;
      let drawHeight = size * zoom;

      if (photoAspect > 1) {
        drawHeight = drawWidth / photoAspect;
      } else {
        drawWidth = drawHeight * photoAspect;
      }

      const x = (size - drawWidth) / 2 + offsetX * scale;
      const y = (size - drawHeight) / 2 + offsetY * scale;

      ctx.drawImage(photoImg, x, y, drawWidth, drawHeight);

      // Load and draw frame overlay
      const frameImg = new Image();
      frameImg.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        frameImg.onload = () => resolve();
        frameImg.onerror = reject;
        frameImg.src = event.frame_image;
      });

      ctx.drawImage(frameImg, 0, 0, size, size);

      // Add user name with neon effect - tailles adaptées
      ctx.save();
      ctx.font = `bold ${48 * scale}px Outfit, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      
      // Neon glow effect
      ctx.shadowColor = '#ff1493';
      ctx.shadowBlur = 20 * scale;
      ctx.fillStyle = '#ffffff';
      ctx.fillText(name.toUpperCase(), size / 2, size - 80 * scale);
      
      // Double pass for stronger glow
      ctx.shadowBlur = 40 * scale;
      ctx.fillText(name.toUpperCase(), size / 2, size - 80 * scale);
      ctx.restore();

      // Add "J'Y SERAI" badge
      ctx.save();
      ctx.font = `bold ${32 * scale}px Outfit, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#00ffff';
      ctx.shadowColor = '#00ffff';
      ctx.shadowBlur = 15 * scale;
      ctx.fillText("J'Y SERAI !", size / 2, size - 30 * scale);
      ctx.restore();

      // NOTE: No QR code is added to prevent ticket theft
      
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      setGeneratedVisual(dataUrl);

    } catch (error) {
      console.error('Error generating visual:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de générer le visuel',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  }, [userPhoto, name, event.frame_image, zoom, offsetX, offsetY, toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserPhoto(reader.result as string);
        setGeneratedVisual(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = async () => {
    if (!userPhoto || !name) return;
    
    // Générer en HD pour le téléchargement
    await generateVisual(true);
    
    // Petit délai pour s'assurer que le canvas est prêt
    setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const link = document.createElement('a');
      link.download = `jyserai-${event.title.replace(/\s+/g, '-')}-HD.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
      
      toast({
        title: 'Téléchargé en HD !',
        description: 'Image 2160x2160px - Qualité optimale pour les réseaux',
      });
      
      // Regénérer en aperçu
      generateVisual(false);
    }, 100);
  };

  const handleShare = async () => {
    if (!generatedVisual) return;

    try {
      const blob = await (await fetch(generatedVisual)).blob();
      const file = new File([blob], 'jyserai.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `${name} sera à ${event.title}`,
          text: `J'y serai ! 🎉 #${event.title.replace(/\s+/g, '')}`,
          files: [file],
        });
      } else {
        handleDownload();
      }
    } catch (error) {
      console.error('Error sharing:', error);
      handleDownload();
    }
  };

  const saveToWall = async () => {
    if (!generatedVisual || !name) return;

    try {
      // Upload to storage
      const blob = await (await fetch(generatedVisual)).blob();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.png`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('campaign-images')
        .upload(`public-visuals/${fileName}`, blob);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('campaign-images')
        .getPublicUrl(`public-visuals/${fileName}`);

      // Save to public_visuals table
      const { error: insertError } = await supabase
        .from('public_visuals')
        .insert({
          event_id: event.id,
          creator_name: name,
          creator_photo: userPhoto,
          visual_url: urlData.publicUrl,
        });

      if (insertError) throw insertError;

      toast({
        title: 'Publié !',
        description: 'Votre visuel apparaît maintenant sur le mur social',
      });

      onVisualCreated?.();
      onClose();

    } catch (error) {
      console.error('Error saving visual:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de publier le visuel',
        variant: 'destructive',
      });
    }
  };

  // Mouse/touch handlers for dragging photo
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!userPhoto) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - offsetX, y: e.clientY - offsetY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffsetX(e.clientX - dragStart.x);
    setOffsetY(e.clientY - dragStart.y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (userPhoto && name) {
      generateVisual();
    }
  }, [userPhoto, zoom, offsetX, offsetY, name, generateVisual]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="w-5 h-5 text-primary" />
            Créer mon visuel "J'y serai"
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Event Info */}
          <div className="p-4 rounded-xl bg-secondary/50 border border-border/50">
            <h3 className="font-semibold text-lg">{event.title}</h3>
            <p className="text-sm text-muted-foreground">{event.venue}, {event.city}</p>
          </div>

          {/* Name Input */}
          <div className="space-y-2">
            <Label htmlFor="name">Votre prénom</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Entrez votre prénom"
              className="bg-secondary border-border"
            />
          </div>

          {/* Photo Upload */}
          <div className="space-y-2">
            <Label>Votre photo</Label>
            <div
              className="relative aspect-square rounded-2xl overflow-hidden border-2 border-dashed border-border bg-secondary/30 cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {generatedVisual ? (
                <img
                  src={generatedVisual}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : userPhoto ? (
                <div className="relative w-full h-full">
                  <img
                    src={userPhoto}
                    alt="Your photo"
                    className="w-full h-full object-cover"
                    style={{
                      transform: `scale(${zoom}) translate(${offsetX / zoom}px, ${offsetY / zoom}px)`,
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <p className="text-white text-sm">Glissez pour ajuster</p>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <div className="p-4 rounded-full bg-primary/10">
                    <Camera className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">Cliquez pour ajouter votre photo</p>
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Zoom control */}
            {userPhoto && (
              <div className="flex items-center gap-3">
                <Label className="text-xs text-muted-foreground">Zoom</Label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="flex-1 accent-primary"
                />
              </div>
            )}
          </div>

          {/* Hidden canvas for generation */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Action Buttons */}
          <div className="flex gap-3">
            {generatedVisual ? (
              <>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleDownload}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Télécharger
                </Button>
                <Button
                  className="flex-1 btn-neon-cyan bg-accent text-accent-foreground"
                  onClick={handleShare}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Partager
                </Button>
                <Button
                  className="flex-1 btn-neon gradient-primary text-white"
                  onClick={saveToWall}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Publier
                </Button>
              </>
            ) : (
              <Button
                className="w-full btn-neon gradient-primary text-white"
                disabled={!userPhoto || !name || isGenerating}
                onClick={() => generateVisual(false)}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Génération...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Créer mon visuel
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Important Notice */}
          <p className="text-xs text-muted-foreground text-center">
            Ce visuel est uniquement pour vos réseaux sociaux.{' '}
            <span className="text-primary">Votre billet officiel avec QR code</span>{' '}
            sera disponible après l'achat.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
