import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Campaign } from '@/types/campaign';
import { PhotoEditor } from '@/components/PhotoEditor';
import { VideoRecorder } from '@/components/VideoRecorder';
import { supabase } from '@/integrations/supabase/client';
import { mapDbToCampaign } from '@/lib/mapDbToCampaign';
import { ArrowLeft, Loader2, Sparkles, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Helmet } from 'react-helmet-async';
import { trackDownload } from '@/utils/trackDownload';
import { trackPageView } from '@/utils/trackPageView';

const CampaignBySlugPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCampaign = async () => {
      if (!slug) {
        setError('Campagne introuvable');
        setIsLoading(false);
        return;
      }

      // First try by slug (only show approved or free campaigns)
      let { data, error: fetchError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('slug', slug)
        .in('payment_status', ['free', 'approved'])
        .maybeSingle();

      // If not found by slug, try by ID (backwards compatibility)
      if (!data && !fetchError) {
        const { data: dataById, error: errorById } = await supabase
          .from('campaigns')
          .select('*')
          .eq('id', slug)
          .in('payment_status', ['free', 'approved'])
          .maybeSingle();
        data = dataById;
        fetchError = errorById;
      }

      if (fetchError) {
        console.error('Error fetching campaign:', fetchError);
        setError('Impossible de charger la campagne');
      } else if (!data) {
        setError('Campagne introuvable');
      } else {
        setCampaign(mapDbToCampaign(data));
        supabase.rpc('increment_campaign_views', { campaign_id: data.id });
      }
      setIsLoading(false);
    };

    fetchCampaign();
  }, [slug]);

  useEffect(() => {
    if (!campaign) return;
    const cleanup = trackPageView({ campaignId: campaign.id });
    return cleanup;
  }, [campaign]);

  const handleDownload = async (mediaType: 'photo' | 'pdf' = 'photo') => {
    if (!campaign) return;
    
    await trackDownload({
      campaignId: campaign.id,
      mediaType: mediaType === 'pdf' ? 'pdf' : 'photo',
    });
    
    await supabase.rpc('increment_campaign_downloads', { campaign_id: campaign.id });
    setCampaign(prev => prev ? { ...prev, downloads: prev.downloads + 1 } : null);
  };

  const isVideoFilter = campaign?.type === 'video_filter';

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <h1 className="text-2xl font-display font-bold text-foreground">
          {error || 'Campagne introuvable'}
        </h1>
        <p className="text-muted-foreground">
          Cette campagne n'existe pas ou a été supprimée.
        </p>
        <Link to="/">
          <Button className="btn-neon gradient-primary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à l'accueil
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{campaign.title}{isVideoFilter ? ' - Filtre Vidéo' : ''} | Jyserai</title>
        <meta name="description" content={campaign.description || (isVideoFilter ? `Enregistrez votre vidéo avec le filtre "${campaign.title}" et partagez-la !` : `Créez votre visuel "${campaign.title}" et partagez-le sur vos réseaux !`)} />
        <meta property="og:title" content={`${campaign.title}${isVideoFilter ? ' - Filtre Vidéo' : ''} | Jyserai`} />
        <meta property="og:description" content={campaign.description || (isVideoFilter ? 'Créez votre vidéo personnalisée avec Jyserai' : 'Créez votre visuel personnalisé avec Jyserai')} />
        <meta property="og:image" content={campaign.frameImagePortrait || campaign.frameImageLandscape || campaign.frameImage} />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="p-2 rounded-xl gradient-neon">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-lg text-gradient-neon">Jyserai</span>
            </Link>
            
            <Link to="/auth">
              <Button variant="outline" size="sm">
                {isVideoFilter ? 'Créer mon filtre' : 'Créer mon événement'}
              </Button>
            </Link>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className={isVideoFilter ? "text-center mb-8" : "mb-8"}>
            {isVideoFilter && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-chart-1/10 border border-chart-1/20 text-chart-1 text-sm font-medium mb-4">
                <Video className="w-4 h-4" />
                <span>Filtre Vidéo</span>
              </div>
            )}
            <h1 className={isVideoFilter ? "text-3xl md:text-4xl font-display font-bold text-foreground" : "text-3xl font-display font-bold text-foreground"}>
              {campaign.title}
            </h1>
            {campaign.description && (
              <p className={isVideoFilter ? "text-muted-foreground mt-2 max-w-lg mx-auto" : "text-muted-foreground mt-2"}>
                {campaign.description}
              </p>
            )}
          </div>

          {isVideoFilter ? (
            <div className="max-w-2xl mx-auto">
              <VideoRecorder 
                frameImagePortrait={campaign.frameImagePortrait}
                frameImageLandscape={campaign.frameImageLandscape || campaign.frameImage}
                campaignTitle={campaign.title}
                campaignId={campaign.id}
                onDownload={handleDownload}
              />
            </div>
          ) : (
            <PhotoEditor campaign={campaign} onDownload={handleDownload} />
          )}

          {isVideoFilter && campaign.hashtags && campaign.hashtags.length > 0 && (
            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground mb-2">Partagez avec</p>
              <div className="flex flex-wrap justify-center gap-2">
                {campaign.hashtags.map((tag, i) => (
                  <span 
                    key={i}
                    className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {isVideoFilter && (
            <div className="mt-8 flex justify-center gap-8 text-sm text-muted-foreground">
              <span>{campaign.views} vues</span>
              <span>{campaign.downloads} téléchargements</span>
            </div>
          )}
        </main>

        <footer className="border-t border-border py-6 mt-12">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <p>
              Propulsé par{' '}
              <Link to="/" className="text-primary hover:underline">
                Jyserai
              </Link>
              {' '}— {isVideoFilter ? 'Créez vos filtres vidéo gratuitement' : 'Créez vos campagnes gratuitement'}
            </p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default CampaignBySlugPage;
