"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { usePathname } from "next/navigation";
import {
  calculateQuote,
  createBookingCheckout,
  getVehicles,
  getVehicleRecommendation,
  getServices,
  getAddOns,
  generateIdempotencyKey,
} from "@/lib/api";
import {
  VehicleCard,
  ServiceItem,
  AddOnItem,
  QuoteResponse,
  CheckoutResponse,
  QuoteRequest,
  CheckoutRequest,
} from "@/types/api";
import { isNightOrEarlyMorningTime } from "@/utils/timeValidation";
import { resolveServiceForBooking, getVehicleFareForBooking } from "@/utils/serviceResolver";
import { getRecommendedFleet } from "@/utils/recommendation";
import { resolveSlugFromApiVehicle } from "@/lib/fleetResolver";

export interface BookingData {
  vehicleId?: number;
  serviceId?: number;
  serviceCode?: string;
  serviceType: string;
  pickup: string;
  dropoff: string;
  passengers: number;
  luggage: number;
  meetAndGreet: boolean;
  meetGreetPax?: number;
  durationHours: number;
  selectedFleet: string;
  selectedFleetSlug: string;
  baseFare: number;
  pickupDate: string;
  pickupTime: string;
  flightNo: string;
  flightNumber?: string;
  signboardName?: string;
  terminal?: string;
  babySeat: boolean;
  babySeatsCount?: number;
  babySeatType?: "Infant" | "Toddler";
  babySeatAge?: string;
  nightTravel?: boolean;
  extraStopsWithin2km?: number;
  extraStopsOver2km?: number;
  additionalStopsCount?: number;
  additionalStopDistanceTier?: "<2km" | "2-5km" | ">5km";
  additionalStopAddress?: string;
  wheelchairAccessible?: boolean;
  wheelchairCount?: number;
  wheelchairRequirement?: string;
  selectedAddOnIds?: string[];
  specialRequests: string;
  name: string;
  phone: string;
  countryCode: string;
  email: string;
}

interface BookingModalOptions {
  initialStep?: number;
  serviceType?: string;
  vehicleId?: number;
  serviceId?: number;
  selectedFleet?: string;
  selectedFleetSlug?: string;
  baseFare?: number;
  pickup?: string;
  dropoff?: string;
  durationHours?: number;
}

interface BookingContextType {
  isModalOpen: boolean;
  step: number;
  bookingData: BookingData;
  vehicles: VehicleCard[];
  isLoadingVehicles: boolean;
  services: ServiceItem[];
  addOns: AddOnItem[];
  quote: QuoteResponse | null;
  isQuoting: boolean;
  quoteError: string | null;
  isCheckingOut: boolean;
  checkoutError: string | null;
  openModal: (options?: BookingModalOptions) => void;
  closeModal: () => void;
  setStep: (step: number) => void;
  updateBookingData: (data: Partial<BookingData>) => void;
  resetBooking: () => void;
  calculateTotal: () => number;
  fetchLiveQuote: () => Promise<QuoteResponse | null>;
  submitLiveCheckout: (paymentType?: "stripe" | "paynow" | string) => Promise<CheckoutResponse | null>;
  fetchRecommendation: () => Promise<void>;
}

