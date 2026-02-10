import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/Header';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Users, Calendar, Ticket, Image, TrendingUp, DollarSign, 
  Eye, Download, Video, ShieldCheck, Loader2, RefreshCw 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { AdminUserList } from '@/components/admin/AdminUserList';
import { AdminEventList } from '@/components/admin/AdminEventList';
import { AdminCampaignList } from '@/components/admin/AdminCampaignList';
import { AdminTransactionList } from '@/components/admin/AdminTransactionList';
import { AdminModerationPanel } from '@/components/admin/AdminModerationPanel';
import { AdminLandingPagePanel } from '@/components/admin/AdminLandingPagePanel';
import { AdminVideoCampaignValidation } from '@/components/admin/AdminVideoCampaignValidation';
import { AdminWatermarkValidation } from '@/components/admin/AdminWatermarkValidation';
import { AppRole } from '@/types/ticket';
import { Badge } from '@/components/ui/badge';

interface PlatformStats {
  totalUsers: number;
  totalEvents: number;
  totalTickets: number;
  totalCampaigns: number;
  totalVisuals: number;
  totalRevenue: number;
  totalViews: number;
  totalDownloads: number;
  totalPageViews: number;
}

interface DailyStats {
  date: string;
  users: number;
  events: number;
  tickets: number;
  revenue: number;
}

interface UserWithRoles {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  created_at: string | null;
  updated_at: string | null;
  roles: AppRole[];
}

