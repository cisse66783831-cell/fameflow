import { useState, useRef, useEffect } from 'react';
import { Campaign, TextElement } from '@/types/campaign';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FileText, Download, Archive, ChevronLeft, ChevronRight, 
  Upload, Users, Calendar, Loader2, Check
} from 'lucide-react';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface BatchGeneratorProps {
  campaign: Campaign;
}

// Canvas dimensions for high quality output
const CANVAS_WIDTH = 2480; // A4 landscape at 300 DPI
const CANVAS_HEIGHT = 1754;

export const BatchGenerator = ({ campaign }: BatchGeneratorProps) => {
  const [namesInput, setNamesInput] = useState('');
  const [dateValue, setDateValue] = useState(new Date().toLocaleDateString('fr-FR'));
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewIndex, setPreviewIndex] = useState(0);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);

  // Parse names from input
  const participants = namesInput
    .split('\n')
    .map(n => n.trim())
    .filter(n => n.length > 0);

  // Load background image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => setBackgroundImage(img);
    img.src = campaign.backgroundImage || campaign.frameImage;
  }, [campaign.backgroundImage, campaign.frameImage]);

  // Update preview when index or participants change
  useEffect(() => {
    if (participants.length > 0 && backgroundImage && previewCanvasRef.current) {
      renderPreview(participants[previewIndex] || participants[0]);
    }
  }, [previewIndex, participants, backgroundImage, dateValue]);

  const renderPreview = async (name: string) => {
    const canvas = previewCanvasRef.current;
    if (!canvas || !backgroundImage) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size (smaller for preview)
    canvas.width = 800;
    canvas.height = 566;

    // Draw background
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    // Draw text elements with replacements
    const scale = canvas.width / CANVAS_WIDTH;
    
    for (const elem of campaign.textElements) {
      let value = elem.value;
      
      // Replace based on field type
      if (elem.fieldType === 'name' || elem.label.toLowerCase().includes('nom')) {
        value = name;
      } else if (elem.fieldType === 'date' || elem.label.toLowerCase().includes('date')) {
        value = dateValue;
      }

      ctx.font = `${elem.fontWeight} ${Math.round(elem.fontSize * scale)}px ${elem.fontFamily}`;
      ctx.fillStyle = elem.color;
      ctx.textAlign = 'center';
      ctx.fillText(value, elem.x * scale, elem.y * scale);
    }
  };

  const generateCanvasForParticipant = async (name: string): Promise<HTMLCanvasElement> => {
    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    const ctx = canvas.getContext('2d')!;

    // Draw background
    if (backgroundImage) {
      ctx.drawImage(backgroundImage, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    // Draw text elements with replacements
    for (const elem of campaign.textElements) {
      let value = elem.value;
      
      if (elem.fieldType === 'name' || elem.label.toLowerCase().includes('nom')) {
        value = name;
      } else if (elem.fieldType === 'date' || elem.label.toLowerCase().includes('date')) {
        value = dateValue;
      }

      // Scale font size for high resolution
      const scaledFontSize = elem.fontSize * (CANVAS_WIDTH / 800);
      ctx.font = `${elem.fontWeight} ${scaledFontSize}px ${elem.fontFamily}`;
      ctx.fillStyle = elem.color;
      ctx.textAlign = 'center';
      ctx.fillText(value, elem.x * (CANVAS_WIDTH / 800), elem.y * (CANVAS_HEIGHT / 566));
    }

    return canvas;
  };

  const generatePDF = async () => {
    if (participants.length === 0) {
      toast.error('Ajoutez au moins un nom');
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    try {
      const pdf = new jsPDF({ 
        orientation: 'landscape', 
        format: 'a4',
        unit: 'mm'
      });

      for (let i = 0; i < participants.length; i++) {
        if (i > 0) pdf.addPage();

        const canvas = await generateCanvasForParticipant(participants[i]);
        const imgData = canvas.toDataURL('image/png', 1.0);
        
        // A4 landscape dimensions in mm
        pdf.addImage(imgData, 'PNG', 0, 0, 297, 210);
        
        setProgress(((i + 1) / participants.length) * 100);
      }

      pdf.save(`${campaign.title}-attestations.pdf`);
      toast.success(`${participants.length} attestations générées en PDF`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Erreur lors de la génération du PDF');
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  const generateZIP = async () => {
    if (participants.length === 0) {
      toast.error('Ajoutez au moins un nom');
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    try {
      const zip = new JSZip();

      for (let i = 0; i < participants.length; i++) {
        const canvas = await generateCanvasForParticipant(participants[i]);
        
        const blob = await new Promise<Blob>((resolve) => 
          canvas.toBlob((b) => resolve(b!), 'image/png', 1.0)
        );

        // Clean filename
        const fileName = `${participants[i].replace(/[^a-zA-Z0-9À-ÿ\s-]/g, '').replace(/\s+/g, '-')}.png`;
        zip.file(fileName, blob);

        setProgress(((i + 1) / participants.length) * 100);
      }

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `${campaign.title}-attestations.zip`);
      toast.success(`${participants.length} attestations générées en ZIP`);
    } catch (error) {
      console.error('Error generating ZIP:', error);
      toast.error('Erreur lors de la génération du ZIP');
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      // Parse CSV - take first column as names
      const names = text
        .split('\n')
        .map(line => line.split(',')[0]?.trim())
        .filter(name => name && name.length > 0);
      
      setNamesInput(names.join('\n'));
      toast.success(`${names.length} noms importés`);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Génération par lot
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Date field */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Date du document
            </Label>
            <Input
              value={dateValue}
              onChange={(e) => setDateValue(e.target.value)}
              placeholder="05/01/2026"
              className="max-w-xs"
            />
          </div>

          {/* Names input */}
          <div className="space-y-2">
            <Label>Liste des participants (un par ligne)</Label>
            <Textarea
              value={namesInput}
              onChange={(e) => setNamesInput(e.target.value)}
              placeholder="Marie Dupont&#10;Jean Martin&#10;Sophie Bernard&#10;..."
              className="min-h-[200px] font-mono"
            />
            
            <div className="flex items-center gap-4">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleCSVImport}
                  className="hidden"
                />
                <Button variant="outline" size="sm" asChild>
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    Importer CSV
                  </span>
                </Button>
              </label>
              
              <span className="text-sm text-muted-foreground">
                {participants.length > 0 ? (
                  <span className="flex items-center gap-1 text-primary">
                    <Check className="w-4 h-4" />
                    {participants.length} attestation{participants.length > 1 ? 's' : ''} à générer
                  </span>
                ) : (
                  'Aucun nom saisi'
                )}
              </span>
            </div>
          </div>

          {/* Preview section */}
          {participants.length > 0 && (
            <div className="space-y-3">
              <Label>Aperçu</Label>
              <div className="flex items-center gap-4 mb-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPreviewIndex(Math.max(0, previewIndex - 1))}
                  disabled={previewIndex === 0}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  {previewIndex + 1} / {participants.length} — {participants[previewIndex]}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPreviewIndex(Math.min(participants.length - 1, previewIndex + 1))}
                  disabled={previewIndex === participants.length - 1}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="border rounded-lg overflow-hidden bg-muted/20">
                <canvas 
                  ref={previewCanvasRef} 
                  className="w-full max-w-2xl mx-auto"
                />
              </div>
            </div>
          )}

          {/* Progress bar */}
          {isGenerating && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Génération en cours...
              </div>
              <Progress value={progress} />
            </div>
          )}

          {/* Download buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={generatePDF}
              disabled={participants.length === 0 || isGenerating}
              className="flex-1"
            >
              <FileText className="w-4 h-4 mr-2" />
              Télécharger PDF
            </Button>
            <Button
              variant="outline"
              onClick={generateZIP}
              disabled={participants.length === 0 || isGenerating}
              className="flex-1"
            >
              <Archive className="w-4 h-4 mr-2" />
              Télécharger ZIP (PNG)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
