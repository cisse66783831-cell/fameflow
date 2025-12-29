import { useState, useEffect, useRef } from 'react';
import { Header } from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  Video, Upload, Play, Download, Camera, Plus, Sparkles, 
  Loader2, Eye, Trash2, Settings
} from 'lucide-react';

interface VideoFilter {
  id: string;
  title: string;
  description: string | null;
  filter_image: string;
  filter_type: string;
  views: number;
  downloads: number;
  user_id: string;
  created_at: string;
}

export default function VideoFiltersPage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState<VideoFilter[]>([]);
  const [myFilters, setMyFilters] = useState<VideoFilter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<VideoFilter | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState<Blob | null>(null);
  const [uploadedVideo, setUploadedVideo] = useState<File | null>(null);
  const [exportQuality, setExportQuality] = useState<string>('720p');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newFilter, setNewFilter] = useState({ title: '', description: '', filterImage: '' });
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    fetchFilters();
  }, [user]);

  const fetchFilters = async () => {
    setIsLoading(true);
    // Use any to bypass type checking since video_filters table was just created
    const { data: allFilters } = await (supabase as any)
      .from('video_filters')
      .select('*')
      .order('created_at', { ascending: false });

    if (allFilters) {
      setFilters(allFilters as VideoFilter[]);
      if (user) {
        setMyFilters((allFilters as VideoFilter[]).filter((f: VideoFilter) => f.user_id === user.id));
      }
    }
    setIsLoading(false);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 1280, height: 720 },
        audio: true 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      toast.error('Impossible d\'accéder à la caméra');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const startRecording = () => {
    if (!streamRef.current) return;

    const mediaRecorder = new MediaRecorder(streamRef.current, { mimeType: 'video/webm' });
    const chunks: Blob[] = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      setRecordedVideo(blob);
    };

    mediaRecorder.start();
    mediaRecorderRef.current = mediaRecorder;
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedVideo(file);
    }
  };

  const getResolutionDimensions = (quality: string): { width: number; height: number } => {
    switch (quality) {
      case '480p': return { width: 854, height: 480 };
      case '720p': return { width: 1280, height: 720 };
      case '1080p': return { width: 1920, height: 1080 };
      default: return { width: 1280, height: 720 };
    }
  };

  const applyFilterAndExport = async () => {
    if (!selectedFilter || (!recordedVideo && !uploadedVideo)) {
      toast.error('Sélectionnez un filtre et une vidéo');
      return;
    }

    setIsProcessing(true);
    toast.info(`Traitement en cours (${exportQuality})...`);

    try {
      const videoBlob = recordedVideo || uploadedVideo;
      if (!videoBlob) return;

      // Create video element for processing
      const videoElement = document.createElement('video');
      videoElement.src = URL.createObjectURL(videoBlob);
      videoElement.muted = true;
      
      await new Promise<void>((resolve) => {
        videoElement.onloadedmetadata = () => resolve();
      });

      const { width, height } = getResolutionDimensions(exportQuality);
      
      // Create canvas for compositing
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;

      // Load filter image
      const filterImg = new Image();
      filterImg.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        filterImg.onload = () => resolve();
        filterImg.onerror = reject;
        filterImg.src = selectedFilter.filter_image;
      });

      // Setup MediaRecorder for canvas
      const canvasStream = canvas.captureStream(30);
      const mediaRecorder = new MediaRecorder(canvasStream, { 
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: exportQuality === '1080p' ? 8000000 : exportQuality === '720p' ? 5000000 : 2500000
      });
      
      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      const exportPromise = new Promise<Blob>((resolve) => {
        mediaRecorder.onstop = () => {
          const exportedBlob = new Blob(chunks, { type: 'video/webm' });
          resolve(exportedBlob);
        };
      });

      // Start recording
      mediaRecorder.start();
      videoElement.play();

      // Render frames
      const renderFrame = () => {
        if (videoElement.ended || videoElement.paused) {
          mediaRecorder.stop();
          return;
        }

        // Draw video frame
        ctx.drawImage(videoElement, 0, 0, width, height);
        
        // Draw filter overlay
        ctx.drawImage(filterImg, 0, 0, width, height);

        requestAnimationFrame(renderFrame);
      };

      renderFrame();

      // Wait for video to end
      await new Promise<void>((resolve) => {
        videoElement.onended = () => resolve();
      });

      const exportedBlob = await exportPromise;

      // Increment downloads
      await (supabase as any)
        .from('video_filters')
        .update({ downloads: selectedFilter.downloads + 1 })
        .eq('id', selectedFilter.id);

      // Download the file
      const url = URL.createObjectURL(exportedBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `jyserai-${selectedFilter.title.replace(/\s+/g, '-')}-${exportQuality}-${Date.now()}.webm`;
      a.click();
      URL.revokeObjectURL(url);
      URL.revokeObjectURL(videoElement.src);

      toast.success(`Vidéo exportée en ${exportQuality} !`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Erreur lors de l\'export. Réessayez.');
    }

    setIsProcessing(false);
  };

  const createFilter = async () => {
    if (!user || !newFilter.title || !newFilter.filterImage) {
      toast.error('Remplissez tous les champs');
      return;
    }

    const { error } = await (supabase as any).from('video_filters').insert({
      user_id: user.id,
      title: newFilter.title,
      description: newFilter.description,
      filter_image: newFilter.filterImage,
      filter_type: 'overlay'
    });

    if (error) {
      toast.error('Erreur lors de la création');
    } else {
      toast.success('Filtre créé !');
      setIsCreateOpen(false);
      setNewFilter({ title: '', description: '', filterImage: '' });
      fetchFilters();
    }
  };

  const deleteFilter = async (id: string) => {
    const { error } = await (supabase as any).from('video_filters').delete().eq('id', id);
    if (!error) {
      toast.success('Filtre supprimé');
      fetchFilters();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20 pb-12 px-4 md:px-6">
        <div className="container mx-auto max-w-6xl">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-4">
              <Video className="w-4 h-4" />
              <span>Nouvelle fonctionnalité</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-display mb-4">
              Filtres <span className="text-gradient-neon">Vidéo</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Enregistrez ou importez une vidéo, appliquez le filtre de votre événement préféré et partagez-la sur vos réseaux !
            </p>
          </div>

          <Tabs defaultValue="explore" className="space-y-8">
            <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
              <TabsTrigger value="explore">Explorer</TabsTrigger>
              <TabsTrigger value="create">Créer</TabsTrigger>
              {user && <TabsTrigger value="my-filters">Mes filtres</TabsTrigger>}
            </TabsList>

            {/* Explore Tab */}
            <TabsContent value="explore" className="space-y-8">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                  <div className="col-span-full flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : filters.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <Video className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Aucun filtre disponible pour le moment</p>
                  </div>
                ) : (
                  filters.map(filter => (
                    <Card 
                      key={filter.id} 
                      className={`bg-card/50 border-border/50 overflow-hidden cursor-pointer transition-all hover:border-primary/50 ${selectedFilter?.id === filter.id ? 'border-primary ring-2 ring-primary/20' : ''}`}
                      onClick={() => setSelectedFilter(filter)}
                    >
                      <div className="aspect-video relative">
                        <img 
                          src={filter.filter_image} 
                          alt={filter.title} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                        <div className="absolute bottom-3 left-3 right-3">
                          <h3 className="font-semibold text-foreground">{filter.title}</h3>
                          {filter.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1">{filter.description}</p>
                          )}
                        </div>
                      </div>
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" /> {filter.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <Download className="w-4 h-4" /> {filter.downloads}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              {/* Video Recording/Upload Section */}
              {selectedFilter && (
                <Card className="bg-card/50 border-primary/30">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      Appliquer le filtre : {selectedFilter.title}
                    </h3>

                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Camera/Video Preview */}
                      <div className="space-y-4">
                        <div className="aspect-video rounded-xl bg-background border border-border overflow-hidden relative">
                          <video 
                            ref={videoRef} 
                            autoPlay 
                            muted 
                            playsInline
                            className="w-full h-full object-cover"
                          />
                          {/* Filter Overlay */}
                          <img 
                            src={selectedFilter.filter_image} 
                            alt="Filter" 
                            className="absolute inset-0 w-full h-full object-contain pointer-events-none opacity-80"
                          />
                          <canvas ref={canvasRef} className="hidden" />
                        </div>

                        <div className="flex gap-2">
                          <Button onClick={startCamera} variant="outline" className="flex-1">
                            <Camera className="w-4 h-4 mr-2" />
                            Démarrer caméra
                          </Button>
                          {!isRecording ? (
                            <Button onClick={startRecording} variant="default" className="flex-1 btn-neon gradient-primary">
                              <Play className="w-4 h-4 mr-2" />
                              Enregistrer
                            </Button>
                          ) : (
                            <Button onClick={stopRecording} variant="destructive" className="flex-1">
                              Arrêter
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Upload & Export Options */}
                      <div className="space-y-4">
                        <div>
                          <Label>Ou importer une vidéo</Label>
                          <Input 
                            type="file" 
                            accept="video/*" 
                            onChange={handleVideoUpload}
                            className="mt-2"
                          />
                        </div>

                        <div>
                          <Label>Qualité d'export</Label>
                          <Select value={exportQuality} onValueChange={setExportQuality}>
                            <SelectTrigger className="mt-2">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="480p">480p (SD)</SelectItem>
                              <SelectItem value="720p">720p (HD)</SelectItem>
                              <SelectItem value="1080p">1080p (Full HD)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <Button 
                          onClick={applyFilterAndExport} 
                          disabled={isProcessing || (!recordedVideo && !uploadedVideo)}
                          className="w-full btn-neon-cyan gradient-accent text-accent-foreground"
                        >
                          {isProcessing ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Download className="w-4 h-4 mr-2" />
                          )}
                          Exporter avec filtre
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Create Tab */}
            <TabsContent value="create">
              {!user ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">Connectez-vous pour créer des filtres</p>
                  <Button onClick={() => window.location.href = '/auth'}>Se connecter</Button>
                </div>
              ) : (
                <Card className="max-w-md mx-auto bg-card/50 border-border/50">
                  <CardContent className="p-6 space-y-4">
                    <div className="text-center mb-4">
                      <div className="p-3 rounded-full bg-primary/10 w-fit mx-auto mb-3">
                        <Plus className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold">Créer un filtre</h3>
                      <p className="text-sm text-muted-foreground">Hébergez votre propre filtre vidéo</p>
                    </div>

                    <div>
                      <Label>Nom du filtre</Label>
                      <Input 
                        value={newFilter.title}
                        onChange={(e) => setNewFilter(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Ex: Festival Vibes 2025"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Description (optionnel)</Label>
                      <Input 
                        value={newFilter.description}
                        onChange={(e) => setNewFilter(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Décrivez votre filtre..."
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>URL de l'image du filtre (PNG transparent)</Label>
                      <Input 
                        value={newFilter.filterImage}
                        onChange={(e) => setNewFilter(prev => ({ ...prev, filterImage: e.target.value }))}
                        placeholder="https://..."
                        className="mt-1"
                      />
                    </div>

                    {newFilter.filterImage && (
                      <div className="aspect-video rounded-lg border border-border overflow-hidden">
                        <img src={newFilter.filterImage} alt="Preview" className="w-full h-full object-contain" />
                      </div>
                    )}

                    <Button onClick={createFilter} className="w-full btn-neon gradient-primary">
                      Créer le filtre
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* My Filters Tab */}
            {user && (
              <TabsContent value="my-filters">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myFilters.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                      <Video className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Vous n'avez pas encore créé de filtre</p>
                    </div>
                  ) : (
                    myFilters.map(filter => (
                      <Card key={filter.id} className="bg-card/50 border-border/50 overflow-hidden">
                        <div className="aspect-video relative">
                          <img 
                            src={filter.filter_image} 
                            alt={filter.title} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold">{filter.title}</h3>
                          <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
                            <span><Eye className="w-4 h-4 inline mr-1" />{filter.views}</span>
                            <span><Download className="w-4 h-4 inline mr-1" />{filter.downloads}</span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="w-full mt-3 text-destructive hover:bg-destructive/10"
                            onClick={() => deleteFilter(filter.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Supprimer
                          </Button>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </main>
    </div>
  );
}
