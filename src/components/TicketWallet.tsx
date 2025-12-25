import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useTickets } from '@/hooks/useTickets';
import { Ticket } from '@/types/ticket';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Ticket as TicketIcon, 
  Calendar, 
  MapPin, 
  Download, 
  Share2,
  Gift,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

interface TicketWalletProps {
  className?: string;
}

export function TicketWallet({ className }: TicketWalletProps) {
  const { tickets, isLoading } = useTickets();
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);

  const toggleTicket = (ticketId: string) => {
    setExpandedTicket(expandedTicket === ticketId ? null : ticketId);
  };

  const getStatusBadge = (status: Ticket['status']) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-success text-success-foreground gap-1"><CheckCircle2 className="w-3 h-3" /> Valide</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="gap-1"><Clock className="w-3 h-3" /> En attente</Badge>;
      case 'used':
        return <Badge variant="outline" className="gap-1"><CheckCircle2 className="w-3 h-3" /> Utilisé</Badge>;
      case 'cancelled':
        return <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" /> Annulé</Badge>;
      case 'expired':
        return <Badge variant="secondary" className="text-muted-foreground gap-1"><XCircle className="w-3 h-3" /> Expiré</Badge>;
      default:
        return null;
    }
  };

  const handleDownload = async (ticket: Ticket) => {
    // Create a canvas with the ticket visual
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // Draw background
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw event frame if available
    if (ticket.event?.frame_image) {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = ticket.event!.frame_image;
        });
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      } catch (error) {
        console.error('Error loading frame image:', error);
      }
    }

    // Draw QR code
    const qrSize = 120;
    const qrX = ticket.event?.qr_position_x 
      ? (ticket.event.qr_position_x / 100) * canvas.width - qrSize / 2
      : canvas.width / 2 - qrSize / 2;
    const qrY = ticket.event?.qr_position_y
      ? (ticket.event.qr_position_y / 100) * canvas.height - qrSize / 2
      : canvas.height - qrSize - 50;

    // Draw white background for QR
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20);

    // Draw QR code (simplified - in production use proper QR rendering)
    const qrCanvas = document.createElement('canvas');
    const qrSvg = document.querySelector(`[data-ticket-qr="${ticket.id}"]`) as SVGElement;
    if (qrSvg) {
      const svgData = new XMLSerializer().serializeToString(qrSvg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      const qrImg = new Image();
      await new Promise((resolve) => {
        qrImg.onload = resolve;
        qrImg.src = url;
      });
      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
      URL.revokeObjectURL(url);
    }

    // Download
    const link = document.createElement('a');
    link.download = `ticket-${ticket.event?.title || 'event'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    toast.success('Ticket téléchargé !');
  };

  const handleShare = async (ticket: Ticket) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Mon ticket - ${ticket.event?.title}`,
          text: `J'ai mon ticket pour ${ticket.event?.title} ! 🎉`,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Share error:', error);
      }
    } else {
      toast.info('Partage non disponible sur cet appareil');
    }
  };

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <Card className={`p-8 text-center ${className}`}>
        <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <TicketIcon className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Aucun ticket</h3>
        <p className="text-sm text-muted-foreground">
          Vos tickets apparaîtront ici après achat.
        </p>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {tickets.map((ticket) => (
        <Card
          key={ticket.id}
          className="overflow-hidden border-border/50 transition-all hover:shadow-glow"
        >
          {/* Ticket Header */}
          <div
            className="p-4 cursor-pointer"
            onClick={() => toggleTicket(ticket.id)}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold truncate">
                    {ticket.event?.title || 'Événement'}
                  </h3>
                  {ticket.is_gift && (
                    <Gift className="w-4 h-4 text-accent shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {ticket.event?.event_date 
                      ? format(new Date(ticket.event.event_date), 'd MMM yyyy', { locale: fr })
                      : 'Date inconnue'
                    }
                  </span>
                  {ticket.event?.venue && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {ticket.event.venue}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {getStatusBadge(ticket.status)}
                {expandedTicket === ticket.id ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
            </div>
          </div>

          {/* Expanded Content */}
          {expandedTicket === ticket.id && (
            <div className="px-4 pb-4 space-y-4 border-t border-border/50 pt-4">
              {/* QR Code */}
              {ticket.status === 'paid' && (
                <div className="flex justify-center">
                  <div className="p-4 bg-white rounded-xl">
                    <QRCodeSVG
                      value={ticket.qr_code}
                      size={180}
                      level="H"
                      data-ticket-qr={ticket.id}
                    />
                  </div>
                </div>
              )}

              {/* Ticket Details */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-lg bg-secondary/50">
                  <div className="text-muted-foreground text-xs mb-1">Prix</div>
                  <div className="font-semibold">
                    {ticket.price.toLocaleString()} {ticket.currency}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-secondary/50">
                  <div className="text-muted-foreground text-xs mb-1">Acheté le</div>
                  <div className="font-semibold">
                    {format(new Date(ticket.created_at), 'd MMM yyyy', { locale: fr })}
                  </div>
                </div>
              </div>

              {ticket.is_gift && ticket.recipient_name && (
                <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                  <div className="text-xs text-accent mb-1 flex items-center gap-1">
                    <Gift className="w-3 h-3" />
                    Offert à
                  </div>
                  <div className="font-semibold">{ticket.recipient_name}</div>
                </div>
              )}

              {ticket.status === 'used' && ticket.scanned_at && (
                <div className="p-3 rounded-lg bg-success/10 border border-success/20 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-success inline mr-2" />
                  Scanné le {format(new Date(ticket.scanned_at), 'd MMM yyyy à HH:mm', { locale: fr })}
                </div>
              )}

              {/* Actions */}
              {ticket.status === 'paid' && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={() => handleDownload(ticket)}
                  >
                    <Download className="w-4 h-4" />
                    Télécharger
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={() => handleShare(ticket)}
                  >
                    <Share2 className="w-4 h-4" />
                    Partager
                  </Button>
                </div>
              )}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
