import { useState, useEffect, useRef, useCallback } from "react";
import { Campaign, TextElement, DocumentFormat, DocumentCategory } from "@/types/campaign";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Image,
  FileText,
  Upload,
  Sparkles,
  X,
  Loader2,
  Wand2,
  Video,
  AlertCircle,
  Check,
  Camera,
  Play,
  Square,
  ArrowRight,
  ChevronDown,
  User,
  Phone,
  Globe,
  CreditCard,
  Copy,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useStorage } from "@/hooks/useStorage";
import { supabase } from "@/integrations/supabase/client";
import { compressImage, needsCompression, formatFileSize } from "@/utils/imageCompression";
import { DocumentFieldEditor } from "./DocumentFieldEditor";
import { DocumentTemplateSelector } from "./DocumentTemplateSelector";
import { PhotoZoneEditor } from "./PhotoZoneEditor";
import { useUserRoles } from "@/hooks/useUserRoles";
import { AIFrameGenerator } from "./AIFrameGenerator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// --- CONFIGURATION PAIEMENT ---
const VIDEO_PRICE = 2000;
const MERCHANT_NUMBER = "+226 66 78 38 31";
const USSD_BF = "*144*2*1*66783831*2000#";

interface CreateCampaignModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (campaign: Campaign) => void;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

const DOCUMENT_FORMATS: { value: DocumentFormat; label: string; dimensions: string }[] = [
  { value: "a4-landscape", label: "A4 Paysage", dimensions: "800 × 566" },
  { value: "a4-portrait", label: "A4 Portrait", dimensions: "566 × 800" },
  { value: "square", label: "Carré", dimensions: "600 × 600" },
  { value: "badge", label: "Badge", dimensions: "500 × 300" },
];

const getCanvasDimensions = (format: DocumentFormat) => {
  switch (format) {
    case "a4-landscape":
      return { width: 800, height: 566 };
    case "a4-portrait":
      return { width: 566, height: 800 };
    case "square":
      return { width: 600, height: 600 };
    case "badge":
      return { width: 500, height: 300 };
    default:
      return { width: 800, height: 566 };
  }
};

