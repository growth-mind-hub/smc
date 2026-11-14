/**
 * Maxicab Backend API Service Methods
 * All 24 Endpoint Handlers from frontend-api-handoff.html
 */

import { apiFetch, RequestOptions } from "./client";
import { ENDPOINTS } from "@/config/api";
import {
  VehicleListResponse,
  SingleVehicleResponse,
  ServiceListResponse,
  VehicleTypeListResponse,
  CatalogResponse,
  AddOnListResponse,
  QuoteRequest,
  QuoteResponse,
  CheckoutRequest,
  CheckoutResponse,
  HealthResponse,
  ReadyResponse,
  AdminCreateVehicleTypeRequest,
  AdminUpdateVehicleTypeRequest,
  AdminCreateVehicleRequest,
  AdminUpdateVehicleRequest,
  AdminSetVehiclePriceRequest,
  AdminCreateServiceRequest,
  AdminUpdateServiceRequest,
  AdminCreateAddOnRequest,
  AdminUpdateAddOnRequest,
  AdminCreateDistanceRuleRequest,
  AdminUpdateDistanceRuleRequest,
  DistancePricingRuleListResponse,
  DistancePricingRuleSingleResponse,
  GooglePlacesAutocompleteRequest,
  GooglePlacesAutocompleteResponse,
  AdminManualBookingRequest,
  AdminManualBookingResponse,
  Status,
  UppercaseStatus,
} from "@/types/api";

// ==========================================
// CLIENT-SIDE IN-MEMORY CACHE
// ==========================================

const clientPlacesCache = new Map<string, GooglePlacesAutocompleteResponse>();
let cachedVehicles: VehicleListResponse | null = null;
let cachedServices: ServiceListResponse | null = null;
let cachedAddOns: AddOnListResponse | null = null;
const clientQuoteCache = new Map<string, { data: QuoteResponse; timestamp: number }>();
const QUOTE_CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes cache for live quotes

// ==========================================
// 1. PUBLIC CATALOG & PRICING
// ==========================================

/**
 * 1. List vehicle cards
 * GET /api/vehicles (optional query: persons, luggage)
 */
export async function getVehicles(
  params?: { persons?: number; luggage?: number },
  options?: RequestOptions
): Promise<VehicleListResponse> {
  const isDefaultQuery = !params || (params.persons === undefined && params.luggage === undefined);
  if (isDefaultQuery && cachedVehicles) {
    return cachedVehicles;
  }

  const query = new URLSearchParams();
  if (params?.persons !== undefined) query.set("persons", params.persons.toString());
  if (params?.luggage !== undefined) query.set("luggage", params.luggage.toString());

  const queryString = query.toString();
  const path = queryString ? `${ENDPOINTS.VEHICLES}?${queryString}` : ENDPOINTS.VEHICLES;

  const result = await apiFetch<VehicleListResponse>(path, {
    method: "GET",
    ...options,
  });

  if (isDefaultQuery && result && result.success) {
    cachedVehicles = result;
  }

  return result;
}

/**
 * 2. Recommend a vehicle
 * GET /api/vehicles/recommend?persons=5&luggage=4
 */
export async function getVehicleRecommendation(
  persons: number,
  luggage: number,
  options?: RequestOptions
): Promise<VehicleListResponse> {
  const query = new URLSearchParams({
    persons: persons.toString(),
    luggage: luggage.toString(),
  });

  return apiFetch<VehicleListResponse>(`${ENDPOINTS.VEHICLES_RECOMMEND}?${query.toString()}`, {
    method: "GET",
    ...options,
  });
}

/**
 * 3. Get one vehicle by ID
 * GET /api/vehicles/:id
 */
export async function getVehicleById(
  id: number | string,
  options?: RequestOptions
): Promise<SingleVehicleResponse> {
  return apiFetch<SingleVehicleResponse>(ENDPOINTS.VEHICLE_DETAIL(id), {
    method: "GET",
    ...options,
  });
}

/**
 * 4. List active services
 * GET /api/services
 */
