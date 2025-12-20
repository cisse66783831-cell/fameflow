import { usePublicVisuals } from '@/hooks/usePublicVisuals';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, Share2, Eye, Ticket } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface SocialWallProps {
  eventId?: string;
  onBuyTicket?: (eventId: string) => void;
}

export function SocialWall({ eventId, onBuyTicket }: SocialWallProps) {
  const { visuals, isLoading } = usePublicVisuals(eventId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-2xl" />
        ))}
      </div>
    );
  }

  if (visuals.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto mb-4">
          <Heart className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Soyez le premier !</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Créez votre visuel "J'y serai" et partagez-le sur vos réseaux sociaux.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Masonry Grid */}
      <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {visuals.map((visual, index) => (
          <Card
            key={visual.id}
            className="break-inside-avoid bg-card border-border/50 overflow-hidden group animate-fade-in hover:shadow-glow transition-all duration-300"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            {/* Visual Image */}
            <div className="relative aspect-square overflow-hidden">
              <img
                src={visual.visual_url}
                alt={`${visual.creator_name} sera là`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <div className="flex items-center gap-2 mb-2">
                  {visual.creator_photo ? (
                    <img
                      src={visual.creator_photo}
                      alt={visual.creator_name}
                      className="w-8 h-8 rounded-full border-2 border-primary"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-neon flex items-center justify-center text-white font-bold text-sm">
                      {visual.creator_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-white font-medium text-sm truncate">
                    {visual.creator_name}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-white/80 text-xs">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      {visual.views}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:text-primary p-1"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Event Info & CTA */}
            {visual.event && (
              <div className="p-3 border-t border-border/50">
                <p className="text-xs text-muted-foreground mb-2 truncate">
                  {visual.event.title}
                </p>
                <Button
                  size="sm"
                  className="w-full btn-neon gradient-primary text-white text-xs"
                  onClick={() => onBuyTicket?.(visual.event_id)}
                >
                  <Ticket className="w-3.5 h-3.5 mr-1.5" />
                  Acheter mon ticket
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
