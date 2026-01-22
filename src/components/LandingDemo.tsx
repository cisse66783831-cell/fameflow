import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Download, Sparkles, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { useNavigate } from 'react-router-dom';

// Demo frame SVG - J'y serai style with gradient
const demoFrameSvg = `
<svg width="600" height="800" viewBox="0 0 600 800" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="frameGrad" x1="0" y1="0" x2="600" y2="800">
      <stop offset="0%" stop-color="#8b5cf6"/>
      <stop offset="100%" stop-color="#d946ef"/>
    </linearGradient>
    <linearGradient id="badgeGrad" x1="0" y1="0" x2="100%" y2="0">
      <stop offset="0%" stop-color="#8b5cf6"/>
      <stop offset="100%" stop-color="#ec4899"/>
    </linearGradient>
  </defs>
  <!-- Frame border -->
  <rect x="15" y="15" width="570" height="770" rx="30" stroke="url(#frameGrad)" stroke-width="30" fill="none"/>
  <!-- Bottom badge background -->
  <rect x="100" y="700" width="400" height="70" rx="35" fill="url(#badgeGrad)"/>
  <!-- J'y serai text -->
  <text x="300" y="745" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="32" font-weight="bold">J'Y SERAI ! 🎉</text>
  <!-- Event name placeholder at top -->
  <rect x="150" y="40" width="300" height="40" rx="20" fill="rgba(139, 92, 246, 0.15)"/>
</svg>
`;

