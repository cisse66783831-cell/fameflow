import { useState } from 'react';
import { Campaign } from '@/types/campaign';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Image, FileText, Upload, Sparkles, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CreateCampaignModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (campaign: Campaign) => void;
}

export const CreateCampaignModal = ({ open, onClose, onCreate }: CreateCampaignModalProps) => {
  const [step, setStep] = useState<'type' | 'details'>('type');
  const [type, setType] = useState<'photo' | 'document'>('photo');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [frameImage, setFrameImage] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFrameImage(event.target?.result as string);
        toast.success('Image uploaded!');
      };
      reader.readAsDataURL(file);
    }
  };

  const generateWithAI = async () => {
    setIsGenerating(true);
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const suggestions = [
      { title: 'Support Our Cause', hashtags: '#Support #Community #Together' },
      { title: 'Join the Movement', hashtags: '#Movement #Change #Action' },
      { title: 'Celebrate With Us', hashtags: '#Celebrate #Party #Event' },
    ];
    
    const random = suggestions[Math.floor(Math.random() * suggestions.length)];
    setTitle(random.title);
    setHashtags(random.hashtags);
    setIsGenerating(false);
    toast.success('Generated with AI!');
  };

  const handleCreate = () => {
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    if (!frameImage) {
      toast.error('Please upload an image');
      return;
    }

    const campaign: Campaign = {
      id: `campaign-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      type,
      frameImage,
      textElements: [],
      hashtags: hashtags.split(' ').filter(h => h.startsWith('#')),
      views: 0,
      downloads: 0,
      createdAt: new Date(),
    };

    onCreate(campaign);
    handleClose();
    toast.success('Campaign created!');
  };

  const handleClose = () => {
    setStep('type');
    setType('photo');
    setTitle('');
    setDescription('');
    setHashtags('');
    setFrameImage('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {step === 'type' ? 'Choose Campaign Type' : 'Campaign Details'}
          </DialogTitle>
        </DialogHeader>

        {step === 'type' ? (
          <div className="grid grid-cols-2 gap-4 mt-4">
            <button
              onClick={() => {
                setType('photo');
                setStep('details');
              }}
              className={cn(
                "p-6 rounded-xl border-2 border-dashed transition-all",
                "hover:border-primary hover:bg-primary/5",
                "flex flex-col items-center gap-3 text-center"
              )}
            >
              <div className="p-4 rounded-full bg-primary/10">
                <Image className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="font-medium">Photo Frame</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Overlay on profile photos
                </p>
              </div>
            </button>

            <button
              onClick={() => {
                setType('document');
                setStep('details');
              }}
              className={cn(
                "p-6 rounded-xl border-2 border-dashed transition-all",
                "hover:border-accent hover:bg-accent/5",
                "flex flex-col items-center gap-3 text-center"
              )}
            >
              <div className="p-4 rounded-full bg-accent/10">
                <FileText className="w-8 h-8 text-accent" />
              </div>
              <div>
                <p className="font-medium">Document</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Certificates & diplomas
                </p>
              </div>
            </button>
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            {/* Image Upload */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                {type === 'photo' ? 'Frame Image (PNG with transparency)' : 'Background Image'}
              </label>
              <label className="cursor-pointer block">
                {frameImage ? (
                  <div className="relative group">
                    <img 
                      src={frameImage} 
                      alt="Preview" 
                      className="w-full h-40 object-contain bg-muted/50 rounded-xl"
                    />
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setFrameImage('');
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed rounded-xl p-8 text-center hover:border-primary hover:bg-primary/5 transition-all">
                    <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Click to upload</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Title */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Title</label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={generateWithAI}
                  disabled={isGenerating}
                  className="text-xs"
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  {isGenerating ? 'Generating...' : 'AI Generate'}
                </Button>
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="My Awesome Campaign"
                className="w-full px-4 py-2.5 rounded-lg bg-background border border-input focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your campaign..."
                rows={2}
                className="w-full px-4 py-2.5 rounded-lg bg-background border border-input focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
              />
            </div>

            {/* Hashtags */}
            <div>
              <label className="text-sm font-medium mb-2 block">Hashtags</label>
              <input
                type="text"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                placeholder="#Viral #Campaign #FrameFlow"
                className="w-full px-4 py-2.5 rounded-lg bg-background border border-input focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setStep('type')} className="flex-1">
                Back
              </Button>
              <Button variant="gradient" onClick={handleCreate} className="flex-1">
                Create Campaign
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
