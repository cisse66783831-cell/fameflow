import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const cloudName = Deno.env.get('CLOUDINARY_CLOUD_NAME');
    const apiKey = Deno.env.get('CLOUDINARY_API_KEY');
    const apiSecret = Deno.env.get('CLOUDINARY_API_SECRET');

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error('Cloudinary credentials not configured');
    }

    // Get the video file from the request
    const formData = await req.formData();
    const videoFile = formData.get('video') as File;
    
    if (!videoFile) {
      throw new Error('No video file provided');
    }

    console.log(`Converting video: ${videoFile.name}, size: ${videoFile.size}, type: ${videoFile.type}`);

    // Convert File to base64 for Cloudinary upload
    const arrayBuffer = await videoFile.arrayBuffer();
    const base64Video = btoa(
      new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );
    const dataUri = `data:${videoFile.type};base64,${base64Video}`;

    // Generate signature for authenticated upload
    const timestamp = Math.floor(Date.now() / 1000);
    const paramsToSign = `format=mp4&resource_type=video&timestamp=${timestamp}`;
    
    // Create signature using HMAC-SHA1
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(apiSecret),
      { name: 'HMAC', hash: 'SHA-1' },
      false,
      ['sign']
    );
    const signatureBuffer = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(paramsToSign)
    );
    const signature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Upload to Cloudinary with MP4 conversion
    const cloudinaryForm = new FormData();
    cloudinaryForm.append('file', dataUri);
    cloudinaryForm.append('api_key', apiKey);
    cloudinaryForm.append('timestamp', timestamp.toString());
    cloudinaryForm.append('signature', signature);
    cloudinaryForm.append('resource_type', 'video');
    cloudinaryForm.append('format', 'mp4');

    console.log('Uploading to Cloudinary...');
    
    const uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
      {
        method: 'POST',
        body: cloudinaryForm,
      }
    );

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('Cloudinary upload error:', errorText);
      throw new Error(`Cloudinary upload failed: ${errorText}`);
    }

    const uploadResult = await uploadResponse.json();
    console.log('Upload successful, public_id:', uploadResult.public_id);

    // Get the MP4 URL directly from secure_url (already in MP4 format)
    const mp4Url = uploadResult.secure_url;
    
    console.log('MP4 URL:', mp4Url);

    // Download the converted MP4
    const mp4Response = await fetch(mp4Url);
    if (!mp4Response.ok) {
      throw new Error('Failed to download converted MP4');
    }

    const mp4Buffer = await mp4Response.arrayBuffer();
    console.log('MP4 downloaded, size:', mp4Buffer.byteLength);

    // Delete the temporary file from Cloudinary (cleanup)
    const deleteTimestamp = Math.floor(Date.now() / 1000);
    const deleteParamsToSign = `public_id=${uploadResult.public_id}&timestamp=${deleteTimestamp}`;
    const deleteSignatureBuffer = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(deleteParamsToSign)
    );
    const deleteSignature = Array.from(new Uint8Array(deleteSignatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Fire and forget cleanup
    fetch(`https://api.cloudinary.com/v1_1/${cloudName}/video/destroy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        public_id: uploadResult.public_id,
        api_key: apiKey,
        timestamp: deleteTimestamp.toString(),
        signature: deleteSignature,
      }),
    }).catch(err => console.warn('Cleanup failed:', err));

    // Return the MP4 file
    return new Response(mp4Buffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'video/mp4',
        'Content-Disposition': 'attachment; filename="video.mp4"',
      },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Conversion error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
