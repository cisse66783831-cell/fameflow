import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Camera, CameraOff, Loader2 } from 'lucide-react';

interface QRScannerProps {
  onScan: (decodedText: string) => void;
  isActive: boolean;
}

export function QRScanner({ onScan, isActive }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const startScanner = async () => {
    if (!containerRef.current || scannerRef.current?.getState() === Html5QrcodeScannerState.SCANNING) {
      return;
    }

    setIsInitializing(true);
    setError(null);

    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode('qr-reader');
      }

      await scannerRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1,
        },
        (decodedText) => {
          onScan(decodedText);
          // Don't stop scanner, let parent handle it
        },
        () => {
          // Ignore failed scans
        }
      );

      setIsScanning(true);
    } catch (err: any) {
      console.error('Scanner error:', err);
      if (err.name === 'NotAllowedError') {
        setError('Accès à la caméra refusé. Veuillez autoriser l\'accès dans les paramètres.');
      } else if (err.name === 'NotFoundError') {
        setError('Aucune caméra trouvée sur cet appareil.');
      } else {
        setError('Impossible de démarrer le scanner. Utilisez la saisie manuelle.');
      }
    } finally {
      setIsInitializing(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current?.getState() === Html5QrcodeScannerState.SCANNING) {
      try {
        await scannerRef.current.stop();
        setIsScanning(false);
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current?.getState() === Html5QrcodeScannerState.SCANNING) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  useEffect(() => {
    if (!isActive && isScanning) {
      stopScanner();
    }
  }, [isActive, isScanning]);

  if (error) {
    return (
      <div className="text-center p-4 rounded-xl bg-destructive/10 border border-destructive/20">
        <CameraOff className="w-8 h-8 text-destructive mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setError(null)} 
          className="mt-3"
        >
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {!isScanning ? (
        <Button
          onClick={startScanner}
          disabled={isInitializing}
          variant="outline"
          className="w-full gap-2"
        >
          {isInitializing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Initialisation...
            </>
          ) : (
            <>
              <Camera className="w-4 h-4" />
              Activer la caméra
            </>
          )}
        </Button>
      ) : (
        <Button
          onClick={stopScanner}
          variant="outline"
          className="w-full gap-2"
        >
          <CameraOff className="w-4 h-4" />
          Désactiver la caméra
        </Button>
      )}

      <div
        id="qr-reader"
        ref={containerRef}
        className={`rounded-xl overflow-hidden ${isScanning ? 'block' : 'hidden'}`}
        style={{ width: '100%' }}
      />

      {isScanning && (
        <p className="text-xs text-center text-muted-foreground">
          Placez le QR code dans le cadre
        </p>
      )}
    </div>
  );
}
