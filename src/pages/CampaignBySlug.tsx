import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Campaign } from '@/types/campaign';
import { PhotoEditor } from '@/components/PhotoEditor';
import { VideoRecorder } from '@/components/VideoRecorder';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';
import { TextElement } from '@/types/campaign';
import { ArrowLeft, Loader2, Sparkles, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Helmet } from 'react-helmet-async';
import { trackDownload } from '@/utils/trackDownload';

const mapDbToCampaign = (db: {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  type: string;
  frame_image: string;
  frame_image_portrait: string | null;
  frame_image_landscape: string | null;
  background_image: string | null;
  text_elements: Json;
  hashtags: string[];
  views: number;
  downloads: number;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
  slug?: string | null;
}): Campaign & { slug?: string | null } => ({
  id: db.id,
  title: db.title,
  description: db.description || '',
  type: db.type as 'photo' | 'document' | 'video_filter',
  frameImage: db.frame_image,
  frameImagePortrait: db.frame_image_portrait || undefined,
  frameImageLandscape: db.frame_image_landscape || undefined,
  backgroundImage: db.background_image || undefined,
  textElements: db.text_elements as unknown as TextElement[],
  hashtags: db.hashtags,
  views: db.views,
  downloads: db.downloads,
  createdAt: new Date(db.created_at),
  isDemo: db.is_demo,
  slug: db.slug,
});

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

      // First try by slug
      let { data, error: fetchError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      // If not found by slug, try by ID (backwards compatibility)
      if (!data && !fetchError) {
        const { data: dataById, error: errorById } = await supabase
          .from('campaigns')
          .select('*')
          .eq('id', slug)
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
        // Increment views
        supabase.rpc('increment_campaign_views', { campaign_id: data.id });
      }
      setIsLoading(false);
    };

    fetchCampaign();
  }, [slug]);

  const handleDownload = async (mediaType: 'photo' | 'pdf' = 'photo') => {
    if (!campaign) return;
    
    // Track download in download_stats (works for anonymous users)
    await trackDownload({
      campaignId: campaign.id,
      mediaType: mediaType === 'pdf' ? 'pdf' : 'photo',
    });
    
    // Also update the campaign counter
    await supabase
      .from('campaigns')
      .update({ downloads: campaign.downloads + 1 })
      .eq('id', campaign.id);
    
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
        {/* Header */}
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

        {/* Content */}
        <main className="container mx-auto px-4 py-8">
          {/* Title Section */}
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

          {/* Content based on type */}
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

          {/* Hashtags (for video filters) */}
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

          {/* Stats (for video filters) */}
          {isVideoFilter && (
            <div className="mt-8 flex justify-center gap-8 text-sm text-muted-foreground">
              <span>{campaign.views} vues</span>
              <span>{campaign.downloads} téléchargements</span>
            </div>
          )}
        </main>

        {/* Footer */}
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