export async function getServices(options?: RequestOptions): Promise<ServiceListResponse> {
  if (cachedServices) {
    return cachedServices;
  }

  const result = await apiFetch<ServiceListResponse>(ENDPOINTS.SERVICES, {
    method: "GET",
    ...options,
  });

  if (result && Array.isArray(result.services)) {
    cachedServices = result;
  }

  return result;
}

/**
 * 5. List vehicle types
 * GET /api/vehicle-types
 */
export async function getVehicleTypes(
  options?: RequestOptions
): Promise<VehicleTypeListResponse> {
  return apiFetch<VehicleTypeListResponse>(ENDPOINTS.VEHICLE_TYPES, {
    method: "GET",
    ...options,
  });
}

/**
 * 6. Resolve a vehicle/service price
 * GET /api/catalog/:id
 */
export async function getCatalogPrice(
  catalogId: number | string,
  options?: RequestOptions
): Promise<CatalogResponse> {
  return apiFetch<CatalogResponse>(ENDPOINTS.CATALOG_PRICE(catalogId), {
    method: "GET",
    ...options,
  });
}

/**
 * 7. List active add-ons
 * GET /api/add-ons
 */
export async function getAddOns(options?: RequestOptions): Promise<AddOnListResponse> {
  if (cachedAddOns) {
    return cachedAddOns;
  }

  const result = await apiFetch<AddOnListResponse>(ENDPOINTS.ADD_ONS, {
    method: "GET",
    ...options,
  });

  if (result && result.success) {
    cachedAddOns = result;
  }

  return result;
}

// ==========================================
// 2. PUBLIC BOOKING & CHECKOUT
// ==========================================

/**
 * 8. Calculate a quotation
 * POST /api/booking/quote (Cached with 3-minute TTL)
 */
export async function calculateQuote(
  payload: QuoteRequest,
  options?: RequestOptions
): Promise<QuoteResponse> {
  const cacheKey = JSON.stringify({
    v: payload.vehicle_id,
    s: payload.service_id,
    p: (payload.pickup?.address || "").toLowerCase().trim(),
    d: (payload.drop?.address || "").toLowerCase().trim(),
    a: payload.add_ons,
    h: payload.hours,
  });

  const cached = clientQuoteCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < QUOTE_CACHE_TTL_MS) {
    return cached.data;
  }

  const result = await apiFetch<QuoteResponse>(ENDPOINTS.BOOKING_QUOTE, {
    method: "POST",
    body: JSON.stringify(payload),
    ...options,
  });

  if (result && result.success) {
    clientQuoteCache.set(cacheKey, { data: result, timestamp: Date.now() });
  }

  return result;
}

/**
 * 9. Create booking and Stripe checkout
 * POST /api/bookings/checkout
 */
export async function createBookingCheckout(
  payload: CheckoutRequest,
  options?: RequestOptions
): Promise<CheckoutResponse> {
  return apiFetch<CheckoutResponse>(ENDPOINTS.BOOKINGS_CHECKOUT, {
    method: "POST",
    body: JSON.stringify(payload),
    ...options,
  });
}

/**
 * Google Places Autocomplete Search
 * POST /api/places/autocomplete (with client in-memory cache)
 */
export async function getPlacesAutocomplete(
  input: string,
  includedRegionCodes: string[] = ["sg"],
  options?: RequestOptions
): Promise<GooglePlacesAutocompleteResponse> {
  const cleanInput = (input || "").trim();
  const cacheKey = `${cleanInput.toLowerCase()}_${includedRegionCodes.sort().join(",")}`;

  // Check client memory cache first
  if (clientPlacesCache.has(cacheKey)) {
    return clientPlacesCache.get(cacheKey)!;
  }

  try {
    const res = await fetch(ENDPOINTS.PLACES_AUTOCOMPLETE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: cleanInput,
        includedRegionCodes,
        languageCode: "en",
      }),
      signal: options?.signal,
    });

    if (!res.ok) {
      return { suggestions: [] };
    }

    const data: GooglePlacesAutocompleteResponse = await res.json();
    if (data && Array.isArray(data.suggestions)) {
      clientPlacesCache.set(cacheKey, data);
    }
    return data;
  } catch (err) {
    if ((err as Error).name !== "AbortError") {
      console.warn("Places autocomplete request failed:", err);
    }
    return { suggestions: [] };
  }
}


