import { Campaign } from '@/types/campaign';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Eye, Download } from 'lucide-react';

interface AnalyticsChartProps {
  campaigns: Campaign[];
}

export const AnalyticsChart = ({ campaigns }: AnalyticsChartProps) => {
  // Group campaigns by creation date and aggregate stats
  const chartData = campaigns.reduce((acc, campaign) => {
    const date = campaign.createdAt.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: 'short' 
    });
    
    const existing = acc.find(d => d.date === date);
    if (existing) {
      existing.views += campaign.views;
      existing.downloads += campaign.downloads;
      existing.campaigns += 1;
    } else {
      acc.push({
        date,
        views: campaign.views,
        downloads: campaign.downloads,
        campaigns: 1,
      });
    }
    return acc;
  }, [] as { date: string; views: number; downloads: number; campaigns: number }[]);

  // Sort by date
  chartData.sort((a, b) => {
    const dateA = new Date(a.date.split(' ').reverse().join(' '));
    const dateB = new Date(b.date.split(' ').reverse().join(' '));
    return dateA.getTime() - dateB.getTime();
  });

  // Take last 7 entries
  const recentData = chartData.slice(-7);

  // Calculate totals
  const totalViews = campaigns.reduce((sum, c) => sum + c.views, 0);
  const totalDownloads = campaigns.reduce((sum, c) => sum + c.downloads, 0);
  const conversionRate = totalViews > 0 ? ((totalDownloads / totalViews) * 100).toFixed(1) : '0';

  // Top performing campaigns
  const topCampaigns = [...campaigns]
    .sort((a, b) => (b.views + b.downloads) - (a.views + a.downloads))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold">{totalViews.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-full bg-primary/10">
                <Eye className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Downloads</p>
                <p className="text-2xl font-bold">{totalDownloads.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-full bg-accent/10">
                <Download className="w-6 h-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold">{conversionRate}%</p>
              </div>
              <div className="p-3 rounded-full bg-green-500/10">
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Area Chart */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg font-display">Views & Downloads</CardTitle>
          </CardHeader>
          <CardContent>
            {recentData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={recentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="views" 
                    stackId="1"
                    stroke="hsl(var(--primary))" 
                    fill="hsl(var(--primary) / 0.3)" 
                    name="Views"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="downloads" 
                    stackId="2"
                    stroke="hsl(var(--accent))" 
                    fill="hsl(var(--accent) / 0.3)" 
                    name="Downloads"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                No data yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Campaigns */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg font-display">Top Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            {topCampaigns.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={topCampaigns.map(c => ({
                  name: c.title.length > 15 ? c.title.slice(0, 15) + '...' : c.title,
                  views: c.views,
                  downloads: c.downloads,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="name" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={10}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="views" fill="hsl(var(--primary))" name="Views" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="downloads" fill="hsl(var(--accent))" name="Downloads" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                No campaigns yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
