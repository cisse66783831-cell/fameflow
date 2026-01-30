import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageUploader } from '@/components/ImageUploader';
import { toast } from 'sonner';
import { Loader2, Video, Image as ImageIcon, Copy, CheckCircle2, Phone, CreditCard, Globe, AlertCircle } from 'lucide-react';
import { Campaign } from '@/types/campaign';

const VIDEO_PRICE = 2000;
const MERCHANT_NUMBER = "+226 66 78 38 31";
const USSD_BF = "*144*2*1*66783831*2000#";

interface CreateCampaignModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (campaign: Campaign) => Promise<Campaign>;
}

export const CreateCampaignModal = ({ open, onClose, onCreate }: CreateCampaignModalProps) => {
  const [step, setStep] = useState<'details' | 'payment'>('details');
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'photo' | 'video'>('photo');
  const [frameImage, setFrameImage] = useState<string>('');
  
  // Payment State
  const [country, setCountry] = useState('BF');
  const [transactionCode, setTransactionCode] = useState('');

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setType('photo');
    setFrameImage('');
    setTransactionCode('');
    setCountry('BF');
    setStep('details');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleNext = () => {
    if (!title || !frameImage) {
      toast.error("Veuillez remplir le titre et l'image du cadre");
      return;
    }
    
    if (type === 'video') {
      setStep('payment');
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Injection des métadonnées pour l'admin
      let finalDescription = description;

      if (type === 'video') {
        if (!transactionCode) {
          toast.error("Veuillez entrer le code de transaction reçu par SMS");
          setLoading(false);
          return;
        }
        finalDescription = `[PAYS: ${country} - PAIEMENT: ${transactionCode} - STATUS: EN_ATTENTE]\n\n${description}`;
      }

      const campaign: Campaign = {
        id: `campaign-${Date.now()}`,
        title: title.trim(),
        description: finalDescription.trim(),
        type: type === 'video' ? 'video_filter' : 'photo',
        frameImage: frameImage,
        textElements: [],
        hashtags: [],
        views: 0,
        downloads: 0,
        createdAt: new Date(),
      };

      await onCreate(campaign);

      if (type === 'video') {
        toast.success("Demande reçue ! Vous recevrez un email après validation.");
      } else {
        toast.success("Campagne Photo créée avec succès !");
      }
      handleClose();
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copié !");
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === 'payment' ? 'Activer le filtre Vidéo' : 'Créer une campagne'}
          </DialogTitle>
          <DialogDescription>
            {step === 'payment' 
              ? 'Finalisez votre configuration par le paiement.' 
              : 'Configurez les détails de votre cadre.'}
          </DialogDescription>
        </DialogHeader>

        {/* ÉTAPE 1 : CONFIGURATION */}
        {step === 'details' && (
          <div className="space-y-5 py-2">
            <div className="space-y-3">
              <Label>Type de campagne</Label>
              <div className="grid grid-cols-2 gap-3">
                <div
                  onClick={() => setType('photo')}
                  className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center gap-2 transition-all ${type === 'photo' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
                >
                  <ImageIcon className="w-8 h-8 text-primary" />
                  <span className="font-medium">Photo</span>
                  <span className="text-xs text-green-600 font-bold">GRATUIT</span>
                </div>

                <div
                  onClick={() => setType('video')}
                  className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center gap-2 transition-all ${type === 'video' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
                >
                  <Video className="w-8 h-8 text-primary" />
                  <span className="font-medium">Vidéo</span>
                  <span className="text-xs text-orange-600 font-bold">{VIDEO_PRICE} F</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Titre de l'événement</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Concert..." />
            </div>

            <ImageUploader 
              value={frameImage}
              onChange={setFrameImage}
              bucket="campaign-images"
              folder="frames"
              label="Image du cadre (PNG transparent)"
              aspectRatio="portrait"
            />
            <p className="text-xs text-muted-foreground -mt-3">Format 9:16 recommandé (1080x1920px)</p>

            <div className="space-y-2">
              <Label>Description (Optionnel)</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Décrivez votre campagne..." />
            </div>

            <Button onClick={handleNext} className="w-full mt-4" disabled={!frameImage || !title}>
              {type === 'video' ? 'Terminer et Payer (2000 F)' : 'Créer la campagne'}
            </Button>
          </div>
        )}

        {/* ÉTAPE 2 : PAIEMENT */}
        {step === 'payment' && (
          <div className="space-y-5 py-2">
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 text-sm flex gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 shrink-0" />
              <div>
                <h4 className="font-bold text-orange-600">Mise en ligne payante</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  La configuration est terminée. Effectuez le paiement de <strong>{VIDEO_PRICE} FCFA</strong> pour activer l'hébergement vidéo.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Votre Pays (pour le moyen de paiement)</Label>
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
              <Label>Instructions de Paiement</Label>
              
              {/* NUMERO MARCHAND (TOUJOURS VISIBLE) */}
              <div className="flex items-center gap-3 p-3 border rounded-lg bg-background">
                <div className="bg-blue-500/10 p-2 rounded-full"><Phone className="w-4 h-4 text-blue-600" /></div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">
                    {country === 'BF' ? 'Numéro Wave / OM' : 'Transfert International vers'}
                  </p>
                  <p className="font-mono font-bold">{MERCHANT_NUMBER}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => copyToClipboard(MERCHANT_NUMBER)}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>

              {/* CODE USSD (UNIQUEMENT BF) */}
              {country === 'BF' ? (
                <div className="flex items-center gap-3 p-3 border rounded-lg bg-background animate-in fade-in slide-in-from-top-2">
                  <div className="bg-orange-500/10 p-2 rounded-full"><CreditCard className="w-4 h-4 text-orange-600" /></div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Code rapide Orange Money</p>
                    <p className="font-mono font-bold text-xs">{USSD_BF}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => copyToClipboard(USSD_BF)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="bg-yellow-500/10 p-3 rounded-lg flex gap-2 text-xs text-yellow-700">
                  <Globe className="w-4 h-4 shrink-0" />
                  <p>Depuis l'étranger, effectuez un "Transfert International" via votre application Wave ou Orange Money vers ce numéro.</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Code de Transaction (ID reçu par SMS)</Label>
              <Input 
                placeholder="Entrez l'ID de transaction ici" 
                value={transactionCode}
                onChange={(e) => setTransactionCode(e.target.value)}
                className="text-center font-mono tracking-widest uppercase border-primary/50"
              />
            </div>

            <div className="flex items-start gap-2 bg-green-500/10 p-3 rounded text-xs text-green-700">
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
              <p>Une fois validé par l'admin, vous recevrez <strong>automatiquement un email</strong> confirmant l'activation.</p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setStep('details')} className="flex-1">
                Retour
              </Button>
              <Button onClick={handleSubmit} disabled={loading || !transactionCode} className="flex-[2]">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                J'ai payé, valider ma demande
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
