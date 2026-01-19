import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Campaign } from '@/types/campaign';
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

const VideoFilterPublicPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCampaign = async () => {
      if (!slug) {
        setError('Filtre introuvable');
        setIsLoading(false);
        return;
      }

      // First try by slug
      let { data, error: fetchError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('slug', slug)
        .eq('type', 'video_filter')
        .maybeSingle();

      // If not found by slug, try by ID
      if (!data && !fetchError) {
        const { data: dataById, error: errorById } = await supabase
          .from('campaigns')
          .select('*')
          .eq('id', slug)
          .eq('type', 'video_filter')
          .maybeSingle();
        data = dataById;
        fetchError = errorById;
      }

      if (fetchError) {
        console.error('Error fetching campaign:', fetchError);
        setError('Impossible de charger le filtre');
      } else if (!data) {
        setError('Filtre introuvable');
      } else {
        setCampaign(mapDbToCampaign(data));
        // Increment views
        supabase.rpc('increment_campaign_views', { campaign_id: data.id });
      }
      setIsLoading(false);
    };

    fetchCampaign();
  }, [slug]);

  const handleDownload = async () => {
    if (!campaign) return;
    
    // Track download in download_stats (works for anonymous users)
    await trackDownload({
      campaignId: campaign.id,
      mediaType: 'video',
    });
    
    // Update campaign counter using RPC (atomic, works for anonymous users)
    await supabase.rpc('increment_campaign_downloads', { campaign_id: campaign.id });
    
    setCampaign(prev => prev ? { ...prev, downloads: prev.downloads + 1 } : null);
  };

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
        <Video className="w-16 h-16 text-muted-foreground" />
        <h1 className="text-2xl font-display font-bold text-foreground">
          {error || 'Filtre introuvable'}
        </h1>
        <p className="text-muted-foreground">
          Ce filtre vidéo n'existe pas ou a été supprimé.
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
        <title>{campaign.title} - Filtre Vidéo | Jyserai</title>
        <meta name="description" content={campaign.description || `Enregistrez votre vidéo avec le filtre "${campaign.title}" et partagez-la !`} />
        <meta property="og:title" content={`${campaign.title} - Filtre Vidéo | Jyserai`} />
        <meta property="og:description" content={campaign.description || 'Créez votre vidéo personnalisée avec Jyserai'} />
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
                Créer mon filtre
              </Button>
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="container mx-auto px-4 py-8">
          {/* Title Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-chart-1/10 border border-chart-1/20 text-chart-1 text-sm font-medium mb-4">
              <Video className="w-4 h-4" />
              <span>Filtre Vidéo</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              {campaign.title}
            </h1>
            {campaign.description && (
              <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
                {campaign.description}
              </p>
            )}
          </div>

          {/* Video Recorder */}
          <div className="max-w-2xl mx-auto">
            <VideoRecorder 
              frameImagePortrait={campaign.frameImagePortrait}
              frameImageLandscape={campaign.frameImageLandscape || campaign.frameImage}
              campaignTitle={campaign.title}
              onDownload={handleDownload}
            />
          </div>

          {/* Hashtags */}
          {campaign.hashtags && campaign.hashtags.length > 0 && (
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

          {/* Stats */}
          <div className="mt-8 flex justify-center gap-8 text-sm text-muted-foreground">
            <span>{campaign.views} vues</span>
            <span>{campaign.downloads} téléchargements</span>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border py-6 mt-12">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <p>
              Propulsé par{' '}
              <Link to="/" className="text-primary hover:underline">
                Jyserai
              </Link>
              {' '}— Créez vos filtres vidéo gratuitement
            </p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default VideoFilterPublicPage;
