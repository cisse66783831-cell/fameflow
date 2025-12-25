import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Ticket, Transaction, PaymentMethod } from '@/types/ticket';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export function useTickets(eventId?: string) {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setTickets([]);
      setIsLoading(false);
      return;
    }

    fetchTickets();
  }, [user, eventId]);

  const fetchTickets = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      let query = supabase
        .from('tickets')
        .select(`
          *,
          event:events(*)
        `)
        .or(`owner_id.eq.${user.id},purchaser_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (eventId) {
        query = query.eq('event_id', eventId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTickets((data as unknown as Ticket[]) || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createTicket = async (data: {
    eventId: string;
    isGift: boolean;
    recipientName?: string;
    recipientPhone?: string;
    recipientEmail?: string;
    price: number;
    currency: string;
  }) => {
    if (!user) {
      toast.error('Vous devez être connecté pour acheter un ticket');
      return null;
    }

    try {
      // Generate unique QR code
      const { data: qrCode, error: qrError } = await supabase.rpc('generate_ticket_qr_code');
      if (qrError) throw qrError;

      const ticketData = {
        event_id: data.eventId,
        owner_id: data.isGift ? null : user.id,
        purchaser_id: user.id,
        qr_code: qrCode,
        status: 'pending' as const,
        is_gift: data.isGift,
        recipient_name: data.recipientName || null,
        recipient_phone: data.recipientPhone || null,
        recipient_email: data.recipientEmail || null,
        price: data.price,
        currency: data.currency,
      };

      const { data: ticket, error } = await supabase
        .from('tickets')
        .insert(ticketData)
        .select()
        .single();

      if (error) throw error;

      return ticket as unknown as Ticket;
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast.error('Erreur lors de la création du ticket');
      return null;
    }
  };

  const createTransaction = async (data: {
    ticketId: string;
    amount: number;
    currency: string;
    paymentMethod: PaymentMethod;
    paymentPhone?: string;
  }) => {
    if (!user) return null;

    try {
      const transactionData = {
        ticket_id: data.ticketId,
        user_id: user.id,
        amount: data.amount,
        currency: data.currency,
        payment_method: data.paymentMethod,
        payment_phone: data.paymentPhone || null,
        status: 'pending',
      };

      const { data: transaction, error } = await supabase
        .from('transactions')
        .insert(transactionData)
        .select()
        .single();

      if (error) throw error;

      return transaction as unknown as Transaction;
    } catch (error) {
      console.error('Error creating transaction:', error);
      toast.error('Erreur lors de la création de la transaction');
      return null;
    }
  };

  const confirmPayment = async (ticketId: string, transactionId: string, reference: string) => {
    try {
      // Update transaction
      await supabase
        .from('transactions')
        .update({ status: 'completed', payment_reference: reference })
        .eq('id', transactionId);

      // Update ticket status
      const { error } = await supabase
        .from('tickets')
        .update({ status: 'paid' })
        .eq('id', ticketId);

      if (error) throw error;

      toast.success('Paiement confirmé ! Votre ticket est prêt.');
      await fetchTickets();
      return true;
    } catch (error) {
      console.error('Error confirming payment:', error);
      toast.error('Erreur lors de la confirmation du paiement');
      return false;
    }
  };

  return {
    tickets,
    isLoading,
    createTicket,
    createTransaction,
    confirmPayment,
    refetch: fetchTickets,
  };
}
