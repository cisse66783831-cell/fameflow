import { useState } from 'react';
import { useDownloadStats } from '@/hooks/useDownloadStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { 
  Download, Users, TrendingUp, Clock, Smartphone, Monitor, Tablet,
  FileImage, Video, FileText, RefreshCw, ArrowUp, ArrowDown, Minus,
  Globe, Chrome, Apple, Percent, Timer, FileDown, Map, Share2
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { exportToCSV, exportToExcel, prepareDownloadStatsForExport, prepareSummaryForExport } from '@/utils/exportStats';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))'];

export const DownloadAnalytics = () => {
  const [period, setPeriod] = useState<number>(14);
  
  const {
    isLoading,
    refetch,
    totalDownloads,
    uniqueVisitors,
    dailyAverage,
    popularMediaType,
    totalViews,
    conversionRate,
    avgTimeOnPage,
    getDailyTrends,
    getMediaTypeDistribution,
    getDeviceBreakdown,
    getBrowserBreakdown,
    getOSBreakdown,
    getLocationBreakdown,
    getReferrerBreakdown,
    getHourlyDistribution,
    getCampaignStats,
    getEventStats,
    getPerformanceComparison,
    getExportSummary,
    getCampaignTitles,
    rawStats,
  } = useDownloadStats(period);

  const dailyTrends = getDailyTrends();
  const mediaDistribution = getMediaTypeDistribution();
  const deviceBreakdown = getDeviceBreakdown();
  const browserBreakdown = getBrowserBreakdown();
  const osBreakdown = getOSBreakdown();
  const locationBreakdown = getLocationBreakdown();
  const referrerBreakdown = getReferrerBreakdown();
  const hourlyData = getHourlyDistribution();
  const campaignStats = getCampaignStats();
  const eventStats = getEventStats();
  const comparison = getPerformanceComparison(7);

  const formatHour = (hour: number) => `${hour.toString().padStart(2, '0')}h`;

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

  const handleExportCSV = () => {
    const data = prepareDownloadStatsForExport(rawStats, getCampaignTitles());
    exportToCSV(data, 'statistiques_telechargements');
  };

  const handleExportExcel = () => {
    const data = prepareDownloadStatsForExport(rawStats, getCampaignTitles());
    exportToExcel(data, 'statistiques_telechargements');
  };

  const handleExportSummary = () => {
    const summary = prepareSummaryForExport(getExportSummary());
    exportToCSV(summary, 'resume_statistiques');
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
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-lg font-display font-semibold">Statistiques de Téléchargement</h2>
        <div className="flex items-center gap-2">
          <Select value={period.toString()} onValueChange={(v) => setPeriod(parseInt(v))}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 jours</SelectItem>
              <SelectItem value="14">14 jours</SelectItem>
              <SelectItem value="30">30 jours</SelectItem>
              <SelectItem value="90">90 jours</SelectItem>
            </SelectContent>
          </Select>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <FileDown className="w-4 h-4 mr-2" />
                Exporter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportCSV}>
                Exporter CSV (Détaillé)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportExcel}>
                Exporter Excel (Détaillé)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportSummary}>
                Exporter Résumé CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Summary Stats with comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Téléchargements</p>
                <p className="text-2xl font-bold">{totalDownloads.toLocaleString()}</p>
                {comparison.changePercent !== 0 && (
                  <p className={`text-xs flex items-center gap-1 mt-1 ${comparison.changePercent > 0 ? 'text-green-500' : 'text-destructive'}`}>
                    {comparison.changePercent > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                    {Math.abs(comparison.changePercent)}% vs sem. préc.
                  </p>
                )}
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
                {comparison.visitorsChangePercent !== 0 && (
                  <p className={`text-xs flex items-center gap-1 mt-1 ${comparison.visitorsChangePercent > 0 ? 'text-green-500' : 'text-destructive'}`}>
                    {comparison.visitorsChangePercent > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                    {Math.abs(comparison.visitorsChangePercent)}% vs sem. préc.
                  </p>
                )}
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
                <p className="text-sm text-muted-foreground">Taux Conversion</p>
                <p className="text-2xl font-bold">{conversionRate}%</p>
                <p className="text-xs text-muted-foreground mt-1">{totalViews} vues</p>
              </div>
              <div className="p-3 rounded-full bg-chart-1/10">
                <Percent className="w-6 h-6 text-chart-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Temps Moyen</p>
                <p className="text-2xl font-bold">{avgTimeOnPage}s</p>
                <p className="text-xs text-muted-foreground mt-1">sur page</p>
              </div>
              <div className="p-3 rounded-full bg-chart-2/10">
                <Timer className="w-6 h-6 text-chart-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Moyenne/Jour</p>
                <p className="text-2xl font-bold">{dailyAverage}</p>
                <p className="text-xs text-muted-foreground mt-1">{popularMediaType}</p>
              </div>
              <div className="p-3 rounded-full bg-chart-3/10">
                <TrendingUp className="w-6 h-6 text-chart-3" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="sources">Sources</TabsTrigger>
          <TabsTrigger value="campaigns">Campagnes</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Trends */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg font-display">Tendances ({period} jours)</CardTitle>
              </CardHeader>
              <CardContent>
                {dailyTrends.some(d => d.downloads > 0) ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={dailyTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Area type="monotone" dataKey="downloads" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.3)" name="Téléchargements" />
                      <Area type="monotone" dataKey="uniqueVisitors" stroke="hsl(var(--accent))" fill="hsl(var(--accent) / 0.3)" name="Visiteurs" />
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
                  <BarChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" fontSize={10} tickFormatter={formatHour} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      labelFormatter={(value) => formatHour(value as number)}
                    />
                    <Bar dataKey="downloads" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Téléchargements" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  Aucune donnée disponible
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audience Tab */}
        <TabsContent value="audience" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Device Breakdown */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg font-display flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  Appareils
                </CardTitle>
              </CardHeader>
              <CardContent>
                {deviceBreakdown.length > 0 ? (
                  <div className="space-y-4">
                    {deviceBreakdown.map((item, index) => (
                      <div key={item.device} className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-muted">{getDeviceIcon(item.device)}</div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{item.device}</span>
                            <span className="text-sm text-muted-foreground">{item.count} ({item.percentage}%)</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${item.percentage}%`, backgroundColor: COLORS[index % COLORS.length] }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-[150px] flex items-center justify-center text-muted-foreground">Aucune donnée</div>
                )}
              </CardContent>
            </Card>

            {/* Browser Breakdown */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg font-display flex items-center gap-2">
                  <Chrome className="w-5 h-5" />
                  Navigateurs
                </CardTitle>
              </CardHeader>
              <CardContent>
                {browserBreakdown.length > 0 ? (
                  <div className="space-y-4">
                    {browserBreakdown.slice(0, 5).map((item, index) => (
                      <div key={item.browser} className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{item.browser}</span>
                            <span className="text-sm text-muted-foreground">{item.count} ({item.percentage}%)</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${item.percentage}%`, backgroundColor: COLORS[index % COLORS.length] }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-[150px] flex items-center justify-center text-muted-foreground">Aucune donnée</div>
                )}
              </CardContent>
            </Card>

            {/* OS Breakdown */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg font-display flex items-center gap-2">
                  <Apple className="w-5 h-5" />
                  Systèmes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {osBreakdown.length > 0 ? (
                  <div className="space-y-4">
                    {osBreakdown.slice(0, 5).map((item, index) => (
                      <div key={item.os} className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{item.os}</span>
                            <span className="text-sm text-muted-foreground">{item.count} ({item.percentage}%)</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${item.percentage}%`, backgroundColor: COLORS[index % COLORS.length] }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-[150px] flex items-center justify-center text-muted-foreground">Aucune donnée</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Location Map */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <Map className="w-5 h-5" />
                Géographie
              </CardTitle>
            </CardHeader>
            <CardContent>
              {locationBreakdown.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {locationBreakdown.slice(0, 12).map((item, index) => (
                    <div key={item.location} className="p-4 rounded-lg bg-muted/50 text-center">
                      <Globe className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium truncate">{item.location}</p>
                      <p className="text-lg font-bold">{item.count}</p>
                      <p className="text-xs text-muted-foreground">{item.percentage}%</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  Les données de géolocalisation seront collectées lors des prochains téléchargements
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sources Tab */}
        <TabsContent value="sources" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Referrer Breakdown */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg font-display flex items-center gap-2">
                  <Share2 className="w-5 h-5" />
                  Sources de Trafic
                </CardTitle>
              </CardHeader>
              <CardContent>
                {referrerBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={referrerBreakdown}
                        dataKey="count"
                        nameKey="source"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ source, percentage }) => `${source} (${percentage}%)`}
                      >
                        {referrerBreakdown.map((_, index) => (
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

            {/* Referrer List */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg font-display">Détail des Sources</CardTitle>
              </CardHeader>
              <CardContent>
                {referrerBreakdown.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Source</TableHead>
                        <TableHead className="text-right">Téléchargements</TableHead>
                        <TableHead className="text-right">%</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {referrerBreakdown.map((item) => (
                        <TableRow key={item.source}>
                          <TableCell className="font-medium">{item.source}</TableCell>
                          <TableCell className="text-right">{item.count}</TableCell>
                          <TableCell className="text-right">{item.percentage}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    Les données de source seront collectées lors des prochains téléchargements
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-6 mt-6">
          {/* Top Campaigns Table */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg font-display">Performance des Campagnes</CardTitle>
            </CardHeader>
            <CardContent>
              {campaignStats.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Campagne</TableHead>
                      <TableHead className="text-right">Vues</TableHead>
                      <TableHead className="text-right">Téléchargements</TableHead>
                      <TableHead className="text-right">Conversion</TableHead>
                      <TableHead className="text-center">Tendance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaignStats.slice(0, 10).map((campaign, index) => (
                      <TableRow key={campaign.campaignId}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{campaign.campaignTitle}</TableCell>
                        <TableCell className="text-right">{campaign.views.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-semibold">{campaign.downloads.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <span className={campaign.conversionRate > 10 ? 'text-green-500 font-semibold' : ''}>
                            {campaign.conversionRate}%
                          </span>
                        </TableCell>
                        <TableCell className="text-center">{getTrendIcon(campaign.trend)}</TableCell>
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

          {/* Events Table */}
          {eventStats.length > 0 && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg font-display">Performance des Événements</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Événement</TableHead>
                      <TableHead className="text-right">Téléchargements</TableHead>
                      <TableHead className="text-center">Tendance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {eventStats.slice(0, 10).map((event, index) => (
                      <TableRow key={event.eventId}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{event.eventTitle}</TableCell>
                        <TableCell className="text-right font-semibold">{event.downloads.toLocaleString()}</TableCell>
                        <TableCell className="text-center">{getTrendIcon(event.trend)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};