interface EventWithTickets {
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

export default function SuperAdminPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [events, setEvents] = useState<EventWithTickets[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [visuals, setVisuals] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    const checkSuperAdmin = async () => {
      if (!user) {
        setIsChecking(false);
        return;
      }

      const { data } = await supabase.rpc('is_super_admin', { _user_id: user.id });
      setIsSuperAdmin(!!data);
      setIsChecking(false);

      if (data) {
        fetchAllData();
      }
    };

    if (!loading) {
      checkSuperAdmin();
    }
  }, [user, loading]);

  const fetchAllData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      await Promise.all([
        fetchPlatformStats(),
        fetchUsers(),
        fetchEvents(),
        fetchCampaigns(),
        fetchTransactions(),
        fetchVisuals(),
        fetchDailyStats()
      ]);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  const fetchPlatformStats = async () => {
    const [
      { count: usersCount },
      { count: eventsCount },
      { count: ticketsCount },
      { count: campaignsCount },
      { count: visualsCount },
      { count: pageViewsCount },
      { count: downloadStatsCount },
      { data: campaignViews },
      { data: completedTx }
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('events').select('*', { count: 'exact', head: true }),
      supabase.from('tickets').select('*', { count: 'exact', head: true }),
      supabase.from('campaigns').select('*', { count: 'exact', head: true }),
      supabase.from('public_visuals').select('*', { count: 'exact', head: true }),
      supabase.from('page_views').select('*', { count: 'exact', head: true }),
      // Get real download count from download_stats table (source of truth)
      supabase.from('download_stats').select('*', { count: 'exact', head: true }),
      supabase.from('campaigns').select('views'),
      supabase.from('transactions').select('amount').eq('status', 'completed')
    ]);

    const totalViews = campaignViews?.reduce((acc, c) => acc + (c.views || 0), 0) || 0;
    // Use download_stats as source of truth for downloads
    const totalDownloads = downloadStatsCount || 0;
    const totalRevenue = completedTx?.reduce((acc, t) => acc + (Number(t.amount) || 0), 0) || 0;

    setStats({
      totalUsers: usersCount || 0,
      totalEvents: eventsCount || 0,
      totalTickets: ticketsCount || 0,
      totalCampaigns: campaignsCount || 0,
      totalVisuals: visualsCount || 0,
      totalRevenue,
      totalViews,
      totalDownloads,
      totalPageViews: pageViewsCount || 0
    });
  };

  const fetchUsers = async () => {
    // Fetch all profiles
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    // Fetch all user roles
    const { data: roles } = await supabase
      .from('user_roles')
      .select('user_id, role');

    // Map roles to users - profiles.id is the user_id
    const usersWithRoles: UserWithRoles[] = (profiles || []).map(profile => ({
      ...profile,
      created_at: profile.created_at,
      roles: (roles || [])
        .filter(r => r.user_id === profile.id)
        .map(r => r.role as AppRole)
    }));

    setUsers(usersWithRoles);
  };

  const fetchEvents = async () => {
    // Fetch events with ticket counts
    const { data: eventsData } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });

    // Get ticket counts per event
    const { data: ticketCounts } = await supabase
      .from('tickets')
      .select('event_id');

    const countMap = (ticketCounts || []).reduce((acc, t) => {
      acc[t.event_id] = (acc[t.event_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const eventsWithTickets: EventWithTickets[] = (eventsData || []).map(event => ({
      ...event,
      tickets_count: countMap[event.id] || 0
    }));

    setEvents(eventsWithTickets);
  };

  const fetchCampaigns = async () => {
    // Fetch campaigns with profile info including payment and watermark fields
    const { data: campaignsData } = await supabase
      .from('campaigns')
      .select('id, title, slug, views, created_at, user_id, frame_image, is_featured, display_order, type, payment_status, transaction_code, payment_country, payment_amount, watermark_status, watermark_removal_requested_at, watermark_transaction_code, watermark_payment_country, watermark_payment_amount')
      .order('created_at', { ascending: false });

    // Fetch real download counts from download_stats (source of truth)
    const { data: downloadStats } = await supabase
      .from('download_stats')
      .select('campaign_id');

    // Calculate real downloads per campaign
    const downloadsByCampaign = (downloadStats || []).reduce((acc, d) => {
      if (d.campaign_id) {
        acc[d.campaign_id] = (acc[d.campaign_id] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // Fetch profiles to map user names
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('id, full_name, email');

    const profilesMap = (profilesData || []).reduce((acc, p) => {
      acc[p.id] = p;
      return acc;
    }, {} as Record<string, { full_name: string | null; email: string | null }>);

    const enrichedCampaigns = (campaignsData || []).map(c => ({
      ...c,
      // Use real download count from download_stats
      downloads: downloadsByCampaign[c.id] || 0,
      owner_name: profilesMap[c.user_id]?.full_name || profilesMap[c.user_id]?.email || 'Inconnu',
      owner_email: profilesMap[c.user_id]?.email || null,
    }));

    setCampaigns(enrichedCampaigns);
  };

  const fetchTransactions = async () => {
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });

    setTransactions(data || []);
  };

  const fetchVisuals = async () => {
    const { data } = await supabase
      .from('public_visuals')
      .select('*')
      .order('created_at', { ascending: false });

    setVisuals(data || []);
  };

  const fetchDailyStats = async () => {
    // Get date range for last 14 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 13);

    // Fetch real data grouped by date
    const [
      { data: profilesData },
      { data: ticketsData },
      { data: transactionsData }
    ] = await Promise.all([
      supabase.from('profiles').select('created_at'),
      supabase.from('tickets').select('created_at'),
      supabase.from('transactions').select('created_at, amount, status').eq('status', 'completed')
    ]);

    // Generate days array
    const days = Array.from({ length: 14 }, (_, i) => {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      return d.toISOString().split('T')[0];
    });

    // Group data by date
    const groupByDate = (items: any[] | null, dateField: string) => {
      if (!items) return {};
      return items.reduce((acc, item) => {
        const date = new Date(item[dateField]).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    };

    const groupRevenueByDate = (items: any[] | null) => {
      if (!items) return {};
      return items.reduce((acc, item) => {
        const date = new Date(item.created_at).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + (item.amount || 0);
        return acc;
      }, {} as Record<string, number>);
    };

    const usersByDate = groupByDate(profilesData, 'created_at');
    const ticketsByDate = groupByDate(ticketsData, 'created_at');
    const revenueByDate = groupRevenueByDate(transactionsData);

    const dailyData: DailyStats[] = days.map(date => ({
      date: new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
      users: usersByDate[date] || 0,
      events: 0, // We can add events by date if needed
      tickets: ticketsByDate[date] || 0,
      revenue: revenueByDate[date] || 0
    }));

    setDailyStats(dailyData);
  };

  if (loading || isChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isSuperAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-24 text-center">
          <ShieldCheck className="w-16 h-16 mx-auto text-destructive mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Accès refusé</h1>
          <p className="text-muted-foreground">Vous n'avez pas les permissions super admin.</p>
        </div>
      </div>
    );
  }

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--success))', 'hsl(var(--warning))'];

  const pieData = stats ? [
    { name: 'Utilisateurs', value: stats.totalUsers },
    { name: 'Événements', value: stats.totalEvents },
    { name: 'Campagnes', value: stats.totalCampaigns },
    { name: 'Visuels', value: stats.totalVisuals }
  ] : [];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20 pb-12 px-4 md:px-6">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                </div>
                <h1 className="text-3xl font-bold font-display">Tableau de bord Super Admin</h1>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-muted-foreground">Vue d'ensemble de toute la plateforme</p>
                {lastUpdated && (
                  <p className="text-xs text-muted-foreground">
                    Mis à jour : {lastUpdated.toLocaleTimeString('fr-FR')}
                  </p>
                )}
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={fetchAllData} 
              disabled={isLoadingData}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingData ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Utilisateurs', value: stats?.totalUsers || 0, icon: Users, color: 'text-primary' },
              { label: 'Événements', value: stats?.totalEvents || 0, icon: Calendar, color: 'text-accent' },
              { label: 'Tickets vendus', value: stats?.totalTickets || 0, icon: Ticket, color: 'text-success' },
              { label: 'Revenus', value: `${(stats?.totalRevenue || 0).toLocaleString()} XOF`, icon: DollarSign, color: 'text-warning' },
              { label: 'Campagnes', value: stats?.totalCampaigns || 0, icon: Image, color: 'text-primary' },
              { label: 'Visuels publics', value: stats?.totalVisuals || 0, icon: Video, color: 'text-accent' },
              { label: 'Vues pages', value: stats?.totalPageViews || 0, icon: Eye, color: 'text-success' },
              { label: 'Téléchargements', value: stats?.totalDownloads || 0, icon: Download, color: 'text-warning' }
            ].map((stat, i) => (
              <Card key={i} className="bg-card/50 border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-background ${stat.color}`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="flex-wrap">
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="landing">Landing Page</TabsTrigger>
              <TabsTrigger value="video-validation" className="gap-2">
                Validations Vidéo
                {campaigns.filter(c => c.payment_status === 'pending').length > 0 && (
                  <Badge variant="destructive" className="ml-1 h-5 px-1.5">
                    {campaigns.filter(c => c.payment_status === 'pending').length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="watermark-validation" className="gap-2">
                Filigranes
                {campaigns.filter(c => c.watermark_status === 'pending').length > 0 && (
                  <Badge variant="destructive" className="ml-1 h-5 px-1.5">
                    {campaigns.filter(c => c.watermark_status === 'pending').length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="users">Utilisateurs</TabsTrigger>
              <TabsTrigger value="events">Événements</TabsTrigger>
              <TabsTrigger value="campaigns">Campagnes</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="moderation">Modération</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Activity Chart */}
                <Card className="bg-card/50 border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      Activité des 14 derniers jours
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={dailyStats}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                        <Tooltip 
                          contentStyle={{ 
                            background: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }} 
                        />
                        <Area type="monotone" dataKey="users" stackId="1" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} name="Utilisateurs" />
                        <Area type="monotone" dataKey="tickets" stackId="2" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.3} name="Tickets" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Distribution Chart */}
                <Card className="bg-card/50 border-border/50">
                  <CardHeader>
                    <CardTitle>Distribution des contenus</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            background: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }} 
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap justify-center gap-4 mt-4">
                      {pieData.map((entry, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                          <span className="text-sm text-muted-foreground">{entry.name}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Revenue Chart */}
                <Card className="bg-card/50 border-border/50 lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-success" />
                      Revenus quotidiens (XOF)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={dailyStats}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                        <Tooltip 
                          contentStyle={{ 
                            background: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                          formatter={(value: number) => [`${value.toLocaleString()} XOF`, 'Revenus']}
                        />
                        <Bar dataKey="revenue" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="landing">
              <AdminLandingPagePanel onRefresh={fetchVisuals} />
            </TabsContent>

            <TabsContent value="video-validation">
              <AdminVideoCampaignValidation 
                campaigns={campaigns} 
                onRefresh={fetchCampaigns} 
                isLoading={isLoadingData} 
              />
            </TabsContent>

            <TabsContent value="watermark-validation">
              <AdminWatermarkValidation 
                campaigns={campaigns} 
                onRefresh={fetchCampaigns} 
                isLoading={isLoadingData} 
              />
            </TabsContent>

            <TabsContent value="users">
              <AdminUserList 
                users={users} 
                onRefresh={fetchUsers} 
                isLoading={isLoadingData} 
              />
            </TabsContent>

            <TabsContent value="events">
              <AdminEventList 
                events={events} 
                onRefresh={fetchEvents} 
                isLoading={isLoadingData} 
              />
            </TabsContent>

            <TabsContent value="campaigns">
              <AdminCampaignList 
                campaigns={campaigns} 
                onRefresh={fetchCampaigns} 
                isLoading={isLoadingData} 
              />
            </TabsContent>

            <TabsContent value="transactions">
              <AdminTransactionList 
                transactions={transactions} 
                onRefresh={fetchTransactions} 
                isLoading={isLoadingData} 
              />
            </TabsContent>

            <TabsContent value="moderation">
              <AdminModerationPanel 
                visuals={visuals} 
                onRefresh={fetchVisuals} 
                isLoading={isLoadingData} 
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
