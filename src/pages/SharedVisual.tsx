import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Share2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface SharedVisual {
  id: string;
  event_id: string | null;
  campaign_id: string | null;
  creator_name: string;
  visual_url: string;
  description: string | null;
  created_at: string;
  views: number;
}

interface EventData {
  id: string;
  title: string;
  description: string | null;
}

interface CampaignData {
  id: string;
  title: string;
  description: string | null;
}

export default function SharedVisual() {
  const { id } = useParams<{ id: string }>();
  const [visual, setVisual] = useState<SharedVisual | null>(null);
  const [parentData, setParentData] = useState<EventData | CampaignData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVisual = async () => {
      if (!id) {
        setError('ID manquant');
        setIsLoading(false);
        return;
      }

      try {
        // Fetch the shared visual
        const { data: visualData, error: visualError } = await supabase
          .from('shared_visuals')
          .select('*')
          .eq('id', id)
          .single();

        if (visualError || !visualData) {
          setError('Visuel non trouvé');
          setIsLoading(false);
          return;
        }

        setVisual(visualData as SharedVisual);

        // Increment view count
        await supabase
          .from('shared_visuals')
          .update({ views: (visualData.views || 0) + 1 })
          .eq('id', id);

        // Fetch parent event or campaign
        if (visualData.event_id) {
          const { data: eventData } = await supabase
            .from('events')
            .select('id, title, description')
            .eq('id', visualData.event_id)
            .single();
          setParentData(eventData);
        } else if (visualData.campaign_id) {
          const { data: campaignData } = await supabase
            .from('campaigns')
            .select('id, title, description')
            .eq('id', visualData.campaign_id)
            .single();
          setParentData(campaignData);
        }
      } catch (err) {
        console.error('Error fetching visual:', err);
        setError('Erreur de chargement');
      }

      setIsLoading(false);
    };

    fetchVisual();
  }, [id]);

  const handleDownload = () => {
    if (!visual) return;
    
    const link = document.createElement('a');
    link.href = visual.visual_url;
    link.download = `jyserai-${visual.creator_name.replace(/\s+/g, '-')}.png`;
    link.target = '_blank';
    link.click();
    
    toast.success('Téléchargement lancé !');
  };

  const handleShare = async () => {
    if (!visual || !parentData) return;

    const shareData = {
      title: `${visual.creator_name} sera à ${parentData.title}`,
      text: `J'y serai ! 🎉 Rejoins-moi à ${parentData.title}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Lien copié !');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !visual) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <h1 className="text-2xl font-bold text-foreground mb-4">Visuel non trouvé</h1>
        <p className="text-muted-foreground mb-6">Ce lien n'est plus valide ou le visuel a été supprimé.</p>
        <Link to="/">
          <Button>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à l'accueil
          </Button>
        </Link>
      </div>
    );
  }

  const title = parentData 
    ? `${visual.creator_name} sera à ${parentData.title}` 
    : `${visual.creator_name} - Jyserai`;
  
  const description = visual.description 
    || (parentData?.description) 
    || `${visual.creator_name} a créé son visuel "J'y serai" ! Rejoins-le sur Jyserai.`;

  const parentUrl = visual.event_id 
    ? `/events` 
    : visual.campaign_id 
      ? `/campaign/${visual.campaign_id}` 
      : '/';

  return (
    <>
      <Helmet>
        <title>{title} | Jyserai</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={visual.visual_url} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={visual.visual_url} />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center justify-between">
            <Link to={parentUrl} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span>Retour</span>
            </Link>
            <Link to="/" className="font-display text-xl font-bold text-primary">
              Jyserai
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="container py-8 max-w-lg mx-auto px-4">
          {/* Visual Image */}
          <div className="rounded-2xl overflow-hidden shadow-2xl mb-6">
            <img 
              src={visual.visual_url} 
              alt={title}
              className="w-full h-auto"
            />
          </div>

          {/* Info */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-display font-bold text-foreground mb-2">
              {visual.creator_name}
            </h1>
            {parentData && (
              <p className="text-lg text-muted-foreground">
                sera à <span className="text-primary font-semibold">{parentData.title}</span>
              </p>
            )}
            {visual.description && (
              <p className="mt-3 text-muted-foreground">{visual.description}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button 
              onClick={handleDownload}
              className="flex-1 gap-2"
              variant="outline"
            >
              <Download className="w-4 h-4" />
              Télécharger
            </Button>
            <Button 
              onClick={handleShare}
              className="flex-1 gap-2 gradient-primary"
            >
              <Share2 className="w-4 h-4" />
              Partager
            </Button>
          </div>

          {/* CTA */}
          <div className="mt-8 p-6 rounded-2xl bg-secondary text-center">
            <p className="text-lg font-medium text-foreground mb-3">
              Toi aussi, montre que tu y seras !
            </p>
            <Link to={parentUrl}>
              <Button className="gradient-primary">
                Créer mon visuel
              </Button>
            </Link>
          </div>
        </main>
      </div>
    </>
  );
}
