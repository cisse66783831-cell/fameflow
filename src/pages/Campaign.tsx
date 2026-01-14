import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Campaign } from '@/types/campaign';
import { PhotoEditor } from '@/components/PhotoEditor';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';
import { TextElement } from '@/types/campaign';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Helmet } from 'react-helmet-async';
import { trackDownload } from '@/utils/trackDownload';
import { trackPageView } from '@/utils/trackPageView';

const mapDbToCampaign = (db: {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  type: string;
  frame_image: string;
  background_image: string | null;
  text_elements: Json;
  hashtags: string[];
  views: number;
  downloads: number;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
}): Campaign => ({
  id: db.id,
  title: db.title,
  description: db.description || '',
  type: db.type as 'photo' | 'document',
  frameImage: db.frame_image,
  backgroundImage: db.background_image || undefined,
  textElements: db.text_elements as unknown as TextElement[],
  hashtags: db.hashtags,
  views: db.views,
  downloads: db.downloads,
  createdAt: new Date(db.created_at),
  isDemo: db.is_demo,
});

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
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching campaign:', fetchError);
        setError('Failed to load campaign');
      } else if (!data) {
        setError('Campaign not found');
      } else {
        setCampaign(mapDbToCampaign(data));
        // Increment views using RPC function (works for anonymous users)
        supabase.rpc('increment_campaign_views', { campaign_id: id });
      }
      setIsLoading(false);
    };

    fetchCampaign();
  }, [id]);

  // Track time on page
  useEffect(() => {
    if (!id || !campaign) return;
    const cleanup = trackPageView({ campaignId: id });
    return cleanup;
  }, [id, campaign]);

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
          {error || 'Campaign not found'}
        </h1>
        <p className="text-muted-foreground">
          This campaign may have been removed or doesn't exist.
        </p>
        <Link to="/">
          <Button variant="gradient">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go to Homepage
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{campaign.title} | FrameFlow</title>
        <meta name="description" content={campaign.description || `Use ${campaign.title} template to create your personalized content.`} />
        <meta property="og:title" content={campaign.title} />
        <meta property="og:description" content={campaign.description || 'Create personalized content with FrameFlow'} />
        <meta property="og:image" content={campaign.frameImage} />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <span className="text-white font-bold text-sm">FF</span>
              </div>
              <span className="font-display font-bold text-lg">FrameFlow</span>
            </Link>
            
            <Link to="/auth">
              <Button variant="outline" size="sm">
                Create Your Own
              </Button>
            </Link>
          </div>
        </header>

        {/* Content */}
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

        {/* Footer */}
        <footer className="border-t border-border py-6 mt-12">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <p>
              Powered by{' '}
              <Link to="/" className="text-primary hover:underline">
                FrameFlow
              </Link>
              {' '}— Create your own campaigns for free
            </p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default CampaignPage;
