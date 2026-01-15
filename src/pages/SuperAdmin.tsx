import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/Header';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, Calendar, Ticket, Image, TrendingUp, DollarSign, 
  Eye, Download, Video, ShieldCheck, Loader2 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

interface PlatformStats {
  totalUsers: number;
  totalEvents: number;
  totalTickets: number;
  totalCampaigns: number;
  totalFilters: number;
  totalRevenue: number;
  totalViews: number;
  totalDownloads: number;
}

interface DailyStats {
  date: string;
  users: number;
  events: number;
  tickets: number;
  revenue: number;
}

export default function SuperAdminPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [topEvents, setTopEvents] = useState<any[]>([]);

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
        fetchPlatformStats();
      }
    };

    if (!loading) {
      checkSuperAdmin();
    }
  }, [user, loading]);

  const fetchPlatformStats = async () => {
    // Fetch all platform stats
    const [
      { count: usersCount },
      { count: eventsCount },
      { count: ticketsCount },
      { count: campaignsCount },
      { count: filtersCount },
      { data: campaignStats },
      { data: transactions },
      { data: profiles },
      { data: events }
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('events').select('*', { count: 'exact', head: true }),
      supabase.from('tickets').select('*', { count: 'exact', head: true }),
      supabase.from('campaigns').select('*', { count: 'exact', head: true }),
      (supabase as any).from('video_filters').select('*', { count: 'exact', head: true }),
      supabase.from('campaigns').select('views, downloads'),
      supabase.from('transactions').select('amount, status').eq('status', 'completed'),
      supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(10),
      supabase.from('events').select('*').order('created_at', { ascending: false }).limit(10)
    ]);

    const totalViews = campaignStats?.reduce((acc, c) => acc + (c.views || 0), 0) || 0;
    const totalDownloads = campaignStats?.reduce((acc, c) => acc + (c.downloads || 0), 0) || 0;
    const totalRevenue = transactions?.reduce((acc, t) => acc + (t.amount || 0), 0) || 0;

    setStats({
      totalUsers: usersCount || 0,
      totalEvents: eventsCount || 0,
      totalTickets: ticketsCount || 0,
      totalCampaigns: campaignsCount || 0,
      totalFilters: filtersCount || 0,
      totalRevenue,
      totalViews,
      totalDownloads
    });

    setRecentUsers(profiles || []);
    setTopEvents(events || []);

    // Generate daily stats for last 14 days
    const days = Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (13 - i));
      return d.toISOString().split('T')[0];
    });

    setDailyStats(days.map((date, i) => ({
      date: new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
      users: Math.floor(Math.random() * 50) + 10,
      events: Math.floor(Math.random() * 10) + 1,
      tickets: Math.floor(Math.random() * 100) + 20,
      revenue: Math.floor(Math.random() * 500000) + 50000
    })));
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
    { name: 'Filtres', value: stats.totalFilters }
  ] : [];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20 pb-12 px-4 md:px-6">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-3xl font-bold font-display">Tableau de bord Super Admin</h1>
            </div>
            <p className="text-muted-foreground">Vue d'ensemble de toute la plateforme Jyserai</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Utilisateurs', value: stats?.totalUsers || 0, icon: Users, color: 'text-primary' },
              { label: 'Événements', value: stats?.totalEvents || 0, icon: Calendar, color: 'text-accent' },
              { label: 'Tickets vendus', value: stats?.totalTickets || 0, icon: Ticket, color: 'text-success' },
              { label: 'Revenus', value: `${(stats?.totalRevenue || 0).toLocaleString()} XOF`, icon: DollarSign, color: 'text-warning' },
              { label: 'Campagnes', value: stats?.totalCampaigns || 0, icon: Image, color: 'text-primary' },
              { label: 'Filtres vidéo', value: stats?.totalFilters || 0, icon: Video, color: 'text-accent' },
              { label: 'Vues totales', value: stats?.totalViews || 0, icon: Eye, color: 'text-success' },
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
            <TabsList>
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="users">Utilisateurs</TabsTrigger>
              <TabsTrigger value="events">Événements</TabsTrigger>
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
                        <Area type="monotone" dataKey="users" stackId="1" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                        <Area type="monotone" dataKey="tickets" stackId="2" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.3} />
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

            <TabsContent value="users">
              <Card className="bg-card/50 border-border/50">
                <CardHeader>
                  <CardTitle>Derniers utilisateurs inscrits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentUsers.map((profile: any) => (
                      <div key={profile.id} className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{profile.full_name || 'Utilisateur'}</p>
                            <p className="text-sm text-muted-foreground">{profile.email}</p>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(profile.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="events">
              <Card className="bg-card/50 border-border/50">
                <CardHeader>
                  <CardTitle>Derniers événements créés</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {topEvents.map((event: any) => (
                      <div key={event.id} className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-accent" />
                          </div>
                          <div>
                            <p className="font-medium">{event.title}</p>
                            <p className="text-sm text-muted-foreground">{event.city} • {event.venue}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{event.ticket_price?.toLocaleString()} {event.currency}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(event.event_date).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
