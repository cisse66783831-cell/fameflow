import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Image, Search, Trash2, RefreshCw, Loader2, Eye, Download } from 'lucide-react';
import { toast } from 'sonner';

interface Campaign {
  id: string;
  name: string;
  slug: string | null;
  views: number | null;
  downloads: number | null;
  created_at: string;
  user_id: string;
}

interface AdminCampaignListProps {
  campaigns: Campaign[];
  onRefresh: () => void;
  isLoading: boolean;
}

export function AdminCampaignList({ campaigns, onRefresh, isLoading }: AdminCampaignListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingCampaignId, setDeletingCampaignId] = useState<string | null>(null);

  const filteredCampaigns = campaigns.filter(campaign => 
    campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    campaign.slug?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteCampaign = async (campaignId: string) => {
    setDeletingCampaignId(campaignId);
    try {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', campaignId);

      if (error) throw error;
      toast.success('Campagne supprimée');
      onRefresh();
    } catch (error) {
      console.error('Error deleting campaign:', error);
      toast.error('Erreur lors de la suppression');
    } finally {
      setDeletingCampaignId(null);
    }
  };

  const totalViews = campaigns.reduce((acc, c) => acc + (c.views || 0), 0);
  const totalDownloads = campaigns.reduce((acc, c) => acc + (c.downloads || 0), 0);

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Image className="w-5 h-5 text-primary" />
              Gestion des campagnes ({campaigns.length})
            </CardTitle>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" /> {totalViews.toLocaleString()} vues
              </span>
              <span className="flex items-center gap-1">
                <Download className="w-4 h-4" /> {totalDownloads.toLocaleString()} téléchargements
              </span>
            </div>
          </div>
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
            {filteredCampaigns.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Aucune campagne trouvée</p>
            ) : (
              filteredCampaigns.map((campaign) => (
                <div 
                  key={campaign.id} 
                  className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-lg bg-background/50 border border-border/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Image className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{campaign.name}</p>
                      <p className="text-sm text-muted-foreground">/{campaign.slug}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-sm">
                      <Eye className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{(campaign.views || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Download className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{(campaign.downloads || 0).toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(campaign.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="icon" disabled={deletingCampaignId === campaign.id}>
                        {deletingCampaignId === campaign.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer cette campagne ?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Cette action supprimera définitivement "{campaign.name}" et toutes ses données.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteCampaign(campaign.id)}>
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
