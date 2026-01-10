import { useDownloadStats } from '@/hooks/useDownloadStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { 
  Download, Users, TrendingUp, Clock, Smartphone, Monitor, Tablet,
  FileImage, Video, FileText, RefreshCw, ArrowUp, ArrowDown, Minus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--chart-1))', 'hsl(var(--chart-2))'];

export const DownloadAnalytics = () => {
  const {
    isLoading,
    refetch,
    totalDownloads,
    uniqueVisitors,
    dailyAverage,
    popularMediaType,
    getDailyTrends,
    getMediaTypeDistribution,
    getDeviceBreakdown,
    getHourlyDistribution,
    getCampaignStats,
  } = useDownloadStats();

  const dailyTrends = getDailyTrends();
  const mediaDistribution = getMediaTypeDistribution();
  const deviceBreakdown = getDeviceBreakdown();
  const hourlyData = getHourlyDistribution();
  const campaignStats = getCampaignStats();

  const formatHour = (hour: number) => {
    return `${hour.toString().padStart(2, '0')}h`;
  };

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      case 'tablet': return <Tablet className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  const getMediaIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('photo') || lowerType.includes('image')) return <FileImage className="w-4 h-4" />;
    if (lowerType.includes('vid')) return <Video className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <ArrowUp className="w-4 h-4 text-green-500" />;
      case 'down': return <ArrowDown className="w-4 h-4 text-destructive" />;
      default: return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="glass-card animate-pulse">
              <CardContent className="pt-6">
                <div className="h-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with refresh */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-display font-semibold">Statistiques de Téléchargement</h2>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Téléchargements</p>
                <p className="text-2xl font-bold">{totalDownloads.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-full bg-primary/10">
                <Download className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Visiteurs Uniques</p>
                <p className="text-2xl font-bold">{uniqueVisitors.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-full bg-accent/10">
                <Users className="w-6 h-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Moyenne Journalière</p>
                <p className="text-2xl font-bold">{dailyAverage}</p>
              </div>
              <div className="p-3 rounded-full bg-chart-1/10">
                <TrendingUp className="w-6 h-6 text-chart-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Type Populaire</p>
                <p className="text-2xl font-bold">{popularMediaType}</p>
              </div>
              <div className="p-3 rounded-full bg-chart-2/10">
                {getMediaIcon(popularMediaType)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Trends */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg font-display">Tendances (14 jours)</CardTitle>
          </CardHeader>
          <CardContent>
            {dailyTrends.some(d => d.downloads > 0) ? (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={dailyTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={10}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="downloads" 
                    stroke="hsl(var(--primary))" 
                    fill="hsl(var(--primary) / 0.3)" 
                    name="Téléchargements"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="uniqueVisitors" 
                    stroke="hsl(var(--accent))" 
                    fill="hsl(var(--accent) / 0.3)" 
                    name="Visiteurs"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                Aucune donnée pour cette période
              </div>
            )}
          </CardContent>
        </Card>

        {/* Media Type Distribution */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg font-display">Répartition par Type</CardTitle>
          </CardHeader>
          <CardContent>
            {mediaDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={mediaDistribution}
                    dataKey="count"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ type, percentage }) => `${type} (${percentage}%)`}
                  >
                    {mediaDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                Aucune donnée disponible
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Breakdown */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg font-display">Appareils</CardTitle>
          </CardHeader>
          <CardContent>
            {deviceBreakdown.length > 0 ? (
              <div className="space-y-4">
                {deviceBreakdown.map((item, index) => (
                  <div key={item.device} className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-muted">
                      {getDeviceIcon(item.device)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{item.device}</span>
                        <span className="text-sm text-muted-foreground">{item.count} ({item.percentage}%)</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-500"
                          style={{ 
                            width: `${item.percentage}%`,
                            backgroundColor: COLORS[index % COLORS.length]
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                Aucune donnée disponible
              </div>
            )}
          </CardContent>
        </Card>

        {/* Peak Hours */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Heures de Pointe
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hourlyData.some(h => h.downloads > 0) ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={hourlyData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis 
                    dataKey="hour" 
                    type="category" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={10}
                    tickFormatter={formatHour}
                    width={40}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    labelFormatter={(value) => formatHour(value as number)}
                  />
                  <Bar 
                    dataKey="downloads" 
                    fill="hsl(var(--primary))" 
                    radius={[0, 4, 4, 0]} 
                    name="Téléchargements"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                Aucune donnée disponible
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Campaigns Table */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg font-display">Top Campagnes</CardTitle>
        </CardHeader>
        <CardContent>
          {campaignStats.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Campagne</TableHead>
                  <TableHead className="text-right">Téléchargements</TableHead>
                  <TableHead className="text-center">Tendance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaignStats.slice(0, 10).map((campaign, index) => (
                  <TableRow key={campaign.campaignId}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {campaign.campaignTitle}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {campaign.downloads.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center">
                      {getTrendIcon(campaign.trend)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              Aucune campagne avec des téléchargements
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
