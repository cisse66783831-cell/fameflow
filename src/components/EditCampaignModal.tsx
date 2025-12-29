import { useState, useEffect, useRef } from 'react';
import { Campaign } from '@/types/campaign';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Upload, X, Loader2, Wand2, Sparkles, AlertCircle, Check, Camera, Square } from 'lucide-react';
import { toast } from 'sonner';
import { useStorage } from '@/hooks/useStorage';
import { supabase } from '@/integrations/supabase/client';
import { compressImage, needsCompression, formatFileSize } from '@/utils/imageCompression';
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

interface EditCampaignModalProps {
  open: boolean;
  campaign: Campaign | null;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Campaign>) => void;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export const EditCampaignModal = ({ open, campaign, onClose, onUpdate }: EditCampaignModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [frameImage, setFrameImage] = useState<string>('');
  const [frameImagePortrait, setFrameImagePortrait] = useState<string>('');
  const [frameImageLandscape, setFrameImageLandscape] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [portraitFile, setPortraitFile] = useState<File | null>(null);
  const [landscapeFile, setLandscapeFile] = useState<File | null>(null);
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { uploadImage } = useStorage();

  useEffect(() => {
    if (campaign) {
      setTitle(campaign.title);
      setDescription(campaign.description || '');
      setHashtags(campaign.hashtags.join(' '));
      setFrameImage(campaign.frameImage);
      setFrameImagePortrait(campaign.frameImagePortrait || '');
      setFrameImageLandscape(campaign.frameImageLandscape || '');
      setSlug(campaign.slug || '');
      setSlugAvailable(null);
    }
  }, [campaign]);

  // Debounced slug check
  useEffect(() => {
    if (!slug.trim() || (campaign?.slug === slug)) {
      setSlugAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingSlug(true);
      try {
        const { data, error } = await supabase
          .rpc('check_slug_availability', { 
            check_slug: slug.toLowerCase().trim(),
            exclude_id: campaign?.id
          });
        
        if (error) throw error;
        setSlugAvailable(data);
      } catch (error) {
        console.error('Error checking slug:', error);
        setSlugAvailable(null);
      }
      setIsCheckingSlug(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [slug, campaign?.id, campaign?.slug]);

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

  const handleUpdate = async () => {
    if (!campaign) return;
    
    if (!title.trim()) {
      toast.error('Veuillez entrer un titre');
      return;
    }

    // Validate slug if changed
    if (slug.trim() && slug !== campaign.slug && slugAvailable === false) {
      toast.error('Ce lien personnalisé est déjà pris');
      return;
    }

    setIsUploading(true);
    
    try {
      const updates: Partial<Campaign> = {
        title: title.trim(),
        description: description.trim(),
        hashtags: hashtags.split(' ').filter(h => h.startsWith('#')),
        slug: slug.trim().toLowerCase() || undefined,
      };

      // Upload new images if provided
      if (imageFile) {
        const uploadedUrl = await uploadImage(imageFile, campaign.type === 'photo' ? 'frames' : 'documents');
        if (uploadedUrl) updates.frameImage = uploadedUrl;
      }

      if (portraitFile) {
        const uploadedUrl = await uploadImage(portraitFile, 'filters/portrait');
        if (uploadedUrl) updates.frameImagePortrait = uploadedUrl;
      }

      if (landscapeFile) {
        const uploadedUrl = await uploadImage(landscapeFile, 'filters/landscape');
        if (uploadedUrl) updates.frameImageLandscape = uploadedUrl;
      }

      onUpdate(campaign.id, updates);
      setIsUploading(false);
      handleClose();
      toast.success('Campagne mise à jour!');
    } catch (error) {
      console.error('Error updating campaign:', error);
      toast.error('Erreur lors de la mise à jour');
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    stopCamera();
    setImageFile(null);
    setPortraitFile(null);
    setLandscapeFile(null);
    setShowPreview(false);
    setIsCameraActive(false);
    onClose();
  };

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

  if (!campaign) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              Modifier la campagne
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Image Upload Section */}
            {campaign.type === 'video_filter' ? (
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
                      <div className="aspect-[9/16] max-h-[200px] rounded-xl bg-background border border-border overflow-hidden relative mx-auto">
                        <video 
                          ref={videoRef} 
                          autoPlay 
                          muted 
                          playsInline
                          className="w-full h-full object-cover"
                        />
                        <img 
                          src={frameImagePortrait || frameImageLandscape} 
                          alt="Filter Preview" 
                          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              renderImageUpload(
                campaign.type === 'photo' ? 'Image du cadre (PNG transparent)' : 'Image de fond',
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
                  {slug && slug !== campaign.slug && (
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
              {slug && slug !== campaign.slug && slugAvailable === false && (
                <p className="text-xs text-destructive mt-1">Ce lien est déjà pris</p>
              )}
              {slug && slug !== campaign.slug && slugAvailable === true && (
                <p className="text-xs text-green-500 mt-1">Ce lien est disponible</p>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="text-sm font-medium mb-2 block">Titre</label>
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
              <Button variant="outline" onClick={handleClose} className="flex-1" disabled={isUploading}>
                Annuler
              </Button>
              <Button variant="gradient" onClick={handleUpdate} className="flex-1" disabled={isUploading}>
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Mise à jour...
                  </>
                ) : (
                  'Enregistrer'
                )}
              </Button>
            </div>
          </div>
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
