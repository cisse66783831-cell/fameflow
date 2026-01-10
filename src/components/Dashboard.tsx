import { useState } from 'react';
import { Campaign } from '@/types/campaign';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useAuth } from '@/hooks/useAuth';
import { StatsCard } from './StatsCard';
import { CampaignCard } from './CampaignCard';
import { CreateCampaignModal } from './CreateCampaignModal';
import { EditCampaignModal } from './EditCampaignModal';
import { PhotoEditor } from './PhotoEditor';
import { AnalyticsChart } from './AnalyticsChart';
import { DownloadAnalytics } from './DownloadAnalytics';
import { BatchGenerator } from './BatchGenerator';
import { CreateEventModal } from './CreateEventModal';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, Eye, Download, Layers, Beaker, 
  ArrowLeft, Zap, Sparkles, LogOut, BarChart3, LayoutGrid, Users, Activity, Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export const Dashboard = () => {
  const { 
    campaigns, 
    isLoading, 
    addCampaign, 
    updateCampaign,
    deleteCampaign, 
    loadDemoTemplates, 
    incrementStats,
    getTotalStats 
  } = useCampaigns();
  
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

  const stats = getTotalStats();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    toast.success('Déconnexion réussie');
  };

  const handleLoadDemos = () => {
    loadDemoTemplates();
    toast.success('Demo templates loaded!');
  };

  const handleDeleteCampaign = (id: string) => {
    if (confirm('Are you sure you want to delete this campaign?')) {
      deleteCampaign(id);
      toast.success('Campaign deleted');
    }
  };

  const handleSelectCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    incrementStats(campaign.id, 'views');
  };

  const handleEditCampaign = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setShowEditModal(true);
  };

  const handleDownload = () => {
    if (selectedCampaign) {
      incrementStats(selectedCampaign.id, 'downloads');
    }
  };

  // Check if campaign is a document type for batch generation
  const isDocumentCampaign = selectedCampaign?.type === 'document';

  if (selectedCampaign) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-5xl py-8">
          <button
            onClick={() => setSelectedCampaign(null)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour au Dashboard</span>
          </button>

          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold text-foreground">
              {selectedCampaign.title}
            </h1>
            <p className="text-muted-foreground mt-1">{selectedCampaign.description}</p>
          </div>

          {isDocumentCampaign ? (
            <Tabs defaultValue="editor" className="space-y-6">
              <TabsList>
                <TabsTrigger value="editor" className="gap-2">
                  <LayoutGrid className="w-4 h-4" />
                  Éditeur
                </TabsTrigger>
                <TabsTrigger value="batch" className="gap-2">
                  <Users className="w-4 h-4" />
                  Génération par lot
                </TabsTrigger>
              </TabsList>

              <TabsContent value="editor">
                <PhotoEditor campaign={selectedCampaign} onDownload={handleDownload} />
              </TabsContent>

              <TabsContent value="batch">
                <BatchGenerator campaign={selectedCampaign} />
              </TabsContent>
            </Tabs>
          ) : (
            <PhotoEditor campaign={selectedCampaign} onDownload={handleDownload} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl gradient-primary">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl">FrameFlow</span>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user?.email}
            </span>
            <Button variant="outline" onClick={() => setShowEventModal(true)}>
              <Calendar className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Créer un événement</span>
              <span className="sm:hidden">Event</span>
            </Button>
            <Button variant="gradient" onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">New Campaign</span>
              <span className="sm:hidden">New</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Stats Section */}
        <section className="mb-10">
          <h2 className="font-display font-semibold text-lg text-muted-foreground mb-4">
            Overview
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatsCard
              icon={<Layers className="w-5 h-5" />}
              label="Total Campaigns"
              value={campaigns.length}
            />
            <StatsCard
              icon={<Eye className="w-5 h-5" />}
              label="Total Views"
              value={stats.views}
              trend="+12%"
            />
            <StatsCard
              icon={<Download className="w-5 h-5" />}
              label="Total Downloads"
              value={stats.downloads}
              trend="+8%"
            />
          </div>
        </section>

        {/* Tabs for Campaigns and Analytics */}
        <Tabs defaultValue="campaigns" className="space-y-6">
          <TabsList className="glass-card">
            <TabsTrigger value="campaigns" className="gap-2">
              <LayoutGrid className="w-4 h-4" />
              Campaigns
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="downloads" className="gap-2">
              <Activity className="w-4 h-4" />
              Téléchargements
            </TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns">
            {/* Campaigns Grid */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display font-semibold text-lg text-foreground">
                  Your Campaigns
                </h2>
                
                {campaigns.length === 0 && (
                  <Button variant="outline" onClick={handleLoadDemos}>
                    <Beaker className="w-4 h-4 mr-2" />
                    Load Demo Templates
                  </Button>
                )}
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="glass-card rounded-2xl h-80 animate-pulse" />
                  ))}
                </div>
              ) : campaigns.length === 0 ? (
                <div className="glass-card rounded-2xl p-12 text-center animate-fade-in">
                  <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-display font-semibold text-xl mb-2">
                    No campaigns yet
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                    Create your first viral campaign or load demo templates to explore the platform.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button variant="gradient" onClick={() => setShowCreateModal(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Campaign
                    </Button>
                    <Button variant="outline" onClick={handleLoadDemos}>
                      <Beaker className="w-4 h-4 mr-2" />
                      Load Demos
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {campaigns.map((campaign, index) => (
                    <CampaignCard
                      key={campaign.id}
                      campaign={campaign}
                      onSelect={handleSelectCampaign}
                      onDelete={handleDeleteCampaign}
                      onEdit={handleEditCampaign}
                      index={index}
                    />
                  ))}
                </div>
              )}
            </section>
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsChart campaigns={campaigns} />
          </TabsContent>

          <TabsContent value="downloads">
            <DownloadAnalytics />
          </TabsContent>
        </Tabs>
      </main>

      <CreateCampaignModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={addCampaign}
      />

      <EditCampaignModal
        open={showEditModal}
        campaign={editingCampaign}
        onClose={() => {
          setShowEditModal(false);
          setEditingCampaign(null);
        }}
        onUpdate={updateCampaign}
      />

      <CreateEventModal
        isOpen={showEventModal}
        onClose={() => setShowEventModal(false)}
        onSuccess={() => {
          setShowEventModal(false);
          toast.success('Événement créé avec succès !');
          navigate('/admin/events');
        }}
      />
    </div>
  );
};
