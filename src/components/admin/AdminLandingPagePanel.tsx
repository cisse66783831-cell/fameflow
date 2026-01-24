import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Star, StarOff, Image, Video, Search, ArrowUp, ArrowDown, 
  Trash2, Eye, Loader2, RefreshCw, Layout, Sparkles 
} from 'lucide-react';

interface PublicVisual {
  id: string;
  visual_url: string;
  creator_name: string;
  creator_photo: string | null;
  is_approved: boolean;
  is_featured: boolean;
  display_order: number;
  event_id: string;
  created_at: string;
}

interface PublicVideo {
  id: string;
  video_url: string;
  thumbnail_url: string | null;
  creator_name: string;
  is_approved: boolean;
  is_featured: boolean;
  display_order: number;
  created_at: string;
}

interface AdminLandingPagePanelProps {
  onRefresh: () => void;
}

export function AdminLandingPagePanel({ onRefresh }: AdminLandingPagePanelProps) {
  const [featuredVisuals, setFeaturedVisuals] = useState<PublicVisual[]>([]);
  const [allVisuals, setAllVisuals] = useState<PublicVisual[]>([]);
  const [featuredVideos, setFeaturedVideos] = useState<PublicVideo[]>([]);
  const [allVideos, setAllVideos] = useState<PublicVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch all approved visuals
      const { data: visualsData } = await supabase
        .from('public_visuals')
        .select('*')
        .eq('is_approved', true)
        .order('display_order', { ascending: true });

      setAllVisuals(visualsData || []);
      setFeaturedVisuals((visualsData || []).filter(v => v.is_featured));

      // Fetch all approved videos
      const { data: videosData } = await supabase
        .from('public_videos')
        .select('*')
        .eq('is_approved', true)
        .order('display_order', { ascending: true });

      setAllVideos(videosData || []);
      setFeaturedVideos((videosData || []).filter(v => v.is_featured));
    } catch (error) {
      console.error('Error fetching landing page data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFeatureVisual = async (visual: PublicVisual) => {
    setProcessingId(visual.id);
    try {
      const { error } = await supabase
        .from('public_visuals')
        .update({ 
          is_featured: !visual.is_featured,
          display_order: !visual.is_featured ? 0 : 999 
        })
        .eq('id', visual.id);

      if (error) throw error;
      
      toast.success(visual.is_featured ? 'Retiré de la landing' : 'Mis en avant sur la landing');
      fetchData();
      onRefresh();
    } catch (error) {
      console.error('Error toggling feature:', error);
      toast.error('Erreur lors de la modification');
    } finally {
      setProcessingId(null);
    }
  };

  const toggleFeatureVideo = async (video: PublicVideo) => {
    setProcessingId(video.id);
    try {
      const { error } = await supabase
        .from('public_videos')
        .update({ 
          is_featured: !video.is_featured,
          display_order: !video.is_featured ? 0 : 999 
        })
        .eq('id', video.id);

      if (error) throw error;
      
      toast.success(video.is_featured ? 'Vidéo retirée de la landing' : 'Vidéo mise en avant');
      fetchData();
      onRefresh();
    } catch (error) {
      console.error('Error toggling video feature:', error);
      toast.error('Erreur lors de la modification');
    } finally {
      setProcessingId(null);
    }
  };

  const moveVisual = async (visual: PublicVisual, direction: 'up' | 'down') => {
    const featuredList = [...featuredVisuals].sort((a, b) => a.display_order - b.display_order);
    const currentIndex = featuredList.findIndex(v => v.id === visual.id);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (targetIndex < 0 || targetIndex >= featuredList.length) return;

    const targetVisual = featuredList[targetIndex];
    
    setProcessingId(visual.id);
    try {
      await Promise.all([
        supabase.from('public_visuals').update({ display_order: targetVisual.display_order }).eq('id', visual.id),
        supabase.from('public_visuals').update({ display_order: visual.display_order }).eq('id', targetVisual.id)
      ]);
      
      fetchData();
    } catch (error) {
      console.error('Error reordering:', error);
      toast.error('Erreur lors du réordonnement');
    } finally {
      setProcessingId(null);
    }
  };

  const moveVideo = async (video: PublicVideo, direction: 'up' | 'down') => {
    const featuredList = [...featuredVideos].sort((a, b) => a.display_order - b.display_order);
    const currentIndex = featuredList.findIndex(v => v.id === video.id);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (targetIndex < 0 || targetIndex >= featuredList.length) return;

    const targetVideo = featuredList[targetIndex];
    
    setProcessingId(video.id);
    try {
      await Promise.all([
        supabase.from('public_videos').update({ display_order: targetVideo.display_order }).eq('id', video.id),
        supabase.from('public_videos').update({ display_order: video.display_order }).eq('id', targetVideo.id)
      ]);
      
      fetchData();
    } catch (error) {
      console.error('Error reordering videos:', error);
      toast.error('Erreur lors du réordonnement');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredVisuals = allVisuals.filter(v => 
    v.creator_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredVideos = allVideos.filter(v => 
    v.creator_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Chargement...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Image className="w-5 h-5 text-primary" />
              <span className="text-2xl font-bold">{featuredVisuals.length}</span>
            </div>
            <p className="text-xs text-muted-foreground">Visuels en avant</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Video className="w-5 h-5 text-accent" />
              <span className="text-2xl font-bold">{featuredVideos.length}</span>
            </div>
            <p className="text-xs text-muted-foreground">Vidéos en avant</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Eye className="w-5 h-5 text-success" />
              <span className="text-2xl font-bold">{allVisuals.length}</span>
            </div>
            <p className="text-xs text-muted-foreground">Visuels approuvés</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Layout className="w-5 h-5 text-warning" />
              <span className="text-2xl font-bold">{allVideos.length}</span>
            </div>
            <p className="text-xs text-muted-foreground">Vidéos approuvées</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="visuals" className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <TabsList>
            <TabsTrigger value="visuals" className="gap-2">
              <Image className="w-4 h-4" />
              Visuels
            </TabsTrigger>
            <TabsTrigger value="videos" className="gap-2">
              <Video className="w-4 h-4" />
              Vidéos
            </TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Rechercher par nom..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" size="icon" onClick={fetchData}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <TabsContent value="visuals" className="space-y-6">
          {/* Featured Visuals Section */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Visuels mis en avant sur la landing
              </CardTitle>
            </CardHeader>
            <CardContent>
              {featuredVisuals.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Aucun visuel mis en avant. Cliquez sur l'étoile d'un visuel ci-dessous pour le mettre en avant.
                </p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {featuredVisuals.map((visual, index) => (
                    <div key={visual.id} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden bg-secondary">
                        <img 
                          src={visual.visual_url} 
                          alt={visual.creator_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <Badge className="absolute top-2 left-2 text-xs" variant="secondary">
                        #{index + 1}
                      </Badge>
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                        <Button 
                          size="icon" 
                          variant="secondary"
                          onClick={() => moveVisual(visual, 'up')}
                          disabled={index === 0 || processingId === visual.id}
                          className="w-8 h-8"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="secondary"
                          onClick={() => moveVisual(visual, 'down')}
                          disabled={index === featuredVisuals.length - 1 || processingId === visual.id}
                          className="w-8 h-8"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="destructive"
                          onClick={() => toggleFeatureVisual(visual)}
                          disabled={processingId === visual.id}
                          className="w-8 h-8"
                        >
                          <StarOff className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-center mt-1 truncate">{visual.creator_name}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* All Approved Visuals */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="w-5 h-5 text-muted-foreground" />
                Tous les visuels approuvés ({filteredVisuals.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 max-h-96 overflow-y-auto">
                {filteredVisuals.map((visual) => (
                  <div key={visual.id} className="relative group cursor-pointer">
                    <div className="aspect-square rounded-lg overflow-hidden bg-secondary">
                      <img 
                        src={visual.visual_url} 
                        alt={visual.creator_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {visual.is_featured && (
                      <Badge className="absolute top-2 left-2 bg-primary text-xs">
                        <Star className="w-3 h-3 mr-1 fill-current" />
                        En avant
                      </Badge>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <Button 
                        size="sm"
                        variant={visual.is_featured ? "destructive" : "default"}
                        onClick={() => toggleFeatureVisual(visual)}
                        disabled={processingId === visual.id}
                        className="gap-1"
                      >
                        {processingId === visual.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : visual.is_featured ? (
                          <>
                            <StarOff className="w-4 h-4" />
                            Retirer
                          </>
                        ) : (
                          <>
                            <Star className="w-4 h-4" />
                            Mettre en avant
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-center mt-1 truncate">{visual.creator_name}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="videos" className="space-y-6">
          {/* Featured Videos Section */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Vidéos mises en avant sur la landing
              </CardTitle>
            </CardHeader>
            <CardContent>
              {featuredVideos.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Aucune vidéo mise en avant. Ajoutez des vidéos approuvées pour les mettre en avant.
                </p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {featuredVideos.map((video, index) => (
                    <div key={video.id} className="relative group">
                      <div className="aspect-video rounded-lg overflow-hidden bg-secondary">
                        {video.thumbnail_url ? (
                          <img 
                            src={video.thumbnail_url} 
                            alt={video.creator_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Video className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <Badge className="absolute top-2 left-2 text-xs" variant="secondary">
                        #{index + 1}
                      </Badge>
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                        <Button 
                          size="icon" 
                          variant="secondary"
                          onClick={() => moveVideo(video, 'up')}
                          disabled={index === 0 || processingId === video.id}
                          className="w-8 h-8"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="secondary"
                          onClick={() => moveVideo(video, 'down')}
                          disabled={index === featuredVideos.length - 1 || processingId === video.id}
                          className="w-8 h-8"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="destructive"
                          onClick={() => toggleFeatureVideo(video)}
                          disabled={processingId === video.id}
                          className="w-8 h-8"
                        >
                          <StarOff className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-center mt-1 truncate">{video.creator_name}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* All Approved Videos */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="w-5 h-5 text-muted-foreground" />
                Toutes les vidéos approuvées ({filteredVideos.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredVideos.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Aucune vidéo approuvée disponible.
                </p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
                  {filteredVideos.map((video) => (
                    <div key={video.id} className="relative group cursor-pointer">
                      <div className="aspect-video rounded-lg overflow-hidden bg-secondary">
                        {video.thumbnail_url ? (
                          <img 
                            src={video.thumbnail_url} 
                            alt={video.creator_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Video className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      {video.is_featured && (
                        <Badge className="absolute top-2 left-2 bg-primary text-xs">
                          <Star className="w-3 h-3 mr-1 fill-current" />
                          En avant
                        </Badge>
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <Button 
                          size="sm"
                          variant={video.is_featured ? "destructive" : "default"}
                          onClick={() => toggleFeatureVideo(video)}
                          disabled={processingId === video.id}
                          className="gap-1"
                        >
                          {processingId === video.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : video.is_featured ? (
                            <>
                              <StarOff className="w-4 h-4" />
                              Retirer
                            </>
                          ) : (
                            <>
                              <Star className="w-4 h-4" />
                              Mettre en avant
                            </>
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-center mt-1 truncate">{video.creator_name}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}