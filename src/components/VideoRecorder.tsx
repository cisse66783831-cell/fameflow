import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Camera, Video, Square, Download, Loader2, Upload, RotateCcw, Mic, MicOff, Play, Pause, Volume2, Volume1, VolumeX } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface VideoRecorderProps {
  frameImagePortrait?: string;
  frameImageLandscape?: string;
  campaignTitle: string;
  onDownload?: () => void;
}

type Quality = '480p' | '720p' | '1080p';

const QUALITY_CONFIG: Record<Quality, { width: number; height: number; bitrate: number; label: string }> = {
  '480p': { width: 854, height: 480, bitrate: 2500000, label: 'SD (480p)' },
  '720p': { width: 1280, height: 720, bitrate: 5000000, label: 'HD (720p)' },
  '1080p': { width: 1920, height: 1080, bitrate: 8000000, label: 'Full HD (1080p)' },
};

export const VideoRecorder = ({ 
  frameImagePortrait, 
  frameImageLandscape, 
  campaignTitle,
  onDownload 
}: VideoRecorderProps) => {
  const [mode, setMode] = useState<'idle' | 'camera' | 'upload'>('idle');
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [uploadedVideo, setUploadedVideo] = useState<File | null>(null);
  const [quality, setQuality] = useState<Quality>('720p');
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isPortrait, setIsPortrait] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isUploadPlaying, setIsUploadPlaying] = useState(false);
  const [uploadVideoUrl, setUploadVideoUrl] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [volume, setVolume] = useState(1); // Volume at 100% by default
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const animationRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const filterImgRef = useRef<HTMLImageElement | null>(null);
  const uploadedVideoRef = useRef<HTMLVideoElement>(null);
  const uploadAnimationRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioAnimationRef = useRef<number | null>(null);

  // Determine which frame to use based on orientation
  const currentFrame = isPortrait ? frameImagePortrait : frameImageLandscape;

  // Preload filter image
  useEffect(() => {
    if (currentFrame) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = currentFrame;
      filterImgRef.current = img;
    }
  }, [currentFrame]);

  // Detect orientation
  useEffect(() => {
    const handleResize = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      stopUploadPreview();
      stopAudioAnalysis();
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
      if (uploadVideoUrl) URL.revokeObjectURL(uploadVideoUrl);
    };
  }, []);

  // Handle uploaded video setup
  useEffect(() => {
    if (uploadedVideo && mode === 'upload') {
      const url = URL.createObjectURL(uploadedVideo);
      setUploadVideoUrl(url);
      
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [uploadedVideo, mode]);

  // Sync volume with video element
  useEffect(() => {
    if (uploadedVideoRef.current) {
      uploadedVideoRef.current.volume = volume;
    }
  }, [volume]);

  // Start preview loop when upload video is ready
  useEffect(() => {
    if (uploadVideoUrl && uploadedVideoRef.current && mode === 'upload' && canvasRef.current) {
      const video = uploadedVideoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      video.src = uploadVideoUrl;
      video.load();
      
      video.onloadedmetadata = () => {
        // Wait for filter image to be ready, then draw first frame
        const drawFirstFrame = () => {
          if (!ctx) return;
          
          // Seek to first frame
          video.currentTime = 0;
        };
        
        video.onseeked = () => {
          if (!ctx) return;
          
          // Calculate scaling to fit video in canvas while maintaining aspect ratio
          const videoAspect = video.videoWidth / video.videoHeight;
          const canvasAspect = canvas.width / canvas.height;
          
          let drawWidth, drawHeight, offsetX, offsetY;
          
          if (videoAspect > canvasAspect) {
            drawWidth = canvas.width;
            drawHeight = canvas.width / videoAspect;
            offsetX = 0;
            offsetY = (canvas.height - drawHeight) / 2;
          } else {
            drawHeight = canvas.height;
            drawWidth = canvas.height * videoAspect;
            offsetX = (canvas.width - drawWidth) / 2;
            offsetY = 0;
          }
          
          // Clear canvas with black
          ctx.fillStyle = '#000';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Draw video frame
          ctx.drawImage(video, offsetX, offsetY, drawWidth, drawHeight);
          
          // Draw filter overlay if ready
          if (filterImgRef.current && filterImgRef.current.complete) {
            ctx.drawImage(filterImgRef.current, 0, 0, canvas.width, canvas.height);
          } else if (filterImgRef.current) {
            filterImgRef.current.onload = () => {
              ctx.drawImage(filterImgRef.current!, 0, 0, canvas.width, canvas.height);
            };
          }
        };
        
        drawFirstFrame();
      };
    }
  }, [uploadVideoUrl, mode, currentFrame]);

  const startCamera = async () => {
    try {
      const constraints: MediaStreamConstraints = {
        video: { 
          facingMode: 'user', 
          width: { ideal: isPortrait ? 720 : 1280 },
          height: { ideal: isPortrait ? 1280 : 720 }
        },
        audio: audioEnabled
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      setMode('camera');
      startPreviewLoop();
    } catch (error) {
      console.error('Camera error:', error);
      toast.error('Impossible d\'accéder à la caméra');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    setMode('idle');
  };

  const startPreviewLoop = () => {
    const render = () => {
      if (!videoRef.current || !canvasRef.current) return;
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const video = videoRef.current;
      
      // Calculate scaling to fit video in canvas while maintaining aspect ratio
      const videoAspect = video.videoWidth / video.videoHeight;
      const canvasAspect = canvas.width / canvas.height;
      
      let drawWidth, drawHeight, offsetX, offsetY;
      
      if (videoAspect > canvasAspect) {
        drawWidth = canvas.width;
        drawHeight = canvas.width / videoAspect;
        offsetX = 0;
        offsetY = (canvas.height - drawHeight) / 2;
      } else {
        drawHeight = canvas.height;
        drawWidth = canvas.height * videoAspect;
        offsetX = (canvas.width - drawWidth) / 2;
        offsetY = 0;
      }
      
      // Clear canvas with black background
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw video frame with correct aspect ratio
      ctx.drawImage(video, offsetX, offsetY, drawWidth, drawHeight);
      
      // Draw filter overlay
      if (filterImgRef.current && filterImgRef.current.complete) {
        ctx.drawImage(filterImgRef.current, 0, 0, canvas.width, canvas.height);
      }
      
      animationRef.current = requestAnimationFrame(render);
    };
    
    render();
  };

  const drawUploadFrame = () => {
    if (!uploadedVideoRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const video = uploadedVideoRef.current;
    
    // Calculate scaling to fit video in canvas while maintaining aspect ratio
    const videoAspect = video.videoWidth / video.videoHeight;
    const canvasAspect = canvas.width / canvas.height;
    
    let drawWidth, drawHeight, offsetX, offsetY;
    
    if (videoAspect > canvasAspect) {
      drawWidth = canvas.width;
      drawHeight = canvas.width / videoAspect;
      offsetX = 0;
      offsetY = (canvas.height - drawHeight) / 2;
    } else {
      drawHeight = canvas.height;
      drawWidth = canvas.height * videoAspect;
      offsetX = (canvas.width - drawWidth) / 2;
      offsetY = 0;
    }
    
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw video frame
    ctx.drawImage(video, offsetX, offsetY, drawWidth, drawHeight);
    
    // Draw filter overlay
    if (filterImgRef.current && filterImgRef.current.complete) {
      ctx.drawImage(filterImgRef.current, 0, 0, canvas.width, canvas.height);
    }
  };

  const startUploadPreviewLoop = () => {
    const render = () => {
      if (!uploadedVideoRef.current) return;
      
      const video = uploadedVideoRef.current;
      
      if (video.paused || video.ended) {
        if (video.ended) {
          setIsUploadPlaying(false);
        }
        return;
      }
      
      drawUploadFrame();
      uploadAnimationRef.current = requestAnimationFrame(render);
    };
    
    render();
  };

  const stopUploadPreview = () => {
    if (uploadAnimationRef.current) {
      cancelAnimationFrame(uploadAnimationRef.current);
      uploadAnimationRef.current = null;
    }
    if (uploadedVideoRef.current) {
      uploadedVideoRef.current.pause();
    }
    stopAudioAnalysis();
    setIsUploadPlaying(false);
  };

  // Audio analysis functions
  const startAudioAnalysis = (videoElement: HTMLVideoElement) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      
      const audioContext = audioContextRef.current;
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      
      const source = audioContext.createMediaElementSource(videoElement);
      source.connect(analyser);
      analyser.connect(audioContext.destination);
      
      analyserRef.current = analyser;
      
      const updateAudioLevel = () => {
        if (!analyserRef.current) return;
        
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        
        // Calculate average volume level
        const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
        const normalizedLevel = Math.min(average / 128, 1); // Normalize to 0-1
        
        setAudioLevel(normalizedLevel);
        audioAnimationRef.current = requestAnimationFrame(updateAudioLevel);
      };
      
      updateAudioLevel();
    } catch (error) {
      console.error('Error starting audio analysis:', error);
    }
  };

  const stopAudioAnalysis = () => {
    if (audioAnimationRef.current) {
      cancelAnimationFrame(audioAnimationRef.current);
      audioAnimationRef.current = null;
    }
    setAudioLevel(0);
  };

  const toggleUploadPlayback = () => {
    if (!uploadedVideoRef.current) return;
    
    const video = uploadedVideoRef.current;
    
    if (video.paused || video.ended) {
      if (video.ended) {
        video.currentTime = 0;
      }
      
      // Start audio analysis if not already started
      if (!analyserRef.current) {
        startAudioAnalysis(video);
      } else if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
      }
      
      video.play();
      setIsUploadPlaying(true);
      startUploadPreviewLoop();
      
      // Restart audio level animation
      if (analyserRef.current) {
        const updateAudioLevel = () => {
          if (!analyserRef.current || !isUploadPlaying) return;
          
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(dataArray);
          
          const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
          const normalizedLevel = Math.min(average / 128, 1);
          
          setAudioLevel(normalizedLevel);
          audioAnimationRef.current = requestAnimationFrame(updateAudioLevel);
        };
        updateAudioLevel();
      }
    } else {
      video.pause();
      stopAudioAnalysis();
      setIsUploadPlaying(false);
    }
  };

  const startCountdown = () => {
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          startRecording();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startRecording = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const { bitrate } = QUALITY_CONFIG[quality];
    
    // Capture canvas stream with audio
    const canvasStream = canvas.captureStream(30);
    
    // Add audio track if available
    if (streamRef.current && audioEnabled) {
      const audioTracks = streamRef.current.getAudioTracks();
      audioTracks.forEach(track => canvasStream.addTrack(track));
    }
    
    // Check for supported mime types
    let mimeType = 'video/webm;codecs=vp9';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm;codecs=vp8';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
      }
    }
    
    try {
      const mediaRecorder = new MediaRecorder(canvasStream, { 
        mimeType,
        videoBitsPerSecond: bitrate
      });
      
      chunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType.split(';')[0] });
        setRecordedBlob(blob);
        setIsRecording(false);
        setRecordingTime(0);
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };
      
      mediaRecorder.start(100); // Collect data every 100ms
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 60) { // Max 60 seconds
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
      
    } catch (error) {
      console.error('Recording error:', error);
      toast.error('Erreur lors de l\'enregistrement');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('video/')) {
      toast.error('Veuillez sélectionner un fichier vidéo');
      return;
    }
    
    setUploadedVideo(file);
    setMode('upload');
  };

  const processAndDownload = async (sourceBlob: Blob) => {
    setIsProcessing(true);
    
    try {
      // For now, just download the WebM directly
      // TODO: Add server-side MP4 conversion for iOS
      const url = URL.createObjectURL(sourceBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `jyserai-${campaignTitle.replace(/\s+/g, '-')}-${quality}-${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      onDownload?.();
      toast.success(`Vidéo exportée en ${quality} !`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Erreur lors de l\'export');
    }
    
    setIsProcessing(false);
  };

  const processUploadedVideo = async () => {
    if (!uploadedVideo) return;
    
    setIsProcessing(true);
    toast.info('Traitement de la vidéo en cours...');
    
    let audioContext: AudioContext | null = null;
    let videoSrcUrl: string | null = null;
    
    try {
      // Create video element - NOT muted to capture audio
      const video = document.createElement('video');
      videoSrcUrl = URL.createObjectURL(uploadedVideo);
      video.src = videoSrcUrl;
      video.crossOrigin = 'anonymous';
      video.playsInline = true;
      
      await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => resolve();
        video.onerror = () => reject(new Error('Failed to load video'));
      });
      
      // Detect if source video is portrait or landscape
      const isVideoPortrait = video.videoHeight > video.videoWidth;
      
      // Use correct dimensions based on VIDEO orientation (not screen)
      const { width: baseWidth, height: baseHeight, bitrate } = QUALITY_CONFIG[quality];
      const canvasWidth = isVideoPortrait ? baseHeight : baseWidth;
      const canvasHeight = isVideoPortrait ? baseWidth : baseHeight;
      
      // Use the correct filter based on video orientation
      const frameToUse = isVideoPortrait ? frameImagePortrait : frameImageLandscape;
      
      // Create canvas with correct dimensions
      const canvas = document.createElement('canvas');
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      const ctx = canvas.getContext('2d')!;
      
      // Load the correct filter
      let filterImg: HTMLImageElement | null = null;
      if (frameToUse) {
        filterImg = new Image();
        filterImg.crossOrigin = 'anonymous';
        await new Promise<void>((resolve, reject) => {
          filterImg!.onload = () => resolve();
          filterImg!.onerror = () => {
            console.warn('Failed to load filter, continuing without it');
            filterImg = null;
            resolve();
          };
          filterImg!.src = frameToUse;
        });
      }
      
      // Setup canvas stream for video
      const canvasStream = canvas.captureStream(30);
      
      // Extract audio from source video with full volume for export
      try {
        audioContext = new AudioContext();
        const audioSource = audioContext.createMediaElementSource(video);
        const gainNode = audioContext.createGain();
        gainNode.gain.value = 1.0; // Maximum volume for export
        const audioDestination = audioContext.createMediaStreamDestination();
        
        audioSource.connect(gainNode);
        gainNode.connect(audioDestination);
        // Also connect to speakers so processing works (some browsers require this)
        gainNode.connect(audioContext.destination);
        
        // Add audio tracks to canvas stream
        audioDestination.stream.getAudioTracks().forEach(track => {
          canvasStream.addTrack(track);
        });
      } catch (audioError) {
        console.warn('Could not extract audio, continuing without:', audioError);
      }
      
      // Check for supported mime types with audio codec
      let mimeType = 'video/webm;codecs=vp9,opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm;codecs=vp8,opus';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/webm;codecs=vp9';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = 'video/webm';
          }
        }
      }
      
      const mediaRecorder = new MediaRecorder(canvasStream, { 
        mimeType,
        videoBitsPerSecond: bitrate,
        audioBitsPerSecond: 128000
      });
      
      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      
      const exportPromise = new Promise<Blob>((resolve) => {
        mediaRecorder.onstop = () => {
          resolve(new Blob(chunks, { type: 'video/webm' }));
        };
      });
      
      mediaRecorder.start(100);
      
      // Need to unmute for audio extraction to work
      video.muted = false;
      video.volume = 0.01; // Very low volume to avoid echo
      await video.play();
      
      const renderFrame = () => {
        if (video.ended || video.paused) {
          mediaRecorder.stop();
          return;
        }
        
        // Calculate scaling to fit video in canvas while maintaining aspect ratio
        const videoAspect = video.videoWidth / video.videoHeight;
        const canvasAspect = canvasWidth / canvasHeight;
        
        let drawWidth, drawHeight, offsetX, offsetY;
        
        if (videoAspect > canvasAspect) {
          drawWidth = canvasWidth;
          drawHeight = canvasWidth / videoAspect;
          offsetX = 0;
          offsetY = (canvasHeight - drawHeight) / 2;
        } else {
          drawHeight = canvasHeight;
          drawWidth = canvasHeight * videoAspect;
          offsetX = (canvasWidth - drawWidth) / 2;
          offsetY = 0;
        }
        
        // Clear canvas
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        // Draw video frame
        ctx.drawImage(video, offsetX, offsetY, drawWidth, drawHeight);
        
        // Draw filter overlay if available
        if (filterImg) {
          ctx.drawImage(filterImg, 0, 0, canvasWidth, canvasHeight);
        }
        
        requestAnimationFrame(renderFrame);
      };
      
      renderFrame();
      
      await new Promise<void>((resolve) => {
        video.onended = () => resolve();
      });
      
      const exportedBlob = await exportPromise;
      
      // Download with orientation info in filename
      const orientationLabel = isVideoPortrait ? 'portrait' : 'landscape';
      const url = URL.createObjectURL(exportedBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `jyserai-${campaignTitle.replace(/\s+/g, '-')}-${quality}-${orientationLabel}-${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      onDownload?.();
      toast.success('Vidéo exportée avec audio !');
    } catch (error) {
      console.error('Processing error:', error);
      toast.error('Erreur lors du traitement');
    } finally {
      // Cleanup
      if (audioContext) {
        audioContext.close().catch(console.error);
      }
      if (videoSrcUrl) {
        URL.revokeObjectURL(videoSrcUrl);
      }
      setIsProcessing(false);
    }
  };

  const reset = () => {
    stopUploadPreview();
    setRecordedBlob(null);
    setUploadedVideo(null);
    setUploadVideoUrl(null);
    setMode('idle');
    setRecordingTime(0);
    setIsUploadPlaying(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Canvas dimensions based on quality and orientation
  const canvasWidth = isPortrait ? QUALITY_CONFIG[quality].height : QUALITY_CONFIG[quality].width;
  const canvasHeight = isPortrait ? QUALITY_CONFIG[quality].width : QUALITY_CONFIG[quality].height;

  return (
    <div className="space-y-4">
      {/* Hidden video element for uploaded video */}
      <video 
        ref={uploadedVideoRef}
        playsInline
        className="hidden"
        onEnded={() => setIsUploadPlaying(false)}
      />
      
      {/* Video Preview Area */}
      <div 
        className={cn(
          "relative rounded-2xl overflow-hidden bg-muted/30 border border-border mx-auto",
          isPortrait ? "aspect-[9/16] max-h-[60vh]" : "aspect-video max-h-[50vh]"
        )}
        style={{ maxWidth: isPortrait ? '320px' : '100%' }}
      >
        {/* Hidden video element for camera input */}
        <video 
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="hidden"
        />
        
        {/* Canvas for rendering video + filter */}
        <canvas 
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          className="w-full h-full object-contain"
        />
        
        {/* Countdown overlay */}
        {countdown !== null && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <span className="text-7xl font-bold text-primary animate-pulse">{countdown}</span>
          </div>
        )}
        
        {/* Recording indicator */}
        {isRecording && (
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-destructive/90 text-destructive-foreground px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="text-sm font-medium">{formatTime(recordingTime)}</span>
          </div>
        )}
        
        {/* Play/Pause overlay for upload mode */}
        {mode === 'upload' && uploadedVideo && !isProcessing && (
          <button
            onClick={toggleUploadPlayback}
            className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors group"
          >
            <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
              {isUploadPlaying ? (
                <Pause className="w-8 h-8 text-foreground" />
              ) : (
                <Play className="w-8 h-8 text-foreground ml-1" />
              )}
            </div>
          </button>
        )}
        
        {/* Volume Control with Audio Level Indicator */}
        {mode === 'upload' && uploadedVideo && (
          <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-2 rounded-full">
            <button 
              onClick={() => setVolume(v => v === 0 ? 1 : 0)}
              className="text-white hover:text-primary transition-colors"
            >
              {volume === 0 ? (
                <VolumeX className="w-4 h-4" />
              ) : volume < 0.5 ? (
                <Volume1 className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <Slider
              value={[volume * 100]}
              onValueChange={([val]) => setVolume(val / 100)}
              max={100}
              step={1}
              className="w-20"
            />
            {isUploadPlaying && (
              <div className="flex items-end gap-0.5 h-4">
                {[0.2, 0.4, 0.6, 0.8, 1].map((threshold, index) => (
                  <div
                    key={index}
                    className={cn(
                      "w-1 rounded-full transition-all duration-75",
                      audioLevel >= threshold ? "bg-primary" : "bg-white/30"
                    )}
                    style={{
                      height: `${(index + 1) * 20}%`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Idle state */}
        {mode === 'idle' && !recordedBlob && !uploadedVideo && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            {currentFrame && (
              <img 
                src={currentFrame} 
                alt="Filter preview" 
                className="absolute inset-0 w-full h-full object-contain opacity-50"
              />
            )}
            <p className="text-muted-foreground text-sm z-10">Choisissez une option ci-dessous</p>
          </div>
        )}
        
        {/* Recorded video preview */}
        {recordedBlob && !isRecording && (
          <video 
            src={URL.createObjectURL(recordedBlob)}
            controls
            className="absolute inset-0 w-full h-full object-contain bg-black"
          />
        )}
      </div>

      {/* Controls */}
      <div className="space-y-4">
        {/* Quality Selector */}
        <div className="flex items-center justify-center gap-4">
          <span className="text-sm text-muted-foreground">Qualité:</span>
          <Select value={quality} onValueChange={(v) => setQuality(v as Quality)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(QUALITY_CONFIG).map(([key, config]) => (
                <SelectItem key={key} value={key}>{config.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Main Actions */}
        {mode === 'idle' && !recordedBlob && !uploadedVideo && (
          <div className="flex flex-col gap-4 justify-center px-4 w-full max-w-md mx-auto">
            <Button 
              onClick={startCamera}
              size="lg"
              className="w-full py-6 text-base font-semibold"
              variant="default"
            >
              <Camera className="w-5 h-5 mr-3" />
              Utiliser la caméra
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              className="w-full py-6 text-base font-semibold relative overflow-hidden"
              asChild
            >
              <label className="cursor-pointer flex items-center justify-center">
                <Upload className="w-5 h-5 mr-3" />
                Importer une vidéo
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </label>
            </Button>
          </div>
        )}

        {/* Camera Mode Controls */}
        {mode === 'camera' && !recordedBlob && (
          <div className="flex flex-col gap-3 items-center">
            <div className="flex gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setAudioEnabled(!audioEnabled)}
                className={cn(!audioEnabled && "text-destructive")}
              >
                {audioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </Button>
              
              {!isRecording ? (
                <Button 
                  onClick={startCountdown}
                  size="lg"
                  className="rounded-full w-16 h-16 bg-destructive hover:bg-destructive/90"
                  disabled={countdown !== null}
                >
                  <Video className="w-6 h-6" />
                </Button>
              ) : (
                <Button 
                  onClick={stopRecording}
                  size="lg"
                  className="rounded-full w-16 h-16"
                  variant="outline"
                >
                  <Square className="w-6 h-6" />
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="icon"
                onClick={stopCamera}
              >
                <RotateCcw className="w-5 h-5" />
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground">
              {isRecording ? `Max 1 minute • ${formatTime(60 - recordingTime)} restant` : 'Appuyez pour enregistrer'}
            </p>
          </div>
        )}

        {/* Upload Mode Controls */}
        {mode === 'upload' && uploadedVideo && (
          <div className="flex flex-col gap-3 items-center">
            <p className="text-sm text-muted-foreground text-center">
              {uploadedVideo.name}
              <br />
              <span className="text-xs">Cliquez sur la vidéo pour lecture/pause</span>
            </p>
            <div className="flex gap-3">
              <label>
                <Button variant="outline" asChild>
                  <span>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Changer
                  </span>
                </Button>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => {
                    stopUploadPreview();
                    handleUpload(e);
                  }}
                  className="hidden"
                />
              </label>
              <Button 
                onClick={processUploadedVideo}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Télécharger avec filtre
              </Button>
            </div>
          </div>
        )}

        {/* Recorded Video Controls */}
        {recordedBlob && !isRecording && (
          <div className="flex flex-col gap-3 items-center">
            <div className="flex gap-3">
              <Button variant="outline" onClick={reset}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Recommencer
              </Button>
              <Button 
                onClick={() => processAndDownload(recordedBlob)}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Télécharger
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