const demoFrameBase64 = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(demoFrameSvg)))}`;

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  }
};

export function LandingDemo() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [userName, setUserName] = useState('');
  const [userPhoto, setUserPhoto] = useState<HTMLImageElement | null>(null);
  const [frameImage, setFrameImage] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isGenerating, setIsGenerating] = useState(false);

  const CANVAS_WIDTH = 300;
  const CANVAS_HEIGHT = 400;
  const HD_WIDTH = 1200;
  const HD_HEIGHT = 1600;

  // Load demo frame on mount
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => setFrameImage(img);
    img.src = demoFrameBase64;
  }, []);

  // Draw canvas
  const drawCanvas = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height);
    
    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Draw user photo if exists
    if (userPhoto) {
      ctx.save();
      const photoScale = zoom * (width / CANVAS_WIDTH);
      const photoWidth = userPhoto.width * photoScale;
      const photoHeight = userPhoto.height * photoScale;
      const offsetScale = width / CANVAS_WIDTH;
      const photoX = (width - photoWidth) / 2 + offset.x * offsetScale;
      const photoY = (height - photoHeight) / 2 + offset.y * offsetScale;
      ctx.drawImage(userPhoto, photoX, photoY, photoWidth, photoHeight);
      ctx.restore();
    } else {
      // Placeholder
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#94a3b8';
      ctx.font = `${width * 0.05}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText('Ajoutez votre photo', width / 2, height / 2);
    }

    // Draw frame overlay
    if (frameImage) {
      ctx.drawImage(frameImage, 0, 0, width, height);
    }

    // Draw user name at top if provided
    if (userName) {
      const fontSize = width * 0.04;
      ctx.font = `bold ${fontSize}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#7c3aed';
      ctx.fillText(userName, width / 2, height * 0.08);
    }
  }, [userPhoto, frameImage, zoom, offset, userName]);

  // Redraw on changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    drawCanvas(ctx, CANVAS_WIDTH, CANVAS_HEIGHT);
  }, [drawCanvas]);

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setUserPhoto(img);
        setZoom(1);
        setOffset({ x: 0, y: 0 });
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Mouse/touch handlers for dragging
  const getEventCoords = (e: React.MouseEvent | React.TouchEvent) => {
    if ('touches' in e) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (!userPhoto) return;
    const coords = getEventCoords(e);
    setIsDragging(true);
    setDragStart({ x: coords.x - offset.x, y: coords.y - offset.y });
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const coords = getEventCoords(e);
    setOffset({
      x: coords.x - dragStart.x,
      y: coords.y - dragStart.y,
    });
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  // Download HD image
  const handleDownload = async () => {
    setIsGenerating(true);
    
    const hdCanvas = document.createElement('canvas');
    hdCanvas.width = HD_WIDTH;
    hdCanvas.height = HD_HEIGHT;
    const ctx = hdCanvas.getContext('2d');
    
    if (!ctx) {
      setIsGenerating(false);
      return;
    }

    drawCanvas(ctx, HD_WIDTH, HD_HEIGHT);

    // Download
    const link = document.createElement('a');
    link.download = `jyserai-${userName || 'visuel'}.png`;
    link.href = hdCanvas.toDataURL('image/png', 1.0);
    link.click();

    setIsGenerating(false);
  };

  const resetPosition = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  return (
    <motion.section 
      className="relative py-16 sm:py-24 px-4 sm:px-6 bg-gradient-to-b from-violet-50/50 to-white"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
    >
      <div className="container mx-auto max-w-5xl">
        <motion.div variants={fadeInUp} className="text-center mb-10 sm:mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-violet-100 text-violet-700 text-sm font-medium mb-4">
            Testez maintenant
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Créez votre visuel en{' '}
            <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              30 secondes
            </span>
          </h2>
          <p className="text-slate-600 max-w-xl mx-auto">
            Aucune inscription requise. Téléchargez directement votre création.
          </p>
        </motion.div>

        <motion.div 
          variants={fadeInUp}
          className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start"
        >
          {/* Canvas Preview */}
          <div className="flex justify-center">
            <motion.div 
              className="relative bg-white rounded-3xl p-4 shadow-xl shadow-violet-500/10 border border-slate-100"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                className="rounded-2xl cursor-move touch-none"
                style={{ maxWidth: '100%', height: 'auto' }}
                onMouseDown={handleStart}
                onMouseMove={handleMove}
                onMouseUp={handleEnd}
                onMouseLeave={handleEnd}
                onTouchStart={handleStart}
                onTouchMove={handleMove}
                onTouchEnd={handleEnd}
              />
              
              {/* Drag hint */}
              {userPhoto && (
                <motion.div
                  className="absolute bottom-6 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black/70 text-white text-xs rounded-full"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  Glissez pour ajuster
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Controls */}
          <div className="space-y-6">
            {/* Step 1: Upload Photo */}
            <motion.div 
              variants={fadeInUp}
              className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-sm">
                  1
                </div>
                <h3 className="font-semibold text-slate-900">Ajoutez votre photo</h3>
              </div>
              <label className="block">
                <div className="relative cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="flex items-center justify-center gap-3 px-4 py-3 border-2 border-dashed border-slate-200 rounded-xl hover:border-violet-400 hover:bg-violet-50/50 transition-colors">
                    <Upload className="w-5 h-5 text-slate-400" />
                    <span className="text-slate-600 text-sm">
                      {userPhoto ? 'Changer la photo' : 'Choisir une photo'}
                    </span>
                  </div>
                </div>
              </label>

              {/* Zoom controls */}
              {userPhoto && (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <ZoomOut className="w-4 h-4 text-slate-400" />
                    <Slider
                      value={[zoom]}
                      min={0.5}
                      max={2}
                      step={0.1}
                      onValueChange={([v]) => setZoom(v)}
                      className="flex-1"
                    />
                    <ZoomIn className="w-4 h-4 text-slate-400" />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetPosition}
                    className="text-slate-500 hover:text-slate-700"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Réinitialiser
                  </Button>
                </div>
              )}
            </motion.div>

            {/* Step 2: Add Name */}
            <motion.div 
              variants={fadeInUp}
              className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-sm">
                  2
                </div>
                <h3 className="font-semibold text-slate-900">Votre nom</h3>
              </div>
              <Input
                placeholder="Entrez votre nom..."
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="h-12"
              />
            </motion.div>

            {/* Step 3: Download */}
            <motion.div 
              variants={fadeInUp}
              className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-sm">
                  3
                </div>
                <h3 className="font-semibold text-slate-900">Téléchargez !</h3>
              </div>
              <Button
                onClick={handleDownload}
                disabled={!userPhoto || isGenerating}
                className="w-full h-12 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-semibold rounded-xl shadow-lg shadow-violet-500/25"
              >
                <Download className="w-5 h-5 mr-2" />
                {isGenerating ? 'Génération...' : 'Télécharger mon visuel HD'}
              </Button>
            </motion.div>

            {/* CTA to full platform */}
            <motion.div variants={fadeInUp}>
              <Button
                variant="outline"
                className="w-full h-12 rounded-xl border-violet-200 text-violet-700 hover:bg-violet-50"
                onClick={() => navigate('/auth?mode=signup')}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Créer ma campagne complète
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
