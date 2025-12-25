import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface EventStats {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  ticketsSold: number;
  ticketsScanned: number;
  totalRevenue: number;
  visualsCreated: number;
  pendingTickets: number;
  currency: string;
}

export interface GlobalStats {
  totalEvents: number;
  totalTicketsSold: number;
  totalTicketsScanned: number;
  totalRevenue: number;
  totalVisuals: number;
  conversionRate: number;
  scanRate: number;
}

export interface DailyStats {
  date: string;
  ticketsSold: number;
  revenue: number;
  scans: number;
}

export function useEventStats() {
  const { user } = useAuth();
  const [eventStats, setEventStats] = useState<EventStats[]>([]);
  const [globalStats, setGlobalStats] = useState<GlobalStats>({
    totalEvents: 0,
    totalTicketsSold: 0,
    totalTicketsScanned: 0,
    totalRevenue: 0,
    totalVisuals: 0,
    conversionRate: 0,
    scanRate: 0,
  });
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);

    try {
      // Fetch user's events
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user.id)
        .order('event_date', { ascending: false });

      if (eventsError) throw eventsError;

      if (!events || events.length === 0) {
        setEventStats([]);
        setGlobalStats({
          totalEvents: 0,
          totalTicketsSold: 0,
          totalTicketsScanned: 0,
          totalRevenue: 0,
          totalVisuals: 0,
          conversionRate: 0,
          scanRate: 0,
        });
        setDailyStats([]);
        setIsLoading(false);
        return;
      }

      const eventIds = events.map(e => e.id);

      // Fetch all tickets for user's events
      const { data: tickets, error: ticketsError } = await supabase
        .from('tickets')
        .select('*')
        .in('event_id', eventIds);

      if (ticketsError) throw ticketsError;

      // Fetch all visuals for user's events
      const { data: visuals, error: visualsError } = await supabase
        .from('public_visuals')
        .select('*')
        .in('event_id', eventIds);

      if (visualsError) throw visualsError;

      // Calculate stats per event
      const stats: EventStats[] = events.map(event => {
        const eventTickets = tickets?.filter(t => t.event_id === event.id) || [];
        const paidTickets = eventTickets.filter(t => t.status === 'paid' || t.status === 'used');
        const scannedTickets = eventTickets.filter(t => t.status === 'used');
        const pendingTickets = eventTickets.filter(t => t.status === 'pending');
        const eventVisuals = visuals?.filter(v => v.event_id === event.id) || [];

        const totalRevenue = paidTickets.reduce((sum, t) => sum + Number(t.price), 0);

        return {
          eventId: event.id,
          eventTitle: event.title,
          eventDate: event.event_date,
          ticketsSold: paidTickets.length,
          ticketsScanned: scannedTickets.length,
          totalRevenue,
          visualsCreated: eventVisuals.length,
          pendingTickets: pendingTickets.length,
          currency: event.currency || 'XOF',
        };
      });

      setEventStats(stats);

      // Calculate global stats
      const totalTicketsSold = stats.reduce((sum, s) => sum + s.ticketsSold, 0);
      const totalTicketsScanned = stats.reduce((sum, s) => sum + s.ticketsScanned, 0);
      const totalRevenue = stats.reduce((sum, s) => sum + s.totalRevenue, 0);
      const totalVisuals = stats.reduce((sum, s) => sum + s.visualsCreated, 0);

      setGlobalStats({
        totalEvents: events.length,
        totalTicketsSold,
        totalTicketsScanned,
        totalRevenue,
        totalVisuals,
        conversionRate: totalVisuals > 0 ? (totalTicketsSold / totalVisuals) * 100 : 0,
        scanRate: totalTicketsSold > 0 ? (totalTicketsScanned / totalTicketsSold) * 100 : 0,
      });

      // Calculate daily stats (last 14 days)
      const dailyMap: Record<string, DailyStats> = {};
      const now = new Date();
      
      for (let i = 13; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        dailyMap[dateStr] = { date: dateStr, ticketsSold: 0, revenue: 0, scans: 0 };
      }

      tickets?.forEach(ticket => {
        const dateStr = new Date(ticket.created_at).toISOString().split('T')[0];
        if (dailyMap[dateStr] && (ticket.status === 'paid' || ticket.status === 'used')) {
          dailyMap[dateStr].ticketsSold += 1;
          dailyMap[dateStr].revenue += Number(ticket.price);
        }
        if (dailyMap[dateStr] && ticket.scanned_at) {
          const scanDate = new Date(ticket.scanned_at).toISOString().split('T')[0];
          if (dailyMap[scanDate]) {
            dailyMap[scanDate].scans += 1;
          }
        }
      });

      setDailyStats(Object.values(dailyMap));

    } catch (error) {
      console.error('Error fetching stats:', error);
    }

    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { eventStats, globalStats, dailyStats, isLoading, refetch: fetchStats };
}
