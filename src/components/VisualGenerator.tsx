import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Event } from '@/types/event';
import { Camera, Upload, Download, Share2, Loader2, Sparkles, X, Globe } from 'lucide-react';

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
  const [wantPublic, setWantPublic] = useState(false);

  // Résolutions pour export HD
  const EXPORT_SIZE = 2160; // 2160x2160 pour une qualité Instagram HD
  const PREVIEW_SIZE = 540; // Aperçu rapide

  // Get photo zone settings with defaults (all nullable in DB)
  const photoZone = {
    x: event.photo_zone_x ?? 50,
    y: event.photo_zone_y ?? 50,
    width: event.photo_zone_width ?? 30,
    height: event.photo_zone_height ?? 30,
    shape: (event.photo_zone_shape ?? 'circle') as 'rect' | 'circle',
  };
  const nameZoneEnabled = event.name_zone_enabled ?? true;
  const nameZoneY = event.name_zone_y ?? 85;

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

      // Clear canvas
      ctx.clearRect(0, 0, size, size);

      // Load user photo
      const photoImg = new Image();
      photoImg.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        photoImg.onload = () => resolve();
        photoImg.onerror = reject;
        photoImg.src = userPhoto;
      });

      // Load frame image
      const frameImg = new Image();
      frameImg.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        frameImg.onload = () => resolve();
        frameImg.onerror = reject;
        frameImg.src = event.frame_image;
      });

      // Calculate photo zone in pixels
      const zoneX = (photoZone.x / 100) * size;
      const zoneY = (photoZone.y / 100) * size;
      const zoneWidth = (photoZone.width / 100) * size;
      const zoneHeight = (photoZone.height / 100) * size;

      // Draw user photo in the defined zone with clipping mask
      ctx.save();
      ctx.beginPath();
      
      if (photoZone.shape === 'circle') {
        // Circle mask
        const radius = Math.min(zoneWidth, zoneHeight) / 2;
        ctx.arc(zoneX, zoneY, radius, 0, Math.PI * 2);
      } else {
        // Rectangle mask with rounded corners
        const cornerRadius = 10 * scale;
        const left = zoneX - zoneWidth / 2;
        const top = zoneY - zoneHeight / 2;
        ctx.roundRect(left, top, zoneWidth, zoneHeight, cornerRadius);
      }
      ctx.clip();

      // Calculate dimensions to fill the zone while maintaining aspect ratio
      const photoAspect = photoImg.width / photoImg.height;
      const zoneAspect = zoneWidth / zoneHeight;
      
      let drawWidth, drawHeight;
      if (photoAspect > zoneAspect) {
        // Photo is wider - fit to height
        drawHeight = zoneHeight * zoom;
        drawWidth = drawHeight * photoAspect;
      } else {
        // Photo is taller - fit to width
        drawWidth = zoneWidth * zoom;
        drawHeight = drawWidth / photoAspect;
      }

      const photoX = zoneX - drawWidth / 2 + offsetX * scale;
      const photoY = zoneY - drawHeight / 2 + offsetY * scale;

      ctx.drawImage(photoImg, photoX, photoY, drawWidth, drawHeight);
      ctx.restore();

      // Draw frame overlay on top
      ctx.drawImage(frameImg, 0, 0, size, size);

      // Add user name with neon effect if enabled
      if (nameZoneEnabled) {
        const nameY = (nameZoneY / 100) * size;
        
        ctx.save();
        ctx.font = `bold ${48 * scale}px Outfit, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Neon glow effect
        ctx.shadowColor = '#ff1493';
        ctx.shadowBlur = 20 * scale;
        ctx.fillStyle = '#ffffff';
        ctx.fillText(name.toUpperCase(), size / 2, nameY);
        
        // Double pass for stronger glow
        ctx.shadowBlur = 40 * scale;
        ctx.fillText(name.toUpperCase(), size / 2, nameY);
        ctx.restore();
      }

      // Add "J'Y SERAI" badge below name
      ctx.save();
      const badgeY = nameZoneEnabled ? ((nameZoneY + 8) / 100) * size : size - 50 * scale;
      ctx.font = `bold ${28 * scale}px Outfit, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#00ffff';
      ctx.shadowColor = '#00ffff';
      ctx.shadowBlur = 15 * scale;
      ctx.fillText("J'Y SERAI !", size / 2, badgeY);
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
  }, [userPhoto, name, event.frame_image, zoom, offsetX, offsetY, toast, photoZone, nameZoneEnabled, nameZoneY]);

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

          {/* Public wall opt-in checkbox */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/30 border border-border/50">
            <Checkbox
              id="public-wall"
              checked={wantPublic}
              onCheckedChange={(checked) => setWantPublic(checked === true)}
              className="mt-0.5"
            />
            <div className="space-y-1">
              <Label 
                htmlFor="public-wall" 
                className="text-sm font-medium cursor-pointer flex items-center gap-2"
              >
                <Globe className="w-4 h-4 text-primary" />
                Publier sur le mur social
              </Label>
              <p className="text-xs text-muted-foreground">
                Votre visuel pourra être affiché sur notre page d'accueil et les pages de l'événement
              </p>
            </div>
          </div>

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
                {wantPublic && (
                  <Button
                    className="flex-1 btn-neon gradient-primary text-white"
                    onClick={saveToWall}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Publier
                  </Button>
                )}
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
