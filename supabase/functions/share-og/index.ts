import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const visualId = url.searchParams.get("id");

    if (!visualId) {
      return new Response("Missing id", { status: 400, headers: corsHeaders });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch the shared visual
    const { data: visual, error } = await supabase
      .from("shared_visuals")
      .select("id, creator_name, visual_url, description, campaign_id, event_id")
      .eq("id", visualId)
      .single();

    if (error || !visual) {
      return new Response("Not found", { status: 404, headers: corsHeaders });
    }

    // Fetch parent title
    let parentTitle = "Jyserai";
    if (visual.campaign_id) {
      const { data: campaign } = await supabase
        .from("campaigns")
        .select("title")
        .eq("id", visual.campaign_id)
        .single();
      if (campaign) parentTitle = campaign.title;
    } else if (visual.event_id) {
      const { data: event } = await supabase
        .from("events")
        .select("title")
        .eq("id", visual.event_id)
        .single();
      if (event) parentTitle = event.title;
    }

    const ogTitle = `${visual.creator_name} sera à ${parentTitle}`;
    const ogDescription = visual.description || `J'y serai ! 🎉 Rejoins-moi à ${parentTitle}`;
    const ogImage = visual.visual_url;

    // Determine the frontend app URL (use Referer or Origin, fallback to known domain)
    const origin = req.headers.get("origin") || req.headers.get("referer") || "https://fameflow.lovable.app";
    const appBase = origin.replace(/\/$/, "");
    const spaUrl = `${appBase}/share/${visualId}`;

    // Serve a minimal HTML page with OG tags
    // Bots read the OG tags; real browsers get redirected to the SPA
    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(ogTitle)} | Jyserai</title>
  <meta name="description" content="${escapeHtml(ogDescription)}">

  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escapeHtml(ogTitle)}">
  <meta property="og:description" content="${escapeHtml(ogDescription)}">
  <meta property="og:image" content="${escapeHtml(ogImage)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="${escapeHtml(spaUrl)}">
  <meta property="og:site_name" content="Jyserai">

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(ogTitle)}">
  <meta name="twitter:description" content="${escapeHtml(ogDescription)}">
  <meta name="twitter:image" content="${escapeHtml(ogImage)}">

  <!-- Redirect real users to the SPA -->
  <meta http-equiv="refresh" content="0;url=${escapeHtml(spaUrl)}">
</head>
<body>
  <p>Redirection vers <a href="${escapeHtml(spaUrl)}">${escapeHtml(ogTitle)}</a>...</p>
</body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    console.error("share-og error:", err);
    return new Response("Internal error", { status: 500, headers: corsHeaders });
  }
});

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
