import { NextRequest, NextResponse } from "next/server";
import { GooglePlacesAutocompleteResponse, GooglePlaceSuggestion } from "@/types/api";

// In-memory Server-side Cache with TTL (30 minutes)
interface CacheEntry {
  data: GooglePlacesAutocompleteResponse;
  timestamp: number;
}
const serverAutocompleteCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
const MAX_CACHE_ENTRIES = 500;

function getCachedSuggestions(key: string): GooglePlacesAutocompleteResponse | null {
  const entry = serverAutocompleteCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    serverAutocompleteCache.delete(key);
    return null;
  }
  return entry.data;
}

function setCachedSuggestions(key: string, data: GooglePlacesAutocompleteResponse) {
  if (serverAutocompleteCache.size >= MAX_CACHE_ENTRIES) {
    // Evict oldest entry
    const firstKey = serverAutocompleteCache.keys().next().value;
    if (firstKey) serverAutocompleteCache.delete(firstKey);
  }
  serverAutocompleteCache.set(key, { data, timestamp: Date.now() });
}

// Fallback curated Singapore places for development, testing, or when API key is not yet configured
const FALLBACK_SINGAPORE_PLACES = [
  {
    name: "Singapore Changi Airport (SIN)",
    secondary: "Airport Boulevard, Singapore",
    placeId: "fallback_changi_all",
    types: ["airport", "establishment", "point_of_interest"],
  },
  {
    name: "Changi Airport Terminal 1",
    secondary: "80 Airport Boulevard, Singapore 819642",
    placeId: "fallback_changi_t1",
    types: ["airport", "transit_station"],
  },
  {
    name: "Changi Airport Terminal 2",
    secondary: "60 Airport Boulevard, Singapore 819643",
    placeId: "fallback_changi_t2",
    types: ["airport", "transit_station"],
  },
  {
    name: "Changi Airport Terminal 3",
    secondary: "65 Airport Boulevard, Singapore 819663",
    placeId: "fallback_changi_t3",
    types: ["airport", "transit_station"],
  },
  {
    name: "Changi Airport Terminal 4",
    secondary: "10 Airport Boulevard, Singapore 819665",
    placeId: "fallback_changi_t4",
    types: ["airport", "transit_station"],
  },
  {
    name: "Changi Airport Terminal (TBA)",
    secondary: "Airport Boulevard, Singapore (Arrival Terminal To Be Advised)",
    placeId: "fallback_changi_tba",
    types: ["airport", "transit_station"],
  },
  {
    name: "Jewel Changi Airport",
    secondary: "78 Airport Boulevard, Singapore 819666",
    placeId: "fallback_jewel_changi",
    types: ["shopping_mall", "tourist_attraction", "establishment"],
  },
  {
    name: "Marina Bay Sands Hotel",
    secondary: "10 Bayfront Avenue, Singapore 018956",
    placeId: "fallback_mbs",
    types: ["lodging", "tourist_attraction", "establishment"],
  },
  {
    name: "Marina Bay Cruise Centre Singapore (MBCCS)",
    secondary: "61 Marina Coastal Drive, Singapore 018947",
    placeId: "fallback_mbccs",
    types: ["transit_station", "establishment"],
  },
  {
    name: "Singapore Cruise Centre (HarbourFront)",
    secondary: "1 Maritime Square, Singapore 099253",
    placeId: "fallback_scc_harbourfront",
    types: ["transit_station", "establishment"],
  },
  {
    name: "Orchard Road Shopping District",
    secondary: "Orchard Road, Singapore",
    placeId: "fallback_orchard_road",
    types: ["shopping_mall", "point_of_interest"],
  },
  {
    name: "Resorts World Sentosa / Universal Studios Singapore",
    secondary: "8 Sentosa Gateway, Sentosa Island, Singapore 098269",
    placeId: "fallback_rws_uss",
    types: ["amusement_park", "tourist_attraction", "lodging"],
  },
  {
    name: "Sentosa Island (Beach & Attractions)",
    secondary: "Sentosa, Singapore",
    placeId: "fallback_sentosa_island",
    types: ["tourist_attraction", "point_of_interest"],
  },
  {
    name: "Raffles Hotel Singapore",
    secondary: "1 Beach Road, Singapore 189673",
    placeId: "fallback_raffles_hotel",
    types: ["lodging", "historical_landmark"],
  },
  {
    name: "Raffles Place Financial District (CBD)",
    secondary: "Raffles Place, Downtown Core, Singapore 048616",
    placeId: "fallback_raffles_place",
    types: ["finance", "transit_station"],
  },
  {
    name: "Gardens by the Bay",
    secondary: "18 Marina Gardens Drive, Singapore 018953",
    placeId: "fallback_gardens_by_the_bay",
    types: ["park", "tourist_attraction"],
  },
  {
    name: "Mandai Wildlife Reserve / Singapore Zoo",
    secondary: "80 Mandai Lake Road, Singapore 729826",
    placeId: "fallback_singapore_zoo",
    types: ["zoo", "tourist_attraction"],
  },
  {
    name: "Clarke Quay Riverside",
    secondary: "3 River Valley Road, Singapore 179024",
    placeId: "fallback_clarke_quay",
    types: ["food", "night_club", "tourist_attraction"],
  },
  {
    name: "Suntec Singapore Convention & Exhibition Centre",
    secondary: "1 Raffles Boulevard, Singapore 039593",
    placeId: "fallback_suntec_city",
    types: ["convention_center", "establishment"],
  },
  {
    name: "The Fullerton Hotel Singapore",
    secondary: "1 Fullerton Square, Singapore 049178",
    placeId: "fallback_fullerton_hotel",
    types: ["lodging", "establishment"],
  },
  {
    name: "Pan Pacific Singapore",
    secondary: "7 Raffles Boulevard, Marina Square, Singapore 039595",
    placeId: "fallback_pan_pacific",
    types: ["lodging", "establishment"],
  },
  {
    name: "Hotel Grand Pacific Singapore",
    secondary: "101 Victoria Street, Singapore 188018",
    placeId: "fallback_hotel_grand_pacific",
    types: ["lodging", "establishment"],
  },
  {
    name: "Woodlands Train Checkpoint / Customs",
    secondary: "Woodlands Crossing, Singapore 738404",
    placeId: "fallback_woodlands_checkpoint",
    types: ["transit_station", "establishment"],
  },
  {
    name: "Tuas Checkpoint",
    secondary: "Tuas West Drive, Singapore 638404",
    placeId: "fallback_tuas_checkpoint",
    types: ["transit_station", "establishment"],
  },
];

