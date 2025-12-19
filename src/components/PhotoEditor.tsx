import { useState, useRef, useEffect, useCallback } from 'react';
import { Campaign, TextElement } from '@/types/campaign';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Upload, ZoomIn, ZoomOut, RotateCw, Download, 
  Move, Type, GripVertical, FileText 
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import jsPDF from 'jspdf';
import { SocialShare } from './SocialShare';

interface PhotoEditorProps {
  campaign: Campaign;
  onDownload: () => void;
}

export const PhotoEditor = ({ campaign, onDownload }: PhotoEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [textElements, setTextElements] = useState<TextElement[]>(campaign.textElements);
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [textDragStart, setTextDragStart] = useState({ x: 0, y: 0, elemX: 0, elemY: 0 });
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);

  const CANVAS_SIZE = 400;

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Helper to load image with CORS
    const loadImage = (src: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });
    };

    // Draw user photo if exists
    if (userPhoto) {
      const img = new Image();
      img.onload = async () => {
        ctx.save();
        ctx.translate(CANVAS_SIZE / 2, CANVAS_SIZE / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(zoom, zoom);
        
        const scale = Math.max(CANVAS_SIZE / img.width, CANVAS_SIZE / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        
        ctx.drawImage(
          img,
          -w / 2 + offset.x,
          -h / 2 + offset.y,
          w,
          h
        );
        ctx.restore();

        // Draw frame overlay
        if (campaign.frameImage) {
          try {
            const frame = await loadImage(campaign.frameImage);
            ctx.drawImage(frame, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
          } catch (e) {
            console.error('Failed to load frame:', e);
          }
        }
        drawTextElements(ctx);
      };
      img.src = userPhoto;
    } else if (campaign.type === 'document' && campaign.backgroundImage) {
      // Document type - draw background
      loadImage(campaign.backgroundImage).then((bg) => {
        ctx.drawImage(bg, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
        drawTextElements(ctx);
      }).catch(console.error);
    } else if (campaign.frameImage) {
      // Just draw the frame
      loadImage(campaign.frameImage).then((frame) => {
        ctx.drawImage(frame, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
        drawTextElements(ctx);
      }).catch(console.error);
    }
  }, [userPhoto, zoom, rotation, offset, campaign, textElements]);

  const drawTextElements = (ctx: CanvasRenderingContext2D) => {
    textElements.forEach((elem) => {
      ctx.save();
      ctx.font = `${elem.fontWeight} ${elem.fontSize * (CANVAS_SIZE / 800)}px ${elem.fontFamily}`;
      ctx.fillStyle = elem.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const x = elem.x * (CANVAS_SIZE / 800);
      const y = elem.y * (CANVAS_SIZE / 600);
      
      ctx.fillText(elem.value, x, y);
      
      // Draw selection indicator if selected
      if (selectedText === elem.id && elem.isDraggable) {
        const metrics = ctx.measureText(elem.value);
        const padding = 8;
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(
          x - metrics.width / 2 - padding,
          y - elem.fontSize / 2 - padding,
          metrics.width + padding * 2,
          elem.fontSize + padding * 2
        );
      }
      ctx.restore();
    });
  };

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Update blob when canvas changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const timer = setTimeout(() => {
      canvas.toBlob((blob) => {
        if (blob) setImageBlob(blob);
      }, 'image/png');
    }, 100);
    
    return () => clearTimeout(timer);
  }, [userPhoto, zoom, rotation, offset, textElements]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUserPhoto(event.target?.result as string);
        toast.success('Photo uploaded successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  // Get coordinates from mouse or touch event
  const getEventCoords = (e: React.MouseEvent | React.TouchEvent) => {
    if ('touches' in e) {
      return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
    }
    return { clientX: e.clientX, clientY: e.clientY };
  };

  const handleStart = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { clientX, clientY } = getEventCoords(e);
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) * (CANVAS_SIZE / rect.width);
    const y = (clientY - rect.top) * (CANVAS_SIZE / rect.height);

    // Check if clicking on a draggable text element
    const clickedText = textElements.find(elem => {
      if (!elem.isDraggable) return false;
      const elemX = elem.x * (CANVAS_SIZE / 800);
      const elemY = elem.y * (CANVAS_SIZE / 600);
      const size = elem.fontSize * (CANVAS_SIZE / 800);
      return Math.abs(x - elemX) < 100 && Math.abs(y - elemY) < size;
    });

    if (clickedText) {
      setSelectedText(clickedText.id);
      setTextDragStart({ 
        x, 
        y, 
        elemX: clickedText.x, 
        elemY: clickedText.y 
      });
      return;
    }

    // Otherwise, drag the photo
    setSelectedText(null);
    setIsDragging(true);
    setDragStart({ x: clientX - offset.x, y: clientY - offset.y });
  };

  const handleMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { clientX, clientY } = getEventCoords(e);

    if (selectedText) {
      const rect = canvas.getBoundingClientRect();
      const x = (clientX - rect.left) * (CANVAS_SIZE / rect.width);
      const y = (clientY - rect.top) * (CANVAS_SIZE / rect.height);

      const deltaX = (x - textDragStart.x) * (800 / CANVAS_SIZE);
      const deltaY = (y - textDragStart.y) * (600 / CANVAS_SIZE);

      setTextElements(prev => prev.map(elem => 
        elem.id === selectedText
          ? { ...elem, x: textDragStart.elemX + deltaX, y: textDragStart.elemY + deltaY }
          : elem
      ));
    } else if (isDragging) {
      setOffset({
        x: clientX - dragStart.x,
        y: clientY - dragStart.y,
      });
    }
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `${campaign.title.replace(/\s+/g, '-')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    
    onDownload();
    toast.success('Image downloaded!');
  };

  const handleDownloadPDF = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Center the image on the page
    const canvasAspect = canvas.width / canvas.height;
    const pageAspect = pdfWidth / pdfHeight;
    
    let imgWidth, imgHeight, x, y;
    
    if (canvasAspect > pageAspect) {
      imgWidth = pdfWidth - 20;
      imgHeight = imgWidth / canvasAspect;
      x = 10;
      y = (pdfHeight - imgHeight) / 2;
    } else {
      imgHeight = pdfHeight - 20;
      imgWidth = imgHeight * canvasAspect;
      x = (pdfWidth - imgWidth) / 2;
      y = 10;
    }

    pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
    pdf.save(`${campaign.title.replace(/\s+/g, '-')}.pdf`);
    
    onDownload();
    toast.success('PDF downloaded!');
  };

  const updateTextValue = (id: string, value: string) => {
    setTextElements(prev => prev.map(elem => 
      elem.id === id ? { ...elem, value } : elem
    ));
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Canvas Area */}
      <div className="flex-1">
        <div className="relative inline-block">
          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            onMouseDown={handleStart}
            onMouseMove={handleMove}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={handleStart}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
            className={cn(
              "rounded-2xl shadow-elevated bg-muted/50 cursor-move max-w-full touch-none",
              selectedText && "cursor-grab"
            )}
          />
          
          {!userPhoto && campaign.type === 'photo' && (
            <div className="absolute inset-0 flex items-center justify-center bg-foreground/5 rounded-2xl">
              <label className="cursor-pointer flex flex-col items-center gap-3 text-muted-foreground hover:text-foreground transition-colors">
                <div className="p-4 rounded-full bg-primary/10">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <span className="font-medium">Upload your photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>

        {/* Draggable text hint */}
        {textElements.some(t => t.isDraggable) && (
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <GripVertical className="w-4 h-4" />
            <span>Click and drag text elements to reposition</span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="lg:w-72 space-y-6">
        {campaign.type === 'photo' && userPhoto && (
          <>
            {/* Zoom */}
            <div className="glass-card rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">Zoom</span>
                <span className="text-sm text-muted-foreground">{Math.round(zoom * 100)}%</span>
              </div>
              <div className="flex items-center gap-3">
                <ZoomOut className="w-4 h-4 text-muted-foreground" />
                <Slider
                  value={[zoom]}
                  min={0.5}
                  max={2}
                  step={0.1}
                  onValueChange={([v]) => setZoom(v)}
                />
                <ZoomIn className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>

            {/* Rotation */}
            <div className="glass-card rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">Rotation</span>
                <span className="text-sm text-muted-foreground">{rotation}°</span>
              </div>
              <div className="flex items-center gap-3">
                <RotateCw className="w-4 h-4 text-muted-foreground" />
                <Slider
                  value={[rotation]}
                  min={-180}
                  max={180}
                  step={1}
                  onValueChange={([v]) => setRotation(v)}
                />
              </div>
            </div>

            {/* Position hint */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground px-1">
              <Move className="w-4 h-4" />
              <span>Drag image to reposition</span>
            </div>
          </>
        )}

        {/* Text inputs for document type */}
        {campaign.type === 'document' && textElements.length > 0 && (
          <div className="glass-card rounded-xl p-4 space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Type className="w-4 h-4" />
              <span>Edit Text Fields</span>
            </div>
            {textElements.map((elem) => (
              <div key={elem.id}>
                <label className="text-xs text-muted-foreground mb-1 block">
                  {elem.label}
                  {elem.isDraggable && (
                    <span className="ml-2 text-primary">(draggable)</span>
                  )}
                </label>
                <input
                  type="text"
                  value={elem.value}
                  onChange={(e) => updateTextValue(elem.id, e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-background border border-input text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                />
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          {campaign.type === 'photo' && (
            <label className="w-full">
              <Button variant="secondary" className="w-full">
                <Upload className="w-4 h-4 mr-2" />
                {userPhoto ? 'Change Photo' : 'Upload Photo'}
              </Button>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          )}
          
          <Button 
            variant="gradient" 
            className="w-full"
            onClick={handleDownload}
            disabled={campaign.type === 'photo' && !userPhoto}
          >
            <Download className="w-4 h-4 mr-2" />
            Download PNG
          </Button>

          <Button 
            variant="secondary" 
            className="w-full"
            onClick={handleDownloadPDF}
            disabled={campaign.type === 'photo' && !userPhoto}
          >
            <FileText className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>

        {/* Social Share */}
        <div className="pt-4 border-t border-border">
          <SocialShare 
            imageBlob={imageBlob}
            title={campaign.title}
            hashtags={campaign.hashtags}
            shareUrl={`${window.location.origin}/c/${campaign.id}`}
          />
        </div>

        {/* Hashtags */}
        {campaign.hashtags.length > 0 && (
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2">Suggested hashtags</p>
            <div className="flex flex-wrap gap-1.5">
              {campaign.hashtags.map((tag, i) => (
                <button
                  key={i}
                  onClick={() => {
                    navigator.clipboard.writeText(tag);
                    toast.success('Copied to clipboard!');
                  }}
                  className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
