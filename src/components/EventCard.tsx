import { Event } from '@/types/event';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Ticket, Users, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface EventCardProps {
  event: Event;
  onCreateVisual: () => void;
  onBuyTicket: () => void;
}

export function EventCard({ event, onCreateVisual, onBuyTicket }: EventCardProps) {
  const eventDate = new Date(event.event_date);
  const isUpcoming = eventDate > new Date();

  return (
    <Card className="overflow-hidden bg-card border-border/50 group hover:shadow-glow transition-all duration-500">
      {/* Cover Image */}
      <div className="relative aspect-[16/9] overflow-hidden">
        {event.cover_image ? (
          <img
            src={event.cover_image}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full gradient-dark flex items-center justify-center">
            <Ticket className="w-12 h-12 text-primary/30" />
          </div>
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
        
        {/* Date Badge */}
        <div className="absolute top-4 left-4">
          <div className="bg-black/60 backdrop-blur-sm rounded-xl p-3 text-center border border-white/10">
            <div className="text-2xl font-bold text-white">
              {format(eventDate, 'd')}
            </div>
            <div className="text-xs text-white/80 uppercase">
              {format(eventDate, 'MMM', { locale: fr })}
            </div>
          </div>
        </div>

        {/* Status Badge */}
        {isUpcoming && (
          <Badge className="absolute top-4 right-4 bg-success text-success-foreground shadow-neon-green">
            Bientôt
          </Badge>
        )}

        {/* Title & Location */}
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-xl font-bold text-white mb-1 line-clamp-2">
            {event.title}
          </h3>
          <div className="flex items-center gap-2 text-white/80 text-sm">
            <MapPin className="w-3.5 h-3.5" />
            <span>{event.venue}, {event.city}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Event Details */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{format(eventDate, 'EEEE d MMMM, HH:mm', { locale: fr })}</span>
          </div>
          {event.ticket_price > 0 && (
            <Badge variant="secondary" className="font-semibold">
              {event.ticket_price.toLocaleString()} {event.currency}
            </Badge>
          )}
        </div>

        {event.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {event.description}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 border-primary/50 text-primary hover:bg-primary/10"
            onClick={onCreateVisual}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            J'y serai !
          </Button>
          <Button
            className="flex-1 btn-neon gradient-primary text-white"
            onClick={onBuyTicket}
          >
            <Ticket className="w-4 h-4 mr-2" />
            Acheter
          </Button>
        </div>
      </div>
    </Card>
  );
}
