import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageUploader } from '@/components/ImageUploader';
import { PhotoZoneEditor } from '@/components/PhotoZoneEditor';
import { toast } from 'sonner';
import { Loader2, Video, Image as ImageIcon, Copy, CheckCircle2, Phone, CreditCard, Globe, AlertCircle, Settings, CreditCard as PaymentIcon, ArrowRight, User } from 'lucide-react';
import { Campaign } from '@/types/campaign';

const VIDEO_PRICE = 2000;
const MERCHANT_NUMBER = "+226 66 78 38 31";
const USSD_BF = "*144*2*1*66783831*2000#";

interface CreateCampaignModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (campaign: Campaign) => Promise<Campaign>;
}

type TabValue = 'details' | 'photozone' | 'payment';

export const CreateCampaignModal = ({ open, onClose, onCreate }: CreateCampaignModalProps) => {
  const [activeTab, setActiveTab] = useState<TabValue>('details');
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'photo' | 'video'>('photo');
  const [frameImage, setFrameImage] = useState<string>('');
  
  // Photo Zone State
  const [photoZone, setPhotoZone] = useState({
    x: 50,
    y: 50,
    width: 30,
    height: 30,
    shape: 'circle' as 'rect' | 'circle',
    nameEnabled: true,
    nameY: 85,
  });
  
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
    setActiveTab('details');
    setPhotoZone({
      x: 50, y: 50, width: 30, height: 30,
      shape: 'circle', nameEnabled: true, nameY: 85,
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const canProceedToPhotoZone = () => {
    return title.trim() !== '' && frameImage !== '';
  };

  const canProceedToPayment = () => {
    return canProceedToPhotoZone();
  };

  const handleNextTab = () => {
    if (activeTab === 'details') {
      if (!canProceedToPhotoZone()) {
        toast.error("Veuillez remplir le titre et uploader l'image du cadre");
        return;
      }
      setActiveTab('photozone');
    } else if (activeTab === 'photozone') {
      if (type === 'video') {
        setActiveTab('payment');
      } else {
        handleSubmit();
      }
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (type === 'video' && !transactionCode) {
        toast.error("Veuillez entrer le code de transaction reçu par SMS");
        setLoading(false);
        return;
      }

      const campaign: Campaign = {
        id: `campaign-${Date.now()}`,
        title: title.trim(),
        description: description.trim(),
        type: type === 'video' ? 'video_filter' : 'photo',
        frameImage: frameImage,
        textElements: [],
        hashtags: [],
        views: 0,
        downloads: 0,
        createdAt: new Date(),
        // Photo zone settings
        photoZoneX: photoZone.x,
        photoZoneY: photoZone.y,
        photoZoneWidth: photoZone.width,
        photoZoneHeight: photoZone.height,
        photoZoneShape: photoZone.shape,
        nameZoneEnabled: photoZone.nameEnabled,
        nameZoneY: photoZone.nameY,
        // Payment tracking
        paymentStatus: type === 'video' ? 'pending' : 'free',
        transactionCode: type === 'video' ? transactionCode : null,
        paymentCountry: type === 'video' ? country : null,
        paymentAmount: type === 'video' ? VIDEO_PRICE : 0,
      };

      await onCreate(campaign);

      if (type === 'video') {
        toast.success("Demande reçue ! Vous recevrez un email après validation par l'admin.", {
          duration: 6000,
        });
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {type === 'video' ? <Video className="w-5 h-5 text-primary" /> : <ImageIcon className="w-5 h-5 text-primary" />}
            Créer une campagne {type === 'video' ? 'Vidéo' : 'Photo'}
          </DialogTitle>
          <DialogDescription>
            Configurez votre cadre personnalisé en quelques étapes.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)} className="w-full">
          <TabsList className="w-full grid grid-cols-3 mb-4">
            <TabsTrigger value="details" className="gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Détails</span>
            </TabsTrigger>
            <TabsTrigger 
              value="photozone" 
              disabled={!canProceedToPhotoZone()}
              className="gap-2"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Zone Photo</span>
            </TabsTrigger>
            <TabsTrigger 
              value="payment" 
              disabled={type !== 'video' || !canProceedToPayment()}
              className="gap-2"
            >
              <PaymentIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Paiement</span>
              {type === 'video' && (
                <span className="text-xs bg-orange-500/20 text-orange-600 px-1.5 py-0.5 rounded">
                  {VIDEO_PRICE} F
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: DETAILS */}
          <TabsContent value="details" className="space-y-5 mt-0">
            {/* Type Selection */}
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

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Titre de la campagne *</Label>
              <Input 
                id="title"
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="Ex: Concert Afro Nation 2025" 
              />
            </div>

            {/* Frame Image Upload */}
            <ImageUploader 
              value={frameImage}
              onChange={setFrameImage}
              bucket="campaign-images"
              folder="frames"
              label="Image du cadre (PNG transparent) *"
              aspectRatio="portrait"
            />
            <p className="text-xs text-muted-foreground -mt-3">
              Format 9:16 recommandé (1080x1920px). Utilisez un fond transparent pour les zones photo.
            </p>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optionnel)</Label>
              <Textarea 
                id="description"
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Décrivez votre campagne..." 
                rows={3}
              />
            </div>

            <Button 
              onClick={handleNextTab} 
              className="w-full gap-2" 
              disabled={!canProceedToPhotoZone()}
            >
              Suivant : Configurer la zone photo
              <ArrowRight className="w-4 h-4" />
            </Button>
          </TabsContent>

          {/* TAB 2: PHOTO ZONE */}
          <TabsContent value="photozone" className="space-y-5 mt-0">
            {frameImage && (
              <PhotoZoneEditor
                frameImage={frameImage}
                initialX={photoZone.x}
                initialY={photoZone.y}
                initialWidth={photoZone.width}
                initialHeight={photoZone.height}
                initialShape={photoZone.shape}
                nameZoneEnabled={photoZone.nameEnabled}
                nameZoneY={photoZone.nameY}
                onChange={(zone) => setPhotoZone(zone)}
                showActions={false}
              />
            )}

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setActiveTab('details')} className="flex-1">
                Retour
              </Button>
              <Button onClick={handleNextTab} className="flex-[2] gap-2">
                {type === 'video' ? (
                  <>
                    Suivant : Paiement
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    Créer la campagne
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* TAB 3: PAYMENT (VIDEO ONLY) */}
          <TabsContent value="payment" className="space-y-5 mt-0">
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 text-sm flex gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 shrink-0" />
              <div>
                <h4 className="font-bold text-orange-600">Mise en ligne payante</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  La configuration est terminée. Effectuez le paiement de <strong>{VIDEO_PRICE} FCFA</strong> pour activer l'hébergement vidéo.
                </p>
              </div>
            </div>

            {/* Country Selector */}
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
                  <SelectItem value="OTHER">🌍 Autre pays</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Payment Instructions */}
            <div className="space-y-2">
              <Label>Instructions de Paiement</Label>
              
              {/* Merchant Number - Always visible */}
              <div className="flex items-center gap-3 p-3 border rounded-lg bg-background">
                <div className="bg-blue-500/10 p-2 rounded-full">
                  <Phone className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">
                    {country === 'BF' ? 'Numéro Wave / Orange Money' : 'Transfert International vers'}
                  </p>
                  <p className="font-mono font-bold">{MERCHANT_NUMBER}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => copyToClipboard(MERCHANT_NUMBER)}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>

              {/* USSD Code - Only for Burkina Faso */}
              {country === 'BF' ? (
                <div className="flex items-center gap-3 p-3 border rounded-lg bg-background animate-in fade-in slide-in-from-top-2">
                  <div className="bg-orange-500/10 p-2 rounded-full">
                    <CreditCard className="w-4 h-4 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Code rapide Orange Money</p>
                    <p className="font-mono font-bold text-sm">{USSD_BF}</p>
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

            {/* Transaction Code Input */}
            <div className="space-y-2">
              <Label htmlFor="transactionCode">Code de Transaction (ID reçu par SMS) *</Label>
              <Input 
                id="transactionCode"
                placeholder="Entrez l'ID de transaction ici" 
                value={transactionCode}
                onChange={(e) => setTransactionCode(e.target.value)}
                className="text-center font-mono tracking-widest uppercase border-primary/50"
              />
            </div>

            {/* Success Notice */}
            <div className="flex items-start gap-2 bg-green-500/10 p-3 rounded text-xs text-green-700">
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
              <p>
                Une fois validé par l'admin, vous recevrez <strong>automatiquement un email</strong> confirmant l'activation de votre campagne vidéo.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setActiveTab('photozone')} className="flex-1">
                Retour
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={loading || !transactionCode} 
                className="flex-[2] gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                J'ai payé, soumettre ma demande
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
