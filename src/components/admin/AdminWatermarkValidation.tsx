import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { 
  Droplets, Search, RefreshCw, Loader2, CheckCircle2, XCircle, 
  Clock, ExternalLink, User, Calendar, Image, CreditCard, Globe, Phone
} from 'lucide-react';
import { toast } from 'sonner';

interface PendingWatermarkCampaign {
  id: string;
  title: string;
  frame_image: string | null;
  watermark_status: string;
  watermark_removal_requested_at: string | null;
  watermark_transaction_code?: string | null;
  watermark_payment_country?: string | null;
  watermark_payment_amount?: number | null;
  slug: string | null;
  created_at: string;
  user_id: string;
  owner_name?: string;
  owner_email?: string;
}

const countryLabels: Record<string, string> = {
  BF: '🇧🇫 Burkina Faso',
  CI: '🇨🇮 Côte d\'Ivoire',
  ML: '🇲🇱 Mali',
  OTHER: '🌍 Autre',
};

interface AdminWatermarkValidationProps {
  campaigns: PendingWatermarkCampaign[];
  onRefresh: () => void;
  isLoading: boolean;
}

export function AdminWatermarkValidation({ campaigns, onRefresh, isLoading }: AdminWatermarkValidationProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Filter only pending watermark removal requests
  const pendingCampaigns = campaigns.filter(
    c => c.watermark_status === 'pending'
  );

  const filteredCampaigns = pendingCampaigns.filter(campaign => 
    campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    campaign.owner_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleApprove = async (campaignId: string) => {
    setProcessingId(campaignId);
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ watermark_status: 'removed' })
        .eq('id', campaignId);

      if (error) throw error;
      
      toast.success('Filigrane retiré ! Le visuel est maintenant sans filigrane.');
      onRefresh();
    } catch (error) {
      console.error('Error removing watermark:', error);
      toast.error('Erreur lors du retrait du filigrane');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (campaignId: string) => {
    setProcessingId(campaignId);
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ 
          watermark_status: 'active',
          watermark_removal_requested_at: null 
        })
        .eq('id', campaignId);

      if (error) throw error;
      
      toast.success('Demande rejetée. Le filigrane reste actif.');
      onRefresh();
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Erreur lors du rejet');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Droplets className="w-5 h-5 text-blue-500" />
              Retrait de filigrane
              {pendingCampaigns.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {pendingCampaigns.length} en attente
                </Badge>
              )}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Validez les demandes de retrait du filigrane "créé sur jyserai.site"
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par titre..."
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
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle2 className="w-12 h-12 mx-auto text-green-500 mb-4" />
            <p className="text-muted-foreground">Aucune demande de retrait en attente</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCampaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/5 space-y-4"
              >
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-secondary shrink-0">
                      {campaign.frame_image ? (
                        <img 
                          src={campaign.frame_image} 
                          alt={campaign.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/10">
                          <Image className="w-6 h-6 text-primary" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{campaign.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <User className="w-3 h-3" />
                        <span>{campaign.owner_name || 'Utilisateur inconnu'}</span>
                        {campaign.owner_email && (
                          <span className="text-xs">({campaign.owner_email})</span>
                        )}
                      </div>
                      {campaign.watermark_removal_requested_at && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <Calendar className="w-3 h-3" />
                          Demandé le {new Date(campaign.watermark_removal_requested_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30">
                    <Clock className="w-3 h-3 mr-1" />
                    En attente
                  </Badge>
                </div>

                {/* Payment Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-background/80 border">
                    <CreditCard className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Code transaction</p>
                      <p className="font-mono font-bold text-sm">{campaign.watermark_transaction_code || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-background/80 border">
                    <Globe className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Pays</p>
                      <p className="font-medium text-sm">
                        {countryLabels[campaign.watermark_payment_country || ''] || campaign.watermark_payment_country || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-background/80 border">
                    <Phone className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Montant</p>
                      <p className="font-bold text-sm text-green-600">
                        {(campaign.watermark_payment_amount || 0).toLocaleString()} FCFA
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t">
                  {campaign.slug && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(`/${campaign.slug}`, '_blank')}
                      className="gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Prévisualiser
                    </Button>
                  )}
                  <div className="flex-1" />
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-destructive border-destructive/30 hover:bg-destructive/10"
                        disabled={processingId === campaign.id}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Rejeter
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Rejeter cette demande ?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Le filigrane restera actif sur la campagne "{campaign.title}".
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleReject(campaign.id)}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Rejeter
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <Button 
                    size="sm" 
                    onClick={() => handleApprove(campaign.id)}
                    disabled={processingId === campaign.id}
                    className="gap-2 bg-green-600 hover:bg-green-700"
                  >
                    {processingId === campaign.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    Retirer le filigrane
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