const defaultBookingData: BookingData = {
  vehicleId: 3,
  serviceId: 1,
  serviceCode: "arrival",
  serviceType: "Airport Transfer",
  pickup: "",
  dropoff: "",
  passengers: 7,
  luggage: 5,
  meetAndGreet: false,
  durationHours: 3,
  selectedFleet: "7 Seater Maxi Cab",
  selectedFleetSlug: "7-seater",
  baseFare: 80,
  pickupDate: "",
  pickupTime: "",
  flightNo: "",
  flightNumber: "",
  signboardName: "",
  terminal: "",
  babySeat: false,
  nightTravel: false,
  extraStopsWithin2km: 0,
  extraStopsOver2km: 0,
  additionalStopsCount: 0,
  additionalStopDistanceTier: "<2km",
  additionalStopAddress: "",
  specialRequests: "",
  name: "",
  phone: "",
  countryCode: "+65",
  email: "",
};

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingModalProvider({ children }: { children: ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState<BookingData>(defaultBookingData);

  const pathname = usePathname();

  // Reset booking data, quotation, and close modal when route changes
  useEffect(() => {
    setBookingData(defaultBookingData);
    setQuote(null);
    setQuoteError(null);
    setCheckoutError(null);
    setIsModalOpen(false);
    setStep(1);
  }, [pathname]);

  // Live Catalog State from API
  const [vehicles, setVehicles] = useState<VehicleCard[]>([]);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(true);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [addOns, setAddOns] = useState<AddOnItem[]>([]);

  // Live Quote & Checkout State
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [isQuoting, setIsQuoting] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Reset checking-out state when returning from Stripe (browser Back, BFCache, or tab focus)
  useEffect(() => {
    const handleReset = () => {
      setIsCheckingOut(false);
    };

    window.addEventListener("pageshow", handleReset);
    window.addEventListener("focus", handleReset);
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        setIsCheckingOut(false);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("pageshow", handleReset);
      window.removeEventListener("focus", handleReset);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  // Fetch initial catalog data
  useEffect(() => {
    let isMounted = true;
    async function loadCatalog() {
      try {
        setIsLoadingVehicles(true);
        const [vehiclesRes, servicesRes, addOnsRes] = await Promise.allSettled([
          getVehicles(),
          getServices(),
          getAddOns(),
        ]);

        if (!isMounted) return;

        if (vehiclesRes.status === "fulfilled" && vehiclesRes.value.data) {
          setVehicles(vehiclesRes.value.data);
        }
        if (servicesRes.status === "fulfilled" && servicesRes.value.services) {
          setServices(servicesRes.value.services);
        }
        if (addOnsRes.status === "fulfilled" && addOnsRes.value.data) {
          setAddOns(addOnsRes.value.data);
        }
      } catch (e) {
        console.warn("Could not connect to live backend catalog, using local fallbacks:", e);
      } finally {
        if (isMounted) {
          setIsLoadingVehicles(false);
        }
      }
    }
    loadCatalog();
    return () => {
      isMounted = false;
    };
  }, []);

  const fetchRecommendation = async () => {
    try {
      const res = await getVehicleRecommendation(
        bookingData.passengers || 7,
        bookingData.luggage || 5
      );
      if (res && res.data && res.data.length > 0) {
        setVehicles(res.data);
        if (res.recommendation && res.recommendation.vehicle_id) {
          const recommendedVehicle = res.data.find(
            (v) => v.id === res.recommendation?.vehicle_id
          );
          if (recommendedVehicle) {
            const currentCap = bookingData.passengers || 7;
            const currentLug = bookingData.luggage || 5;
            // If current vehicle is under-capacity for the passenger/luggage count, auto-upgrade
            if (
              (recommendedVehicle.passengerCapacity ?? 7) >= currentCap &&
              (recommendedVehicle.luggageCapacity ?? 5) >= currentLug
            ) {
              const slug =
                recommendedVehicle.passengerCapacity === 6
                  ? "6-seater"
                  : recommendedVehicle.passengerCapacity === 7
                  ? "7-seater"
                  : recommendedVehicle.passengerCapacity === 9
                  ? "9-seater"
                  : recommendedVehicle.passengerCapacity === 13
                  ? "13-seater"
                  : `vehicle-${recommendedVehicle.id}`;
              const fare = getVehicleFareForBooking(recommendedVehicle, bookingData, services);
              setBookingData((prev) => ({
                ...prev,
                vehicleId: recommendedVehicle.id,
                selectedFleet: recommendedVehicle.name,
                selectedFleetSlug: slug,
                baseFare: fare,
              }));
            }
          }
        }
      }
    } catch {
      // Local capacity-based recommendation fallback strictly matching backend API pricing
      const rec = getRecommendedFleet(
        bookingData.passengers || 7,
        bookingData.luggage || 5,
        bookingData,
        vehicles
      );

      setBookingData((prev) => ({
        ...prev,
        ...rec,
      }));
    }
  };

  // Auto-recommendation watcher when passenger or luggage counts change
  useEffect(() => {
    let isCancelled = false;
    const update = async () => {
      await fetchRecommendation();
    };
    update();
    return () => {
      isCancelled = true;
    };
  }, [bookingData.passengers, bookingData.luggage]);

  const openModal = (options?: BookingModalOptions) => {
    if (options) {
      setBookingData((prev) => ({
        ...prev,
        ...(options.serviceType ? { serviceType: options.serviceType } : {}),
        ...(options.vehicleId !== undefined ? { vehicleId: options.vehicleId } : {}),
        ...(options.serviceId !== undefined ? { serviceId: options.serviceId } : {}),
        ...(options.selectedFleet ? { selectedFleet: options.selectedFleet } : {}),
        ...(options.selectedFleetSlug ? { selectedFleetSlug: options.selectedFleetSlug } : {}),
        ...(options.baseFare !== undefined ? { baseFare: options.baseFare } : {}),
        ...(options.pickup !== undefined && options.pickup !== "" ? { pickup: options.pickup } : {}),
        ...(options.dropoff !== undefined && options.dropoff !== "" ? { dropoff: options.dropoff } : {}),
        ...(options.durationHours !== undefined ? { durationHours: options.durationHours } : {}),
      }));
      setStep(options.initialStep ?? 1);
    } else {
      setStep(1);
    }
    setQuote(null);
    setQuoteError(null);
    setCheckoutError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const updateBookingData = (data: Partial<BookingData>) => {
    setBookingData((prev) => ({ ...prev, ...data }));
  };

  const resetBooking = () => {
    setBookingData(defaultBookingData);
    setQuote(null);
    setQuoteError(null);
    setCheckoutError(null);
    setStep(1);
  };

  // Helper to build Add-On Selections for API
  const buildAddOnSelections = () => {
    const list: { add_on_id: number; quantity: number }[] = [];

    // Find add_on IDs dynamically or use standard defaults from handoff
    const meetGreetAddOn = addOns.find((a) => a.code === "MEET_GREET");
    const babySeatAddOn = addOns.find((a) => a.code === "BABY_SEAT");
    const nightTravelAddOn = addOns.find(
      (a) => a.code === "NIGHT_TRAVEL" || a.name.toLowerCase().includes("night") || a.name.toLowerCase().includes("midnight")
    );
    const stopWithin2km = addOns.find((a) => a.code === "STOP_WITHIN_2KM");
    const stopOver2km = addOns.find((a) => a.code === "STOP_OVER_2KM");

    if (bookingData.meetAndGreet) {
      list.push({ add_on_id: meetGreetAddOn?.id || 2, quantity: 1 });
    }
    if (bookingData.babySeat) {
      list.push({ add_on_id: babySeatAddOn?.id || 3, quantity: bookingData.babySeatsCount || 1 });
    }
    const isNightPickup = isNightOrEarlyMorningTime(bookingData.pickupTime);
    if (bookingData.nightTravel || isNightPickup) {
      list.push({ add_on_id: nightTravelAddOn?.id || 1, quantity: 1 });
    }
    const stopsCount = bookingData.additionalStopsCount || bookingData.extraStopsWithin2km || 0;
    const stopTier = bookingData.additionalStopDistanceTier || "<2km";
    if (stopsCount > 0) {
      if (stopTier === "<2km") {
        list.push({ add_on_id: stopWithin2km?.id || 4, quantity: stopsCount });
      } else if (stopTier === "2-5km") {
        list.push({ add_on_id: stopOver2km?.id || 5, quantity: stopsCount });
      }
      // >5km: requires special enquiry/quote, not billed as standard online add-on
    }

    return list;
  };

  // Helper to dynamically resolve the vehicle ID matching API catalog
  const resolveVehicleId = () => {
    if (bookingData.vehicleId && vehicles.some((v) => v.id === bookingData.vehicleId)) {
      return bookingData.vehicleId;
    }
    if (vehicles.length > 0) {
      const slug = (bookingData.selectedFleetSlug || "").toLowerCase();
      const name = (bookingData.selectedFleet || "").toLowerCase();
      const found = vehicles.find((v) => {
        if (slug.includes("6-seater") || name.includes("6 seater")) return v.passengerCapacity === 6;
        if (slug.includes("7-seater") || name.includes("7 seater") || slug.includes("vip")) return v.passengerCapacity === 7;
        if (slug.includes("9-seater") || name.includes("9 seater")) return v.passengerCapacity === 9;
        if (slug.includes("13-seater") || name.includes("13 seater") || name.includes("minibus")) return v.passengerCapacity === 13;
        if (slug.includes("wheelchair") || name.includes("wheelchair")) return v.name.toLowerCase().includes("wheelchair");
        return false;
      });
      if (found) return found.id;
    }
    return bookingData.vehicleId || 3;
  };

  // 8. Calculate live quote via API
  const fetchLiveQuote = async (): Promise<QuoteResponse | null> => {
    setIsQuoting(true);
    setQuoteError(null);

    const isHourly = bookingData.serviceType.toLowerCase().includes("hourly");

    // Dynamic resolution of service ID matching itinerary
    const { id: resolvedServiceId } = resolveServiceForBooking(bookingData, services);

    const payload: QuoteRequest = {
      vehicle_id: resolveVehicleId(),
      service_id: resolvedServiceId,
      pickup: { address: bookingData.pickup || "Singapore Changi Airport" },
      drop: { address: bookingData.dropoff || "Marina Bay Sands" },
      add_ons: buildAddOnSelections(),
      ...(isHourly ? { hours: Math.min(24, Math.max(1, bookingData.durationHours || 3)) } : {}),
    };

    try {
      const response = await calculateQuote(payload);
      setQuote(response);
      return response;
    } catch (err: unknown) {
      const msg = (err as Error).message || "Failed to calculate live quotation";
      setQuoteError(msg);
      console.warn("Quote calculation warning:", msg);
      return null;
    } finally {
      setIsQuoting(false);
    }
  };

  // 9. Submit live booking and redirect to Stripe Checkout
  const submitLiveCheckout = async (
    paymentType: "stripe" | "paynow" | string = "stripe"
  ): Promise<CheckoutResponse | null> => {
    setIsCheckingOut(true);
    setCheckoutError(null);

    const isHourly = bookingData.serviceType.toLowerCase().includes("hourly");

    // Dynamic resolution of service ID matching itinerary
    const { id: resolvedServiceId } = resolveServiceForBooking(bookingData, services);

    // Format phone to E.164 (+ followed by 7-15 digits)
    const cleanCountry = (bookingData.countryCode || "+65").replace(/[^\d+]/g, "");
    const rawCountry = cleanCountry.startsWith("+") ? cleanCountry : `+${cleanCountry}`;
    const rawDigits = (bookingData.phone || "91234567").replace(/\D/g, "");
    const cleanDigits = rawDigits.startsWith("0") ? rawDigits.replace(/^0+/, "") : rawDigits;
    const formattedPhone = `${rawCountry}${cleanDigits}`;

    const payload: CheckoutRequest = {
      customer: {
        name: bookingData.name.trim() || "Customer",
        email: bookingData.email.trim() || "booking@singaporemaxicabs.com.sg",
        phone: formattedPhone,
      },
      vehicle_id: resolveVehicleId(),
      service_id: resolvedServiceId,
      pickup: { address: bookingData.pickup || "Singapore Changi Airport" },
      drop: { address: bookingData.dropoff || "Marina Bay Sands" },
      add_ons: buildAddOnSelections(),
      payment_method: "STRIPE",
      paymentType,
      ...(isHourly ? { hours: Math.min(24, Math.max(1, bookingData.durationHours || 3)) } : {}),
    };

    const idempotencyKey = generateIdempotencyKey();

    try {
      const response = await createBookingCheckout(payload, { idempotencyKey });
      if (response && "stripe_checkout_url" in response && response.stripe_checkout_url) {
        if (typeof window !== "undefined") {
          try {
            sessionStorage.setItem("last_booking_id", response.booking_id || "");
            sessionStorage.setItem("last_booking_amount", String(response.amount || ""));
            sessionStorage.setItem("last_booking_currency", response.currency || "SGD");
          } catch {}
          // Navigate to Stripe checkout URL
          window.location.href = response.stripe_checkout_url;
        }
      }
      return response;
    } catch (err: unknown) {
      const msg = (err as Error).message || "Checkout session could not be created";
      setCheckoutError(msg);
      console.warn("Checkout error:", msg);
      return null;
    } finally {
      setIsCheckingOut(false);
    }
  };

  const calculateTotal = () => {
    const nightTravelItem = addOns.find(
      (a) => a.code === "NIGHT_TRAVEL" || a.name.toLowerCase().includes("night") || a.name.toLowerCase().includes("midnight")
    );
    const nightTravelPrice = nightTravelItem ? nightTravelItem.price : 10;
    const isNightPickup = isNightOrEarlyMorningTime(bookingData.pickupTime);

    const selectedVehicleObj = vehicles.find(
      (v) => v.id === bookingData.vehicleId || resolveSlugFromApiVehicle(v) === bookingData.selectedFleetSlug
    );
    const vehicleFare = selectedVehicleObj
      ? getVehicleFareForBooking(selectedVehicleObj, bookingData, services)
      : (bookingData.baseFare || 80);

    const distanceAmt =
      quote && quote.quote_status === "AVAILABLE" && quote.quote?.distance_amount
        ? quote.quote.distance_amount
        : 0;

    let addOnsAmt = 0;
    const meetGreetItem = addOns.find((a) => a.code === "MEET_GREET" || a.name.toLowerCase().includes("meet"));
    const meetGreetPrice = meetGreetItem ? meetGreetItem.price : 20;

    const babySeatItem = addOns.find((a) => a.code === "BABY_SEAT" || a.name.toLowerCase().includes("baby") || a.name.toLowerCase().includes("child"));
    const babySeatPrice = babySeatItem ? babySeatItem.price : 20;

    const stopWithin2kmItem = addOns.find((a) => a.code === "STOP_WITHIN_2KM" || a.name.toLowerCase().includes("within 2km") || a.name.toLowerCase().includes("stop"));
    const stopWithin2kmPrice = stopWithin2kmItem ? stopWithin2kmItem.price : 10;

    const stopOver2kmItem = addOns.find((a) => a.code === "STOP_OVER_2KM" || a.name.toLowerCase().includes("over 2km"));
    const stopOver2kmPrice = stopOver2kmItem ? stopOver2kmItem.price : 20;

    if (bookingData.meetAndGreet) {
      addOnsAmt += meetGreetPrice;
    }
    if (bookingData.babySeat) {
      addOnsAmt += babySeatPrice * (bookingData.babySeatsCount || 1);
    }
    const stops = bookingData.additionalStopsCount || bookingData.extraStopsWithin2km || 0;
    const stopTier = bookingData.additionalStopDistanceTier || "<2km";
    if (stops > 0) {
      if (stopTier === "<2km") {
        addOnsAmt += stopWithin2kmPrice * stops;
      } else if (stopTier === "2-5km") {
        addOnsAmt += 15 * stops;
      } else {
        // >5km: Enquiry via WhatsApp, no automated charge applied
        addOnsAmt += 0;
      }
    }
    if (bookingData.nightTravel || isNightPickup) {
      addOnsAmt += nightTravelPrice;
    }
    return vehicleFare + distanceAmt + addOnsAmt;
  };

  return (
    <BookingContext.Provider
      value={{
        isModalOpen,
        step,
        bookingData,
        vehicles,
        isLoadingVehicles,
        services,
        addOns,
        quote,
        isQuoting,
        quoteError,
        isCheckingOut,
        checkoutError,
        openModal,
        closeModal,
        setStep,
        updateBookingData,
        resetBooking,
        calculateTotal,
        fetchLiveQuote,
        submitLiveCheckout,
        fetchRecommendation,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBookingModal() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error("useBookingModal must be used within a BookingModalProvider");
  }
  return context;
}
