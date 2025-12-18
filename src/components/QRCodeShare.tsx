import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { QrCode, Download, Copy, Check } from 'lucide-react';
import { useState, useRef } from 'react';
import { toast } from 'sonner';

interface QRCodeShareProps {
  campaignId: string;
  campaignTitle: string;
}

export const QRCodeShare = ({ campaignId, campaignTitle }: QRCodeShareProps) => {
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);
  
  const shareUrl = `${window.location.origin}/c/${campaignId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleDownloadQR = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = 300;
      canvas.height = 300;
      ctx?.fillRect(0, 0, 300, 300);
      ctx?.drawImage(img, 0, 0, 300, 300);
      
      const link = document.createElement('a');
      link.download = `qr-${campaignTitle.replace(/\s+/g, '-')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success('QR code downloaded!');
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <QrCode className="w-4 h-4 mr-2" />
          QR Code
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share with QR Code</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center gap-6 py-4">
          <div ref={qrRef} className="p-4 bg-white rounded-xl shadow-sm">
            <QRCodeSVG 
              value={shareUrl} 
              size={200}
              level="H"
              includeMargin
            />
          </div>
          
          <p className="text-sm text-muted-foreground text-center">
            Scan this QR code to access the campaign
          </p>
          
          <div className="flex items-center gap-2 w-full">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 px-3 py-2 text-sm rounded-lg bg-muted border border-input"
            />
            <Button variant="outline" size="icon" onClick={handleCopy}>
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          
          <Button onClick={handleDownloadQR} className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Download QR Code
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
