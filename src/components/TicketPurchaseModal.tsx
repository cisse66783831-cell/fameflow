import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Event } from '@/types/event';
import { PaymentMethod } from '@/types/ticket';
import { useTickets } from '@/hooks/useTickets';
import { useAuth } from '@/hooks/useAuth';
import { 
  Ticket, 
  Gift, 
  User, 
  Phone, 
  Mail, 
  CreditCard,
  Smartphone,
  Loader2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface TicketPurchaseModalProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type PurchaseStep = 'type' | 'recipient' | 'payment' | 'confirm' | 'success';

const paymentMethods: { id: PaymentMethod; name: string; icon: string; color: string }[] = [
  { id: 'orange_money', name: 'Orange Money', icon: '🟠', color: 'bg-orange-500/10 border-orange-500/30' },
  { id: 'mtn_money', name: 'MTN Money', icon: '🟡', color: 'bg-yellow-500/10 border-yellow-500/30' },
  { id: 'moov_money', name: 'Moov Money', icon: '🔵', color: 'bg-blue-500/10 border-blue-500/30' },
  { id: 'wave', name: 'Wave', icon: '🌊', color: 'bg-cyan-500/10 border-cyan-500/30' },
  { id: 'card', name: 'Carte bancaire', icon: '💳', color: 'bg-purple-500/10 border-purple-500/30' },
];

export function TicketPurchaseModal({ 
  event, 
  isOpen, 
  onClose,
  onSuccess 
}: TicketPurchaseModalProps) {
  const { user } = useAuth();
  const { createTicket, createTransaction, confirmPayment } = useTickets();
  
  const [step, setStep] = useState<PurchaseStep>('type');
  const [isGift, setIsGift] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('orange_money');
  const [paymentPhone, setPaymentPhone] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [createdTicketId, setCreatedTicketId] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  const handleClose = () => {
    setStep('type');
    setIsGift(false);
    setRecipientName('');
    setRecipientPhone('');
    setRecipientEmail('');
    setPaymentMethod('orange_money');
    setPaymentPhone('');
    setCreatedTicketId(null);
    setTransactionId(null);
    onClose();
  };

  const handlePurchaseTypeSelect = (gift: boolean) => {
    setIsGift(gift);
    if (gift) {
      setStep('recipient');
    } else {
      setStep('payment');
    }
  };

  const handleRecipientSubmit = () => {
    if (!recipientName.trim()) {
      toast.error('Veuillez entrer le nom du destinataire');
      return;
    }
    if (!recipientPhone.trim() && !recipientEmail.trim()) {
      toast.error('Veuillez entrer un téléphone ou email');
      return;
    }
    setStep('payment');
  };

  const handlePaymentSubmit = async () => {
    if (paymentMethod !== 'card' && !paymentPhone.trim()) {
      toast.error('Veuillez entrer votre numéro de téléphone');
      return;
    }

    setIsProcessing(true);

    try {
      // Create ticket
      const ticket = await createTicket({
        eventId: event.id,
        isGift,
        recipientName: isGift ? recipientName : undefined,
        recipientPhone: isGift ? recipientPhone : undefined,
        recipientEmail: isGift ? recipientEmail : undefined,
        price: event.ticket_price,
        currency: event.currency,
      });

      if (!ticket) {
        setIsProcessing(false);
        return;
      }

      setCreatedTicketId(ticket.id);

      // Create transaction
      const transaction = await createTransaction({
        ticketId: ticket.id,
        amount: event.ticket_price,
        currency: event.currency,
        paymentMethod,
        paymentPhone: paymentMethod !== 'card' ? paymentPhone : undefined,
      });

      if (!transaction) {
        setIsProcessing(false);
        return;
      }

      setTransactionId(transaction.id);
      setStep('confirm');
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Une erreur est survenue');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!createdTicketId || !transactionId) return;

    setIsProcessing(true);

    // Simulate payment confirmation (in production, this would be a webhook)
    await new Promise(resolve => setTimeout(resolve, 2000));

    const success = await confirmPayment(
      createdTicketId,
      transactionId,
      `PAY-${Date.now()}`
    );

    setIsProcessing(false);

    if (success) {
      setStep('success');
      onSuccess?.();
    }
  };

  const goBack = () => {
    switch (step) {
      case 'recipient':
        setStep('type');
        break;
      case 'payment':
        setStep(isGift ? 'recipient' : 'type');
        break;
      case 'confirm':
        setStep('payment');
        break;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-display flex items-center gap-2">
            <Ticket className="w-5 h-5 text-primary" />
            {step === 'success' ? 'Ticket acheté !' : 'Acheter un ticket'}
          </DialogTitle>
        </DialogHeader>

        {/* Event Summary */}
        {step !== 'success' && (
          <div className="p-4 rounded-xl bg-secondary/50 border border-border/50 space-y-2">
            <h3 className="font-semibold">{event.title}</h3>
            <p className="text-sm text-muted-foreground">
              {format(new Date(event.event_date), 'EEEE d MMMM yyyy à HH:mm', { locale: fr })}
            </p>
            <Badge variant="secondary" className="text-lg font-bold">
              {event.ticket_price.toLocaleString()} {event.currency}
            </Badge>
          </div>
        )}

        {/* Step: Purchase Type */}
        {step === 'type' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Comment souhaitez-vous utiliser ce ticket ?
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <Card
                className="p-6 cursor-pointer hover:border-primary transition-all text-center space-y-3"
                onClick={() => handlePurchaseTypeSelect(false)}
              >
                <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold">Pour moi</h4>
                  <p className="text-xs text-muted-foreground">
                    Ajouté à mon wallet
                  </p>
                </div>
              </Card>

              <Card
                className="p-6 cursor-pointer hover:border-accent transition-all text-center space-y-3"
                onClick={() => handlePurchaseTypeSelect(true)}
              >
                <div className="w-12 h-12 mx-auto rounded-full bg-accent/10 flex items-center justify-center">
                  <Gift className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h4 className="font-semibold">Offrir</h4>
                  <p className="text-xs text-muted-foreground">
                    Envoyer à quelqu'un
                  </p>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Step: Recipient Info */}
        {step === 'recipient' && (
          <div className="space-y-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={goBack}
              className="gap-2 -ml-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </Button>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recipientName">Nom du destinataire *</Label>
                <Input
                  id="recipientName"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Prénom et nom"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipientPhone">Téléphone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="recipientPhone"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    placeholder="+225 XX XX XX XX"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipientEmail">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="recipientEmail"
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="pl-10"
                  />
                </div>
              </div>

              <Button
                onClick={handleRecipientSubmit}
                className="w-full gap-2 gradient-primary text-white"
              >
                Continuer
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step: Payment */}
        {step === 'payment' && (
          <div className="space-y-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={goBack}
              className="gap-2 -ml-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </Button>

            <div className="space-y-4">
              <Label>Mode de paiement</Label>
              <RadioGroup
                value={paymentMethod}
                onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
                className="grid grid-cols-2 gap-3"
              >
                {paymentMethods.map((method) => (
                  <Label
                    key={method.id}
                    htmlFor={method.id}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      paymentMethod === method.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <RadioGroupItem value={method.id} id={method.id} className="sr-only" />
                    <span className="text-xl">{method.icon}</span>
                    <span className="text-sm font-medium">{method.name}</span>
                  </Label>
                ))}
              </RadioGroup>

              {paymentMethod !== 'card' && (
                <div className="space-y-2">
                  <Label htmlFor="paymentPhone">Numéro de téléphone</Label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="paymentPhone"
                      value={paymentPhone}
                      onChange={(e) => setPaymentPhone(e.target.value)}
                      placeholder="+225 XX XX XX XX"
                      className="pl-10"
                    />
                  </div>
                </div>
              )}

              <Button
                onClick={handlePaymentSubmit}
                disabled={isProcessing}
                className="w-full gap-2 gradient-primary text-white"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Traitement...
                  </>
                ) : (
                  <>
                    Payer {event.ticket_price.toLocaleString()} {event.currency}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step: Confirm Payment */}
        {step === 'confirm' && (
          <div className="space-y-6 text-center py-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-warning/10 flex items-center justify-center animate-pulse">
              <Smartphone className="w-8 h-8 text-warning" />
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-lg">En attente de confirmation</h3>
              <p className="text-sm text-muted-foreground">
                Veuillez valider le paiement sur votre téléphone {paymentPhone}
              </p>
            </div>

            <Button
              onClick={handleConfirmPayment}
              disabled={isProcessing}
              className="w-full gap-2 gradient-primary text-white"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Vérification...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  J'ai confirmé le paiement
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground">
              Le ticket sera ajouté à votre wallet après confirmation.
            </p>
          </div>
        )}

        {/* Step: Success */}
        {step === 'success' && (
          <div className="space-y-6 text-center py-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-success" />
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-xl">Félicitations ! 🎉</h3>
              <p className="text-muted-foreground">
                {isGift 
                  ? `Le ticket a été envoyé à ${recipientName}`
                  : 'Votre ticket a été ajouté à votre wallet'
                }
              </p>
            </div>

            <Button
              onClick={handleClose}
              className="w-full gradient-primary text-white"
            >
              Fermer
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
