import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Event } from '@/types/event';
import { Ticket } from '@/types/ticket';
import { 
  QrCode, 
  Camera, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Search,
  User,
  Calendar,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface TicketScannerProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
}

type ScanResult = {
  status: 'valid' | 'used' | 'invalid' | 'not_found';
  ticket?: Ticket & { owner_name?: string };
  message: string;
};

export function TicketScanner({ event, isOpen, onClose }: TicketScannerProps) {
  const { user } = useAuth();
  const [qrCode, setQrCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleScan = async () => {
    if (!qrCode.trim()) {
      toast.error('Veuillez entrer ou scanner un QR code');
      return;
    }

    setIsScanning(true);
    setScanResult(null);

    try {
      // Find ticket by QR code
      const { data: ticket, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('qr_code', qrCode.trim())
        .eq('event_id', event.id)
        .maybeSingle();

      if (error) throw error;

      if (!ticket) {
        setScanResult({
          status: 'not_found',
          message: 'Ce ticket n\'existe pas ou n\'est pas pour cet événement.',
        });
        return;
      }

      const ticketWithOwner = {
        ...ticket,
        owner_name: ticket.recipient_name || 'Anonyme',
      } as Ticket & { owner_name: string };

      if (ticket.status === 'used') {
        setScanResult({
          status: 'used',
          ticket: ticketWithOwner,
          message: `Ce ticket a déjà été utilisé le ${format(new Date(ticket.scanned_at!), 'dd/MM/yyyy à HH:mm', { locale: fr })}`,
        });
        return;
      }

      if (ticket.status !== 'paid') {
        setScanResult({
          status: 'invalid',
          ticket: ticketWithOwner,
          message: `Ce ticket est ${ticket.status === 'pending' ? 'en attente de paiement' : ticket.status === 'cancelled' ? 'annulé' : 'expiré'}`,
        });
        return;
      }

      setScanResult({
        status: 'valid',
        ticket: ticketWithOwner,
        message: 'Ticket valide ! Prêt pour validation.',
      });
    } catch (error) {
      console.error('Scan error:', error);
      setScanResult({
        status: 'invalid',
        message: 'Erreur lors de la vérification du ticket.',
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleValidate = async () => {
    if (!scanResult?.ticket || scanResult.status !== 'valid' || !user) return;

    setIsValidating(true);

    try {
      const { error } = await supabase
        .from('tickets')
        .update({
          status: 'used',
          scanned_at: new Date().toISOString(),
          scanned_by: user.id,
        })
        .eq('id', scanResult.ticket.id);

      if (error) throw error;

      toast.success('Ticket validé avec succès !');
      setScanResult({
        ...scanResult,
        status: 'used',
        message: 'Ticket validé ! L\'entrée est autorisée.',
      });
      setQrCode('');
    } catch (error) {
      console.error('Validation error:', error);
      toast.error('Erreur lors de la validation');
    } finally {
      setIsValidating(false);
    }
  };

  const handleReset = () => {
    setQrCode('');
    setScanResult(null);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleScan();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-display flex items-center gap-2">
            <QrCode className="w-5 h-5 text-primary" />
            Scanner de tickets
          </DialogTitle>
        </DialogHeader>

        {/* Event Info */}
        <div className="p-3 rounded-xl bg-secondary/50 border border-border/50">
          <h3 className="font-semibold text-sm">{event.title}</h3>
          <p className="text-xs text-muted-foreground">
            {format(new Date(event.event_date), 'EEEE d MMMM yyyy', { locale: fr })}
          </p>
        </div>

        {/* QR Input */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={qrCode}
              onChange={(e) => setQrCode(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Entrez ou scannez le QR code..."
              className="pl-10 pr-4 h-12 text-lg font-mono"
              autoComplete="off"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleScan}
              disabled={isScanning || !qrCode.trim()}
              className="flex-1 gap-2 gradient-primary text-white"
            >
              {isScanning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Vérification...
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4" />
                  Vérifier
                </>
              )}
            </Button>
            {scanResult && (
              <Button variant="outline" onClick={handleReset}>
                Nouveau
              </Button>
            )}
          </div>
        </div>

        {/* Scan Result */}
        {scanResult && (
          <Card className={`p-4 space-y-4 border-2 ${
            scanResult.status === 'valid' ? 'border-success bg-success/5' :
            scanResult.status === 'used' ? 'border-warning bg-warning/5' :
            'border-destructive bg-destructive/5'
          }`}>
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-full ${
                scanResult.status === 'valid' ? 'bg-success/10' :
                scanResult.status === 'used' ? 'bg-warning/10' :
                'bg-destructive/10'
              }`}>
                {scanResult.status === 'valid' ? (
                  <CheckCircle2 className="w-6 h-6 text-success" />
                ) : scanResult.status === 'used' ? (
                  <AlertTriangle className="w-6 h-6 text-warning" />
                ) : (
                  <XCircle className="w-6 h-6 text-destructive" />
                )}
              </div>

              <div className="flex-1 space-y-1">
                <Badge variant={
                  scanResult.status === 'valid' ? 'default' :
                  scanResult.status === 'used' ? 'secondary' :
                  'destructive'
                }>
                  {scanResult.status === 'valid' ? 'VALIDE' :
                   scanResult.status === 'used' ? 'DÉJÀ UTILISÉ' :
                   scanResult.status === 'not_found' ? 'NON TROUVÉ' :
                   'INVALIDE'
                  }
                </Badge>
                <p className="text-sm text-muted-foreground">
                  {scanResult.message}
                </p>
              </div>
            </div>

            {scanResult.ticket && (
              <div className="pt-3 border-t border-border/50 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{scanResult.ticket.owner_name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Acheté le {format(new Date(scanResult.ticket.created_at), 'dd/MM/yyyy', { locale: fr })}</span>
                </div>
                {scanResult.ticket.is_gift && (
                  <Badge variant="outline" className="text-xs">
                    🎁 Ticket offert
                  </Badge>
                )}
              </div>
            )}

            {scanResult.status === 'valid' && (
              <Button
                onClick={handleValidate}
                disabled={isValidating}
                className="w-full gap-2 bg-success hover:bg-success/90 text-white"
              >
                {isValidating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Validation...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Valider l'entrée
                  </>
                )}
              </Button>
            )}
          </Card>
        )}

        {/* Instructions */}
        {!scanResult && (
          <div className="text-center text-sm text-muted-foreground space-y-1">
            <p>Scannez le QR code du ticket ou entrez-le manuellement.</p>
            <p className="text-xs">Appuyez sur Entrée pour vérifier.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
