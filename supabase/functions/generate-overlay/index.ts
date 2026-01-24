import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Get the configured provider (defaults to lovable)
function getProvider(): string {
  return Deno.env.get("IMAGE_GEN_PROVIDER") || "lovable";
}

// Generate image using Lovable AI (Gemini)
async function generateWithLovable(prompt: string, originalImageUrl: string): Promise<string> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    throw new Error("LOVABLE_API_KEY is not configured");
  }

  console.log("=== GENERATING WITH LOVABLE AI ===");
  console.log("Original Image URL:", originalImageUrl?.substring(0, 100) + "...");
  console.log("Prompt:", prompt.substring(0, 300) + "...");
  console.log("Timestamp:", new Date().toISOString());

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-pro-image-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt,
            },
            {
              type: "image_url",
              image_url: {
                url: originalImageUrl,
              },
            },
          ],
        },
      ],
      modalities: ["image", "text"],
    }),
  });

  if (!response.ok) {
    const status = response.status;
    const errorText = await response.text();
    console.error("Lovable AI error:", status, errorText);
    
    if (status === 429) {
      throw { status: 429, message: "Rate limit exceeded" };
    }
    if (status === 402) {
      throw { status: 402, message: "Payment required" };
    }
    throw new Error(`AI gateway error: ${status}`);
  }

  const data = await response.json();
  console.log("=== LOVABLE AI RESPONSE ===");
  console.log("Has choices:", !!data.choices?.length);
  console.log("Has images:", !!data.choices?.[0]?.message?.images?.length);

  const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
  if (!imageUrl) {
    throw new Error("No image generated");
  }

  return imageUrl;
}

// Generate image using OpenAI DALL-E (for future use)
async function generateWithOpenAI(prompt: string, _originalImageUrl: string): Promise<string> {
  const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured. Please add it in your secrets.");
  }

  console.log("Generating with OpenAI DALL-E...");

  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      response_format: "url",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("OpenAI error:", response.status, errorText);
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.data?.[0]?.url;
}

// Generate image using Replicate (for future use)
async function generateWithReplicate(prompt: string, originalImageUrl: string): Promise<string> {
  const REPLICATE_API_KEY = Deno.env.get("REPLICATE_API_KEY");
  if (!REPLICATE_API_KEY) {
    throw new Error("REPLICATE_API_KEY is not configured. Please add it in your secrets.");
  }

  console.log("Generating with Replicate...");

  // Using Flux Schnell for fast generation
  const response = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      Authorization: `Token ${REPLICATE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      version: "black-forest-labs/flux-schnell",
      input: {
        prompt: prompt,
        image: originalImageUrl,
        guidance_scale: 7.5,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Replicate error:", response.status, errorText);
    throw new Error(`Replicate API error: ${response.status}`);
  }

  const prediction = await response.json();
  
  // Poll for result
  let result = prediction;
  while (result.status !== "succeeded" && result.status !== "failed") {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
      headers: { Authorization: `Token ${REPLICATE_API_KEY}` },
    });
    result = await pollResponse.json();
  }

  if (result.status === "failed") {
    throw new Error("Replicate generation failed");
  }

  return result.output?.[0] || result.output;
}

// Generate image using custom endpoint
async function generateWithCustom(prompt: string, originalImageUrl: string): Promise<string> {
  const CUSTOM_AI_ENDPOINT = Deno.env.get("CUSTOM_AI_ENDPOINT");
  const CUSTOM_AI_API_KEY = Deno.env.get("CUSTOM_AI_API_KEY");
  
  if (!CUSTOM_AI_ENDPOINT) {
    throw new Error("CUSTOM_AI_ENDPOINT is not configured. Please add it in your secrets.");
  }

  console.log("Generating with custom endpoint:", CUSTOM_AI_ENDPOINT);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  
  if (CUSTOM_AI_API_KEY) {
    headers["Authorization"] = `Bearer ${CUSTOM_AI_API_KEY}`;
  }

  const response = await fetch(CUSTOM_AI_ENDPOINT, {
    method: "POST",
    headers,
    body: JSON.stringify({
      prompt,
      image_url: originalImageUrl,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Custom API error:", response.status, errorText);
    throw new Error(`Custom API error: ${response.status}`);
  }

  const data = await response.json();
  return data.image_url || data.url || data.output;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mode, originalImageUrl, prompt, eventTitle } = await req.json();

    console.log("Generate overlay request:", { mode, eventTitle, hasImage: !!originalImageUrl });

    if (!originalImageUrl || !prompt) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const provider = getProvider();
    console.log("Using provider:", provider);

    let imageUrl: string;

    try {
      switch (provider) {
        case "openai":
          imageUrl = await generateWithOpenAI(prompt, originalImageUrl);
          break;
        case "replicate":
          imageUrl = await generateWithReplicate(prompt, originalImageUrl);
          break;
        case "custom":
          imageUrl = await generateWithCustom(prompt, originalImageUrl);
          break;
        case "lovable":
        default:
          imageUrl = await generateWithLovable(prompt, originalImageUrl);
          break;
      }
    } catch (genError: any) {
      // Handle rate limit and payment errors
      if (genError.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded", status: 429 }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (genError.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required", status: 402 }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw genError;
    }

    // If the image is base64, we need to upload it to storage
    if (imageUrl.startsWith("data:image")) {
      console.log("Uploading base64 image to storage...");
      
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Convert base64 to blob
      const base64Data = imageUrl.split(",")[1];
      const binaryData = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
      const blob = new Blob([binaryData], { type: "image/png" });

      const fileName = `ai-generated/${Date.now()}-${Math.random().toString(36).substring(7)}.png`;

      const { error: uploadError } = await supabase.storage
        .from("event-images")
        .upload(fileName, blob, {
          contentType: "image/png",
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw new Error("Failed to upload generated image");
      }

      const { data: urlData } = supabase.storage
        .from("event-images")
        .getPublicUrl(fileName);

      imageUrl = urlData.publicUrl;
      console.log("Image uploaded to:", imageUrl);
    }

    return new Response(
      JSON.stringify({ imageUrl, provider }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Generate overlay error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});