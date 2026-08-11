import { api } from "./api";
import type { ApiAffiliateLink } from "./models";

export type AffiliateLinkInput = {
  name: string;
  url: string;
  slug?: string;
  vendor?: string;
  logo?: string;
  niche?: string;
  tagline?: string;
  description?: string;
  pricingNote?: string;
  rating?: number;
  badge?: string;
  pros?: string[];
  cons?: string[];
  useCases?: string[];
  ctaLabel?: string;
  isAffiliate?: boolean;
  active?: boolean;
  epc?: number;
  earnings?: number;
};

/** Admin: full list including destination URLs + earnings. */
export function listAffiliateLinks() {
  return api<ApiAffiliateLink[]>("/affiliate-links?all=1");
}

export function createAffiliateLink(input: AffiliateLinkInput) {
  return api<ApiAffiliateLink>("/affiliate-links", { method: "POST", json: input });
}

export function updateAffiliateLink(slug: string, input: Partial<AffiliateLinkInput>) {
  return api<ApiAffiliateLink>(`/affiliate-links/${slug}`, { method: "PATCH", json: input });
}

export function deleteAffiliateLink(slug: string) {
  return api<{ success: true }>(`/affiliate-links/${slug}`, { method: "DELETE" });
}
