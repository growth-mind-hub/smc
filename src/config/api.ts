/**
 * API Configuration & Endpoint Mapping
 * Maxicab Backend Integration
 */

export const API_CONFIG = {
  // Base URL: Set via NEXT_PUBLIC_API_BASE_URL or fallback to live deployed backend
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.singaporemaxicabs.com.sg",
  // Proxy URL for client-side calls to bypass browser CORS / preflight restrictions
  PROXY_PREFIX: "/api/proxy",
  // Standard API prefix
  API_PREFIX: "/api",
  API_V1_PREFIX: "/api/v1",
  TIMEOUT_MS: 15000,
  DEFAULT_CURRENCY: "SGD",
} as const;

/**
 * All 24 Endpoint Paths defined in frontend-api-handoff.html
 */
export const ENDPOINTS = {
  // --- Public Endpoints ---
  // 1. List vehicle cards
  VEHICLES: "/api/vehicles",
  // 2. Recommend a vehicle
  VEHICLES_RECOMMEND: "/api/vehicles/recommend",
  // 3. Get one vehicle
  VEHICLE_DETAIL: (id: number | string) => `/api/vehicles/${id}`,
  // 4. List active services
  SERVICES: "/api/services",
  // 5. List vehicle types
  VEHICLE_TYPES: "/api/vehicle-types",
  // 6. Resolve a vehicle/service price
  CATALOG_PRICE: (catalogId: number | string) => `/api/catalog/${catalogId}`,
  // 7. List active add-ons
  ADD_ONS: "/api/add-ons",
  // 8. Calculate a quotation
  BOOKING_QUOTE: "/api/booking/quote",
  // 9. Create booking and Stripe checkout
  BOOKINGS_CHECKOUT: "/api/bookings/checkout",
  // 22. Process health
  HEALTH: "/health",
  // 23. Database readiness
  READY: "/ready",
  // 24. Stripe payment notification
  STRIPE_WEBHOOK: "/api/payments/stripe/webhook",
  // Google Places Autocomplete Endpoint
  PLACES_AUTOCOMPLETE: "/api/places/autocomplete",

  // --- Admin Endpoints ---
  // Admin Bookings (Manual Booking & Deletion)
  ADMIN_BOOKINGS: "/api/v1/bookings",
  ADMIN_BOOKING_DETAIL: (id: string | number) => `/api/v1/bookings/${id}`,
  // 10 & 11. Vehicle Types CRUD
  ADMIN_VEHICLE_TYPES: "/api/vehicle-types",
  ADMIN_VEHICLE_TYPE_DETAIL: (id: number | string) => `/api/vehicle-types/${id}`,
  // 12 & 13. Vehicles CRUD
  ADMIN_VEHICLES: "/api/vehicles",
  ADMIN_VEHICLE_DETAIL: (id: number | string) => `/api/vehicles/${id}`,
  // 14. Set or replace one service rate
  ADMIN_VEHICLE_PRICE: (vehicleId: number | string, serviceCode: string) =>
    `/api/vehicles/${vehicleId}/prices/${serviceCode}`,
  // 15 & 16. Services CRUD
  ADMIN_SERVICES: "/api/services",
  ADMIN_SERVICE_DETAIL: (serviceCode: string) => `/api/services/${serviceCode}`,
  // 17 & 18. Add-ons CRUD
  ADMIN_ADD_ONS: "/api/add-ons",
  ADMIN_ADD_ON_DETAIL: (id: number | string) => `/api/add-ons/${id}`,
  // 19, 20 & 21. Distance Pricing Rules CRUD
  ADMIN_DISTANCE_RULES: "/api/distance-pricing-rules",
  ADMIN_DISTANCE_RULE_DETAIL: (id: number | string) => `/api/distance-pricing-rules/${id}`,
} as const;
