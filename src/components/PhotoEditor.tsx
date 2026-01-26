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
import { getCampaignPublicUrl } from '@/lib/publicUrls';
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
  const [userName, setUserName] = useState('');

  // Calculate canvas size based on document format (aperçu)
  const getCanvasSize = () => {
    if (campaign.type === 'document' && campaign.documentFormat) {
      switch (campaign.documentFormat) {
        case 'a4-landscape': return { width: 800, height: 566 };
        case 'a4-portrait': return { width: 566, height: 800 };
        case 'square': return { width: 600, height: 600 };
        case 'badge': return { width: 500, height: 300 };
      }
    }
    return { width: 400, height: 400 };
  };

  // Résolutions HD pour export 300 DPI
  const getHDSize = () => {
    if (campaign.type === 'document' && campaign.documentFormat) {
      switch (campaign.documentFormat) {
        case 'a4-landscape': return { width: 3508, height: 2480 }; // A4 300 DPI
        case 'a4-portrait': return { width: 2480, height: 3508 }; // A4 300 DPI
        case 'square': return { width: 2400, height: 2400 };
        case 'badge': return { width: 2000, height: 1200 };
      }
    }
    return { width: 2400, height: 2400 }; // Photo frame HD
  };

  const { width: CANVAS_WIDTH, height: CANVAS_HEIGHT } = getCanvasSize();
  const HD_SIZE = getHDSize();

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

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
        ctx.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(zoom, zoom);
        
        const scale = Math.max(CANVAS_WIDTH / img.width, CANVAS_HEIGHT / img.height);
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
            ctx.drawImage(frame, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
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
        ctx.drawImage(bg, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        drawTextElements(ctx);
      }).catch(console.error);
    } else if (campaign.frameImage) {
      // Just draw the frame
      loadImage(campaign.frameImage).then((frame) => {
        ctx.drawImage(frame, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        drawTextElements(ctx);
      }).catch(console.error);
    }
  }, [userPhoto, zoom, rotation, offset, campaign, textElements, CANVAS_WIDTH, CANVAS_HEIGHT]);

  const drawTextElements = (ctx: CanvasRenderingContext2D) => {
    textElements.forEach((elem) => {
      ctx.save();
      ctx.font = `${elem.fontWeight} ${elem.fontSize * (CANVAS_WIDTH / 800)}px ${elem.fontFamily}`;
      ctx.fillStyle = elem.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const x = elem.x * (CANVAS_WIDTH / 800);
      const y = elem.y * (CANVAS_HEIGHT / 600);
      
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
    const x = (clientX - rect.left) * (CANVAS_WIDTH / rect.width);
    const y = (clientY - rect.top) * (CANVAS_HEIGHT / rect.height);

    // Check if clicking on a draggable text element
    const clickedText = textElements.find(elem => {
      if (!elem.isDraggable) return false;
      const elemX = elem.x * (CANVAS_WIDTH / 800);
      const elemY = elem.y * (CANVAS_HEIGHT / 600);
      const size = elem.fontSize * (CANVAS_WIDTH / 800);
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
      const x = (clientX - rect.left) * (CANVAS_WIDTH / rect.width);
      const y = (clientY - rect.top) * (CANVAS_HEIGHT / rect.height);

      const deltaX = (x - textDragStart.x) * (800 / CANVAS_WIDTH);
      const deltaY = (y - textDragStart.y) * (600 / CANVAS_HEIGHT);

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

  // iOS detection helper
  const isIOS = () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  };

  const handleDownload = async () => {
    // Créer un canvas HD pour l'export
    const hdCanvas = document.createElement('canvas');
    hdCanvas.width = HD_SIZE.width;
    hdCanvas.height = HD_SIZE.height;
    const hdCtx = hdCanvas.getContext('2d');
    if (!hdCtx) return;

    const scaleX = HD_SIZE.width / CANVAS_WIDTH;
    const scaleY = HD_SIZE.height / CANVAS_HEIGHT;

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

    try {
      // Draw background or user photo
      if (userPhoto) {
        const img = await loadImage(userPhoto);
        hdCtx.save();
        hdCtx.translate(HD_SIZE.width / 2, HD_SIZE.height / 2);
        hdCtx.rotate((rotation * Math.PI) / 180);
        hdCtx.scale(zoom, zoom);
        
        const scale = Math.max(HD_SIZE.width / img.width, HD_SIZE.height / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        
        hdCtx.drawImage(
          img,
          -w / 2 + offset.x * scaleX,
          -h / 2 + offset.y * scaleY,
          w,
          h
        );
        hdCtx.restore();

        // Draw frame overlay
        if (campaign.frameImage) {
          const frame = await loadImage(campaign.frameImage);
          hdCtx.drawImage(frame, 0, 0, HD_SIZE.width, HD_SIZE.height);
        }
      } else if (campaign.type === 'document' && campaign.backgroundImage) {
        const bg = await loadImage(campaign.backgroundImage);
        hdCtx.drawImage(bg, 0, 0, HD_SIZE.width, HD_SIZE.height);
      } else if (campaign.frameImage) {
        const frame = await loadImage(campaign.frameImage);
        hdCtx.drawImage(frame, 0, 0, HD_SIZE.width, HD_SIZE.height);
      }

      // Draw text elements in HD
      textElements.forEach((elem) => {
        hdCtx.save();
        const fontSize = elem.fontSize * scaleX;
        hdCtx.font = `${elem.fontWeight} ${fontSize}px ${elem.fontFamily}`;
        hdCtx.fillStyle = elem.color;
        hdCtx.textAlign = 'center';
        hdCtx.textBaseline = 'middle';
        
        const x = elem.x * scaleX;
        const y = elem.y * scaleY;
        
        hdCtx.fillText(elem.value, x, y);
        hdCtx.restore();
      });

      // Check for iOS device
      const isIOSDevice = isIOS();

      if (isIOSDevice) {
        // iOS method: try Web Share API first, fallback to opening in new tab
        hdCanvas.toBlob(async (blob) => {
          if (!blob) {
            toast.error('Erreur lors de la création de l\'image');
            return;
          }

          // Try Web Share API first
          if (navigator.share && navigator.canShare) {
            const file = new File([blob], `${campaign.title.replace(/\s+/g, '-')}-HD.png`, { type: 'image/png' });
            const shareData = { files: [file], title: campaign.title };
            
            if (navigator.canShare(shareData)) {
              try {
                await navigator.share(shareData);
                onDownload();
                toast.success('Image partagée avec succès !');
                return;
              } catch (e) {
                // User cancelled or error - fallback to new tab method
                if ((e as Error).name !== 'AbortError') {
                  console.log('Share failed, falling back to new tab method');
                }
              }
            }
          }

          // Fallback: Open in new tab with instructions
          const url = URL.createObjectURL(blob);
          const newWindow = window.open('', '_blank');
          if (newWindow) {
            newWindow.document.write(`
              <!DOCTYPE html>
              <html>
                <head>
                  <title>Enregistrer l'image</title>
                  <meta name="viewport" content="width=device-width, initial-scale=1">
                  <style>
                    * { box-sizing: border-box; margin: 0; padding: 0; }
                    body { 
                      background: #000; 
                      min-height: 100vh;
                      display: flex;
                      flex-direction: column;
                      align-items: center;
                      padding: 20px;
                      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    }
                    .instructions {
                      color: white;
                      text-align: center;
                      padding: 20px;
                      font-size: 16px;
                      line-height: 1.6;
                      max-width: 300px;
                    }
                    .highlight {
                      color: #007AFF;
                      font-weight: 600;
                    }
                    .emoji { font-size: 24px; margin-bottom: 10px; display: block; }
                    img { 
                      max-width: 100%; 
                      max-height: 70vh;
                      border-radius: 12px;
                      margin-top: 20px;
                    }
                  </style>
                </head>
                <body>
                  <div class="instructions">
                    <span class="emoji">📱</span>
                    <p><span class="highlight">Appuyez longuement</span> sur l'image</p>
                    <p style="margin-top: 8px;">Puis sélectionnez <span class="highlight">"Ajouter aux photos"</span></p>
                  </div>
                  <img src="${url}" alt="Image à télécharger"/>
                </body>
              </html>
            `);
            newWindow.document.close();
          } else {
            // If popup blocked, open URL directly
            window.location.href = url;
          }
          
          onDownload();
          toast.success('Appuyez longuement sur l\'image pour l\'enregistrer');
        }, 'image/png', 1.0);
      } else {
        // Standard download for other browsers
        const link = document.createElement('a');
        link.download = `${campaign.title.replace(/\s+/g, '-')}-HD.png`;
        link.href = hdCanvas.toDataURL('image/png', 1.0);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        onDownload();
        toast.success(`Image HD téléchargée (${HD_SIZE.width}x${HD_SIZE.height}px)`);
      }
    } catch (error) {
      console.error('HD export error:', error);
      toast.error('Erreur lors de l\'export HD');
    }
  };

  const handleDownloadPDF = async () => {
    // Créer un canvas HD pour l'export PDF
    const hdCanvas = document.createElement('canvas');
    hdCanvas.width = HD_SIZE.width;
    hdCanvas.height = HD_SIZE.height;
    const hdCtx = hdCanvas.getContext('2d');
    if (!hdCtx) return;

    const scaleX = HD_SIZE.width / CANVAS_WIDTH;
    const scaleY = HD_SIZE.height / CANVAS_HEIGHT;

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

    try {
      // Draw background or user photo
      if (userPhoto) {
        const img = await loadImage(userPhoto);
        hdCtx.save();
        hdCtx.translate(HD_SIZE.width / 2, HD_SIZE.height / 2);
        hdCtx.rotate((rotation * Math.PI) / 180);
        hdCtx.scale(zoom, zoom);
        
        const scale = Math.max(HD_SIZE.width / img.width, HD_SIZE.height / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        
        hdCtx.drawImage(
          img,
          -w / 2 + offset.x * scaleX,
          -h / 2 + offset.y * scaleY,
          w,
          h
        );
        hdCtx.restore();

        if (campaign.frameImage) {
          const frame = await loadImage(campaign.frameImage);
          hdCtx.drawImage(frame, 0, 0, HD_SIZE.width, HD_SIZE.height);
        }
      } else if (campaign.type === 'document' && campaign.backgroundImage) {
        const bg = await loadImage(campaign.backgroundImage);
        hdCtx.drawImage(bg, 0, 0, HD_SIZE.width, HD_SIZE.height);
      } else if (campaign.frameImage) {
        const frame = await loadImage(campaign.frameImage);
        hdCtx.drawImage(frame, 0, 0, HD_SIZE.width, HD_SIZE.height);
      }

      // Draw text elements in HD
      textElements.forEach((elem) => {
        hdCtx.save();
        const fontSize = elem.fontSize * scaleX;
        hdCtx.font = `${elem.fontWeight} ${fontSize}px ${elem.fontFamily}`;
        hdCtx.fillStyle = elem.color;
        hdCtx.textAlign = 'center';
        hdCtx.textBaseline = 'middle';
        
        const x = elem.x * scaleX;
        const y = elem.y * scaleY;
        
        hdCtx.fillText(elem.value, x, y);
        hdCtx.restore();
      });

      // Create PDF with HD image
      const isLandscape = HD_SIZE.width > HD_SIZE.height;
      const pdf = new jsPDF({
        orientation: isLandscape ? 'landscape' : 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgData = hdCanvas.toDataURL('image/png', 1.0);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Center the image on the page
      const canvasAspect = hdCanvas.width / hdCanvas.height;
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

      // Check for iOS device
      const isIOSDevice = isIOS();

      if (isIOSDevice) {
        // iOS method: create blob and open in new tab
        const pdfBlob = pdf.output('blob');
        
        // Try Web Share API first
        if (navigator.share && navigator.canShare) {
          const file = new File([pdfBlob], `${campaign.title.replace(/\s+/g, '-')}-HD.pdf`, { type: 'application/pdf' });
          const shareData = { files: [file], title: campaign.title };
          
          if (navigator.canShare(shareData)) {
            try {
              await navigator.share(shareData);
              onDownload();
              toast.success('PDF partagé avec succès !');
              return;
            } catch (e) {
              // User cancelled or error - fallback to new tab method
              if ((e as Error).name !== 'AbortError') {
                console.log('Share failed, falling back to new tab method');
              }
            }
          }
        }

        // Fallback: Open PDF in new tab
        const pdfUrl = URL.createObjectURL(pdfBlob);
        const newWindow = window.open(pdfUrl, '_blank');
        
        if (!newWindow) {
          // If popup blocked, try direct navigation
          window.location.href = pdfUrl;
        }
        
        onDownload();
        toast.success('Utilisez le bouton partage pour enregistrer le PDF');
      } else {
        // Standard download for other browsers
        pdf.save(`${campaign.title.replace(/\s+/g, '-')}-HD.pdf`);
        onDownload();
        toast.success('PDF HD téléchargé (qualité 300 DPI)');
      }
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('Erreur lors de l\'export PDF');
    }
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
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
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

        {/* User Name Input for Sharing */}
        {campaign.type === 'photo' && (
          <div className="pt-4 border-t border-border">
            <label className="text-xs text-muted-foreground mb-2 block">Votre nom (pour le partage)</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Entrez votre nom"
              className="w-full px-3 py-2 rounded-lg bg-background border border-input text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all mb-3"
            />
          </div>
        )}

        {/* Social Share */}
        <div className={campaign.type !== 'photo' ? "pt-4 border-t border-border" : ""}>
          <SocialShare 
            imageBlob={imageBlob}
            title={campaign.title}
            hashtags={campaign.hashtags}
            shareUrl={getCampaignPublicUrl(campaign)}
            campaignId={campaign.id}
            creatorName={userName || 'Participant'}
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