export const CreateCampaignModal = ({ open, onClose, onCreate }: CreateCampaignModalProps) => {
  // Steps: type -> document-config -> details -> (payment for video)
  const [step, setStep] = useState<"type" | "document-config" | "details" | "payment">("type");
  const [type, setType] = useState<"photo" | "document" | "video_filter">("photo");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [frameImage, setFrameImage] = useState<string>("");
  const [frameImagePortrait, setFrameImagePortrait] = useState<string>("");
  const [frameImageLandscape, setFrameImageLandscape] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [portraitFile, setPortraitFile] = useState<File | null>(null);
  const [landscapeFile, setLandscapeFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingHashtags, setIsGeneratingHashtags] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [slug, setSlug] = useState("");
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [showCompressionDialog, setShowCompressionDialog] = useState(false);
  const [pendingFile, setPendingFile] = useState<{ file: File; target: "main" | "portrait" | "landscape" } | null>(
    null,
  );
  const [isCompressing, setIsCompressing] = useState(false);

  // Payment State
  const [country, setCountry] = useState("BF");
  const [transactionCode, setTransactionCode] = useState("");

  // Document-specific state
  const [documentFormat, setDocumentFormat] = useState<DocumentFormat>("a4-landscape");
  const [documentCategory, setDocumentCategory] = useState<DocumentCategory>("attestation");
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [backgroundImage, setBackgroundImage] = useState<string>("");
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
  const [showTemplateSelector, setShowTemplateSelector] = useState(true);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [isDraggingField, setIsDraggingField] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0, fieldX: 0, fieldY: 0 });

  // Photo zone state
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [showPhotoZoneEditor, setShowPhotoZoneEditor] = useState(false);
  const [photoZone, setPhotoZone] = useState({
    x: 50,
    y: 50,
    width: 30,
    height: 30,
    shape: "circle" as "rect" | "circle",
    nameEnabled: true,
    nameY: 85,
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const { uploadImage } = useStorage();
  const { isSuperAdmin } = useUserRoles();

  useEffect(() => {
    if (!slug.trim()) {
      setSlugAvailable(null);
      return;
    }
    const timer = setTimeout(async () => {
      setIsCheckingSlug(true);
      try {
        const { data, error } = await supabase.rpc("check_slug_availability", {
          check_slug: slug.toLowerCase().trim(),
        });
        if (error) throw error;
        setSlugAvailable(data);
      } catch (error) {
        console.error("Error checking slug:", error);
        setSlugAvailable(null);
      }
      setIsCheckingSlug(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [slug]);

  const processFile = (file: File, target: "main" | "portrait" | "landscape") => {
    const previewUrl = URL.createObjectURL(file);
    if (target === "main") {
      setImageFile(file);
      setFrameImage(previewUrl);
    } else if (target === "portrait") {
      setPortraitFile(file);
      setFrameImagePortrait(previewUrl);
    } else {
      setLandscapeFile(file);
      setFrameImageLandscape(previewUrl);
    }
    toast.success("Image sélectionnée!");
  };

  const handleCompressAndUse = async () => {
    if (!pendingFile) return;
    setIsCompressing(true);
    try {
      const compressedFile = await compressImage(pendingFile.file, 2, 2048);
      processFile(compressedFile, pendingFile.target);
      toast.success(`Image compressée !`);
    } catch (error) {
      toast.error("Erreur lors de la compression");
    }
    setIsCompressing(false);
    setShowCompressionDialog(false);
    setPendingFile(null);
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: "main" | "portrait" | "landscape",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
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
      const { data, error } = await supabase.functions.invoke("ai-assistant", {
        body: { type: "campaign-idea" },
      });
      if (error) throw error;
      const result = data?.result;
      if (result) {
        try {
          const parsed = JSON.parse(result);
          setTitle(parsed.title || "");
          setDescription(parsed.description || "");
          setHashtags(parsed.hashtags || "");
        } catch {
          setTitle(result.slice(0, 50));
        }
        toast.success("Généré avec l'IA!");
      }
    } catch (error) {
      toast.error("Échec de la génération.");
    }
    setIsGenerating(false);
  };

  const generateHashtags = async () => {
    if (!title.trim()) {
      toast.error("Entrez un titre d'abord");
      return;
    }
    setIsGeneratingHashtags(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-assistant", {
        body: { type: "hashtags", title, description },
      });
      if (error) throw error;
      if (data?.result) {
        setHashtags(data.result);
        toast.success("Hashtags générés!");
      }
    } catch (error) {
      toast.error("Erreur hashtags");
    }
    setIsGeneratingHashtags(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copié !");
  };

  const handleNextStep = () => {
    if (!title.trim()) {
      toast.error("Veuillez entrer un titre");
      return;
    }

    if (type === "video_filter") {
      if (!portraitFile && !landscapeFile) {
        toast.error("Veuillez uploader au moins un cadre");
        return;
      }
      // Pour la vidéo, on va au paiement
      setStep("payment");
    } else {
      if (!imageFile) {
        toast.error("Veuillez uploader une image");
        return;
      }
      // Pour le reste, on crée directement
      handleCreate();
    }
  };

  const handleCreate = async () => {
    // Validation du slug
    if (slug.trim() && slugAvailable === false) {
      toast.error("Ce lien personnalisé est déjà pris");
      return;
    }

    // Validation paiement vidéo
    let finalDescription = description.trim();
    if (type === "video_filter") {
      if (!transactionCode) {
        toast.error("Veuillez entrer le code de transaction");
        return;
      }
      finalDescription = `[PAYS: ${country} - PAIEMENT: ${transactionCode} - STATUS: EN_ATTENTE]\n\n${description}`;
    }

    setIsUploading(true);

    try {
      let uploadedUrl = "";
      let uploadedPortraitUrl = "";
      let uploadedLandscapeUrl = "";

      if (type === "video_filter") {
        if (portraitFile) uploadedPortraitUrl = (await uploadImage(portraitFile, "filters/portrait")) || "";
        if (landscapeFile) uploadedLandscapeUrl = (await uploadImage(landscapeFile, "filters/landscape")) || "";
        uploadedUrl = uploadedPortraitUrl || uploadedLandscapeUrl;
      } else {
        uploadedUrl = (await uploadImage(imageFile!, type === "photo" ? "frames" : "documents")) || "";
      }

      if (!uploadedUrl) {
        throw new Error("Échec upload");
      }

      const campaign: Campaign = {
        id: `campaign-${Date.now()}`,
        title: title.trim(),
        description: finalDescription, // Description avec métadonnées de paiement
        type,
        frameImage: uploadedUrl,
        frameImagePortrait: uploadedPortraitUrl || undefined,
        frameImageLandscape: uploadedLandscapeUrl || undefined,
        backgroundImage: type === "document" ? uploadedUrl : undefined,
        textElements: type === "document" ? textElements : [],
        hashtags: hashtags.split(" ").filter((h) => h.startsWith("#")),
        views: 0,
        downloads: 0,
        createdAt: new Date(),
        slug: slug.trim().toLowerCase() || undefined,
        documentFormat: type === "document" ? documentFormat : undefined,
        documentCategory: type === "document" ? documentCategory : undefined,
        photoZoneX: type === "photo" ? photoZone.x : undefined,
        photoZoneY: type === "photo" ? photoZone.y : undefined,
        photoZoneWidth: type === "photo" ? photoZone.width : undefined,
        photoZoneHeight: type === "photo" ? photoZone.height : undefined,
        photoZoneShape: type === "photo" ? photoZone.shape : undefined,
        nameZoneEnabled: type === "photo" ? photoZone.nameEnabled : undefined,
        nameZoneY: type === "photo" ? photoZone.nameY : undefined,
      };

      onCreate(campaign);
      setIsUploading(false);

      if (type === "video_filter") {
        toast.success("Demande envoyée ! En attente de validation admin.");
      } else {
        toast.success("Campagne créée avec succès !");
      }

      handleClose();
    } catch (error) {
      console.error("Error creating campaign:", error);
      toast.error("Erreur lors de la création");
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    stopCamera();
    setStep("type");
    setType("photo");
    setTitle("");
    setDescription("");
    setHashtags("");
    setFrameImage("");
    setFrameImagePortrait("");
    setFrameImageLandscape("");
    setImageFile(null);
    setPortraitFile(null);
    setLandscapeFile(null);
    setSlug("");
    setSlugAvailable(null);
    setShowPreview(false);
    setIsCameraActive(false);
    setDocumentFormat("a4-landscape");
    setDocumentCategory("attestation");
    setTextElements([]);
    setBackgroundImage("");
    setBackgroundFile(null);
    setShowTemplateSelector(true);
    setSelectedFieldId(null);
    setIsDraggingField(false);
    setCountry("BF");
    setTransactionCode("");
    onClose();
  };

  const handlePreviewMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!previewRef.current) return;
      const rect = previewRef.current.getBoundingClientRect();
      const dims = getCanvasDimensions(documentFormat);
      const scaleX = dims.width / rect.width;
      const scaleY = dims.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;
      const clickedField = textElements.find((elem) => {
        const dx = Math.abs(x - elem.x);
        const dy = Math.abs(y - elem.y);
        return dx < 80 && dy < elem.fontSize;
      });
      if (clickedField) {
        e.preventDefault();
        setSelectedFieldId(clickedField.id);
        setIsDraggingField(true);
        setDragStartPos({ x: e.clientX, y: e.clientY, fieldX: clickedField.x, fieldY: clickedField.y });
      } else {
        setSelectedFieldId(null);
      }
    },
    [textElements, documentFormat],
  );

  const handlePreviewMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isDraggingField || !selectedFieldId || !previewRef.current) return;
      const rect = previewRef.current.getBoundingClientRect();
      const dims = getCanvasDimensions(documentFormat);
      const scaleX = dims.width / rect.width;
      const scaleY = dims.height / rect.height;
      const deltaX = (e.clientX - dragStartPos.x) * scaleX;
      const deltaY = (e.clientY - dragStartPos.y) * scaleY;
      const newX = Math.max(50, Math.min(dims.width - 50, dragStartPos.fieldX + deltaX));
      const newY = Math.max(30, Math.min(dims.height - 30, dragStartPos.fieldY + deltaY));
      setTextElements((prev) =>
        prev.map((elem) => (elem.id === selectedFieldId ? { ...elem, x: newX, y: newY } : elem)),
      );
    },
    [isDraggingField, selectedFieldId, dragStartPos, documentFormat],
  );

  const handlePreviewMouseUp = useCallback(() => {
    setIsDraggingField(false);
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 720, height: 1280 },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setIsCameraActive(true);
      setShowPreview(true);
    } catch (error) {
      toast.error("Impossible d'accéder à la caméra");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const renderImageUpload = (
    label: string,
    preview: string,
    onClear: () => void,
    target: "main" | "portrait" | "landscape",
    hint?: string,
  ) => (
    <div>
      <label className="text-sm font-medium mb-2 block">
        {label}
        {hint && <span className="text-xs text-muted-foreground ml-2">({hint})</span>}
      </label>
      <label className="cursor-pointer block">
        {preview ? (
          <div className="relative group">
            <img src={preview} alt="Preview" className="w-full h-32 object-contain bg-muted/50 rounded-xl" />
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
        <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, target)} className="hidden" />
      </label>
    </div>
  );

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {step === "type" && "Choisir le type de campagne"}
              {step === "document-config" && "Configuration du document"}
              {step === "details" && "Détails de la campagne"}
              {step === "payment" && "Activation Premium (Vidéo)"}
            </DialogTitle>
            {step === "payment" && (
              <DialogDescription>La mise en ligne du filtre vidéo est payante ({VIDEO_PRICE} FCFA).</DialogDescription>
            )}
          </DialogHeader>

          {step === "type" ? (
            <div className="grid grid-cols-3 gap-3 mt-4">
              <button
                onClick={() => {
                  setType("photo");
                  setStep("details");
                }}
                className={cn(
                  "p-4 rounded-xl border-2 border-dashed transition-all hover:border-primary hover:bg-primary/5 flex flex-col items-center gap-2 text-center",
                )}
              >
                <div className="p-3 rounded-full bg-primary/10">
                  <Image className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">Cadre Photo</p>
                  <p className="text-xs text-green-600 font-bold bg-green-100 px-2 py-0.5 rounded-full mt-1">Gratuit</p>
                </div>
              </button>
              <button
                onClick={() => {
                  setType("video_filter");
                  setStep("details");
                }}
                className={cn(
                  "p-4 rounded-xl border-2 border-dashed transition-all hover:border-chart-1 hover:bg-chart-1/5 flex flex-col items-center gap-2 text-center",
                )}
              >
                <div className="p-3 rounded-full bg-chart-1/10">
                  <Video className="w-6 h-6 text-chart-1" />
                </div>
                <div>
                  <p className="font-medium text-sm">Filtre Vidéo</p>
                  <p className="text-xs text-orange-600 font-bold bg-orange-100 px-2 py-0.5 rounded-full mt-1">
                    {VIDEO_PRICE} F
                  </p>
                </div>
              </button>
              <button
                onClick={() => {
                  setType("document");
                  setStep("document-config");
                  setShowTemplateSelector(true);
                }}
                className={cn(
                  "p-4 rounded-xl border-2 border-dashed transition-all hover:border-accent hover:bg-accent/5 flex flex-col items-center gap-2 text-center",
                )}
              >
                <div className="p-3 rounded-full bg-accent/10">
                  <FileText className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="font-medium text-sm">Document</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Attestations</p>
                </div>
              </button>
            </div>
          ) : step === "document-config" ? (
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
                  <div>
                    <label className="text-sm font-medium mb-2 block">Format</label>
                    <div className="grid grid-cols-2 gap-2">
                      {DOCUMENT_FORMATS.map((format) => (
                        <button
                          key={format.value}
                          onClick={() => setDocumentFormat(format.value)}
                          className={cn(
                            "p-3 rounded-lg border-2 text-left transition-all",
                            documentFormat === format.value
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50",
                          )}
                        >
                          <p className="font-medium text-sm">{format.label}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Upload fond document */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Image de fond</label>
                    <label className="cursor-pointer block">
                      {backgroundImage ? (
                        <div className="relative group">
                          <img
                            src={backgroundImage}
                            alt="Bg"
                            className="w-full h-40 object-contain bg-muted/50 rounded-xl"
                          />
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              setBackgroundImage("");
                              setBackgroundFile(null);
                            }}
                            className="absolute top-2 right-2 p-1 bg-destructive text-white rounded-full"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed rounded-xl p-4 text-center">
                          <Upload className="w-6 h-6 mx-auto" />
                          <p className="text-xs">Uploader fond</p>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) {
                            setBackgroundFile(f);
                            setBackgroundImage(URL.createObjectURL(f));
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <DocumentFieldEditor
                    textElements={textElements}
                    onChange={setTextElements}
                    canvasWidth={getCanvasDimensions(documentFormat).width}
                    canvasHeight={getCanvasDimensions(documentFormat).height}
                    selectedFieldId={selectedFieldId}
                    onSelectField={setSelectedFieldId}
                  />

                  {/* Aperçu Document avec Drag & Drop */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Aperçu <span className="text-xs text-muted-foreground ml-2">(glissez les textes)</span>
                    </label>
                    <div
                      ref={previewRef}
                      className={cn(
                        "relative bg-muted/30 rounded-xl overflow-hidden mx-auto border-2 transition-all select-none",
                        isDraggingField ? "cursor-grabbing border-primary" : "cursor-grab border-border",
                      )}
                      style={{
                        width: "100%",
                        maxWidth: 400,
                        aspectRatio: `${getCanvasDimensions(documentFormat).width} / ${getCanvasDimensions(documentFormat).height}`,
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
                        {textElements.map((elem) => (
                          <g key={elem.id}>
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
                                selectedFieldId === elem.id ? "opacity-100" : "opacity-80",
                              )}
                            >
                              {elem.value}
                            </text>
                          </g>
                        ))}
                      </svg>
                    </div>
                  </div>
                </>
              )}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => (showTemplateSelector ? setStep("type") : setShowTemplateSelector(true))}
                  className="flex-1"
                >
                  Retour
                </Button>
                {!showTemplateSelector && (
                  <Button onClick={() => setStep("details")} className="flex-1">
                    Continuer
                  </Button>
                )}
              </div>
            </div>
          ) : step === "details" ? (
            <div className="space-y-4 mt-4">
              {type === "video_filter" ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {renderImageUpload(
                      "Cadre Portrait",
                      frameImagePortrait,
                      () => {
                        setFrameImagePortrait("");
                        setPortraitFile(null);
                      },
                      "portrait",
                      "9:16",
                    )}
                    {renderImageUpload(
                      "Cadre Paysage",
                      frameImageLandscape,
                      () => {
                        setFrameImageLandscape("");
                        setLandscapeFile(null);
                      },
                      "landscape",
                      "16:9",
                    )}
                  </div>
                  {(frameImagePortrait || frameImageLandscape) && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-sm">Aperçu</label>
                        {!isCameraActive ? (
                          <Button size="sm" variant="outline" onClick={startCamera}>
                            Caméra
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" onClick={stopCamera}>
                            Arrêter
                          </Button>
                        )}
                      </div>
                      {showPreview && (
                        <div className="aspect-[9/16] bg-black relative rounded-lg overflow-hidden">
                          <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" />
                          <img
                            src={frameImagePortrait || frameImageLandscape}
                            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {renderImageUpload(
                    type === "photo" ? "Cadre (PNG)" : "Image",
                    frameImage,
                    () => {
                      setFrameImage("");
                      setImageFile(null);
                    },
                    "main",
                  )}
                  {type === "photo" && frameImage && isSuperAdmin() && (
                    <Button variant="outline" onClick={() => setShowAIGenerator(true)} className="w-full gap-2">
                      <Sparkles className="w-4 h-4" />
                      IA Generator
                    </Button>
                  )}
                  {type === "photo" && frameImage && (
                    <Collapsible open={showPhotoZoneEditor} onOpenChange={setShowPhotoZoneEditor}>
                      <CollapsibleTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                          Zone Photo <ChevronDown className="w-4 h-4" />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <PhotoZoneEditor
                          frameImage={frameImage}
                          initialX={photoZone.x}
                          initialY={photoZone.y}
                          initialWidth={photoZone.width}
                          initialHeight={photoZone.height}
                          initialShape={photoZone.shape}
                          nameZoneEnabled={photoZone.nameEnabled}
                          nameZoneY={photoZone.nameY}
                          onChange={setPhotoZone}
                          showActions={false}
                        />
                      </CollapsibleContent>
                    </Collapsible>
                  )}
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Lien</label>
                  <div className="flex gap-2 items-center">
                    <span className="text-xs text-muted-foreground">jyserai.site/</span>
                    <Input
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="mon-event"
                      className="h-8"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Titre</label>
                  <div className="flex gap-2">
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                    <Button size="icon" variant="ghost" onClick={generateWithAI} disabled={isGenerating}>
                      <Sparkles className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <textarea
                    className="w-full border rounded-md p-2 text-sm"
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Hashtags</label>
                  <div className="flex gap-2">
                    <Input value={hashtags} onChange={(e) => setHashtags(e.target.value)} />
                    <Button size="icon" variant="ghost" onClick={generateHashtags} disabled={isGeneratingHashtags}>
                      <Wand2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setStep(type === "document" ? "document-config" : "type")}
                  className="flex-1"
                  disabled={isUploading}
                >
                  Retour
                </Button>
                <Button onClick={handleNextStep} className="flex-1" disabled={isUploading}>
                  {type === "video_filter" ? `Suivant : Payer (${VIDEO_PRICE} F)` : "Créer"}
                </Button>
              </div>
            </div>
          ) : step === "payment" ? (
            <div className="space-y-5 py-2">
              <div className="space-y-3">
                <Label>Votre Pays</Label>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BF">🇧🇫 Burkina Faso</SelectItem>
                    <SelectItem value="CI">🇨🇮 Côte d'Ivoire</SelectItem>
                    <SelectItem value="ML">🇲🇱 Mali</SelectItem>
                    <SelectItem value="OTHER">🌍 Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Instructions</Label>
                <div className="flex items-center gap-3 p-3 border rounded-lg bg-background">
                  <div className="bg-blue-500/10 p-2 rounded-full">
                    <Phone className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">
                      {country === "BF" ? "Numéro Wave / OM" : "Transfert International vers"}
                    </p>
                    <p className="font-mono font-bold">{MERCHANT_NUMBER}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => copyToClipboard(MERCHANT_NUMBER)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                {country === "BF" ? (
                  <div className="flex items-center gap-3 p-3 border rounded-lg bg-background">
                    <div className="bg-orange-500/10 p-2 rounded-full">
                      <CreditCard className="w-4 h-4 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Code rapide OM</p>
                      <p className="font-mono font-bold text-xs">{USSD_BF}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard(USSD_BF)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="bg-yellow-500/10 p-3 rounded-lg flex gap-2 text-xs text-yellow-700">
                    <Globe className="w-4 h-4 shrink-0" />
                    <p>Effectuez un transfert international Wave/OM vers ce numéro.</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>ID de Transaction</Label>
                <Input
                  placeholder="Entrez l'ID reçu par SMS"
                  value={transactionCode}
                  onChange={(e) => setTransactionCode(e.target.value)}
                  className="text-center font-mono tracking-widest uppercase border-primary/50"
                />
              </div>

              <div className="flex items-start gap-2 bg-green-500/10 p-3 rounded text-xs text-green-700">
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                <p>Une fois validé par l'admin, vous recevrez un email de confirmation.</p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => setStep("details")} className="flex-1">
                  Retour
                </Button>
                <Button onClick={handleCreate} disabled={isUploading || !transactionCode} className="flex-[2]">
                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirmer le paiement"}
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Compression Dialog */}
      <AlertDialog open={showCompressionDialog} onOpenChange={setShowCompressionDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Fichier trop volumineux</AlertDialogTitle>
            <AlertDialogDescription>Voulez-vous compresser l'image ?</AlertDialogDescription>
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
              Compresser
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* AI Generator */}
      {type === "photo" && frameImage && (
        <AIFrameGenerator
          isOpen={showAIGenerator}
          onClose={() => setShowAIGenerator(false)}
          originalImage={frameImage}
          eventTitle={title || "Ma campagne"}
          onImageGenerated={(newImageUrl) => {
            setFrameImage(newImageUrl);
            toast.success("Image adaptée !");
          }}
        />
      )}
    </>
  );
};
