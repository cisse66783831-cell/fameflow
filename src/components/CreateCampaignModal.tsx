import { useState, useEffect, useRef, useCallback } from 'react';
import { Campaign, TextElement, DocumentFormat, DocumentCategory } from '@/types/campaign';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Image, FileText, Upload, Sparkles, X, Loader2, Wand2, Video, AlertCircle, Check, Camera, Play, Square, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useStorage } from '@/hooks/useStorage';
import { supabase } from '@/integrations/supabase/client';
import { compressImage, needsCompression, formatFileSize } from '@/utils/imageCompression';
import { DocumentFieldEditor } from './DocumentFieldEditor';
import { DocumentTemplateSelector } from './DocumentTemplateSelector';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CreateCampaignModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (campaign: Campaign) => void;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

const DOCUMENT_FORMATS: { value: DocumentFormat; label: string; dimensions: string }[] = [
  { value: 'a4-landscape', label: 'A4 Paysage', dimensions: '800 × 566' },
  { value: 'a4-portrait', label: 'A4 Portrait', dimensions: '566 × 800' },
  { value: 'square', label: 'Carré', dimensions: '600 × 600' },
  { value: 'badge', label: 'Badge', dimensions: '500 × 300' },
];

const getCanvasDimensions = (format: DocumentFormat) => {
  switch (format) {
    case 'a4-landscape': return { width: 800, height: 566 };
    case 'a4-portrait': return { width: 566, height: 800 };
    case 'square': return { width: 600, height: 600 };
    case 'badge': return { width: 500, height: 300 };
    default: return { width: 800, height: 566 };
  }
};

