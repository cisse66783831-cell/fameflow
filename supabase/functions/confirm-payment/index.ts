import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Extract and verify authorization
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authentification requise" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with service role for admin operations
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // First verify the user with anon key
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      console.error("Auth error:", authError);
      return new Response(
        JSON.stringify({ error: "Token invalide ou expiré" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { ticketId, transactionId, paymentReference } = await req.json();

    if (!ticketId || !transactionId) {
      return new Response(
        JSON.stringify({ error: "ticketId et transactionId requis" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Payment confirmation request from user ${user.id} for ticket ${ticketId}`);

    // Use service role client for database operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the transaction belongs to the user and is pending
    const { data: transaction, error: txError } = await supabaseAdmin
      .from("transactions")
      .select("*, ticket:tickets(*)")
      .eq("id", transactionId)
      .single();

    if (txError || !transaction) {
      console.error("Transaction not found:", txError);
      return new Response(
        JSON.stringify({ error: "Transaction non trouvée" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the user owns this transaction
    if (transaction.user_id !== user.id) {
      console.warn(`User ${user.id} attempted to confirm transaction ${transactionId} owned by ${transaction.user_id}`);
      return new Response(
        JSON.stringify({ error: "Non autorisé" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the ticket matches
    if (transaction.ticket_id !== ticketId) {
      return new Response(
        JSON.stringify({ error: "Ticket/Transaction mismatch" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if already completed
    if (transaction.status === "completed") {
      return new Response(
        JSON.stringify({ success: true, message: "Paiement déjà confirmé" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // In a real implementation, here we would:
    // 1. Verify the payment with the mobile money provider API (Orange Money, MTN, etc.)
    // 2. Check the payment reference is valid
    // 3. Verify the amount matches
    
    // For now, we'll mark it as pending_verification
    // This requires an admin/staff to manually verify OR a webhook from payment provider
    
    const serverReference = `SRV-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // Update transaction to pending_verification (not completed!)
    // Only a webhook from payment provider or admin should mark as completed
    const { error: updateTxError } = await supabaseAdmin
      .from("transactions")
      .update({ 
        status: "pending_verification",
        payment_reference: paymentReference || serverReference,
        metadata: {
          claimed_at: new Date().toISOString(),
          claimed_by_user: user.id,
          server_reference: serverReference,
        }
      })
      .eq("id", transactionId);

    if (updateTxError) {
      console.error("Error updating transaction:", updateTxError);
      throw updateTxError;
    }

    console.log(`Transaction ${transactionId} marked as pending_verification`);

    // Note: We do NOT update the ticket status here!
    // That should only happen when payment is truly verified

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Paiement en cours de vérification. Vous recevrez une notification une fois confirmé.",
        status: "pending_verification",
        reference: serverReference,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Payment confirmation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erreur serveur" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
