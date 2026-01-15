import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { Event } from '@/types/event';
import { TicketPurchaseModal } from '@/components/TicketPurchaseModal';
import LoadingScreen from '@/components/LoadingScreen';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function TicketPurchasePage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (error) throw error;
      setEvent(data as Event);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching event:', error);
      navigate('/events');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!event) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Acheter un ticket - {event.title} | Jyserai</title>
        <meta name="description" content={`Achetez votre ticket pour ${event.title}`} />
      </Helmet>

      <div className="min-h-screen bg-background p-6">
        <div className="container mx-auto max-w-2xl">
          <Button
            variant="ghost"
            onClick={() => navigate('/events')}
            className="gap-2 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux événements
          </Button>

          <TicketPurchaseModal
            event={event}
            isOpen={showModal}
            onClose={() => navigate('/events')}
            onSuccess={() => {
              // Stay on modal to show success
            }}
          />
        </div>
      </div>
    </>
  );
}
