import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRoles } from '@/hooks/useUserRoles';
import { supabase } from '@/integrations/supabase/client';
import { Event } from '@/types/event';
import { Header } from '@/components/Header';
import { CreateEventModal } from '@/components/CreateEventModal';
import { ManageRolesModal } from '@/components/ManageRolesModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Plus, Calendar, MapPin, Users, Settings, Ticket, 
  Edit2, Eye, ScanLine, UserCog
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';

export default function AdminEventsPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isPromoter, isLoading: rolesLoading } = useUserRoles();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [managingRolesEvent, setManagingRolesEvent] = useState<Event | null>(null);
  const [ticketCounts, setTicketCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchMyEvents();
    }
  }, [user]);

  const fetchMyEvents = async () => {
    if (!user) return;
    
    setIsLoading(true);
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', user.id)
      .order('event_date', { ascending: true });

    if (error) {
      console.error('Error fetching events:', error);
      toast.error('Erreur lors du chargement des événements');
    } else {
      setEvents(data as Event[] || []);
      
      // Fetch ticket counts for each event
      const counts: Record<string, number> = {};
      for (const event of data || []) {
        const { count } = await supabase
          .from('tickets')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', event.id)
          .eq('status', 'paid');
        counts[event.id] = count || 0;
      }
      setTicketCounts(counts);
    }
    setIsLoading(false);
  };

  const handleEventCreated = () => {
    setShowCreateModal(false);
    setEditingEvent(null);
    fetchMyEvents();
    toast.success('Événement créé avec succès');
  };

  if (authLoading || rolesLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Gérer mes événements | FameFlow</title>
      </Helmet>

      <Header />

      <div className="min-h-screen bg-background pt-20 pb-12 px-4 md:px-6">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold font-display">
                Mes <span className="text-gradient-neon">Événements</span>
              </h1>
              <p className="text-muted-foreground mt-1">
                Créez et gérez vos événements
              </p>
            </div>
            <Button 
              className="btn-neon gradient-primary"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Créer un événement
            </Button>
          </div>

          {/* Events List */}
          {isLoading ? (
            <div className="grid md:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-2xl" />
              ))}
            </div>
          ) : events.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="p-4 rounded-full bg-primary/10 mb-4">
                  <Calendar className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Aucun événement</h3>
                <p className="text-muted-foreground text-center mb-6">
                  Créez votre premier événement pour commencer à vendre des tickets.
                </p>
                <Button 
                  className="btn-neon gradient-primary"
                  onClick={() => setShowCreateModal(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Créer mon premier événement
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {events.map((event) => (
                <Card key={event.id} className="overflow-hidden hover:border-primary/30 transition-all">
                  {/* Cover Image */}
                  {event.cover_image && (
                    <div className="aspect-video bg-muted overflow-hidden">
                      <img 
                        src={event.cover_image} 
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg line-clamp-1">{event.title}</CardTitle>
                      <Badge variant={event.is_active ? 'default' : 'secondary'}>
                        {event.is_active ? 'Actif' : 'Inactif'}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Event Details */}
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {format(new Date(event.event_date), 'PPP à HH:mm', { locale: fr })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{event.venue}, {event.city}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Ticket className="w-4 h-4" />
                        <span>
                          {ticketCounts[event.id] || 0} tickets vendus
                          {event.max_tickets && ` / ${event.max_tickets}`}
                        </span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary">
                        {event.ticket_price === 0 ? 'Gratuit' : `${event.ticket_price.toLocaleString()} ${event.currency}`}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/event/${event.id}/ticket`)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Voir
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setEditingEvent(event)}
                      >
                        <Edit2 className="w-4 h-4 mr-1" />
                        Modifier
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setManagingRolesEvent(event)}
                      >
                        <UserCog className="w-4 h-4 mr-1" />
                        Staff
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Event Modal */}
      <CreateEventModal
        isOpen={showCreateModal || !!editingEvent}
        onClose={() => {
          setShowCreateModal(false);
          setEditingEvent(null);
        }}
        event={editingEvent}
        onSuccess={handleEventCreated}
      />

      {/* Manage Roles Modal */}
      {managingRolesEvent && (
        <ManageRolesModal
          isOpen={!!managingRolesEvent}
          onClose={() => setManagingRolesEvent(null)}
          event={managingRolesEvent}
        />
      )}
    </>
  );
}
