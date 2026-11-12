/**
 * Maxicab API TypeScript Type Definitions
 * Based on frontend-api-handoff.html (24 Endpoint Contracts)
 */

// ==========================================
// 1. Vehicle & Catalog Types
// ==========================================

export type ServiceUnit = "trip" | "hour";
export type Status = "active" | "inactive";
export type UppercaseStatus = "ACTIVE" | "INACTIVE";
export type PricingType = "FIXED" | "PER_STOP";

export interface VehiclePriceItem {
  catalogId: number;
  serviceId: number;
  amount: number;
  amountMinor: number;
  currency: string;
  validFrom: string;
  validTo: string | null;
  status: Status;
  isFrom: boolean;
  unit: ServiceUnit;
  serviceName: string;
  minimumHours: number | null;
  threeHourAmount?: number | null;
  eightHourAmount?: number | null;
}

export interface VehiclePrices {
  [serviceCode: string]: VehiclePriceItem;
}

export interface VehicleCard {
  id: number;
  name: string;
  description: string | null;
  passengerCapacity: number | null;
  currency: string;
  vehicleTypeId: number | null;
  vehicleType: string | null;
  imageUrl: string | null;
  status: Status;
  updatedAt: string;
  luggageCapacity: number | null;
  isActive: boolean;
  createdAt: string;
  prices: VehiclePrices;
  recommendation?: boolean;
}

export interface VehicleListRequirements {
  persons: number;
  luggage: number;
}

export interface VehicleListResponse {
  success: boolean;
  requirements: VehicleListRequirements | null;
  data: VehicleCard[];
  recommendation?: {
    vehicle_id: number;
    name?: string;
    reason?: string;
  };
}

export interface SingleVehicleResponse {
  vehicle: VehicleCard;
}

export interface ServiceItem {
  id: number;
  code: string;
  name: string;
  unit: ServiceUnit;
  status: Status;
  sortOrder: number;
}

export interface ServiceListResponse {
  services: ServiceItem[];
}

export interface VehicleTypeItem {
  id: number;
  name: string;
  description: string;
}

export interface VehicleTypeListResponse {
  vehicleTypes: VehicleTypeItem[];
}

export interface CatalogItem {
  catalogId: number;
  vehicleId: number;
  vehicleName: string;
  currency: string;
  service: string;
  price: VehiclePriceItem;
}

export interface CatalogResponse {
  catalog: CatalogItem;
}

// ==========================================
// 2. Add-Ons Types
// ==========================================

export interface AddOnItem {
  id: number;
  code: string;
  name: string;
  description: string;
  pricing_type: PricingType;
  price: number;
  currency: string;
  status: UppercaseStatus;
  created_at: string;
  updated_at: string;
}

export interface AddOnListResponse {
  success: boolean;
  data: AddOnItem[];
}

// ==========================================
// 3. Quote Request & Response Types
// ==========================================

export interface AddressPayload {
  address: string;
}

export interface AddOnSelectionPayload {
  add_on_id: number;
  quantity: number;
}

export interface QuoteRequest {
  vehicle_id: number;
  service_id: number;
  pickup: AddressPayload;
  drop: AddressPayload;
  add_ons: AddOnSelectionPayload[];
  hours?: number; // Required only for hourly services (1-24)
}

export interface QuoteBreakdownAddOn {
  id: number;
  code: string;
  name: string;
  pricing_type: PricingType;
  quantity: number;
  unit_price: number;
  amount: number;
}

export interface QuoteDistanceCharge {
  rule_id: number;
  rule: string;
  amount: number;
}

export interface QuoteRoute {
  pickup: string;
  drop: string;
  distance_km: number;
}

export interface QuoteDetails {
  vehicle: {
    id: number;
    name: string;
    price: number;
  };
  service: {
    id: number;
    name: string;
    unit: ServiceUnit;
  };
  catalog_id: number;
  add_ons: QuoteBreakdownAddOn[];
  vehicle_amount: number;
  add_on_amount: number;
  total_amount: number;
  currency: string;
  route: QuoteRoute;
  distance_charge: QuoteDistanceCharge;
  distance_amount: number;
  hours?: number;
}

export interface AvailableQuoteResponse {
  success: true;
  quote_status: "AVAILABLE";
  quote: QuoteDetails;
}

export interface ContactSupportQuoteResponse {
  success: true;
  quote_status: "CONTACT_SUPPORT";
  route: QuoteRoute;
  distance: {
    value: number;
    unit: string;
  };
  message: string;
  whatsapp: {
    enabled: boolean;
  };
}

export type QuoteResponse = AvailableQuoteResponse | ContactSupportQuoteResponse;

// ==========================================
// 4. Checkout Request & Response Types
// ==========================================

export interface CheckoutCustomer {
  name: string;
  email: string;
  phone: string; // E.164 format: + followed by 7-15 digits
}

export interface CheckoutRequest {
  customer: CheckoutCustomer;
  vehicle_id: number;
  service_id: number;
  pickup: AddressPayload;
  drop: AddressPayload;
  add_ons: AddOnSelectionPayload[];
  hours?: number;
  payment_method: "STRIPE";
  paymentType?: "stripe" | "paynow" | string;
}

export interface CheckoutSuccessResponse {
  success: true;
  booking_id: string;
  payment_status: "PENDING" | "PAID";
  amount: number;
  currency: string;
  stripe_checkout_url: string;
}

