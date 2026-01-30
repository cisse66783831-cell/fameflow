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
import { Image, Search, Trash2, RefreshCw, Loader2, Eye, Download, ExternalLink, User, TrendingUp, Star, StarOff, Video, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Campaign {
  id: string;
  title: string;
  slug: string | null;
  frame_image: string | null;
  is_featured: boolean;
  views: number | null;
  downloads: number | null;
  created_at: string;
  user_id: string;
  owner_name?: string;
  type?: string;
  payment_status?: string;
  transaction_code?: string | null;
  payment_country?: string | null;
  payment_amount?: number | null;
}

interface AdminCampaignListProps {
  campaigns: Campaign[];
  onRefresh: () => void;
  isLoading: boolean;
}

export function AdminCampaignList({ campaigns, onRefresh, isLoading }: AdminCampaignListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingCampaignId, setDeletingCampaignId] = useState<string | null>(null);
  const [featuringId, setFeaturingId] = useState<string | null>(null);

  const filteredCampaigns = campaigns.filter(campaign => 
    campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    campaign.slug?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    campaign.owner_name?.toLowerCase().includes(searchQuery.toLowerCase())
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

  const handleToggleFeature = async (campaign: Campaign) => {
    setFeaturingId(campaign.id);
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ 
          is_featured: !campaign.is_featured,
          display_order: !campaign.is_featured ? 0 : 999 
        })
        .eq('id', campaign.id);

      if (error) throw error;
      toast.success(campaign.is_featured ? 'Retiré de la landing' : 'Mis en avant sur la landing');
      onRefresh();
    } catch (error) {
      console.error('Error toggling feature:', error);
      toast.error('Erreur lors de la modification');
    } finally {
      setFeaturingId(null);
    }
  };

  const totalViews = campaigns.reduce((acc, c) => acc + (c.views || 0), 0);
  const totalDownloads = campaigns.reduce((acc, c) => acc + (c.downloads || 0), 0);
  const pendingCount = campaigns.filter(c => c.payment_status === 'pending').length;

  const getConversionRate = (views: number, downloads: number) => {
    if (views === 0) return 0;
    return ((downloads / views) * 100).toFixed(1);
  };

  const getPaymentStatusBadge = (status: string | undefined, type: string | undefined) => {
    if (type === 'video_filter') {
      switch (status) {
        case 'approved':
          return (
            <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 border-green-200">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Approuvé
            </Badge>
          );
        case 'pending':
          return (
            <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700 border-orange-200">
              <Clock className="w-3 h-3 mr-1" />
              En attente
            </Badge>
          );
        case 'rejected':
          return (
            <Badge variant="secondary" className="text-xs bg-red-100 text-red-700 border-red-200">
              <XCircle className="w-3 h-3 mr-1" />
              Rejeté
            </Badge>
          );
        default:
          return null;
      }
    }
    return null;
  };

  const getCampaignTypeIcon = (type: string | undefined) => {
    if (type === 'video_filter') {
      return <Video className="w-4 h-4 text-orange-500" />;
    }
    return <Image className="w-4 h-4 text-primary" />;
  };

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
              filteredCampaigns.map((campaign) => {
                const convRate = getConversionRate(campaign.views || 0, campaign.downloads || 0);
                const isVideoType = campaign.type === 'video_filter';
                return (
                  <div
                    key={campaign.id} 
                    className={`flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-lg bg-background/50 border transition-colors ${
                      campaign.payment_status === 'pending' 
                        ? 'border-orange-500/30 bg-orange-500/5' 
                        : 'border-border/30 hover:border-primary/30'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-secondary shrink-0 relative">
                        {campaign.frame_image ? (
                          <img 
                            src={campaign.frame_image} 
                            alt={campaign.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary/10">
                            {getCampaignTypeIcon(campaign.type)}
                          </div>
                        )}
                        {isVideoType && (
                          <div className="absolute bottom-0 right-0 bg-orange-500 p-0.5 rounded-tl">
                            <Video className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium truncate">{campaign.title}</p>
                          {campaign.is_featured && (
                            <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700 border-amber-200">
                              <Star className="w-3 h-3 mr-1 fill-amber-500" />
                              En avant
                            </Badge>
                          )}
                          {getPaymentStatusBadge(campaign.payment_status, campaign.type)}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="truncate">/{campaign.slug}</span>
                          {campaign.owner_name && (
                            <span className="flex items-center gap-1 text-xs">
                              <User className="w-3 h-3" />
                              {campaign.owner_name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2 text-sm">
                      <Eye className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{(campaign.views || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Download className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{(campaign.downloads || 0).toLocaleString()}</span>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${Number(convRate) > 10 ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
                      <TrendingUp className="w-3 h-3" />
                      {convRate}%
                    </span>
                    <p className="text-xs text-muted-foreground">
                      {new Date(campaign.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button 
                      variant={campaign.is_featured ? "default" : "outline"}
                      size="icon"
                      onClick={() => handleToggleFeature(campaign)}
                      disabled={featuringId === campaign.id}
                      title={campaign.is_featured ? "Retirer de la landing" : "Mettre en avant"}
                      className={campaign.is_featured ? "bg-amber-500 hover:bg-amber-600" : ""}
                    >
                      {featuringId === campaign.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : campaign.is_featured ? (
                        <StarOff className="w-4 h-4" />
                      ) : (
                        <Star className="w-4 h-4" />
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => window.open(`/${campaign.slug}`, '_blank')}
                      title="Voir sur le site"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
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
                            Cette action supprimera définitivement "{campaign.title}" et toutes ses données.
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
                </div>
                );
              })
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