export const CreateCampaignModal = ({ open, onClose, onCreate }: CreateCampaignModalProps) => {
  const [step, setStep] = useState<'type' | 'document-config' | 'details'>('type');
  const [type, setType] = useState<'photo' | 'document' | 'video_filter'>('photo');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [frameImage, setFrameImage] = useState<string>('');
  const [frameImagePortrait, setFrameImagePortrait] = useState<string>('');
  const [frameImageLandscape, setFrameImageLandscape] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [portraitFile, setPortraitFile] = useState<File | null>(null);
  const [landscapeFile, setLandscapeFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingHashtags, setIsGeneratingHashtags] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [slug, setSlug] = useState('');
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [showCompressionDialog, setShowCompressionDialog] = useState(false);
  const [pendingFile, setPendingFile] = useState<{ file: File; target: 'main' | 'portrait' | 'landscape' } | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  
  // Document-specific state
  const [documentFormat, setDocumentFormat] = useState<DocumentFormat>('a4-landscape');
  const [documentCategory, setDocumentCategory] = useState<DocumentCategory>('attestation');
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [backgroundImage, setBackgroundImage] = useState<string>('');
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
  const [showTemplateSelector, setShowTemplateSelector] = useState(true);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [isDraggingField, setIsDraggingField] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0, fieldX: 0, fieldY: 0 });
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const { uploadImage } = useStorage();

  // Debounced slug check
  useEffect(() => {
    if (!slug.trim()) {
      setSlugAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingSlug(true);
      try {
        const { data, error } = await supabase
          .rpc('check_slug_availability', { check_slug: slug.toLowerCase().trim() });
        
        if (error) throw error;
        setSlugAvailable(data);
      } catch (error) {
        console.error('Error checking slug:', error);
        setSlugAvailable(null);
      }
      setIsCheckingSlug(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [slug]);

  const processFile = (file: File, target: 'main' | 'portrait' | 'landscape') => {
    const previewUrl = URL.createObjectURL(file);
    
    if (target === 'main') {
      setImageFile(file);
      setFrameImage(previewUrl);
    } else if (target === 'portrait') {
      setPortraitFile(file);
      setFrameImagePortrait(previewUrl);
    } else {
      setLandscapeFile(file);
      setFrameImageLandscape(previewUrl);
    }
    toast.success('Image sélectionnée!');
  };

  const handleCompressAndUse = async () => {
    if (!pendingFile) return;
    
    setIsCompressing(true);
    try {
      const compressedFile = await compressImage(pendingFile.file, 2, 2048);
      processFile(compressedFile, pendingFile.target);
      toast.success(`Image compressée: ${formatFileSize(pendingFile.file.size)} → ${formatFileSize(compressedFile.size)}`);
    } catch (error) {
      console.error('Compression error:', error);
      toast.error('Erreur lors de la compression');
    }
    setIsCompressing(false);
    setShowCompressionDialog(false);
    setPendingFile(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'main' | 'portrait' | 'landscape') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if file needs compression (> 2MB) - offer compression dialog
    if (needsCompression(file, 2)) {
      setPendingFile({ file, target });
      setShowCompressionDialog(true);
      return;
    }

    processFile(file, target);
  };

  const generateWithAI = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: { type: 'campaign-idea' }
      });

      if (error) throw error;
      
      const result = data?.result;
      if (result) {
        try {
          const parsed = JSON.parse(result);
          setTitle(parsed.title || '');
          setDescription(parsed.description || '');
          setHashtags(parsed.hashtags || '');
        } catch {
          setTitle(result.slice(0, 50));
        }
        toast.success('Généré avec l\'IA!');
      }
    } catch (error) {
      console.error('AI generation error:', error);
      toast.error('Échec de la génération. Réessayez.');
    }
    setIsGenerating(false);
  };

  const generateHashtags = async () => {
    if (!title.trim()) {
      toast.error('Veuillez d\'abord entrer un titre');
      return;
    }
    
    setIsGeneratingHashtags(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: { 
          type: 'hashtags',
          title,
          description
        }
      });

      if (error) throw error;
      
      if (data?.result) {
        setHashtags(data.result);
        toast.success('Hashtags générés!');
      }
    } catch (error) {
      console.error('Hashtag generation error:', error);
      toast.error('Échec de la génération des hashtags');
    }
    setIsGeneratingHashtags(false);
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error('Veuillez entrer un titre');
      return;
    }

    // Validate based on type
    if (type === 'video_filter') {
      if (!portraitFile && !landscapeFile) {
        toast.error('Veuillez uploader au moins un cadre (portrait ou paysage)');
        return;
      }
    } else {
      if (!imageFile) {
        toast.error('Veuillez uploader une image');
        return;
      }
    }

    // Validate slug if provided
    if (slug.trim() && slugAvailable === false) {
      toast.error('Ce lien personnalisé est déjà pris');
      return;
    }

    setIsUploading(true);
    
    try {
      let uploadedUrl = '';
      let uploadedPortraitUrl = '';
      let uploadedLandscapeUrl = '';

      if (type === 'video_filter') {
        // Upload portrait and landscape frames
        if (portraitFile) {
          uploadedPortraitUrl = await uploadImage(portraitFile, 'filters/portrait') || '';
        }
        if (landscapeFile) {
          uploadedLandscapeUrl = await uploadImage(landscapeFile, 'filters/landscape') || '';
        }
        // Use portrait as main if available, otherwise landscape
        uploadedUrl = uploadedPortraitUrl || uploadedLandscapeUrl;
      } else {
        // Upload main image
        uploadedUrl = await uploadImage(imageFile!, type === 'photo' ? 'frames' : 'documents') || '';
      }

      if (!uploadedUrl) {
        toast.error('Échec de l\'upload de l\'image');
        setIsUploading(false);
        return;
      }

      const campaign: Campaign = {
        id: `campaign-${Date.now()}`,
        title: title.trim(),
        description: description.trim(),
        type,
        frameImage: uploadedUrl,
        frameImagePortrait: uploadedPortraitUrl || undefined,
        frameImageLandscape: uploadedLandscapeUrl || undefined,
        backgroundImage: type === 'document' ? uploadedUrl : undefined,
        textElements: type === 'document' ? textElements : [],
        hashtags: hashtags.split(' ').filter(h => h.startsWith('#')),
        views: 0,
        downloads: 0,
        createdAt: new Date(),
        slug: slug.trim().toLowerCase() || undefined,
        documentFormat: type === 'document' ? documentFormat : undefined,
        documentCategory: type === 'document' ? documentCategory : undefined,
      };

      onCreate(campaign);
      setIsUploading(false);
      handleClose();
      toast.success('Campagne créée!');
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast.error('Erreur lors de la création');
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    stopCamera();
    setStep('type');
    setType('photo');
    setTitle('');
    setDescription('');
    setHashtags('');
    setFrameImage('');
    setFrameImagePortrait('');
    setFrameImageLandscape('');
    setImageFile(null);
    setPortraitFile(null);
    setLandscapeFile(null);
    setSlug('');
    setSlugAvailable(null);
    setShowPreview(false);
    setIsCameraActive(false);
    // Reset document state
    setDocumentFormat('a4-landscape');
    setDocumentCategory('attestation');
    setTextElements([]);
    setBackgroundImage('');
    setBackgroundFile(null);
    setShowTemplateSelector(true);
    setSelectedFieldId(null);
    setIsDraggingField(false);
    onClose();
  };

  // Drag & drop handlers pour les champs texte sur l'aperçu
  const handlePreviewMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!previewRef.current) return;
    
    const rect = previewRef.current.getBoundingClientRect();
    const dims = getCanvasDimensions(documentFormat);
    const scaleX = dims.width / rect.width;
    const scaleY = dims.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    // Trouver si on clique sur un champ
    const clickedField = textElements.find(elem => {
      const dx = Math.abs(x - elem.x);
      const dy = Math.abs(y - elem.y);
      return dx < 80 && dy < elem.fontSize;
    });
    
    if (clickedField) {
      e.preventDefault();
      setSelectedFieldId(clickedField.id);
      setIsDraggingField(true);
      setDragStartPos({ 
        x: e.clientX, 
        y: e.clientY, 
        fieldX: clickedField.x, 
        fieldY: clickedField.y 
      });
    } else {
      setSelectedFieldId(null);
    }
  }, [textElements, documentFormat]);

  const handlePreviewMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingField || !selectedFieldId || !previewRef.current) return;
    
    const rect = previewRef.current.getBoundingClientRect();
    const dims = getCanvasDimensions(documentFormat);
    const scaleX = dims.width / rect.width;
    const scaleY = dims.height / rect.height;
    
    const deltaX = (e.clientX - dragStartPos.x) * scaleX;
    const deltaY = (e.clientY - dragStartPos.y) * scaleY;
    
    const newX = Math.max(50, Math.min(dims.width - 50, dragStartPos.fieldX + deltaX));
    const newY = Math.max(30, Math.min(dims.height - 30, dragStartPos.fieldY + deltaY));
    
    setTextElements(prev => prev.map(elem => 
      elem.id === selectedFieldId ? { ...elem, x: newX, y: newY } : elem
    ));
  }, [isDraggingField, selectedFieldId, dragStartPos, documentFormat]);

  const handlePreviewMouseUp = useCallback(() => {
    setIsDraggingField(false);
  }, []);

  // Camera functions for filter preview
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 720, height: 1280 },
        audio: false 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
      setShowPreview(true);
    } catch (error) {
      toast.error('Impossible d\'accéder à la caméra');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const renderImageUpload = (
    label: string,
    preview: string,
    onClear: () => void,
    target: 'main' | 'portrait' | 'landscape',
    hint?: string
  ) => (
    <div>
      <label className="text-sm font-medium mb-2 block">
        {label}
        {hint && <span className="text-xs text-muted-foreground ml-2">({hint})</span>}
      </label>
      <label className="cursor-pointer block">
        {preview ? (
          <div className="relative group">
            <img 
              src={preview} 
              alt="Preview" 
              className="w-full h-32 object-contain bg-muted/50 rounded-xl"
            />
            <button
              onClick={(e) => {
                e.preventDefault();
                onClear();
              }}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="border-2 border-dashed rounded-xl p-6 text-center hover:border-primary hover:bg-primary/5 transition-all">
            <Upload className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
            <p className="text-xs text-muted-foreground">Cliquez pour uploader</p>
            <p className="text-xs text-muted-foreground mt-1">Max 2 Mo</p>
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleFileUpload(e, target)}
          className="hidden"
        />
      </label>
    </div>
  );

  return (
    <>
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {step === 'type' && 'Choisir le type de campagne'}
            {step === 'document-config' && 'Configuration du document'}
            {step === 'details' && 'Détails de la campagne'}
          </DialogTitle>
        </DialogHeader>

        {step === 'type' ? (
          <div className="grid grid-cols-3 gap-3 mt-4">
            <button
              onClick={() => {
                setType('photo');
                setStep('details');
              }}
              className={cn(
                "p-4 rounded-xl border-2 border-dashed transition-all",
                "hover:border-primary hover:bg-primary/5",
                "flex flex-col items-center gap-2 text-center"
              )}
            >
              <div className="p-3 rounded-full bg-primary/10">
                <Image className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Cadre Photo</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Photos de profil
                </p>
              </div>
            </button>

            <button
              onClick={() => {
                setType('video_filter');
                setStep('details');
              }}
              className={cn(
                "p-4 rounded-xl border-2 border-dashed transition-all",
                "hover:border-chart-1 hover:bg-chart-1/5",
                "flex flex-col items-center gap-2 text-center"
              )}
            >
              <div className="p-3 rounded-full bg-chart-1/10">
                <Video className="w-6 h-6 text-chart-1" />
              </div>
              <div>
                <p className="font-medium text-sm">Filtre Vidéo</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Reels & Stories
                </p>
              </div>
            </button>

            <button
              onClick={() => {
                setType('document');
                setStep('document-config');
                setShowTemplateSelector(true);
              }}
              className={cn(
                "p-4 rounded-xl border-2 border-dashed transition-all",
                "hover:border-accent hover:bg-accent/5",
                "flex flex-col items-center gap-2 text-center"
              )}
            >
              <div className="p-3 rounded-full bg-accent/10">
                <FileText className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="font-medium text-sm">Document</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Attestations & Certificats
                </p>
              </div>
            </button>
          </div>
        ) : step === 'document-config' ? (
          <div className="space-y-6 mt-4">
            {showTemplateSelector ? (
              <DocumentTemplateSelector
                onSelect={(template) => {
                  if (template.documentFormat) setDocumentFormat(template.documentFormat);
                  if (template.documentCategory) setDocumentCategory(template.documentCategory);
                  if (template.textElements) setTextElements(template.textElements);
                  if (template.backgroundImage) setBackgroundImage(template.backgroundImage);
                  setShowTemplateSelector(false);
                }}
              />
            ) : (
              <>
                {/* Format Selection */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Format du document</label>
                  <div className="grid grid-cols-2 gap-2">
                    {DOCUMENT_FORMATS.map(format => (
                      <button
                        key={format.value}
                        onClick={() => setDocumentFormat(format.value)}
                        className={cn(
                          "p-3 rounded-lg border-2 text-left transition-all",
                          documentFormat === format.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <p className="font-medium text-sm">{format.label}</p>
                        <p className="text-xs text-muted-foreground">{format.dimensions}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Background Upload */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Image de fond
                    <span className="text-xs text-muted-foreground ml-2">(optionnel)</span>
                  </label>
                  <label className="cursor-pointer block">
                    {backgroundImage ? (
                      <div className="relative group">
                        <img 
                          src={backgroundImage} 
                          alt="Background Preview" 
                          className="w-full h-40 object-contain bg-muted/50 rounded-xl"
                        />
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setBackgroundImage('');
                            setBackgroundFile(null);
                          }}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed rounded-xl p-8 text-center hover:border-primary hover:bg-primary/5 transition-all">
                        <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">Cliquez pour uploader un fond</p>
                        <p className="text-xs text-muted-foreground mt-1">PNG, JPG - Max 2 Mo</p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const previewUrl = URL.createObjectURL(file);
                          setBackgroundFile(file);
                          setBackgroundImage(previewUrl);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Text Elements Editor */}
                <DocumentFieldEditor
                  textElements={textElements}
                  onChange={setTextElements}
                  canvasWidth={getCanvasDimensions(documentFormat).width}
                  canvasHeight={getCanvasDimensions(documentFormat).height}
                  selectedFieldId={selectedFieldId}
                  onSelectField={setSelectedFieldId}
                />

                {/* Document Preview - avec Drag & Drop */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Aperçu 
                    <span className="text-xs text-muted-foreground ml-2">(glissez les textes pour les positionner)</span>
                  </label>
                  <div 
                    ref={previewRef}
                    className={cn(
                      "relative bg-muted/30 rounded-xl overflow-hidden mx-auto border-2 transition-all select-none",
                      isDraggingField ? "cursor-grabbing border-primary" : "cursor-grab border-border"
                    )}
                    style={{ 
                      width: '100%',
                      maxWidth: 400,
                      aspectRatio: `${getCanvasDimensions(documentFormat).width} / ${getCanvasDimensions(documentFormat).height}`
                    }}
                    onMouseDown={handlePreviewMouseDown}
                    onMouseMove={handlePreviewMouseMove}
                    onMouseUp={handlePreviewMouseUp}
                    onMouseLeave={handlePreviewMouseUp}
                  >
                    {backgroundImage && (
                      <img 
                        src={backgroundImage} 
                        alt="Background" 
                        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                        draggable={false}
                      />
                    )}
                    <svg 
                      viewBox={`0 0 ${getCanvasDimensions(documentFormat).width} ${getCanvasDimensions(documentFormat).height}`}
                      className="absolute inset-0 w-full h-full pointer-events-none"
                    >
                      {textElements.map(elem => (
                        <g key={elem.id}>
                          {/* Indicateur de sélection */}
                          {selectedFieldId === elem.id && (
                            <rect
                              x={elem.x - 60}
                              y={elem.y - elem.fontSize / 2 - 5}
                              width={120}
                              height={elem.fontSize + 10}
                              fill="none"
                              stroke="hsl(var(--primary))"
                              strokeWidth="2"
                              strokeDasharray="5,5"
                              rx="4"
                            />
                          )}
                          <text
                            x={elem.x}
                            y={elem.y}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize={elem.fontSize}
                            fontFamily={elem.fontFamily}
                            fontWeight={elem.fontWeight}
                            fill={elem.color}
                            className={cn(
                              "transition-opacity",
                              selectedFieldId === elem.id ? "opacity-100" : "opacity-80"
                            )}
                          >
                            {elem.value}
                          </text>
                        </g>
                      ))}
                    </svg>
                    
                    {/* Hint si pas de champs */}
                    {textElements.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                        <p className="text-sm">Ajoutez des textes</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Navigation */}
            <div className="flex gap-3 pt-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  if (showTemplateSelector) {
                    setStep('type');
                  } else {
                    setShowTemplateSelector(true);
                  }
                }} 
                className="flex-1"
              >
                Retour
              </Button>
              {!showTemplateSelector && (
                <Button 
                  variant="gradient" 
                  onClick={() => setStep('details')} 
                  className="flex-1"
                >
                  Continuer
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            {/* Image Upload Section */}
            {type === 'video_filter' ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {renderImageUpload(
                    'Cadre Portrait',
                    frameImagePortrait,
                    () => { setFrameImagePortrait(''); setPortraitFile(null); },
                    'portrait',
                    '9:16'
                  )}
                  {renderImageUpload(
                    'Cadre Paysage',
                    frameImageLandscape,
                    () => { setFrameImageLandscape(''); setLandscapeFile(null); },
                    'landscape',
                    '16:9'
                  )}
                </div>

                {/* Real-time Filter Preview */}
                {(frameImagePortrait || frameImageLandscape) && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Prévisualisation en direct</label>
                      {!isCameraActive ? (
                        <Button variant="outline" size="sm" onClick={startCamera}>
                          <Camera className="w-4 h-4 mr-1" />
                          Activer caméra
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" onClick={stopCamera}>
                          <Square className="w-4 h-4 mr-1" />
                          Désactiver
                        </Button>
                      )}
                    </div>
                    
                    {showPreview && (
                      <div className="aspect-[9/16] max-h-[300px] rounded-xl bg-background border border-border overflow-hidden relative mx-auto">
                        <video 
                          ref={videoRef} 
                          autoPlay 
                          muted 
                          playsInline
                          className="w-full h-full object-cover"
                        />
                        {/* Filter Overlay */}
                        <img 
                          src={frameImagePortrait || frameImageLandscape} 
                          alt="Filter Preview" 
                          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                        />
                        {!isCameraActive && (
                          <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
                            <Button variant="outline" onClick={startCamera}>
                              <Play className="w-4 h-4 mr-2" />
                              Démarrer l'aperçu
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              renderImageUpload(
                type === 'photo' ? 'Image du cadre (PNG transparent)' : 'Image de fond',
                frameImage,
                () => { setFrameImage(''); setImageFile(null); },
                'main'
              )
            )}

            {/* Slug / Personalized Link */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Lien personnalisé
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">jyserai.site/</span>
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.replace(/[^a-zA-Z0-9-_]/g, '').toLowerCase())}
                    placeholder="mon-projet"
                    className="w-full px-3 py-2 rounded-lg bg-background border border-input focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm"
                  />
                  {slug && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      {isCheckingSlug ? (
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      ) : slugAvailable === true ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : slugAvailable === false ? (
                        <AlertCircle className="w-4 h-4 text-destructive" />
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
              {slug && slugAvailable === false && (
                <p className="text-xs text-destructive mt-1">Ce lien est déjà pris</p>
              )}
              {slug && slugAvailable === true && (
                <p className="text-xs text-green-500 mt-1">Ce lien est disponible</p>
              )}
            </div>

            {/* Title */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Titre</label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={generateWithAI}
                  disabled={isGenerating}
                  className="text-xs"
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  {isGenerating ? 'Génération...' : 'IA'}
                </Button>
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ma super campagne"
                className="w-full px-4 py-2.5 rounded-lg bg-background border border-input focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Décrivez votre campagne..."
                rows={2}
                className="w-full px-4 py-2.5 rounded-lg bg-background border border-input focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
              />
            </div>

            {/* Hashtags */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Hashtags</label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={generateHashtags}
                  disabled={isGeneratingHashtags || !title.trim()}
                  className="text-xs"
                >
                  <Wand2 className="w-3 h-3 mr-1" />
                  {isGeneratingHashtags ? 'Génération...' : 'Générer'}
                </Button>
              </div>
              <input
                type="text"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                placeholder="#Viral #Campagne #Jyserai"
                className="w-full px-4 py-2.5 rounded-lg bg-background border border-input focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setStep('type')} className="flex-1" disabled={isUploading}>
                Retour
              </Button>
              <Button variant="gradient" onClick={handleCreate} className="flex-1" disabled={isUploading}>
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Upload...
                  </>
                ) : (
                  'Créer la campagne'
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>

    {/* Compression Dialog */}
    <AlertDialog open={showCompressionDialog} onOpenChange={setShowCompressionDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Fichier trop volumineux</AlertDialogTitle>
          <AlertDialogDescription>
            Ce fichier fait {pendingFile ? formatFileSize(pendingFile.file.size) : ''}, ce qui dépasse la limite de 2 Mo.
            <br /><br />
            Souhaitez-vous que nous réduisions automatiquement la taille du fichier ? 
            La qualité sera optimisée pour conserver un rendu net.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel 
            onClick={() => {
              setShowCompressionDialog(false);
              setPendingFile(null);
            }}
          >
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleCompressAndUse} disabled={isCompressing}>
            {isCompressing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Compression...
              </>
            ) : (
              'Réduire et utiliser'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>
  );
};
