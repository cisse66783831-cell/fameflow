import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, Wand2, Loader2, ImagePlus, RefreshCw, Check, AlertCircle, Zap, Bot } from 'lucide-react';
import { toast } from 'sonner';

interface AIFrameGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  originalImage: string;
  eventTitle: string;
  onImageGenerated: (imageUrl: string) => void;
}

type GenerationMode = 'overlay' | 'adapt' | 'regenerate';
type AIProvider = 'lovable' | 'gemini' | 'openai';

// Helper function to convert blob URL or file to base64
async function imageToBase64(imageUrl: string): Promise<string> {
  // If already a data URL, return as-is
  if (imageUrl.startsWith('data:')) {
    return imageUrl;
  }

  // If it's a blob URL or http URL, fetch and convert
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    throw new Error('Failed to process image');
  }
}

export function AIFrameGenerator({
  isOpen,
  onClose,
  originalImage,
  eventTitle,
  onImageGenerated,
}: AIFrameGeneratorProps) {
  const [mode, setMode] = useState<GenerationMode>('overlay');
  const [provider, setProvider] = useState<AIProvider>('lovable');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState<string>('');

  const modeDescriptions: Record<GenerationMode, { title: string; description: string; icon: React.ReactNode }> = {
    overlay: {
      title: 'Ajouter un cadre stylé',
      description: 'L\'IA va créer un cadre/badge assorti à votre affiche avec une zone transparente pour les photos.',
      icon: <ImagePlus className="w-5 h-5" />,
    },
    adapt: {
      title: 'Adapter l\'affiche',
      description: 'L\'IA va analyser et modifier votre affiche pour y intégrer une zone photo et texte harmonieusement.',
      icon: <Wand2 className="w-5 h-5" />,
    },
    regenerate: {
      title: 'Régénérer complètement',
      description: 'L\'IA va recréer votre affiche avec le même style mais optimisée pour les visuels "J\'y serai".',
      icon: <RefreshCw className="w-5 h-5" />,
    },
  };

  const providerOptions: Record<AIProvider, { name: string; description: string; icon: React.ReactNode }> = {
    lovable: {
      name: 'Lovable AI (Gemini)',
      description: 'Gratuit avec votre plan',
      icon: <Sparkles className="w-4 h-4" />,
    },
    gemini: {
      name: 'Google Gemini (Votre clé)',
      description: 'Votre propre clé API',
      icon: <Zap className="w-4 h-4" />,
    },
    openai: {
      name: 'OpenAI DALL-E 3',
      description: 'Haute qualité (requiert clé API)',
      icon: <Bot className="w-4 h-4" />,
    },
  };

  const getPromptForMode = (selectedMode: GenerationMode): string => {
    const baseContext = `Event: "${eventTitle}". Original poster style should be preserved.`;
    
    switch (selectedMode) {
      case 'overlay':
        return `Create a stylish decorative frame/overlay that matches the visual style of this event poster. 
                The frame should have:
                - A transparent circular area in the center-top for participant photos
                - A text zone at the bottom for participant names
                - Design elements that complement the original poster's colors and aesthetic
                - A "J'Y SERAI" badge styled to match the event theme
                ${baseContext}
                ${customPrompt ? `Additional instructions: ${customPrompt}` : ''}`;
      
      case 'adapt':
        return `Analyze this event poster and create a modified version that includes:
                - A designated area (circular or square) for participant photos, positioned naturally within the design
                - A text zone for participant names that fits the overall composition
                - All original branding, text, and key visual elements preserved
                - Seamless integration of the new elements with the existing design
                ${baseContext}
                ${customPrompt ? `Additional instructions: ${customPrompt}` : ''}`;
      
      case 'regenerate':
        return `Recreate this event poster in the exact same visual style but optimized for social media sharing:
                - Same color palette, fonts, and overall aesthetic
                - Include a prominent photo zone (circular) for participant portraits
                - Include a styled name text area
                - Add a subtle "J'Y SERAI" element
                - Make it square format (1:1 aspect ratio) for Instagram
                - Keep the event branding prominent
                ${baseContext}
                ${customPrompt ? `Additional instructions: ${customPrompt}` : ''}`;
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);
    setGenerationProgress('Préparation de l\'image...');

    try {
      // CRITICAL FIX: Convert blob URL to base64 before sending
      setGenerationProgress('Conversion de l\'image...');
      let imageToSend: string;
      
      try {
        imageToSend = await imageToBase64(originalImage);
      } catch (convError) {
        throw new Error('Impossible de traiter l\'image. Veuillez réessayer.');
      }

      // Progress updates
      setGenerationProgress('Analyse de votre affiche...');
      setTimeout(() => setGenerationProgress('Génération du design...'), 2000);
      setTimeout(() => setGenerationProgress('Application du style...'), 5000);
      setTimeout(() => setGenerationProgress('Finalisation...'), 8000);

      const { data, error: fnError } = await supabase.functions.invoke('generate-overlay', {
        body: {
          mode,
          originalImageUrl: imageToSend,
          prompt: getPromptForMode(mode),
          eventTitle,
          provider, // Send selected provider
        },
      });

      if (fnError) {
        throw fnError;
      }

      if (data?.error) {
        // Handle rate limit and payment errors
        if (data.status === 429) {
          setError('Limite de requêtes atteinte. Veuillez réessayer dans quelques minutes.');
        } else if (data.status === 402) {
          setError('Crédits insuffisants. Veuillez recharger votre compte Lovable.');
        } else {
          setError(data.error);
        }
        return;
      }

      if (data?.imageUrl) {
        setGeneratedImage(data.imageUrl);
        toast.success(`Image générée avec ${data.provider || provider} !`);
      } else {
        throw new Error('Aucune image générée');
      }
    } catch (err) {
      console.error('Generation error:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la génération. Veuillez réessayer.');
      toast.error('Erreur de génération');
    } finally {
      setIsGenerating(false);
      setGenerationProgress('');
    }
  };

  const handleAccept = () => {
    if (generatedImage) {
      onImageGenerated(generatedImage);
      onClose();
      toast.success('Nouveau design appliqué !');
    }
  };

  const handleRetry = () => {
    setGeneratedImage(null);
    setError(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="w-5 h-5 text-primary" />
            Adapter avec l'IA
          </DialogTitle>
          <DialogDescription>
            Utilisez l'IA pour créer une version de votre affiche optimisée pour les visuels participants.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Original image preview */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Affiche originale</Label>
            <div className="aspect-[3/4] max-h-48 w-auto mx-auto rounded-lg overflow-hidden bg-secondary">
              <img
                src={originalImage}
                alt="Original poster"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Loading state with skeleton */}
          {isGenerating && (
            <div className="space-y-4">
              <div className="aspect-square max-w-sm mx-auto rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/30 to-primary/5 animate-pulse flex flex-col items-center justify-center p-8">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
                  <Sparkles className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <p className="text-sm font-medium text-foreground mt-6">{generationProgress}</p>
                <p className="text-xs text-muted-foreground mt-2">Cela peut prendre 15-30 secondes</p>
                
                {/* Animated dots */}
                <div className="flex gap-1 mt-4">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full bg-primary animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Mode selection */}
          {!generatedImage && !error && !isGenerating && (
            <>
              {/* Provider selector */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Modèle IA</Label>
                <Select value={provider} onValueChange={(v) => setProvider(v as AIProvider)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(providerOptions) as AIProvider[]).map((p) => (
                      <SelectItem key={p} value={p}>
                        <div className="flex items-center gap-2">
                          {providerOptions[p].icon}
                          <span>{providerOptions[p].name}</span>
                          <span className="text-muted-foreground text-xs">- {providerOptions[p].description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Mode de génération</Label>
                <RadioGroup
                  value={mode}
                  onValueChange={(v) => setMode(v as GenerationMode)}
                  className="space-y-3"
                >
                  {(Object.keys(modeDescriptions) as GenerationMode[]).map((m) => (
                    <div
                      key={m}
                      className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        mode === m
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setMode(m)}
                    >
                      <RadioGroupItem value={m} id={m} className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor={m} className="flex items-center gap-2 cursor-pointer font-medium">
                          {modeDescriptions[m].icon}
                          {modeDescriptions[m].title}
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {modeDescriptions[m].description}
                        </p>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Custom prompt */}
              <div className="space-y-2">
                <Label htmlFor="custom-prompt" className="text-sm font-medium">
                  Instructions supplémentaires (optionnel)
                </Label>
                <Textarea
                  id="custom-prompt"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Ex: Utiliser des tons dorés, ajouter des étoiles, style minimaliste..."
                  className="resize-none"
                  rows={3}
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full gap-2 gradient-primary text-white"
                size="lg"
              >
                <Zap className="w-5 h-5" />
                Générer avec {providerOptions[provider].name}
              </Button>
            </>
          )}

          {/* Error state */}
          {error && (
            <Card className="p-6 text-center space-y-4 border-destructive/50 bg-destructive/5">
              <AlertCircle className="w-12 h-12 mx-auto text-destructive" />
              <p className="text-destructive font-medium">{error}</p>
              <Button onClick={handleRetry} variant="outline" className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Réessayer
              </Button>
            </Card>
          )}

          {/* Generated result */}
          {generatedImage && (
            <div className="space-y-4">
              <Label className="text-sm font-medium">Résultat généré</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-xs text-center text-muted-foreground">Avant</p>
                  <div className="aspect-square rounded-lg overflow-hidden bg-secondary">
                    <img
                      src={originalImage}
                      alt="Original"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-center text-muted-foreground">Après</p>
                  <div className="aspect-square rounded-lg overflow-hidden bg-secondary ring-2 ring-primary">
                    <img
                      src={generatedImage}
                      alt="Generated"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleRetry}
                  className="flex-1 gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Régénérer
                </Button>
                <Button
                  onClick={handleAccept}
                  className="flex-1 gap-2 gradient-primary text-white"
                >
                  <Check className="w-4 h-4" />
                  Utiliser ce design
                </Button>
              </div>
            </div>
          )}

          {/* Info */}
          <p className="text-xs text-muted-foreground text-center">
            Propulsé par {provider === 'openai' ? 'OpenAI DALL-E 3' : provider === 'gemini' ? 'Google Gemini (votre clé)' : 'Lovable AI (Gemini)'}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