// ==========================================
// 3. SYSTEM HEALTH & MONITORING
// ==========================================

/**
 * 22. Process health
 * GET /health
 */
export async function checkHealth(options?: RequestOptions): Promise<HealthResponse> {
  return apiFetch<HealthResponse>(ENDPOINTS.HEALTH, {
    method: "GET",
    ...options,
  });
}

/**
 * 23. Database readiness
 * GET /ready
 */
export async function checkReadiness(options?: RequestOptions): Promise<ReadyResponse> {
  return apiFetch<ReadyResponse>(ENDPOINTS.READY, {
    method: "GET",
    ...options,
  });
}

// ==========================================
// 4. ADMIN CATALOG & OPERATIONS
// (Requires Authorization: Bearer <ADMIN_API_KEY>)
// ==========================================

export const adminApi = {
  // 10. Create vehicle type
  createVehicleType: (data: AdminCreateVehicleTypeRequest, adminApiKey: string) =>
    apiFetch<{ vehicleType: { id: number; name: string; description: string } }>(
      ENDPOINTS.ADMIN_VEHICLE_TYPES,
      {
        method: "POST",
        adminApiKey,
        body: JSON.stringify(data),
      }
    ),

  // 11. Update vehicle type
  updateVehicleType: (
    id: number | string,
    data: AdminUpdateVehicleTypeRequest,
    adminApiKey: string
  ) =>
    apiFetch<{ vehicleType: { id: number; name: string; description: string } }>(
      ENDPOINTS.ADMIN_VEHICLE_TYPE_DETAIL(id),
      {
        method: "PATCH",
        adminApiKey,
        body: JSON.stringify(data),
      }
    ),

  // 12. Create vehicle and rates
  createVehicle: (data: AdminCreateVehicleRequest, adminApiKey: string) =>
    apiFetch<SingleVehicleResponse>(ENDPOINTS.ADMIN_VEHICLES, {
      method: "POST",
      adminApiKey,
      body: JSON.stringify(data),
    }),

  // 13. Update vehicle details
  updateVehicle: (
    id: number | string,
    data: AdminUpdateVehicleRequest,
    adminApiKey: string
  ) =>
    apiFetch<SingleVehicleResponse>(ENDPOINTS.ADMIN_VEHICLE_DETAIL(id), {
      method: "PATCH",
      adminApiKey,
      body: JSON.stringify(data),
    }),

  // 14. Set or replace one service rate
  setVehiclePrice: (
    vehicleId: number | string,
    serviceCode: string,
    data: AdminSetVehiclePriceRequest,
    adminApiKey: string
  ) =>
    apiFetch<SingleVehicleResponse>(ENDPOINTS.ADMIN_VEHICLE_PRICE(vehicleId, serviceCode), {
      method: "PUT",
      adminApiKey,
      body: JSON.stringify(data),
    }),

  // 15. Create service
  createService: (data: AdminCreateServiceRequest, adminApiKey: string) =>
    apiFetch<{ service: { id: number; code: string; name: string; unit: string; sortOrder: number; status: string } }>(
      ENDPOINTS.ADMIN_SERVICES,
      {
        method: "POST",
        adminApiKey,
        body: JSON.stringify(data),
      }
    ),

  // 16. Update service
  updateService: (
    serviceCode: string,
    data: AdminUpdateServiceRequest,
    adminApiKey: string
  ) =>
    apiFetch<{ service: { id: number; code: string; name: string; unit: string; sortOrder: number; status: string } }>(
      ENDPOINTS.ADMIN_SERVICE_DETAIL(serviceCode),
      {
        method: "PATCH",
        adminApiKey,
        body: JSON.stringify(data),
      }
    ),

  // 17. Create add-on
  createAddOn: (data: AdminCreateAddOnRequest, adminApiKey: string) =>
    apiFetch<{ success: true; add_on: unknown }>(ENDPOINTS.ADMIN_ADD_ONS, {
      method: "POST",
      adminApiKey,
      body: JSON.stringify(data),
    }),

  // 18. Update add-on
  updateAddOn: (
    id: number | string,
    data: AdminUpdateAddOnRequest,
    adminApiKey: string
  ) =>
    apiFetch<{ success: true; add_on: unknown }>(ENDPOINTS.ADMIN_ADD_ON_DETAIL(id), {
      method: "PATCH",
      adminApiKey,
      body: JSON.stringify(data),
    }),

  // 19. List distance rules
  getDistanceRules: (adminApiKey: string) =>
    apiFetch<DistancePricingRuleListResponse>(ENDPOINTS.ADMIN_DISTANCE_RULES, {
      method: "GET",
      adminApiKey,
    }),

  // 20. Create distance rule
  createDistanceRule: (data: AdminCreateDistanceRuleRequest, adminApiKey: string) =>
    apiFetch<DistancePricingRuleSingleResponse>(ENDPOINTS.ADMIN_DISTANCE_RULES, {
      method: "POST",
      adminApiKey,
      body: JSON.stringify(data),
    }),

  // 21. Update distance rule
  updateDistanceRule: (
    id: number | string,
    data: AdminUpdateDistanceRuleRequest,
    adminApiKey: string
  ) =>
    apiFetch<DistancePricingRuleSingleResponse>(ENDPOINTS.ADMIN_DISTANCE_RULE_DETAIL(id), {
      method: "PATCH",
      adminApiKey,
      body: JSON.stringify(data),
    }),

  // Manual booking from admin (POST /api/v1/bookings)
  createManualBooking: (
    data: AdminManualBookingRequest,
    adminApiKey: string,
    idempotencyKey?: string
  ) =>
    apiFetch<AdminManualBookingResponse>(ENDPOINTS.ADMIN_BOOKINGS, {
      method: "POST",
      adminApiKey,
      idempotencyKey,
      body: JSON.stringify(data),
    }),

  // Delete a booking (DELETE /api/v1/bookings/:id)
  deleteBooking: (bookingId: string | number, adminApiKey: string) =>
    apiFetch<void>(ENDPOINTS.ADMIN_BOOKING_DETAIL(bookingId), {
      method: "DELETE",
      adminApiKey,
    }),

  // Delete an add-on (DELETE /api/v1/add-ons/:id)
  deleteAddOn: (id: number | string, adminApiKey: string) =>
    apiFetch<void>(ENDPOINTS.ADMIN_ADD_ON_DETAIL(id), {
      method: "DELETE",
      adminApiKey,
    }),

  // Deactivate or activate an add-on (PATCH /api/v1/add-ons/:id with uppercase status)
  setAddOnStatus: (
    id: number | string,
    status: UppercaseStatus,
    adminApiKey: string
  ) =>
    apiFetch<{ success: true; add_on: unknown }>(ENDPOINTS.ADMIN_ADD_ON_DETAIL(id), {
      method: "PATCH",
      adminApiKey,
      body: JSON.stringify({ status }),
    }),

  // Deactivate or activate a vehicle (PATCH /api/v1/vehicles/:id with lowercase status)
  setVehicleStatus: (
    id: number | string,
    status: Status,
    adminApiKey: string
  ) =>
    apiFetch<SingleVehicleResponse>(ENDPOINTS.ADMIN_VEHICLE_DETAIL(id), {
      method: "PATCH",
      adminApiKey,
      body: JSON.stringify({ status }),
    }),

  // Update vehicle description (PATCH /api/v1/vehicles/:id with description)
  updateVehicleDescription: (
    id: number | string,
    description: string,
    adminApiKey: string
  ) =>
    apiFetch<SingleVehicleResponse>(ENDPOINTS.ADMIN_VEHICLE_DETAIL(id), {
      method: "PATCH",
      adminApiKey,
      body: JSON.stringify({ description }),
    }),
};
