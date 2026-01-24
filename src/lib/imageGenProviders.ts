// Image Generation Provider Configuration
// This module allows switching between different AI providers for image generation

export type ImageGenProvider = 'lovable' | 'openai' | 'replicate' | 'custom';

export interface ImageGenerationConfig {
  provider: ImageGenProvider;
  model?: string;
  endpoint?: string;
}

// Default configuration - uses Lovable AI (no API key needed)
export const defaultImageGenConfig: ImageGenerationConfig = {
  provider: 'lovable',
  model: 'google/gemini-2.5-flash-image-preview',
};

// Provider-specific configurations
export const providerConfigs: Record<ImageGenProvider, {
  name: string;
  description: string;
  requiresApiKey: boolean;
  secretName?: string;
}> = {
  lovable: {
    name: 'Lovable AI',
    description: 'Gratuit avec votre plan Lovable. Utilise Gemini Flash.',
    requiresApiKey: false,
  },
  openai: {
    name: 'OpenAI DALL-E',
    description: 'Génération d\'images haute qualité avec DALL-E 3.',
    requiresApiKey: true,
    secretName: 'OPENAI_API_KEY',
  },
  replicate: {
    name: 'Replicate',
    description: 'Accès à plusieurs modèles comme Flux, SDXL, etc.',
    requiresApiKey: true,
    secretName: 'REPLICATE_API_KEY',
  },
  custom: {
    name: 'API Personnalisée',
    description: 'Connectez votre propre endpoint de génération d\'images.',
    requiresApiKey: true,
    secretName: 'CUSTOM_AI_ENDPOINT',
  },
};

// Get current provider from environment or default
export function getCurrentProvider(): ImageGenProvider {
  // This would be read from a config or environment
  // For now, default to Lovable AI
  return 'lovable';
}
