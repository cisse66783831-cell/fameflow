import { useState } from 'react';
import { useEvents } from '@/hooks/useEvents';
import { usePublicVisuals } from '@/hooks/usePublicVisuals';
import { SocialWall } from '@/components/SocialWall';
import { EventCard } from '@/components/EventCard';
import { VisualGenerator } from '@/components/VisualGenerator';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Event } from '@/types/event';
import { Sparkles, Calendar, Users, Ticket, TrendingUp } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';

export default function EventsPage() {
  const navigate = useNavigate();
  const { events, isLoading: eventsLoading } = useEvents();
  const { visuals } = usePublicVisuals();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showVisualGenerator, setShowVisualGenerator] = useState(false);

  const handleCreateVisual = (event: Event) => {
    setSelectedEvent(event);
    setShowVisualGenerator(true);
  };

  const handleBuyTicket = (eventId: string) => {
    // TODO: Navigate to ticket purchase page
    navigate(`/event/${eventId}/ticket`);
  };

  return (
    <>
      <Helmet>
        <title>Événements | FameFlow</title>
        <meta name="description" content="Découvrez les événements à venir et créez votre visuel J'y serai" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative pt-20 pb-16 px-6 overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse-soft" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[100px] animate-pulse-soft" style={{ animationDelay: '1s' }} />
          </div>

          <div className="container mx-auto relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6 animate-fade-in">
                <TrendingUp className="w-4 h-4" />
                <span>{visuals.length} personnes ont partagé leur enthousiasme</span>
              </div>

              <h1 className="text-4xl md:text-6xl font-bold font-display mb-6 animate-slide-up">
                Événements{' '}
                <span className="text-gradient-neon">Exclusifs</span>
              </h1>

              <p className="text-lg text-muted-foreground mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                Créez votre visuel "J'y serai" et partagez-le sur vos réseaux.
                Montrez au monde que vous serez là !
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mt-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="text-center p-4 rounded-2xl bg-card border border-border/50">
                <div className="text-2xl md:text-3xl font-bold text-primary mb-1">
                  {events.length}
                </div>
                <div className="text-xs text-muted-foreground">Événements</div>
              </div>
              <div className="text-center p-4 rounded-2xl bg-card border border-border/50">
                <div className="text-2xl md:text-3xl font-bold text-accent mb-1">
                  {visuals.length}
                </div>
                <div className="text-xs text-muted-foreground">Visuels créés</div>
              </div>
              <div className="text-center p-4 rounded-2xl bg-card border border-border/50">
                <div className="text-2xl md:text-3xl font-bold text-success mb-1">
                  🔥
                </div>
                <div className="text-xs text-muted-foreground">Trending</div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="pb-20 px-6">
          <div className="container mx-auto">
            <Tabs defaultValue="wall" className="space-y-8">
              <TabsList className="w-full max-w-md mx-auto grid grid-cols-2 bg-secondary p-1 rounded-xl">
                <TabsTrigger value="wall" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">
                  <Users className="w-4 h-4" />
                  Mur Social
                </TabsTrigger>
                <TabsTrigger value="events" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">
                  <Calendar className="w-4 h-4" />
                  Événements
                </TabsTrigger>
              </TabsList>

              {/* Social Wall Tab */}
              <TabsContent value="wall" className="animate-fade-in">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold font-display">
                      Ils y seront ! 🎉
                    </h2>
                  </div>
                  
                  <SocialWall onBuyTicket={handleBuyTicket} />
                </div>
              </TabsContent>

              {/* Events Tab */}
              <TabsContent value="events" className="animate-fade-in">
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold font-display">
                    Événements à venir
                  </h2>

                  {eventsLoading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="aspect-[4/5] rounded-2xl" />
                      ))}
                    </div>
                  ) : events.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto mb-4">
                        <Calendar className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Aucun événement</h3>
                      <p className="text-muted-foreground">
                        Les prochains événements apparaîtront ici.
                      </p>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {events.map((event) => (
                        <EventCard
                          key={event.id}
                          event={event}
                          onCreateVisual={() => handleCreateVisual(event)}
                          onBuyTicket={() => handleBuyTicket(event.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Visual Generator Modal */}
        {selectedEvent && (
          <VisualGenerator
            event={selectedEvent}
            isOpen={showVisualGenerator}
            onClose={() => {
              setShowVisualGenerator(false);
              setSelectedEvent(null);
            }}
            onVisualCreated={() => {
              // Refetch visuals
            }}
          />
        )}
      </div>
    </>
  );
}
