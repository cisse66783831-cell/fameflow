import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { Image, Trash2, RefreshCw, Loader2, Check, X, ExternalLink, Star, StarOff, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';

interface PublicVisual {
  id: string;
  event_id: string | null;
  campaign_id: string | null;
  visual_url: string;
  creator_name: string | null;
  is_approved: boolean | null;
  is_featured: boolean | null;
  created_at: string;
}

interface AdminModerationPanelProps {
  visuals: PublicVisual[];
  onRefresh: () => void;
  isLoading: boolean;
}

export function AdminModerationPanel({ visuals, onRefresh, isLoading }: AdminModerationPanelProps) {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllApproved, setShowAllApproved] = useState(false);

  // Filter visuals based on search
  const filteredVisuals = visuals.filter(v => 
    !searchQuery || 
    v.creator_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingVisuals = filteredVisuals.filter(v => v.is_approved === null || v.is_approved === false);
  const approvedVisuals = filteredVisuals.filter(v => v.is_approved === true);
  const featuredVisuals = filteredVisuals.filter(v => v.is_featured === true);

  const handleApprove = async (visualId: string) => {
    setProcessingId(visualId);
    try {
      const { error } = await supabase
        .from('public_visuals')
        .update({ is_approved: true })
        .eq('id', visualId);

      if (error) throw error;
      toast.success('Visuel approuvé');
      onRefresh();
    } catch (error) {
      console.error('Error approving visual:', error);
      toast.error('Erreur lors de l\'approbation');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (visualId: string) => {
    setProcessingId(visualId);
    try {
      const { error } = await supabase
        .from('public_visuals')
        .update({ is_approved: false })
        .eq('id', visualId);

      if (error) throw error;
      toast.success('Visuel rejeté');
      onRefresh();
    } catch (error) {
      console.error('Error rejecting visual:', error);
      toast.error('Erreur lors du rejet');
    } finally {
      setProcessingId(null);
    }
  };

  // Feature a visual - also auto-approves if not approved yet
  const handleFeature = async (visualId: string, featured: boolean, isCurrentlyApproved: boolean | null) => {
    setProcessingId(visualId);
    try {
      const updateData: { is_featured: boolean; is_approved?: boolean } = { is_featured: featured };
      
      // Auto-approve when featuring
      if (featured && !isCurrentlyApproved) {
        updateData.is_approved = true;
      }

      const { error } = await supabase
        .from('public_visuals')
        .update(updateData)
        .eq('id', visualId);

      if (error) throw error;
      
      if (featured && !isCurrentlyApproved) {
        toast.success('Visuel approuvé et mis en avant sur la landing page');
      } else {
        toast.success(featured ? 'Visuel mis en avant sur la landing page' : 'Visuel retiré de la landing page');
      }
      onRefresh();
    } catch (error) {
      console.error('Error featuring visual:', error);
      toast.error('Erreur lors de la mise en avant');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (visualId: string) => {
    setProcessingId(visualId);
    try {
      const { error } = await supabase
        .from('public_visuals')
        .delete()
        .eq('id', visualId);

      if (error) throw error;
      toast.success('Visuel supprimé');
      onRefresh();
    } catch (error) {
      console.error('Error deleting visual:', error);
      toast.error('Erreur lors de la suppression');
    } finally {
      setProcessingId(null);
    }
  };

  const renderVisualCard = (visual: PublicVisual, showApprovalButtons: boolean) => (
    <div 
      key={visual.id}
      className={`relative group rounded-lg overflow-hidden border bg-background/50 transition-all hover:shadow-lg ${
        visual.is_featured 
          ? 'border-yellow-500/50 ring-2 ring-yellow-500/20' 
          : 'border-border/30 hover:border-primary/30'
      }`}
    >
      {/* Featured badge */}
      {visual.is_featured && (
        <div className="absolute top-2 left-2 z-10 px-2 py-1 bg-yellow-500 text-yellow-950 text-xs font-bold rounded-full flex items-center gap-1">
          <Star className="w-3 h-3 fill-current" />
          Landing
        </div>
      )}

      {/* Image */}
      <div className="aspect-square relative">
        <img 
          src={visual.visual_url} 
          alt={visual.creator_name || 'Visual'} 
          className="w-full h-full object-cover"
        />
        <a 
          href={visual.visual_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ExternalLink className="w-4 h-4" />
        </a>

        {/* Quick feature button on hover */}
        <button
          onClick={() => handleFeature(visual.id, !visual.is_featured, visual.is_approved)}
          disabled={processingId === visual.id}
          className={`absolute bottom-2 right-2 p-2 rounded-full transition-all opacity-0 group-hover:opacity-100 ${
            visual.is_featured 
              ? 'bg-yellow-500 text-yellow-950 hover:bg-yellow-400' 
              : 'bg-black/70 text-white hover:bg-primary'
          }`}
          title={visual.is_featured ? 'Retirer de la landing page' : 'Mettre sur la landing page'}
        >
          {processingId === visual.id ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : visual.is_featured ? (
            <StarOff className="w-4 h-4" />
          ) : (
            <Star className="w-4 h-4" />
          )}
        </button>
      </div>
      
      {/* Info */}
      <div className="p-3">
        <p className="font-medium text-sm truncate">{visual.creator_name || 'Anonyme'}</p>
        <p className="text-xs text-muted-foreground">
          {new Date(visual.created_at).toLocaleDateString('fr-FR')}
        </p>
        
        <div className="flex items-center gap-2 mt-3">
          {showApprovalButtons ? (
            <>
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1"
                onClick={() => handleApprove(visual.id)}
                disabled={processingId === visual.id}
              >
                {processingId === visual.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    Approuver
                  </>
                )}
              </Button>
              <Button 
                size="sm" 
                variant="secondary"
                onClick={() => handleReject(visual.id)}
                disabled={processingId === visual.id}
              >
                <X className="w-4 h-4" />
              </Button>
              {/* Feature button even on pending */}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleFeature(visual.id, true, visual.is_approved)}
                disabled={processingId === visual.id}
                className="text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10"
                title="Approuver et mettre en avant"
              >
                <Star className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              <Badge className="bg-green-500/20 text-green-400 border-0">Approuvé</Badge>
              <div className="flex-1" />
              <Button
                size="sm"
                variant={visual.is_featured ? "secondary" : "ghost"}
                onClick={() => handleFeature(visual.id, !visual.is_featured, visual.is_approved)}
                disabled={processingId === visual.id}
                className={visual.is_featured ? 'text-yellow-500' : 'text-muted-foreground hover:text-yellow-500'}
                title={visual.is_featured ? 'Retirer de la landing' : 'Mettre sur la landing'}
              >
                {visual.is_featured ? <StarOff className="w-4 h-4" /> : <Star className="w-4 h-4" />}
              </Button>
            </>
          )}
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10" disabled={processingId === visual.id}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer ce visuel ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action est irréversible. Le visuel sera définitivement supprimé.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleDelete(visual.id)}>
                  Supprimer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Image className="w-5 h-5 text-warning" />
              Modération des visuels publics
            </CardTitle>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span>En attente : <span className="font-semibold text-warning">{pendingVisuals.length}</span></span>
              <span>Approuvés : <span className="font-semibold text-success">{approvedVisuals.length}</span></span>
              <span>Sur la landing : <span className="font-semibold text-yellow-500">{featuredVisuals.length}</span></span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Search input */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-48"
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
          <div className="space-y-6">
            {/* Pending visuals */}
            {pendingVisuals.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-3 text-warning flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  En attente d'approbation ({pendingVisuals.length})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {pendingVisuals.map(visual => renderVisualCard(visual, true))}
                </div>
              </div>
            )}

            {/* Approved visuals */}
            {approvedVisuals.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-success flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    Visuels approuvés ({approvedVisuals.length})
                  </h3>
                  {approvedVisuals.length > 10 && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowAllApproved(!showAllApproved)}
                    >
                      {showAllApproved ? 'Voir moins' : `Voir tout (${approvedVisuals.length})`}
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {(showAllApproved ? approvedVisuals : approvedVisuals.slice(0, 10)).map(visual => renderVisualCard(visual, false))}
                </div>
              </div>
            )}

            {filteredVisuals.length === 0 && (
              <div className="text-center py-8">
                {searchQuery ? (
                  <p className="text-muted-foreground">Aucun visuel trouvé pour "{searchQuery}"</p>
                ) : (
                  <p className="text-muted-foreground">Aucun visuel à modérer</p>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
