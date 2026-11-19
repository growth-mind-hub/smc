import { asText } from "@prismicio/client";
import { createClient } from "@/prismicio";
import servicesData from "@/data/services.json";

export interface ServicePricing {
  vehicle: string;
  rate: string;
}

export interface ServiceFAQ {
  question: string;
  answer: string;
}

export interface NormalizedService {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  shortDescription: string;
  heroDescription: string;
  heroDescriptionRichText?: any;
  icon: string;
  tags: string[];
  inclusions: string[];
  pricing: ServicePricing[];
  faqs: ServiceFAQ[];
  startingPrice?: string;
  displayOrder: number;
  isFeatured: boolean;
  featuredImageUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
}

/**
 * Standard fallback pricing when a newly created Prismic service has no pricing table
 */
export const DEFAULT_SERVICE_PRICING: ServicePricing[] = [
  { vehicle: "6-Seater Maxi Cab", rate: "$65 SGD" },
  { vehicle: "7-Seater Maxi Cab", rate: "$70 SGD" },
  { vehicle: "9-Seater Maxi Cab", rate: "$75 SGD" },
  { vehicle: "13-Seater Minibus", rate: "$80 SGD" },
  { vehicle: "VIP Lounge 7-Seater", rate: "$90 SGD" },
];

/**
 * Standard fallback inclusions when a service has no highlights specified
 */
export const DEFAULT_SERVICE_INCLUSIONS: string[] = [
  "Fixed flat fare — zero hidden surge or waiting charges",
  "Professional, English-fluent licensed Singapore chauffeur",
  "Pristine, fully air-conditioned and sanitized vehicle",
  "Complimentary luggage handling assistance",
  "Direct WhatsApp driver communication & dispatch tracking",
  "Round-the-clock island-wide availability",
];

/**
 * Standard fallback FAQs for new services
 */
export const DEFAULT_SERVICE_FAQS: ServiceFAQ[] = [
  {
    question: "How far in advance should I book this service?",
    answer: "We recommend booking at least 1 to 2 hours before your requested pickup time. Immediate and same-day bookings are also available via WhatsApp.",
  },
  {
    question: "Are your fares fixed with no hidden fees?",
    answer: "Yes, 100% fixed flat pricing. All standard ERP gantry tolls and parking are included with no surge multipliers.",
  },
  {
    question: "Can I make multiple pickup or dropoff stops?",
    answer: "Yes! Additional stops can be added during online booking or arranged directly with dispatch for a small nominal stop fee.",
  },
];

/**
 * Normalizes an icon name against common typos, casing, and synonyms
 */
export function normalizeServiceIcon(rawIcon?: string): string {
  if (!rawIcon || typeof rawIcon !== "string") return "Plane";
  const clean = rawIcon.trim().toLowerCase();

  if (/^(plane|airplane|flight|airport|changi|seletar)$/.test(clean)) return "Plane";
  if (/^(briefcase|corporate|business|executive|work)$/.test(clean)) return "Briefcase";
  if (/^(clock|hourly|standby|time|flexible)$/.test(clean)) return "Clock";
  if (/^(sparkles|sparkle|wedding|bridal|party|event)$/.test(clean)) return "Sparkles";
  if (/^(heart)$/.test(clean)) return "Heart";
  if (/^(users|user|group|groups|shuttle|minibus|people)$/.test(clean)) return "Users";
  if (/^(hearthandshake|heart-handshake|accessibility|wheelchair|medical|hospital)$/.test(clean)) return "HeartHandshake";
  if (/^(crown|vip|limo|limousine|diplomatic)$/.test(clean)) return "Crown";
  if (/^(anchor|port|marine|maritime|pier|ship|shipyard)$/.test(clean)) return "Anchor";
  if (/^(flag|f1|racing|formula|circuit)$/.test(clean)) return "Flag";
  if (/^(building|building2|mice|expo|suntec|conference)$/.test(clean)) return "Building2";
  if (/^(compass|pilot|aircrew|crew|aviation)$/.test(clean)) return "Compass";
  if (/^(mappin|map-pin|map|tour|sightseeing|city)$/.test(clean)) return "MapPin";

  return "Plane";
}

