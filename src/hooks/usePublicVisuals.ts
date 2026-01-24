import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PublicVisual } from '@/types/event';

export function usePublicVisuals(eventId?: string) {
  const [visuals, setVisuals] = useState<PublicVisual[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchVisuals = useCallback(async () => {
    setIsLoading(true);
    
    let query = supabase
      .from('public_visuals')
      .select(`
        *,
        event:events(*)
      `)
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .limit(50);

    if (eventId) {
      query = query.eq('event_id', eventId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching visuals:', error);
    } else {
      setVisuals(data as PublicVisual[] || []);
    }
    setIsLoading(false);
  }, [eventId]);

  useEffect(() => {
    fetchVisuals();

    // Subscribe to realtime updates (INSERT, UPDATE, DELETE)
    const channel = supabase
      .channel('public_visuals_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events
          schema: 'public',
          table: 'public_visuals',
        },
        (payload) => {
          const newEventId = (payload.new as any)?.event_id;
          const oldEventId = (payload.old as any)?.event_id;
          if (!eventId || newEventId === eventId || oldEventId === eventId) {
            fetchVisuals();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchVisuals, eventId]);

  const addVisual = async (visual: Omit<PublicVisual, 'id' | 'created_at' | 'is_approved' | 'is_featured' | 'views'>) => {
    const { data, error } = await supabase
      .from('public_visuals')
      .insert(visual)
      .select()
      .single();

    if (error) {
      console.error('Error adding visual:', error);
      throw error;
    }

    return data;
  };

  return { visuals, isLoading, addVisual, refetch: fetchVisuals };
}
