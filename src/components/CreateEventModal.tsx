import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRoles } from '@/hooks/useUserRoles';
import { supabase } from '@/integrations/supabase/client';
import { Event } from '@/types/event';
import { QRPositionEditor } from '@/components/QRPositionEditor';
import { PhotoZoneEditor } from '@/components/PhotoZoneEditor';
import { AIFrameGenerator } from '@/components/AIFrameGenerator';
import { ImageUploader } from '@/components/ImageUploader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, MapPin, Ticket, Image, QrCode, Loader2, User, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: Event | null;
  onSuccess: () => void;
}

const currencies = [
  { value: 'XOF', label: 'XOF (FCFA)' },
  { value: 'XAF', label: 'XAF (FCFA)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'USD', label: 'USD ($)' },
];

export function CreateEventModal({ isOpen, onClose, event, onSuccess }: CreateEventModalProps) {
  const { user } = useAuth();
  const { isSuperAdmin } = useUserRoles();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    venue: '',
    city: '',
    cover_image: '',
    frame_image: '',
    ticket_price: 0,
    currency: 'XOF',
    max_tickets: '',
    is_active: true,
    qr_position_x: 50,
    qr_position_y: 50,
    photo_zone_x: 50,
    photo_zone_y: 50,
    photo_zone_width: 30,
    photo_zone_height: 30,
    photo_zone_shape: 'circle' as 'rect' | 'circle',
    name_zone_enabled: true,
    name_zone_y: 85,
  });

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        description: event.description || '',
        event_date: event.event_date.slice(0, 16),
        venue: event.venue,
        city: event.city,
        cover_image: event.cover_image || '',
        frame_image: event.frame_image,
        ticket_price: event.ticket_price,
        currency: event.currency,
        max_tickets: event.max_tickets?.toString() || '',
        is_active: event.is_active,
        qr_position_x: event.qr_position_x,
        qr_position_y: event.qr_position_y,
        photo_zone_x: event.photo_zone_x ?? 50,
        photo_zone_y: event.photo_zone_y ?? 50,
        photo_zone_width: event.photo_zone_width ?? 30,
        photo_zone_height: event.photo_zone_height ?? 30,
        photo_zone_shape: (event.photo_zone_shape ?? 'circle') as 'rect' | 'circle',
        name_zone_enabled: event.name_zone_enabled ?? true,
        name_zone_y: event.name_zone_y ?? 85,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        event_date: '',
        venue: '',
        city: '',
        cover_image: '',
        frame_image: '',
        ticket_price: 0,
        currency: 'XOF',
        max_tickets: '',
        is_active: true,
        qr_position_x: 50,
        qr_position_y: 50,
        photo_zone_x: 50,
        photo_zone_y: 50,
        photo_zone_width: 30,
        photo_zone_height: 30,
        photo_zone_shape: 'circle',
        name_zone_enabled: true,
        name_zone_y: 85,
      });
    }
    setActiveTab('details');
  }, [event, isOpen]);

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Vous devez être connecté');
      return;
    }

    if (!formData.title || !formData.event_date || !formData.venue || !formData.city || !formData.frame_image) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsSubmitting(true);

    const eventData = {
      title: formData.title,
      description: formData.description || null,
      event_date: formData.event_date,
      venue: formData.venue,
      city: formData.city,
      cover_image: formData.cover_image || null,
      frame_image: formData.frame_image,
      ticket_price: formData.ticket_price,
      currency: formData.currency,
      max_tickets: formData.max_tickets ? parseInt(formData.max_tickets) : null,
      is_active: formData.is_active,
      qr_position_x: formData.qr_position_x,
      qr_position_y: formData.qr_position_y,
      photo_zone_x: formData.photo_zone_x,
      photo_zone_y: formData.photo_zone_y,
      photo_zone_width: formData.photo_zone_width,
      photo_zone_height: formData.photo_zone_height,
      photo_zone_shape: formData.photo_zone_shape,
      name_zone_enabled: formData.name_zone_enabled,
      name_zone_y: formData.name_zone_y,
      user_id: user.id,
    };

    let error;
    if (event) {
      const { error: updateError } = await supabase
        .from('events')
        .update(eventData)
        .eq('id', event.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('events')
        .insert(eventData);
      error = insertError;
      
      // Also add promoter role if not already
      if (!error) {
        await supabase
          .from('user_roles')
          .upsert({ user_id: user.id, role: 'promoter' }, { onConflict: 'user_id,role' });
      }
    }

    setIsSubmitting(false);

    if (error) {
      console.error('Error saving event:', error);
      toast.error('Erreur lors de la sauvegarde');
    } else {
      onSuccess();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-display">
            {event ? 'Modifier l\'événement' : 'Créer un événement'}
          </DialogTitle>
          <DialogDescription>
            {event ? 'Modifiez les détails de votre événement' : 'Remplissez les informations pour créer votre événement'}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="details" className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Détails</span>
            </TabsTrigger>
            <TabsTrigger value="design" className="flex items-center gap-1">
              <Image className="w-4 h-4" />
              <span className="hidden sm:inline">Design</span>
            </TabsTrigger>
            <TabsTrigger value="photo-zone" className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Zone Photo</span>
            </TabsTrigger>
            <TabsTrigger value="qr" className="flex items-center gap-1">
              <QrCode className="w-4 h-4" />
              <span className="hidden sm:inline">QR Code</span>
            </TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Nom de l'événement"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Décrivez votre événement..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="event_date">Date & Heure *</Label>
                <Input
                  id="event_date"
                  type="datetime-local"
                  value={formData.event_date}
                  onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Ville *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Ex: Abidjan"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="venue">Lieu *</Label>
              <Input
                id="venue"
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                placeholder="Nom du lieu ou adresse"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ticket_price">Prix du ticket</Label>
                <Input
                  id="ticket_price"
                  type="number"
                  min="0"
                  value={formData.ticket_price}
                  onChange={(e) => setFormData({ ...formData, ticket_price: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Devise</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => setFormData({ ...formData, currency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_tickets">Max tickets</Label>
                <Input
                  id="max_tickets"
                  type="number"
                  min="1"
                  value={formData.max_tickets}
                  onChange={(e) => setFormData({ ...formData, max_tickets: e.target.value })}
                  placeholder="Illimité"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary">
              <div>
                <Label>Événement actif</Label>
                <p className="text-xs text-muted-foreground">Visible et ouvert aux ventes</p>
              </div>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </TabsContent>

          <TabsContent value="design" className="space-y-6 mt-4">
            <ImageUploader
              value={formData.cover_image}
              onChange={(url) => setFormData({ ...formData, cover_image: url })}
              bucket="event-images"
              folder="covers"
              label="Image de couverture"
              aspectRatio="video"
            />

            <div className="space-y-2">
              <ImageUploader
                value={formData.frame_image}
                onChange={(url) => setFormData({ ...formData, frame_image: url })}
                bucket="event-images"
                folder="tickets"
                label="Design du ticket *"
                aspectRatio="portrait"
                className="max-w-xs"
              />
              <p className="text-xs text-muted-foreground">
                L'image de fond sur laquelle le QR code sera placé
              </p>
              
              {/* AI Adaptation Button - Super Admin only */}
              {formData.frame_image && isSuperAdmin() && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAIGenerator(true)}
                  className="w-full gap-2 mt-2"
                >
                  <Sparkles className="w-4 h-4 text-primary" />
                  Adapter avec l'IA
                </Button>
              )}
            </div>
          </TabsContent>

          {/* Photo Zone Tab */}
          <TabsContent value="photo-zone" className="space-y-4 mt-4">
            {formData.frame_image ? (
              <PhotoZoneEditor
                frameImage={formData.frame_image}
                initialX={formData.photo_zone_x}
                initialY={formData.photo_zone_y}
                initialWidth={formData.photo_zone_width}
                initialHeight={formData.photo_zone_height}
                initialShape={formData.photo_zone_shape}
                nameZoneEnabled={formData.name_zone_enabled}
                nameZoneY={formData.name_zone_y}
                onChange={(zone) => setFormData({
                  ...formData,
                  photo_zone_x: zone.x,
                  photo_zone_y: zone.y,
                  photo_zone_width: zone.width,
                  photo_zone_height: zone.height,
                  photo_zone_shape: zone.shape,
                  name_zone_enabled: zone.nameEnabled,
                  name_zone_y: zone.nameY,
                })}
                showActions={false}
              />
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Ajoutez d'abord le design du ticket dans l'onglet Design</p>
              </div>
            )}
          </TabsContent>

          {/* QR Position Tab */}
          <TabsContent value="qr" className="space-y-4 mt-4">
          {formData.frame_image ? (
              <QRPositionEditor
                frameImage={formData.frame_image}
                initialX={formData.qr_position_x}
                initialY={formData.qr_position_y}
                onChange={(x, y) => setFormData({ ...formData, qr_position_x: x, qr_position_y: y })}
                showActions={false}
              />
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <QrCode className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Ajoutez d'abord le design du ticket dans l'onglet Design</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button 
            className="btn-neon gradient-primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {event ? 'Enregistrer' : 'Créer l\'événement'}
          </Button>
        </div>
      </DialogContent>

      {/* AI Frame Generator Modal */}
      {formData.frame_image && (
        <AIFrameGenerator
          isOpen={showAIGenerator}
          onClose={() => setShowAIGenerator(false)}
          originalImage={formData.frame_image}
          eventTitle={formData.title || 'Mon événement'}
          onImageGenerated={(newImageUrl) => {
            setFormData({ ...formData, frame_image: newImageUrl });
            toast.success('Design mis à jour avec l\'image générée !');
          }}
        />
      )}
    </Dialog>
  );
}
