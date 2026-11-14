import fleetData from "@/data/fleet.json";
import { VehicleDetail } from "@/Components/Fleet/FleetDetailTemplate";
import { VehicleCard } from "@/types/api";
import { Vehicle } from "@/Components/Fleet/FleetCard";

/**
 * Fetch all vehicles directly from the live API with quick timeout and caching
 */
export async function fetchLiveVehicles(): Promise<VehicleCard[]> {
  try {
    const res = await fetch("https://api.singaporemaxicabs.com.sg/api/vehicles", {
      next: { revalidate: 60 },
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch (err) {
    console.warn("Could not fetch live vehicles from API, using static fallbacks:", err);
    return [];
  }
}

/**
 * Match a raw slug or ID to an API vehicle
 */
export function findMatchingApiVehicle(
  rawSlug: string,
  apiVehicles: VehicleCard[]
): VehicleCard | undefined {
  const slug = decodeURIComponent(rawSlug).toLowerCase().trim();
  return apiVehicles.find((v) => {
    const vName = v.name.toLowerCase();
    const vIdStr = v.id.toString();
    const vNameSlug = vName.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    if (vIdStr === slug || `vehicle-${vIdStr}` === slug || vNameSlug === slug) {
      return true;
    }

    if (
      slug === "6-seater" &&
      (v.passengerCapacity === 6 || v.id === 3 || vName.includes("alphard") || vName.includes("6 seater"))
    ) {
      return true;
    }
    if (
      slug === "7-seater" &&
      ((v.passengerCapacity === 7 && !vName.includes("wheelchair")) || v.id === 4 || vName.includes("vito"))
    ) {
      return true;
    }
    if (
      slug === "9-seater" &&
      ((v.passengerCapacity === 9 && !vName.includes("wheelchair")) || v.id === 12)
    ) {
      return true;
    }
    if (
      slug === "13-seater" &&
      ((v.passengerCapacity === 13 && !vName.includes("vip")) || v.id === 6 || vName.includes("hiace"))
    ) {
      return true;
    }
    if (
      (slug === "vip-minibus" || slug === "vip-executive-minibus") &&
      (v.id === 7 || (vName.includes("vip") && vName.includes("minibus")))
    ) {
      return true;
    }
    if (
      slug === "vip-lounge" &&
      (vName.includes("v-class") || v.id === 5 || (vName.includes("vip") && !vName.includes("minibus")))
    ) {
      return true;
    }
    if (slug === "mercedes-e-class" && (vName.includes("e class") || v.id === 1)) {
      return true;
    }
    if (slug === "mercedes-s-class" && (vName.includes("s class") || v.id === 2)) {
      return true;
    }
    if (slug === "wheelchair-cab" && (vName.includes("wheelchair") || v.id === 8 || v.id === 11)) {
      return true;
    }
    if (slug === "23-seater-coach" && (v.passengerCapacity === 23 || v.id === 9)) {
      return true;
    }
    if (slug === "40-seater-coach" && (v.passengerCapacity === 40 || v.id === 10)) {
      return true;
    }

    return false;
  });
}

/**
 * Determine a canonical slug for an API vehicle
 */
export function resolveSlugFromApiVehicle(v: VehicleCard): string {
  const vName = (v.name || "").toLowerCase();
  const vId = v.id;
  const pax = v.passengerCapacity;

  if (vName.includes("e-class") || vName.includes("e class") || vId === 1) return "mercedes-e-class";
  if (vName.includes("s-class") || vName.includes("s class") || vId === 2) return "mercedes-s-class";
  if (vName.includes("wheelchair") || vId === 8 || vId === 11) return "wheelchair-cab";
  if (vId === 7 || (vName.includes("vip") && vName.includes("minibus"))) return "vip-minibus";
  if (vName.includes("vip") || vName.includes("lounge") || vName.includes("v-class") || vId === 5) return "vip-lounge";
  if (pax === 6 || vId === 3 || vName.includes("alphard") || vName.includes("6 seater")) return "6-seater";
  if (pax === 7 || vId === 4 || vName.includes("vito") || vName.includes("7 seater")) return "7-seater";
  if (pax === 9 || vId === 12 || vName.includes("9 seater")) return "9-seater";
  if (pax === 13 || vId === 6 || vName.includes("hiace") || vName.includes("13 seater")) return "13-seater";
  if (pax === 23 || vId === 9 || vName.includes("23")) return "23-seater-coach";
  if (pax === 40 || vId === 10 || vName.includes("40")) return "40-seater-coach";
  return `vehicle-${vId}`;
}

/**
 * Resolve the image source for a vehicle: prefer API imageUrl, fallback to static / Cab.png
 */
export function getVehicleImage(
  apiVehicle?: VehicleCard | null,
  fallbackImage?: string
): string {
  if (apiVehicle?.imageUrl) {
    return apiVehicle.imageUrl.startsWith("http")
      ? apiVehicle.imageUrl
      : `https://api.singaporemaxicabs.com.sg${apiVehicle.imageUrl.startsWith("/") ? "" : "/"}${apiVehicle.imageUrl}`;
  }
  return fallbackImage || "/images/Cab.png";
}

/**
 * Transform an API vehicle card into a UI FleetCard Vehicle
 */
export function transformApiVehicleToCard(v: VehicleCard, defaultFallback?: Vehicle): Vehicle {
  const slug = resolveSlugFromApiVehicle(v);
  const localMatch =
    defaultFallback ||
    fleetData.vehicles.find((fv) => fv.slug === slug || fv.id === slug);

  const departureAmount = v.prices?.departure_transfer?.amount;
  const arrivalAmount = v.prices?.arrival?.amount;
  const hourlyRate = v.prices?.hourly?.amount || 65;
  const hourly3h = v.prices?.hourly?.threeHourAmount ?? (hourlyRate ? hourlyRate * 3 : undefined);

  const basePriceNum =
    departureAmount ||
    arrivalAmount ||
    (localMatch?.price ? parseInt(localMatch.price.replace(/[^0-9]/g, ""), 10) : 70);

  const meetAndGreetStr = arrivalAmount
    ? `$${arrivalAmount} SGD`
    : departureAmount
    ? `$${departureAmount + 10} SGD`
    : localMatch?.meetAndGreet || `$${basePriceNum + 10} SGD`;

  const charter3hStr = hourly3h
    ? `$${hourly3h} SGD`
    : localMatch?.charter3h || "$180 SGD";

  const paxStr =
    v.passengerCapacity != null
      ? `${v.passengerCapacity} Pax`
      : localMatch?.pax || "7 Pax";

  const bagsStr =
    v.luggageCapacity != null
      ? `${v.luggageCapacity} Bags`
      : localMatch?.bags || "4–5 Bags";

  return {
    id: String(v.id),
    slug,
    name: v.name || localMatch?.name || "Singapore Maxi Cab",
    model: v.vehicleType || localMatch?.model || v.name,
    price: `$${basePriceNum}`,
    currency: v.currency || localMatch?.currency || "SGD",
    description:
      v.description ||
      localMatch?.description ||
      "Comfortable luxury maxi cab with air-conditioned cabin and professional chauffeur.",
    heroDescription: localMatch?.heroDescription,
    pax: paxStr,
    paxCount: v.passengerCapacity ?? localMatch?.paxCount ?? 7,
    bags: bagsStr,
    luggageCount: v.luggageCapacity ?? localMatch?.luggageCount ?? 4,
    badge: v.recommendation ? "Recommended" : localMatch?.badge,
    image: getVehicleImage(v, localMatch?.image),
    meetAndGreet: meetAndGreetStr,
    arrivalDrivewayPickup: meetAndGreetStr,
    charter3h: charter3hStr,
    buttonText: `Reserve ${v.name.split(" ")[0]}`,
  };
}

/**
 * Match a raw slug or ID to a static vehicle
 */
export function findMatchingStaticVehicle(
  rawSlug: string,
  apiMatch?: VehicleCard
): (typeof fleetData.vehicles)[number] | undefined {
  const slug = decodeURIComponent(rawSlug).toLowerCase().trim();

  // 1. Direct match by slug or id in static catalog
  const directMatch = fleetData.vehicles.find((v) => {
    const sId = v.id.toLowerCase();
    const sSlug = (v.slug || v.id).toLowerCase();
    return sId === slug || sSlug === slug;
  });
  if (directMatch) return directMatch;

  // 2. Canonical alias resolution
  if (slug === "mercedes-e-class" || slug === "e-class") {
    return fleetData.vehicles.find((v) => v.id === "mercedes-e-class" || v.slug === "mercedes-e-class");
  }
  if (slug === "mercedes-s-class" || slug === "s-class") {
    return fleetData.vehicles.find((v) => v.id === "mercedes-s-class" || v.slug === "mercedes-s-class");
  }
  if (slug === "6-seater" || slug === "6-seater-maxi-cab") {
    return fleetData.vehicles.find((v) => v.id === "6-seater" || v.slug === "6-seater");
  }
  if (slug === "7-seater" || slug === "7-seater-maxi-cab") {
    return fleetData.vehicles.find((v) => v.id === "7-seater" || v.slug === "7-seater");
  }
  if (slug === "9-seater" || slug === "9-seater-maxi-cab") {
    return fleetData.vehicles.find((v) => v.id === "9-seater" || v.slug === "9-seater");
  }
  if (slug === "13-seater" || slug === "13-seater-minibus") {
    return fleetData.vehicles.find((v) => v.id === "13-seater" || v.slug === "13-seater");
  }
  if (slug === "vip-minibus" || slug === "vip-executive-minibus") {
    return (
      fleetData.vehicles.find((v) => v.slug === "vip-minibus" || v.id === "vip-minibus") ||
      fleetData.vehicles.find((v) => v.id === "13-seater" || v.slug === "13-seater")
    );
  }
  if (slug === "vip-lounge" || slug === "vip-lounge-7-seater") {
    return fleetData.vehicles.find((v) => v.id === "vip-lounge" || v.slug === "vip-lounge");
  }
  if (slug === "wheelchair-cab" || slug === "wheelchair-maxi-cab") {
    return fleetData.vehicles.find((v) => v.id === "wheelchair-cab" || v.slug === "wheelchair-cab");
  }
  if (slug === "23-seater-coach" || slug === "23-seater") {
    return fleetData.vehicles.find((v) => v.id === "23-seater-coach" || v.slug === "23-seater-coach");
  }
  if (slug === "40-seater-coach" || slug === "40-seater") {
    return (
      fleetData.vehicles.find((v) => v.slug === "40-seater-coach" || v.id === "40-seater-coach") ||
      fleetData.vehicles.find((v) => v.id === "23-seater-coach")
    );
  }

  // 3. If apiMatch exists, match by apiMatch properties
  if (apiMatch) {
    const apiSlug = resolveSlugFromApiVehicle(apiMatch);
    const byApiSlug = fleetData.vehicles.find((v) => (v.slug || v.id) === apiSlug);
    if (byApiSlug) return byApiSlug;

    const byId = fleetData.vehicles.find((v) => v.id === `vehicle-${apiMatch.id}`);
    if (byId) return byId;
  }

  // 4. Try matching vehicle ID if slug is a number or vehicle-X
  const numId = parseInt(slug.replace("vehicle-", ""), 10);
  if (!isNaN(numId)) {
    const byId = fleetData.vehicles.find((v) => v.id === `vehicle-${numId}` || v.id === slug);
    if (byId) return byId;
  }

  return undefined;
}

/**
 * Build section-wise fleet groups dynamically, falling back to static fleet data
 */
export function buildSectionVehicles(
  apiVehicles: VehicleCard[]
): {
  executive: Vehicle[];
  maxiCabs: Vehicle[];
  minibuses: Vehicle[];
} {
  if (!apiVehicles || apiVehicles.length === 0) {
    const executive: Vehicle[] = [];
    const maxiCabs: Vehicle[] = [];
    const minibuses: Vehicle[] = [];
    const seen = new Set<string>();

    for (const v of fleetData.vehicles) {
      const slug = v.slug || v.id;
      if (seen.has(slug)) continue;
      seen.add(slug);

      const card: Vehicle = {
        id: v.id,
        slug,
        name: v.name,
        model: v.model,
        price: v.price,
        currency: v.currency,
        description: v.description,
        heroDescription: v.heroDescription,
        pax: v.pax,
        paxCount: v.paxCount,
        bags: v.bags,
        luggageCount: v.luggageCount,
        badge: v.badge,
        image: v.image || "/images/Cab.png",
        meetAndGreet: v.meetAndGreet,
        charter3h: v.charter3h,
        buttonText: v.buttonText,
      };

      const name = v.name.toLowerCase();
      const pax = v.paxCount || 7;

      if (
        name.includes("vip") ||
        name.includes("executive") ||
        name.includes("mercedes") ||
        slug.includes("e-class") ||
        slug.includes("s-class") ||
        pax <= 4
      ) {
        executive.push(card);
      } else if (pax >= 10 || name.includes("minibus") || name.includes("coach") || slug.includes("coach")) {
        minibuses.push(card);
      } else {
        maxiCabs.push(card);
      }
    }

    return { executive, maxiCabs, minibuses };
  }

  const executive: Vehicle[] = [];
  const maxiCabs: Vehicle[] = [];
  const minibuses: Vehicle[] = [];
  const seenVehicleIds = new Set<string>();

  for (const v of apiVehicles) {
    if (v.status === "inactive" || v.isActive === false) continue;
    const card = transformApiVehicleToCard(v);
    if (seenVehicleIds.has(card.id)) continue;
    seenVehicleIds.add(card.id);

    const vName = (v.name || "").toLowerCase();
    const pax = v.passengerCapacity ?? 7;

    if (
      vName.includes("vip") ||
      vName.includes("executive") ||
      vName.includes("sedan") ||
      vName.includes("e-class") ||
      vName.includes("s-class") ||
      pax <= 4
    ) {
      executive.push(card);
    } else if (
      pax >= 10 ||
      vName.includes("minibus") ||
      vName.includes("coach")
    ) {
      minibuses.push(card);
    } else {
      maxiCabs.push(card);
    }
  }

  return { executive, maxiCabs, minibuses };
}

/**
 * Resolve a vehicle by slug, ID, or name, seamlessly supporting static fallback
 */
export async function resolveVehicle(rawSlug: string): Promise<VehicleDetail | null> {
  const slug = decodeURIComponent(rawSlug).toLowerCase().trim();
  const apiVehicles = await fetchLiveVehicles();

  // 1. Match API vehicle
  const apiMatch = findMatchingApiVehicle(slug, apiVehicles);

  // 2. Match Static vehicle
  const staticMatch = findMatchingStaticVehicle(slug, apiMatch);

  // If neither API vehicle nor static vehicle matched, return null
  if (!apiMatch && !staticMatch) {
    return null;
  }

  // 3. Extract pricing from API or fallback to static
  const departureAmount = apiMatch?.prices?.departure_transfer?.amount;
  const arrivalAmount = apiMatch?.prices?.arrival?.amount;
  const hourlyRate = apiMatch?.prices?.hourly?.amount;
  const hourly3h =
    apiMatch?.prices?.hourly?.threeHourAmount ?? (hourlyRate ? hourlyRate * 3 : undefined);
  const hourly8h =
    apiMatch?.prices?.hourly?.eightHourAmount ?? (hourlyRate ? hourlyRate * 8 : undefined);

  const basePriceNum =
    departureAmount ||
    arrivalAmount ||
    (staticMatch?.price ? parseInt(staticMatch.price.replace(/[^0-9]/g, ""), 10) : 65);

  const priceStr = `$${basePriceNum}`;

  const pointToPointStr = departureAmount
    ? `$${departureAmount} SGD`
    : arrivalAmount
    ? `$${arrivalAmount} SGD`
    : staticMatch?.pointToPoint || `$${basePriceNum} SGD`;

  const meetAndGreetStr = arrivalAmount
    ? `$${arrivalAmount} SGD`
    : departureAmount
    ? `$${departureAmount + 10} SGD`
    : staticMatch?.meetAndGreet || `$${basePriceNum + 10} SGD`;

  const charter3hStr = hourly3h
    ? `$${hourly3h} SGD`
    : staticMatch?.charter3h || "$180 SGD";

  const charter8hStr = hourly8h
    ? `$${hourly8h} SGD`
    : staticMatch?.charter8h || "$480 SGD";

  // Passenger and luggage counts from API first, fallback to static
  const paxStr =
    apiMatch?.passengerCapacity != null
      ? `${apiMatch.passengerCapacity} Pax`
      : staticMatch?.pax || "7 Pax";

  const bagsStr =
    apiMatch?.luggageCapacity != null
      ? `${apiMatch.luggageCapacity} Bags`
      : staticMatch?.bags || "4–5 Bags";

  // Vehicle image (uses API imageUrl when provided, else static fallback)
  const imageSrc = getVehicleImage(apiMatch, staticMatch?.image);

  // Vehicle model display
  const modelStr =
    staticMatch?.model ||
    apiMatch?.vehicleType ||
    staticMatch?.vehicleType ||
    apiMatch?.name ||
    "Executive Maxi Cab";

  const vehicleTypeStr =
    apiMatch?.vehicleType ||
    staticMatch?.vehicleType ||
    staticMatch?.model ||
    apiMatch?.name ||
    "Toyota Vellfire / Alphard";

  // Display Name: prefer clean static name if matching category, else API name
  const displayName = staticMatch?.name || apiMatch?.name || "Singapore Maxi Cab";

  return {
    id: apiMatch ? String(apiMatch.id) : staticMatch?.id || slug,
    slug,
    apiVehicleId: apiMatch?.id,
    name: displayName,
    model: modelStr,
    price: priceStr,
    currency: apiMatch?.currency || staticMatch?.currency || "SGD",
    description:
      apiMatch?.description ||
      staticMatch?.description ||
      "Comfortable luxury maxi cab with air-conditioned cabin and professional chauffeur.",
    heroDescription:
      apiMatch?.description ||
      staticMatch?.heroDescription ||
      staticMatch?.description ||
      "The premier choice for corporate transfers, family travel, and reliable point-to-point journeys across Singapore.",
    pax: paxStr,
    bags: bagsStr,
    pointToPoint: pointToPointStr,
    meetAndGreet: meetAndGreetStr,
    arrivalDrivewayPickup: meetAndGreetStr,
    charter3h: charter3hStr,
    charter8h: charter8hStr,
    vehicleType: vehicleTypeStr,
    inclusions: staticMatch?.inclusions || [
      "Fixed flat-rate pricing",
      "Licensed & professional chauffeur",
      "Flight tracking for airport pickups",
      "Air-conditioned, clean interior",
      "Child seat available on request",
      "WhatsApp driver contact",
    ],
    image: imageSrc,
    isApiConnected: Boolean(apiMatch),
  };
}
