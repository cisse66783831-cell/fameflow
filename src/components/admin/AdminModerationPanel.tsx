import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { Image, Trash2, RefreshCw, Loader2, Check, X, ExternalLink, Star, StarOff } from 'lucide-react';
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

  const pendingVisuals = visuals.filter(v => v.is_approved === null || v.is_approved === false);
  const approvedVisuals = visuals.filter(v => v.is_approved === true);
  const featuredVisuals = visuals.filter(v => v.is_featured === true);

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

  const handleFeature = async (visualId: string, featured: boolean) => {
    setProcessingId(visualId);
    try {
      const { error } = await supabase
        .from('public_visuals')
        .update({ is_featured: featured })
        .eq('id', visualId);

      if (error) throw error;
      toast.success(featured ? 'Visuel mis en avant' : 'Visuel retiré de la mise en avant');
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
      className={`relative group rounded-lg overflow-hidden border bg-background/50 ${visual.is_featured ? 'border-yellow-500/50 ring-2 ring-yellow-500/20' : 'border-border/30'}`}
    >
      {visual.is_featured && (
        <div className="absolute top-2 left-2 z-10 px-2 py-1 bg-yellow-500 text-yellow-950 text-xs font-bold rounded-full flex items-center gap-1">
          <Star className="w-3 h-3" />
          Mis en avant
        </div>
      )}
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
      </div>
      
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
            </>
          ) : (
            <>
              <Badge className="bg-green-500/20 text-green-400">Approuvé</Badge>
              <Button
                size="sm"
                variant={visual.is_featured ? "secondary" : "outline"}
                onClick={() => handleFeature(visual.id, !visual.is_featured)}
                disabled={processingId === visual.id}
                className={visual.is_featured ? 'text-yellow-500' : ''}
                title={visual.is_featured ? 'Retirer de la mise en avant' : 'Mettre en avant'}
              >
                {visual.is_featured ? <StarOff className="w-4 h-4" /> : <Star className="w-4 h-4" />}
              </Button>
            </>
          )}
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="destructive" disabled={processingId === visual.id}>
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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Image className="w-5 h-5 text-warning" />
              Modération des visuels publics
            </CardTitle>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span>En attente : <span className="font-semibold text-warning">{pendingVisuals.length}</span></span>
              <span>Approuvés : <span className="font-semibold text-success">{approvedVisuals.length}</span></span>
              <span>Mis en avant : <span className="font-semibold text-yellow-500">{featuredVisuals.length}</span></span>
            </div>
          </div>
          <Button variant="outline" size="icon" onClick={onRefresh} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
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
                <h3 className="text-sm font-medium mb-3 text-warning">En attente d'approbation</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {pendingVisuals.map(visual => renderVisualCard(visual, true))}
                </div>
              </div>
            )}

            {/* Approved visuals */}
            {approvedVisuals.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-3 text-success">Visuels approuvés</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {approvedVisuals.slice(0, 10).map(visual => renderVisualCard(visual, false))}
                </div>
                {approvedVisuals.length > 10 && (
                  <p className="text-center text-sm text-muted-foreground mt-4">
                    Et {approvedVisuals.length - 10} autres visuels approuvés...
                  </p>
                )}
              </div>
            )}

            {visuals.length === 0 && (
              <p className="text-center text-muted-foreground py-8">Aucun visuel à modérer</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
