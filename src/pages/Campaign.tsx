import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Campaign } from '@/types/campaign';
import { PhotoEditor } from '@/components/PhotoEditor';
import { supabase } from '@/integrations/supabase/client';
import { mapDbToCampaign } from '@/lib/mapDbToCampaign';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Helmet } from 'react-helmet-async';
import { trackDownload } from '@/utils/trackDownload';
import { trackPageView } from '@/utils/trackPageView';

const CampaignPage = () => {
  const { id } = useParams<{ id: string }>();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCampaign = async () => {
      if (!id) {
        setError('Campaign not found');
        setIsLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', id)
        .in('payment_status', ['free', 'approved'])
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching campaign:', fetchError);
        setError('Failed to load campaign');
      } else if (!data) {
        setError('Campaign not found');
      } else {
        setCampaign(mapDbToCampaign(data));
        supabase.rpc('increment_campaign_views', { campaign_id: id });
      }
      setIsLoading(false);
    };

    fetchCampaign();
  }, [id]);

  useEffect(() => {
    if (!id || !campaign) return;
    const cleanup = trackPageView({ campaignId: id });
    return cleanup;
  }, [id, campaign]);

  const handleDownload = async (mediaType: 'photo' | 'pdf' = 'photo') => {
    if (!campaign) return;
    
    await trackDownload({
      campaignId: campaign.id,
      mediaType: mediaType === 'pdf' ? 'pdf' : 'photo',
    });
    
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
        <h1 className="text-2xl font-display font-bold text-foreground">
          {error || 'Campagne introuvable'}
        </h1>
        <p className="text-muted-foreground">
          Cette campagne a peut-être été supprimée ou n'existe pas.
        </p>
        <Link to="/">
          <Button variant="gradient">
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
        <title>{campaign.title} | Jyserai</title>
        <meta name="description" content={campaign.description || `Utilisez le template "${campaign.title}" pour créer votre contenu personnalisé.`} />
        <meta property="og:title" content={campaign.title} />
        <meta property="og:description" content={campaign.description || 'Créez votre contenu personnalisé avec Jyserai'} />
        <meta property="og:image" content={campaign.frameImage} />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <span className="text-white font-bold text-sm">JY</span>
              </div>
              <span className="font-display font-bold text-lg">Jyserai</span>
            </Link>
            
            <Link to="/auth">
              <Button variant="outline" size="sm">
                Créer le vôtre
              </Button>
            </Link>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold text-foreground">
              {campaign.title}
            </h1>
            {campaign.description && (
              <p className="text-muted-foreground mt-2">
                {campaign.description}
              </p>
            )}
          </div>

          <PhotoEditor campaign={campaign} onDownload={handleDownload} />
        </main>

        <footer className="border-t border-border py-6 mt-12">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <p>
              Propulsé par{' '}
              <Link to="/" className="text-primary hover:underline">
                Jyserai
              </Link>
              {' '}— Créez vos campagnes gratuitement
            </p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default CampaignPage;
