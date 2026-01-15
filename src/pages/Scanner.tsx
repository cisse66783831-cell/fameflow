import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useEvents } from '@/hooks/useEvents';
import { Header } from '@/components/Header';
import { TicketScanner } from '@/components/TicketScanner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Event } from '@/types/event';
import { QrCode, Calendar, MapPin, Lock, LogIn } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function ScannerPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isScanner, isLoading: rolesLoading } = useUserRoles();
  const { events, isLoading: eventsLoading } = useEvents();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showScanner, setShowScanner] = useState(false);

  const isLoading = authLoading || rolesLoading || eventsLoading;
  const hasAccess = user && isScanner();

  const handleSelectEvent = (event: Event) => {
    if (!isScanner(event.id)) return;
    setSelectedEvent(event);
    setShowScanner(true);
  };

  return (
    <>
      <Helmet>
        <title>Scanner de Tickets | Jyserai</title>
        <meta name="description" content="Scannez et validez les tickets d'événements" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />

        <main className="container mx-auto px-6 py-8 pt-24 max-w-2xl space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-2xl" />
              ))}
            </div>
          ) : !user ? (
            <Card className="p-8 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <LogIn className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Connectez-vous</h2>
              <p className="text-muted-foreground mb-6">
                Connectez-vous pour accéder au scanner.
              </p>
              <Button
                onClick={() => navigate('/auth')}
                className="gradient-primary text-white"
              >
                Se connecter
              </Button>
            </Card>
          ) : !hasAccess ? (
            <Card className="p-8 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <Lock className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Accès refusé</h2>
              <p className="text-muted-foreground">
                Vous n'avez pas les permissions pour scanner des tickets.
              </p>
            </Card>
          ) : (
            <>
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold font-display">
                  Sélectionnez un événement
                </h2>
                <p className="text-muted-foreground">
                  Choisissez l'événement pour lequel scanner les tickets.
                </p>
              </div>

              <div className="space-y-4">
                {events.map((event) => {
                  const canScan = isScanner(event.id);
                  return (
                    <Card
                      key={event.id}
                      className={`p-4 transition-all ${
                        canScan 
                          ? 'cursor-pointer hover:border-primary hover:shadow-glow' 
                          : 'opacity-50'
                      }`}
                      onClick={() => canScan && handleSelectEvent(event)}
                    >
                      <div className="flex items-center gap-4">
                        {event.cover_image ? (
                          <img
                            src={event.cover_image}
                            alt={event.title}
                            className="w-16 h-16 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{event.title}</h3>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {format(new Date(event.event_date), 'd MMM yyyy', { locale: fr })}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              {event.city}
                            </span>
                          </div>
                        </div>

                        {canScan ? (
                          <QrCode className="w-6 h-6 text-primary" />
                        ) : (
                          <Lock className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                    </Card>
                  );
                })}

                {events.length === 0 && (
                  <Card className="p-8 text-center">
                    <p className="text-muted-foreground">
                      Aucun événement disponible.
                    </p>
                  </Card>
                )}
              </div>
            </>
          )}
        </main>

        {/* Scanner Modal */}
        {selectedEvent && (
          <TicketScanner
            event={selectedEvent}
            isOpen={showScanner}
            onClose={() => {
              setShowScanner(false);
              setSelectedEvent(null);
            }}
          />
        )}
      </div>
    </>
  );
}