/**
 * Helper to convert slug to a clean Title Case string if title is omitted
 */
function slugToTitle(slug: string): string {
  return slug
    .replace(/[-_]+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Normalizes static services from local services.json into NormalizedService format
 */
export function getLocalServices(): NormalizedService[] {
  return servicesData.services.map((s, idx) => ({
    id: s.id,
    slug: (s.slug || s.id).toLowerCase().trim(),
    title: s.title || slugToTitle(s.slug || s.id),
    subtitle: s.subtitle || "",
    shortDescription: s.shortDescription || s.heroDescription || "",
    heroDescription: s.heroDescription || s.shortDescription || "",
    heroDescriptionRichText: null,
    icon: normalizeServiceIcon(s.icon),
    tags: Array.isArray(s.tags) ? s.tags : [],
    inclusions: Array.isArray(s.inclusions) && s.inclusions.length > 0 ? s.inclusions : DEFAULT_SERVICE_INCLUSIONS,
    pricing: Array.isArray(s.pricing) && s.pricing.length > 0 ? s.pricing : DEFAULT_SERVICE_PRICING,
    faqs: Array.isArray(s.faqs) && s.faqs.length > 0 ? s.faqs : DEFAULT_SERVICE_FAQS,
    startingPrice: s.pricing?.[0]?.rate ? `From ${s.pricing[0].rate}` : "From $65 SGD",
    displayOrder: idx + 1,
    isFeatured: idx < 4,
    featuredImageUrl: "",
    metaTitle: `${s.title} | Singapore Maxicabs Chauffeur & Charter`,
    metaDescription: s.heroDescription || s.shortDescription || "",
  }));
}

/**
 * Maps a Prismic service document to NormalizedService with defensive checks
 */
function mapPrismicService(doc: any): NormalizedService {
  const rawSlug = String(doc.uid || doc.id || "service").trim().toLowerCase();
  const slug = rawSlug.replace(/[^a-z0-9-_]/g, "-") || "service";

  const rawTitle = asText(doc.data?.title)?.trim();
  const title = rawTitle || slugToTitle(slug) || "Singapore Maxicab Service";

  const subtitle = typeof doc.data?.tagline === "string" ? doc.data.tagline.trim() : "";
  const shortDescription =
    typeof doc.data?.short_description === "string" ? doc.data.short_description.trim() : "";

  const rawHeroText = asText(doc.data?.hero_description)?.trim();
  const heroDescription = rawHeroText || shortDescription || subtitle || "Professional chauffeured transport across Singapore.";

  const icon = normalizeServiceIcon(doc.data?.icon_name);
  const startingPrice = typeof doc.data?.starting_price === "string" && doc.data.starting_price.trim().length > 0
    ? doc.data.starting_price.trim()
    : "From $65 SGD";

  // Sanitize display_order: ensure positive integer, fallback to 99
  const parsedOrder = Number(doc.data?.display_order);
  const displayOrder = !isNaN(parsedOrder) && parsedOrder > 0 ? Math.floor(parsedOrder) : 99;

  const isFeatured = Boolean(doc.data?.is_featured);
  const featuredImageUrl = doc.data?.featured_image?.url || "";

  // Highlights from Prismic (filter out blanks)
  const rawHighlights = doc.data?.highlights;
  const prismicInclusions = Array.isArray(rawHighlights)
    ? rawHighlights
        .map((h: any) => (typeof h?.highlight_text === "string" ? h.highlight_text.trim() : ""))
        .filter((t: string) => t.length > 0)
    : [];

  // Match local service for pricing & FAQ fallbacks if available
  const localMatch = servicesData.services.find(
    (s) =>
      (s.slug || s.id).toLowerCase() === slug ||
      s.title.toLowerCase() === title.toLowerCase()
  );

  const inclusions =
    prismicInclusions.length > 0
      ? prismicInclusions
      : localMatch?.inclusions && localMatch.inclusions.length > 0
      ? localMatch.inclusions
      : DEFAULT_SERVICE_INCLUSIONS;

  const pricing =
    localMatch?.pricing && localMatch.pricing.length > 0
      ? localMatch.pricing
      : DEFAULT_SERVICE_PRICING;

  const faqs =
    localMatch?.faqs && localMatch.faqs.length > 0
      ? localMatch.faqs
      : DEFAULT_SERVICE_FAQS;

  const tags =
    localMatch?.tags && localMatch.tags.length > 0
      ? localMatch.tags
      : [subtitle, startingPrice].filter(Boolean);

  const metaTitle =
    (typeof doc.data?.meta_title === "string" && doc.data.meta_title.trim()) ||
    `${title} | Singapore Maxicabs Flat-Rate Booking`;

  const metaDescription =
    (typeof doc.data?.meta_description === "string" && doc.data.meta_description.trim()) ||
    heroDescription ||
    shortDescription;

  return {
    id: String(doc.id || slug),
    slug,
    title,
    subtitle,
    shortDescription,
    heroDescription,
    heroDescriptionRichText: doc.data?.hero_description || null,
    icon,
    tags,
    inclusions,
    pricing,
    faqs,
    startingPrice,
    displayOrder,
    isFeatured,
    featuredImageUrl,
    metaTitle,
    metaDescription,
  };
}

/**
 * Fetch all services from Prismic with seamless local fallback and deterministic sorting
 */
export async function getPrismicServices(): Promise<NormalizedService[]> {
  try {
    const client = createClient();
    const docs = await client.getAllByType("service", {
      orderings: [
        { field: "my.service.display_order", direction: "asc" },
        { field: "document.first_publication_date", direction: "asc" },
      ],
    });

    if (docs && docs.length > 0) {
      const mapped = docs.map(mapPrismicService);

      // Deterministic sort: displayOrder -> title (alphabetical) -> slug
      return mapped.sort((a, b) => {
        if (a.displayOrder !== b.displayOrder) {
          return a.displayOrder - b.displayOrder;
        }
        const titleComp = a.title.localeCompare(b.title);
        if (titleComp !== 0) {
          return titleComp;
        }
        return a.slug.localeCompare(b.slug);
      });
    }
  } catch (error) {
    console.warn("Prismic services query returned no data or failed; falling back to local data:", error);
  }

  // Graceful fallback to local data
  return getLocalServices();
}

/**
 * Fetch a single service by slug from Prismic with case-insensitive and URL-safe fallback
 */
export async function getPrismicServiceBySlug(rawSlug: string): Promise<NormalizedService | null> {
  if (!rawSlug || typeof rawSlug !== "string") {
    return null;
  }

  // Clean and decode slug (handle %20, uppercase, trailing slashes)
  const decoded = decodeURIComponent(rawSlug).trim().toLowerCase();
  const slug = decoded.replace(/\/+$/, "");

  try {
    const client = createClient();
    // 1. Direct UID match
    const doc = await client.getByUID("service", slug);
    if (doc) {
      return mapPrismicService(doc);
    }
  } catch {
    // If exact getByUID fails, attempt case-insensitive match from all services
  }

  try {
    const allServices = await getPrismicServices();
    const matched = allServices.find(
      (s) => s.slug === slug || s.id.toLowerCase() === slug
    );
    if (matched) {
      return matched;
    }
  } catch {
    // Proceed to local fallback
  }

  // Fallback to local data
  const localList = getLocalServices();
  const found = localList.find((s) => s.slug === slug || s.id.toLowerCase() === slug);
  return found || null;
}
