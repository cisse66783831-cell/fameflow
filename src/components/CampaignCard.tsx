import { Campaign } from '@/types/campaign';
import { Eye, Download, Image, FileText, Trash2, Play, Share2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { toast } from 'sonner';

interface CampaignCardProps {
  campaign: Campaign;
  onSelect: (campaign: Campaign) => void;
  onDelete: (id: string) => void;
  index: number;
}

export const CampaignCard = ({ campaign, onSelect, onDelete, index }: CampaignCardProps) => {
  const [copied, setCopied] = useState(false);
  
  const previewImage = campaign.type === 'photo' 
    ? campaign.frameImage 
    : campaign.backgroundImage;

  const shareUrl = `${window.location.origin}/c/${campaign.id}`;

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: campaign.title,
          text: campaign.description || `Check out ${campaign.title} on FrameFlow`,
          url: shareUrl,
        });
      } catch {
        // User cancelled or error
      }
    } else {
      handleCopyLink(e);
    }
  };

  return (
    <div 
      className={cn(
        "group glass-card rounded-2xl overflow-hidden animate-slide-up",
        "hover:shadow-elevated transition-all duration-300 hover:-translate-y-1"
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Preview */}
      <div className="relative aspect-square bg-muted/50 overflow-hidden">
        {previewImage ? (
          <img 
            src={previewImage} 
            alt={campaign.title}
            className="w-full h-full object-contain p-4"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {campaign.type === 'photo' ? (
              <Image className="w-16 h-16 text-muted-foreground/30" />
            ) : (
              <FileText className="w-16 h-16 text-muted-foreground/30" />
            )}
          </div>
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4">
          <Button 
            variant="glass" 
            size="lg"
            onClick={() => onSelect(campaign)}
            className="backdrop-blur-md"
          >
            <Play className="w-4 h-4 mr-2" />
            Use Template
          </Button>
        </div>

        {/* Badge */}
        <div className={cn(
          "absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium",
          campaign.type === 'photo' 
            ? "bg-primary/90 text-primary-foreground" 
            : "bg-accent/90 text-accent-foreground"
        )}>
          {campaign.type === 'photo' ? 'Photo Frame' : 'Document'}
        </div>

        {campaign.isDemo && (
          <div className="absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
            Demo
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-display font-semibold text-foreground truncate">
          {campaign.title}
        </h3>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
          {campaign.description}
        </p>

        {/* Stats & Actions */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Eye className="w-4 h-4" />
            <span>{campaign.views.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Download className="w-4 h-4" />
            <span>{campaign.downloads.toLocaleString()}</span>
          </div>
          
          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={handleCopyLink}
              className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-primary/10"
              title="Copy link"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={handleShare}
              className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-primary/10"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(campaign.id);
              }}
              className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Hashtags */}
        {campaign.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {campaign.hashtags.slice(0, 3).map((tag, i) => (
              <span 
                key={i}
                className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