function getFallbackSuggestions(input: string): GooglePlacesAutocompleteResponse {
  const query = (input || "").toLowerCase().trim();
  const matched = query
    ? FALLBACK_SINGAPORE_PLACES.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.secondary.toLowerCase().includes(query)
      )
    : FALLBACK_SINGAPORE_PLACES.slice(0, 8);

  const suggestions: GooglePlaceSuggestion[] = matched.map((item) => ({
    placePrediction: {
      place: `places/${item.placeId}`,
      placeId: item.placeId,
      text: {
        text: `${item.name}, ${item.secondary}`,
      },
      structuredFormat: {
        mainText: {
          text: item.name,
        },
        secondaryText: {
          text: item.secondary,
        },
      },
      types: item.types,
    },
  }));

  return { suggestions };
}

function injectTbaSuggestionIfNeeded(
  suggestions: GooglePlaceSuggestion[],
  input: string
): GooglePlaceSuggestion[] {
  const q = (input || "").toLowerCase().trim();
  const isAirportQuery =
    q.includes("term") ||
    q.includes("changi") ||
    q.includes("airport") ||
    q.includes("tba") ||
    q.includes("sin");

  if (!isAirportQuery && q !== "") return suggestions;

  const alreadyHasTba = suggestions.some((s) => {
    const text = (s.placePrediction?.text?.text || "").toLowerCase();
    const main = (s.placePrediction?.structuredFormat?.mainText?.text || "").toLowerCase();
    return text.includes("tba") || main.includes("tba");
  });

  if (alreadyHasTba) return suggestions;

  const tbaSuggestion: GooglePlaceSuggestion = {
    placePrediction: {
      place: "places/fallback_changi_tba",
      placeId: "fallback_changi_tba",
      text: {
        text: "Changi Airport Terminal (TBA), Airport Boulevard, Singapore (Arrival Terminal To Be Advised)",
      },
      structuredFormat: {
        mainText: {
          text: "Changi Airport Terminal (TBA)",
        },
        secondaryText: {
          text: "Airport Boulevard, Singapore (Arrival Terminal To Be Advised)",
        },
      },
      types: ["airport", "transit_station"],
    },
  };

  const lastTerminalIdx = suggestions.reduce((acc, s, idx) => {
    const text = (s.placePrediction?.text?.text || "").toLowerCase();
    if (text.includes("terminal") || text.includes("changi")) return idx;
    return acc;
  }, -1);

  const newSuggestions = [...suggestions];
  if (lastTerminalIdx >= 0) {
    newSuggestions.splice(lastTerminalIdx + 1, 0, tbaSuggestion);
  } else {
    newSuggestions.push(tbaSuggestion);
  }

  return newSuggestions;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const input = typeof body.input === "string" ? body.input.trim() : "";
    const includedRegionCodes = Array.isArray(body.includedRegionCodes)
      ? body.includedRegionCodes
      : ["sg"];

    const cacheKey = `post_${input.toLowerCase()}_${includedRegionCodes.sort().join(",")}`;

    // 1. Check in-memory server cache first
    const cached = getCachedSuggestions(cacheKey);
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          "Cache-Control": "public, max-age=1800, stale-while-revalidate=86400",
          "X-Cache": "HIT",
        },
      });
    }

    if (!input) {
      const fallback = getFallbackSuggestions("");
      setCachedSuggestions(cacheKey, fallback);
      return NextResponse.json(fallback, {
        headers: {
          "Cache-Control": "public, max-age=1800, stale-while-revalidate=86400",
          "X-Cache": "MISS",
        },
      });
    }

    const apiKey =
      process.env.GOOGLE_PLACES_API_KEY ||
      process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY ||
      "AIzaSyDn_3Y4fLrq7KSgH0PLQeXH9qHQU4C7GQ8";

    // 2. If API key is provided, call Google Places Autocomplete API
    if (apiKey && apiKey.trim() !== "") {
      try {
        const googleRes = await fetch(
          "https://places.googleapis.com/v1/places:autocomplete",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Goog-Api-Key": apiKey.trim(),
              "X-Goog-FieldMask": "*",
            },
            body: JSON.stringify({
              input,
              includedRegionCodes,
              languageCode: "en",
            }),
            cache: "no-store",
          }
        );

        if (googleRes.ok) {
          const data: GooglePlacesAutocompleteResponse = await googleRes.json();
          if (Array.isArray(data.suggestions)) {
            data.suggestions = injectTbaSuggestionIfNeeded(data.suggestions, input);
          }
          setCachedSuggestions(cacheKey, data);
          return NextResponse.json(data, {
            headers: {
              "Cache-Control": "public, max-age=1800, stale-while-revalidate=86400",
              "X-Cache": "MISS",
            },
          });
        }

        const errorText = await googleRes.text();
        console.warn(
          `Google Places API call returned ${googleRes.status}: ${errorText}. Falling back to curated Singapore landmark dataset.`
        );
      } catch (googleErr) {
        console.warn("Google Places fetch exception:", googleErr);
      }
    }

    // 3. Graceful fallback to curated dataset
    const fallbackData = getFallbackSuggestions(input);
    setCachedSuggestions(cacheKey, fallbackData);
    return NextResponse.json(fallbackData, {
      headers: {
        "Cache-Control": "public, max-age=1800, stale-while-revalidate=86400",
        "X-Cache": "FALLBACK",
      },
    });
  } catch (err: unknown) {
    console.error("Autocomplete handler error:", err);
    return NextResponse.json(
      {
        error: {
          message: (err as Error).message || "Internal Autocomplete Error",
          status: "INTERNAL_ERROR",
        },
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const input = searchParams.get("input") || "";
  const region = searchParams.get("region") || "sg";

  const cacheKey = `get_${input.toLowerCase()}_${region}`;
  const cached = getCachedSuggestions(cacheKey);
  if (cached) {
    return NextResponse.json(cached, {
      headers: {
        "Cache-Control": "public, max-age=1800, stale-while-revalidate=86400",
        "X-Cache": "HIT",
      },
    });
  }

  const apiKey =
    process.env.GOOGLE_PLACES_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY ||
    "AIzaSyDn_3Y4fLrq7KSgH0PLQeXH9qHQU4C7GQ8";

  if (apiKey && apiKey.trim() !== "" && input) {
    try {
      const googleRes = await fetch(
        "https://places.googleapis.com/v1/places:autocomplete",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": apiKey.trim(),
            "X-Goog-FieldMask": "*",
          },
          body: JSON.stringify({
            input,
            includedRegionCodes: [region],
            languageCode: "en",
          }),
          cache: "no-store",
        }
      );

      if (googleRes.ok) {
        const data: GooglePlacesAutocompleteResponse = await googleRes.json();
        if (Array.isArray(data.suggestions)) {
          data.suggestions = injectTbaSuggestionIfNeeded(data.suggestions, input);
        }
        setCachedSuggestions(cacheKey, data);
        return NextResponse.json(data, {
          headers: {
            "Cache-Control": "public, max-age=1800, stale-while-revalidate=86400",
            "X-Cache": "MISS",
          },
        });
      }
    } catch (e) {
      console.warn("Google Places GET error, returning fallback:", e);
    }
  }

  const fallback = getFallbackSuggestions(input);
  setCachedSuggestions(cacheKey, fallback);
  return NextResponse.json(fallback, {
    headers: {
      "Cache-Control": "public, max-age=1800, stale-while-revalidate=86400",
      "X-Cache": "FALLBACK",
    },
  });
}