export type CheckoutResponse = CheckoutSuccessResponse | ContactSupportQuoteResponse;

export interface AdminManualBookingRequest {
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  vehicle_id: number;
  service_id: number;
  pickup: AddressPayload;
  drop: AddressPayload;
  add_ons: AddOnSelectionPayload[];
  driver_name?: string;
  driver_phone?: string;
  hours?: number;
}

export interface AdminManualBookingResponse {
  booking: {
    id: string;
    booking_number: string;
    payment_method: string;
    booking_status: string;
    status: string;
    total_amount_minor: string;
    currency: string;
    driver_name?: string | null;
    driver_phone?: string | null;
    stripe_checkout_url?: string | null;
  };
}

// ==========================================
// 5. Distance Pricing Rules (Admin)
// ==========================================

export interface DistancePricingRule {
  id: number;
  min_distance_km: number;
  max_distance_km: number | null;
  min_inclusive: boolean;
  max_inclusive: boolean;
  surcharge: number;
  currency: string;
  is_contact_support: boolean;
  status: UppercaseStatus;
  created_at: string;
  updated_at: string;
}

export interface DistancePricingRuleListResponse {
  success: boolean;
  data: DistancePricingRule[];
}

export interface DistancePricingRuleSingleResponse {
  success: boolean;
  distance_rule: DistancePricingRule;
}

// ==========================================
// 6. Admin Create/Update Types
// ==========================================

export interface AdminCreateVehicleTypeRequest {
  name: string;
  description?: string;
}

export interface AdminUpdateVehicleTypeRequest {
  name?: string;
  description?: string;
}

export interface AdminCreateVehiclePriceInput {
  amount: number;
  isFrom?: boolean;
  minimumHours?: number | null;
}

export interface AdminCreateVehicleRequest {
  name: string;
  description?: string;
  passengerCapacity?: number | null;
  luggageCapacity?: number | null;
  currency: string;
  vehicleTypeId?: number | null;
  imageUrl?: string | null;
  status?: Status;
  prices: {
    [serviceCode: string]: AdminCreateVehiclePriceInput;
  };
}

export interface AdminUpdateVehicleRequest {
  name?: string;
  description?: string;
  passengerCapacity?: number | null;
  luggageCapacity?: number | null;
  status?: Status;
  isActive?: boolean;
  vehicleTypeId?: number | null;
  imageUrl?: string | null;
}

export interface AdminSetVehiclePriceRequest {
  amount: number;
  currency?: string;
  isFrom?: boolean;
  minimumHours?: number | null;
  validFrom?: string;
  validTo?: string | null;
  status?: Status;
}

export interface AdminCreateServiceRequest {
  code: string;
  name: string;
  unit: ServiceUnit;
  sortOrder?: number;
  status?: Status;
}

export interface AdminUpdateServiceRequest {
  name?: string;
  sortOrder?: number;
  status?: Status;
}

export interface AdminCreateAddOnRequest {
  code: string;
  name: string;
  description?: string;
  pricing_type: PricingType;
  price: number;
  currency?: string;
  status?: UppercaseStatus;
}

export interface AdminUpdateAddOnRequest {
  name?: string;
  description?: string;
  pricing_type?: PricingType;
  price?: number;
  currency?: string;
  status?: UppercaseStatus;
}

export interface AdminCreateDistanceRuleRequest {
  min_distance_km: number;
  max_distance_km?: number | null;
  min_inclusive?: boolean;
  max_inclusive?: boolean;
  surcharge?: number;
  currency?: string;
  is_contact_support?: boolean;
  status?: UppercaseStatus;
}

export interface AdminUpdateDistanceRuleRequest {
  min_distance_km?: number;
  max_distance_km?: number | null;
  min_inclusive?: boolean;
  max_inclusive?: boolean;
  surcharge?: number;
  currency?: string;
  is_contact_support?: boolean;
  status?: UppercaseStatus;
}

// ==========================================
// 7. System & Common Error Types
// ==========================================

export interface HealthResponse {
  status: "ok";
}

export interface ReadyResponse {
  status: "ready";
}

export interface ApiErrorDetails {
  code: string;
  message: string;
  details?: string[];
}

export interface ApiErrorResponse {
  error: ApiErrorDetails;
  requestId?: string;
}

// ==========================================
// 8. Google Places Autocomplete Types
// (POST https://places.googleapis.com/v1/places:autocomplete)
// ==========================================

export interface GooglePlacePredictionText {
  text: string;
  matches?: { startOffset?: number; endOffset?: number }[];
}

export interface GooglePlaceStructuredFormat {
  mainText: GooglePlacePredictionText;
  secondaryText?: GooglePlacePredictionText;
}

export interface GooglePlacePrediction {
  place?: string;
  placeId: string;
  text: GooglePlacePredictionText;
  structuredFormat?: GooglePlaceStructuredFormat;
  types?: string[];
}

export interface GooglePlaceSuggestion {
  placePrediction?: GooglePlacePrediction;
}

export interface GooglePlacesAutocompleteRequest {
  input: string;
  includedRegionCodes?: string[];
  languageCode?: string;
}

export interface GooglePlacesAutocompleteResponse {
  suggestions?: GooglePlaceSuggestion[];
  error?: {
    code?: number | string;
    message?: string;
    status?: string;
  };
}

