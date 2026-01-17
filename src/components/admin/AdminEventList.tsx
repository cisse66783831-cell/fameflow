import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Calendar, Search, Trash2, RefreshCw, Loader2, Ticket, MapPin } from 'lucide-react';
import { toast } from 'sonner';

interface Event {
  id: string;
  title: string;
  city: string | null;
  venue: string | null;
  event_date: string;
  ticket_price: number | null;
  currency: string | null;
  is_active: boolean | null;
  created_at: string;
  tickets_count: number;
}

interface AdminEventListProps {
  events: Event[];
  onRefresh: () => void;
  isLoading: boolean;
}

export function AdminEventList({ events, onRefresh, isLoading }: AdminEventListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);
  const [togglingEventId, setTogglingEventId] = useState<string | null>(null);

  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.venue?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteEvent = async (eventId: string) => {
    setDeletingEventId(eventId);
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
      toast.success('Événement supprimé');
      onRefresh();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Erreur lors de la suppression');
    } finally {
      setDeletingEventId(null);
    }
  };

  const handleToggleActive = async (eventId: string, currentValue: boolean) => {
    setTogglingEventId(eventId);
    try {
      const { error } = await supabase
        .from('events')
        .update({ is_active: !currentValue })
        .eq('id', eventId);

      if (error) throw error;
      toast.success(currentValue ? 'Événement désactivé' : 'Événement activé');
      onRefresh();
    } catch (error) {
      console.error('Error toggling event:', error);
      toast.error('Erreur lors de la modification');
    } finally {
      setTogglingEventId(null);
    }
  };

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-accent" />
            Gestion des événements ({events.length})
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Button variant="outline" size="icon" onClick={onRefresh} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEvents.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Aucun événement trouvé</p>
            ) : (
              filteredEvents.map((event) => (
                <div 
                  key={event.id} 
                  className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-lg bg-background/50 border border-border/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{event.title}</p>
                        <Badge variant={event.is_active ? 'default' : 'secondary'}>
                          {event.is_active ? 'Actif' : 'Inactif'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span>{event.city} • {event.venue}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Ticket className="w-4 h-4 text-primary" />
                      <span className="font-medium">{event.tickets_count}</span>
                      <span className="text-muted-foreground">tickets</span>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {event.ticket_price?.toLocaleString()} {event.currency}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.event_date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Actif</span>
                      <Switch
                        checked={event.is_active ?? true}
                        onCheckedChange={() => handleToggleActive(event.id, event.is_active ?? true)}
                        disabled={togglingEventId === event.id}
                      />
                    </div>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon" disabled={deletingEventId === event.id}>
                          {deletingEventId === event.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer cet événement ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Cette action supprimera définitivement "{event.title}" et tous les tickets associés.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteEvent(event.id)}>
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
