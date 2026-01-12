import { useState, useRef, useCallback } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

interface ConversionProgress {
  phase: 'loading' | 'converting' | 'done' | 'idle';
  progress: number;
  message: string;
}

export const useVideoConverter = () => {
  const [conversionState, setConversionState] = useState<ConversionProgress>({
    phase: 'idle',
    progress: 0,
    message: ''
  });
  
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const ffmpegLoadedRef = useRef(false);

  const loadFFmpeg = useCallback(async () => {
    if (ffmpegLoadedRef.current && ffmpegRef.current) {
      return ffmpegRef.current;
    }

    setConversionState({
      phase: 'loading',
      progress: 10,
      message: 'Chargement du convertisseur vidéo...'
    });

    const ffmpeg = new FFmpeg();
    ffmpegRef.current = ffmpeg;

    ffmpeg.on('progress', ({ progress }) => {
      setConversionState(prev => ({
        ...prev,
        phase: 'converting',
        progress: Math.round(progress * 100),
        message: `Conversion en cours: ${Math.round(progress * 100)}%`
      }));
    });

    ffmpeg.on('log', ({ message }) => {
      console.log('[FFmpeg]', message);
    });

    try {
      // Load FFmpeg core from CDN
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
      
      setConversionState({
        phase: 'loading',
        progress: 30,
        message: 'Téléchargement des composants...'
      });

      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });

      ffmpegLoadedRef.current = true;
      
      setConversionState({
        phase: 'loading',
        progress: 100,
        message: 'Convertisseur prêt'
      });

      return ffmpeg;
    } catch (error) {
      console.error('Failed to load FFmpeg:', error);
      setConversionState({
        phase: 'idle',
        progress: 0,
        message: ''
      });
      throw new Error('Impossible de charger le convertisseur vidéo');
    }
  }, []);

  const convertToMp4 = useCallback(async (webmBlob: Blob): Promise<Blob> => {
    const ffmpeg = await loadFFmpeg();

    setConversionState({
      phase: 'converting',
      progress: 0,
      message: 'Préparation de la conversion...'
    });

    try {
      // Write the input file
      const inputData = await fetchFile(webmBlob);
      await ffmpeg.writeFile('input.webm', inputData);

      setConversionState({
        phase: 'converting',
        progress: 5,
        message: 'Conversion en MP4 pour WhatsApp...'
      });

      // Convert WebM to MP4 with H.264 codec (WhatsApp compatible)
      // Using libx264 for video and aac for audio
      await ffmpeg.exec([
        '-i', 'input.webm',
        '-c:v', 'libx264',
        '-preset', 'fast',
        '-crf', '23',
        '-c:a', 'aac',
        '-b:a', '128k',
        '-movflags', '+faststart', // Enable streaming/fast start
        '-pix_fmt', 'yuv420p', // Ensure compatibility
        'output.mp4'
      ]);

      // Read the output file
      const data = await ffmpeg.readFile('output.mp4');
      
      // Clean up files
      await ffmpeg.deleteFile('input.webm');
      await ffmpeg.deleteFile('output.mp4');

      setConversionState({
        phase: 'done',
        progress: 100,
        message: 'Conversion terminée !'
      });

      // Reset state after a short delay
      setTimeout(() => {
        setConversionState({
          phase: 'idle',
          progress: 0,
          message: ''
        });
      }, 1000);

      // Convert FileData to ArrayBuffer for Blob compatibility
      let arrayBuffer: ArrayBuffer;
      if (data instanceof Uint8Array) {
        // Create a new ArrayBuffer copy to avoid SharedArrayBuffer issues
        arrayBuffer = new ArrayBuffer(data.byteLength);
        new Uint8Array(arrayBuffer).set(data);
      } else {
        // String case - convert to ArrayBuffer
        const encoder = new TextEncoder();
        const encoded = encoder.encode(data as string);
        arrayBuffer = encoded.buffer as ArrayBuffer;
      }
        
      return new Blob([arrayBuffer], { type: 'video/mp4' });
    } catch (error) {
      console.error('Conversion error:', error);
      setConversionState({
        phase: 'idle',
        progress: 0,
        message: ''
      });
      throw new Error('Erreur lors de la conversion en MP4');
    }
  }, [loadFFmpeg]);

  const resetState = useCallback(() => {
    setConversionState({
      phase: 'idle',
      progress: 0,
      message: ''
    });
  }, []);

  return {
    convertToMp4,
    conversionState,
    resetState,
    isConverting: conversionState.phase === 'loading' || conversionState.phase === 'converting'
  };
};
