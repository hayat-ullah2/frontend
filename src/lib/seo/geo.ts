// Geo-targeting & internationalization reference data for the SEO system.
//
// This is intentionally framework-agnostic (no React / Next / Mongoose imports)
// so the SAME file can be mirrored into the backend for server-authoritative
// validation. Keep it a pure data + helper module.

export type CountryCode =
  | "global"
  | "us"
  | "ca"
  | "au"
  | "gb"
  | "de"
  | "fr"
  | "in"
  | "pk"
  | "ae"
  | "sa";

export type TargetCountry = {
  code: CountryCode;
  name: string;
  /** ISO country segment used for localized URLs, e.g. /us/slug. `null` for global. */
  urlSegment: string | null;
  /** Default hreflang for a single-language market, e.g. "en-US". */
  hreflang: string;
  /** Human currency + measurement hints used by the localization checker. */
  currency: string;
  measurement: "imperial" | "metric";
  /** Locale flavour of English used for spelling checks, if English-speaking. */
  englishVariant?: "us" | "uk" | "ca" | "au" | null;
};

export const TARGET_COUNTRIES: TargetCountry[] = [
  { code: "global", name: "Global", urlSegment: null, hreflang: "x-default", currency: "USD", measurement: "metric", englishVariant: null },
  { code: "us", name: "United States", urlSegment: "us", hreflang: "en-US", currency: "USD", measurement: "imperial", englishVariant: "us" },
  { code: "ca", name: "Canada", urlSegment: "ca", hreflang: "en-CA", currency: "CAD", measurement: "metric", englishVariant: "ca" },
  { code: "au", name: "Australia", urlSegment: "au", hreflang: "en-AU", currency: "AUD", measurement: "metric", englishVariant: "au" },
  { code: "gb", name: "United Kingdom", urlSegment: "uk", hreflang: "en-GB", currency: "GBP", measurement: "metric", englishVariant: "uk" },
  { code: "de", name: "Germany", urlSegment: "de", hreflang: "de-DE", currency: "EUR", measurement: "metric" },
  { code: "fr", name: "France", urlSegment: "fr", hreflang: "fr-FR", currency: "EUR", measurement: "metric" },
  { code: "in", name: "India", urlSegment: "in", hreflang: "en-IN", currency: "INR", measurement: "metric", englishVariant: "uk" },
  { code: "pk", name: "Pakistan", urlSegment: "pk", hreflang: "en-PK", currency: "PKR", measurement: "metric", englishVariant: "uk" },
  { code: "ae", name: "United Arab Emirates", urlSegment: "ae", hreflang: "en-AE", currency: "AED", measurement: "metric", englishVariant: "uk" },
  { code: "sa", name: "Saudi Arabia", urlSegment: "sa", hreflang: "ar-SA", currency: "SAR", measurement: "metric" },
];

export const COUNTRY_BY_CODE: Record<string, TargetCountry> = Object.fromEntries(
  TARGET_COUNTRIES.map((c) => [c.code, c]),
);

export type TargetLanguage = { code: string; name: string };

export const TARGET_LANGUAGES: TargetLanguage[] = [
  { code: "en", name: "English" },
  { code: "en-US", name: "English (US)" },
  { code: "en-GB", name: "English (UK)" },
  { code: "en-CA", name: "English (Canada)" },
  { code: "en-AU", name: "English (Australia)" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "ar", name: "Arabic" },
  { code: "es", name: "Spanish" },
  { code: "hi", name: "Hindi" },
  { code: "ur", name: "Urdu" },
];

export type SearchIntent =
  | "informational"
  | "commercial"
  | "transactional"
  | "navigational";

export const SEARCH_INTENTS: { value: SearchIntent; label: string; hint: string }[] = [
  { value: "informational", label: "Informational", hint: "How-to, what-is, guides, explanations" },
  { value: "commercial", label: "Commercial investigation", hint: "Best, top, reviews, comparisons" },
  { value: "transactional", label: "Transactional", hint: "Buy, price, deal, coupon, order" },
  { value: "navigational", label: "Navigational", hint: "Brand / specific site or product" },
];

// ── Localization: US ⇄ UK/CA/AU spelling pairs ────────────────────────────
// Used to flag spelling that does not match the selected market. This is a
// *suggestion* engine — it never rewrites content automatically.
// Keyed by US spelling → non-US ("Commonwealth") spelling.
export const US_TO_UK_SPELLING: Record<string, string> = {
  color: "colour",
  colors: "colours",
  favorite: "favourite",
  favorites: "favourites",
  honor: "honour",
  behavior: "behaviour",
  organize: "organise",
  organized: "organised",
  organization: "organisation",
  recognize: "recognise",
  analyze: "analyse",
  analyzed: "analysed",
  center: "centre",
  centers: "centres",
  meter: "metre",
  liter: "litre",
  fiber: "fibre",
  defense: "defence",
  license: "licence",
  traveled: "travelled",
  traveling: "travelling",
  canceled: "cancelled",
  labeled: "labelled",
  catalog: "catalogue",
  dialog: "dialogue",
  gray: "grey",
  math: "maths",
  program: "programme",
};

/** Words whose presence hints at a US-centric context (for non-US targets). */
export const US_TERMINOLOGY = ["college", "vacation", "apartment", "cellphone", "gas station", "sidewalk", "zip code", "sales tax"];
/** Words whose presence hints at a UK-centric context (for US targets). */
export const UK_TERMINOLOGY = ["university", "holiday", "flat", "mobile phone", "petrol station", "pavement", "postcode", "vat"];

export function isValidCountryCode(code: string): boolean {
  return code in COUNTRY_BY_CODE;
}

export function isValidLanguage(code: string): boolean {
  return TARGET_LANGUAGES.some((l) => l.code === code);
}

export function isValidIntent(value: string): value is SearchIntent {
  return SEARCH_INTENTS.some((i) => i.value === value);
}
