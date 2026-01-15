import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useEventStats, EventStats } from '@/hooks/useEventStats';
import { supabase } from '@/integrations/supabase/client';
import { Event } from '@/types/event';
import { Header } from '@/components/Header';
import { CreateEventModal } from '@/components/CreateEventModal';
import { ManageRolesModal } from '@/components/ManageRolesModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, Calendar, MapPin, Users, Ticket, 
  Edit2, Eye, UserCog, BarChart3, TrendingUp,
  CheckCircle2, Image, Wallet, ScanLine
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

export default function AdminEventsPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { eventStats, globalStats, dailyStats, isLoading: statsLoading, refetch: refetchStats } = useEventStats();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [managingRolesEvent, setManagingRolesEvent] = useState<Event | null>(null);

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
    }
    setIsLoading(false);
  };

  const handleEventCreated = () => {
    setShowCreateModal(false);
    setEditingEvent(null);
    fetchMyEvents();
    refetchStats();
    toast.success('Événement créé avec succès');
  };

  const getEventStats = (eventId: string): EventStats | undefined => {
    return eventStats.find(s => s.eventId === eventId);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount);
  };

  return (
    <>
      <Helmet>
        <title>Tableau de bord Promoteur | Jyserai</title>
      </Helmet>

      <Header />

      <div className="min-h-screen bg-background pt-20 pb-12 px-4 md:px-6">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold font-display">
                Tableau de bord <span className="text-gradient-neon">Promoteur</span>
              </h1>
              <p className="text-muted-foreground mt-1">
                Gérez vos événements et suivez vos performances
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

          {/* Global Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{globalStats.totalEvents}</p>
                    <p className="text-xs text-muted-foreground">Événements</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <Ticket className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{globalStats.totalTicketsSold}</p>
                    <p className="text-xs text-muted-foreground">Tickets vendus</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <ScanLine className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{globalStats.totalTicketsScanned}</p>
                    <p className="text-xs text-muted-foreground">Scannés</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-yellow-500/10">
                    <Wallet className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{formatCurrency(globalStats.totalRevenue)}</p>
                    <p className="text-xs text-muted-foreground">Revenus (XOF)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <Image className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{globalStats.totalVisuals}</p>
                    <p className="text-xs text-muted-foreground">Visuels créés</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-500/10">
                    <TrendingUp className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{globalStats.scanRate.toFixed(0)}%</p>
                    <p className="text-xs text-muted-foreground">Taux scan</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="events" className="space-y-6">
            <TabsList className="glass-card">
              <TabsTrigger value="events" className="gap-2">
                <Calendar className="w-4 h-4" />
                Événements
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                Statistiques
              </TabsTrigger>
            </TabsList>

            {/* Events Tab */}
            <TabsContent value="events">
              {isLoading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-72 rounded-2xl" />
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
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.map((event) => {
                    const stats = getEventStats(event.id);
                    return (
                      <Card key={event.id} className="overflow-hidden hover:border-primary/30 transition-all group">
                        {/* Cover Image */}
                        {event.cover_image && (
                          <div className="aspect-video bg-muted overflow-hidden relative">
                            <img 
                              src={event.cover_image} 
                              alt={event.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                            <Badge 
                              className="absolute top-3 right-3"
                              variant={event.is_active ? 'default' : 'secondary'}
                            >
                              {event.is_active ? 'Actif' : 'Inactif'}
                            </Badge>
                          </div>
                        )}
                        
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg line-clamp-1">{event.title}</CardTitle>
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
                              <span className="line-clamp-1">{event.venue}, {event.city}</span>
                            </div>
                          </div>

                          {/* Stats mini */}
                          {stats && (
                            <div className="grid grid-cols-3 gap-2 text-center">
                              <div className="p-2 rounded-lg bg-muted/50">
                                <p className="text-lg font-bold text-green-500">{stats.ticketsSold}</p>
                                <p className="text-[10px] text-muted-foreground">Vendus</p>
                              </div>
                              <div className="p-2 rounded-lg bg-muted/50">
                                <p className="text-lg font-bold text-blue-500">{stats.ticketsScanned}</p>
                                <p className="text-[10px] text-muted-foreground">Scannés</p>
                              </div>
                              <div className="p-2 rounded-lg bg-muted/50">
                                <p className="text-lg font-bold text-purple-500">{stats.visualsCreated}</p>
                                <p className="text-[10px] text-muted-foreground">Visuels</p>
                              </div>
                            </div>
                          )}

                          {/* Price & Revenue */}
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              {event.ticket_price === 0 ? 'Gratuit' : `${formatCurrency(event.ticket_price || 0)} ${event.currency}`}
                            </span>
                            {stats && stats.totalRevenue > 0 && (
                              <span className="text-sm font-semibold text-green-500">
                                +{formatCurrency(stats.totalRevenue)} {event.currency}
                              </span>
                            )}
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
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              {/* Charts */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Sales Chart */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      Ventes (14 derniers jours)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {dailyStats.length > 0 ? (
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={dailyStats}>
                            <defs>
                              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis 
                              dataKey="date" 
                              stroke="hsl(var(--muted-foreground))"
                              tickFormatter={(v) => format(new Date(v), 'dd/MM')}
                              fontSize={12}
                            />
                            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'hsl(var(--card))', 
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px'
                              }}
                              labelFormatter={(v) => format(new Date(v as string), 'PPP', { locale: fr })}
                            />
                            <Area 
                              type="monotone" 
                              dataKey="ticketsSold" 
                              stroke="hsl(var(--primary))" 
                              fillOpacity={1} 
                              fill="url(#colorRevenue)"
                              name="Tickets vendus"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-64 flex items-center justify-center text-muted-foreground">
                        Aucune donnée disponible
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Revenue Chart */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Wallet className="w-5 h-5 text-green-500" />
                      Revenus (14 derniers jours)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {dailyStats.length > 0 ? (
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={dailyStats}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis 
                              dataKey="date" 
                              stroke="hsl(var(--muted-foreground))"
                              tickFormatter={(v) => format(new Date(v), 'dd/MM')}
                              fontSize={12}
                            />
                            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'hsl(var(--card))', 
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px'
                              }}
                              labelFormatter={(v) => format(new Date(v as string), 'PPP', { locale: fr })}
                              formatter={(value) => [`${formatCurrency(value as number)} XOF`, 'Revenus']}
                            />
                            <Bar 
                              dataKey="revenue" 
                              fill="hsl(142, 76%, 36%)"
                              radius={[4, 4, 0, 0]}
                              name="Revenus"
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-64 flex items-center justify-center text-muted-foreground">
                        Aucune donnée disponible
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Events Performance Table */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Performance par événement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {eventStats.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Événement</th>
                            <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">Vendus</th>
                            <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">Scannés</th>
                            <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">Visuels</th>
                            <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Revenus</th>
                          </tr>
                        </thead>
                        <tbody>
                          {eventStats.map((stat) => (
                            <tr key={stat.eventId} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                              <td className="py-3 px-2">
                                <div>
                                  <p className="font-medium line-clamp-1">{stat.eventTitle}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {format(new Date(stat.eventDate), 'dd MMM yyyy', { locale: fr })}
                                  </p>
                                </div>
                              </td>
                              <td className="text-center py-3 px-2">
                                <span className="font-semibold text-green-500">{stat.ticketsSold}</span>
                              </td>
                              <td className="text-center py-3 px-2">
                                <span className="font-semibold text-blue-500">{stat.ticketsScanned}</span>
                              </td>
                              <td className="text-center py-3 px-2">
                                <span className="font-semibold text-purple-500">{stat.visualsCreated}</span>
                              </td>
                              <td className="text-right py-3 px-2">
                                <span className="font-semibold">{formatCurrency(stat.totalRevenue)} {stat.currency}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="py-12 text-center text-muted-foreground">
                      Aucune donnée disponible. Créez votre premier événement !
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
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
