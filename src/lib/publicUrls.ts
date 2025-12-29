// Centralized helpers for building public URLs (share links, QR codes, etc.)
// Uses the current domain (preview or custom domain) so links work everywhere.

export const getPublicBaseUrl = (): string => {
  if (typeof window === 'undefined') return '';
  return window.location.origin;
};

export const getCampaignPublicSlugOrId = (campaign: { id: string; slug?: string | null }): string => {
  const slug = (campaign.slug ?? '').trim();
  return slug || campaign.id;
};

export const getCampaignPublicUrl = (campaign: { id: string; slug?: string | null }): string => {
  const base = getPublicBaseUrl();
  const slugOrId = getCampaignPublicSlugOrId(campaign);
  if (!base) return `/${slugOrId}`;
  return `${base}/${slugOrId}`;
};
