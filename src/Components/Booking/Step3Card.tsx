"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useBookingModal } from "@/context/BookingContext";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  X,
  ShieldCheck,
  Star,
  Users,
  Briefcase,
  ChevronRight,
  Loader2,
  CreditCard,
  AlertCircle,
  QrCode,
  Moon,
  Sparkles,
} from "lucide-react";
import WhatsAppIcon from "@/Components/Shared/WhatsAppIcon";
import Link from "next/link";
import { isNightOrEarlyMorningTime, validateBookingDetails, getUAETime, formatDateDisplay, formatTimeDisplay } from "@/utils/timeValidation";
import { getVehicleFareForBooking } from "@/utils/serviceResolver";
import { resolveSlugFromApiVehicle } from "@/lib/fleetResolver";

interface Step3CardProps {
  isModal?: boolean;
}

function formatDistanceRule(rule?: string, distanceKm?: number): string {
  if (!rule) {
    return distanceKm != null ? `${distanceKm} km` : "Standard Distance";
  }

  // Strip brackets and parentheses
  const cleaned = rule.replace(/[\[\]\(\)]/g, "").trim();

  // Comma range: e.g. "(20, 35]" -> "20, 35" -> "20–35 km"
  if (cleaned.includes(",")) {
    const parts = cleaned.split(",").map((p) => p.replace(/km/gi, "").trim());
    return `${parts[0]}–${parts[1]} km`;
  }

  // Hyphen / dash range: e.g. "20km - 35km" -> "20–35 km"
  if (/[-–—]/.test(cleaned)) {
    const parts = cleaned.split(/[-–—]/).map((p) => p.replace(/km/gi, "").trim());
    return `${parts[0]}–${parts[1]} km`;
  }

  if (!cleaned.toLowerCase().includes("km") && /\d/.test(cleaned)) {
    return `${cleaned} km`;
  }

  return cleaned;
}

export default function Step3Card({ isModal = true }: Step3CardProps) {
  const {
    bookingData,
    calculateTotal,
    setStep,
    closeModal,
    resetBooking,
    fetchLiveQuote,
    submitLiveCheckout,
    quote,
    isQuoting,
    quoteError,
    isCheckingOut,
    checkoutError,
    addOns,
    vehicles,
    services,
  } = useBookingModal();

  const [isSuccess, setIsSuccess] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"paynow" | "stripe">("paynow");
  const [validationError, setValidationError] = useState<string | null>(null);

  const uaeTime = getUAETime();
  const isBookingCreationNight = uaeTime.isLateNight; // Booking created during UAE night (10 PM - 6 AM UAE)
  const isNightPickup = isNightOrEarlyMorningTime(bookingData.pickupTime); // Fleet needed at night (10 PM - 6 AM)
  const router = useRouter();

  // Reset redirecting state when returning from Stripe (browser Back, BFCache, or tab focus)
  useEffect(() => {
    const handleReset = () => {
      setIsRedirecting(false);
    };

    window.addEventListener("pageshow", handleReset);
    window.addEventListener("focus", handleReset);
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        setIsRedirecting(false);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("pageshow", handleReset);
      window.removeEventListener("focus", handleReset);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  // Safety timer: auto-revert redirecting state after 6 seconds if navigation didn't unload page
  useEffect(() => {
    if (isRedirecting) {
      const timer = setTimeout(() => {
        setIsRedirecting(false);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [isRedirecting]);

  // Fetch live backend quotation when Step 3 mounts
  useEffect(() => {
    fetchLiveQuote();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isHourly = bookingData.serviceType.toLowerCase().includes("hourly");
  const duration = bookingData.durationHours || 3;

  const quoteRoute = quote && "quote" in quote ? quote.quote?.route : null;
  const isCityTour = bookingData.serviceType.toLowerCase().includes("tour");
  const isAirport = !isCityTour && !isHourly && (bookingData.serviceType.toLowerCase().includes("airport") || bookingData.serviceType.toLowerCase().includes("arrival"));

  const fallbackPickup = isAirport
    ? "Singapore Changi Airport (T1-T4)"
    : isHourly
    ? "Hotel Grand Pacific Singapore"
    : isCityTour
    ? "Marina Bay Sands Foyer"
    : "Marina Bay Financial Centre";

  const fallbackDropoff = isHourly
    ? "As-Directed City Tour"
    : isAirport
    ? "Marina Bay Sands Hotel"
    : isCityTour
    ? "Sentosa / Gardens by the Bay"
    : "Orchard Road Shopping District";

  const displayPickup = bookingData.pickup || quoteRoute?.pickup || fallbackPickup;
  const displayDropoff = bookingData.dropoff || quoteRoute?.drop || fallbackDropoff;

  // Selected vehicle object from API catalog to guarantee exact fare consistency with Step 2 listing
  const selectedVehicleObj = vehicles?.find(
    (v) => v.id === bookingData.vehicleId || resolveSlugFromApiVehicle(v) === bookingData.selectedFleetSlug
  );

  const resolvedListingFare = selectedVehicleObj
    ? getVehicleFareForBooking(selectedVehicleObj, bookingData, services)
    : (bookingData.baseFare || 80);

  const baseVehicleFare = resolvedListingFare;
  const hourlyRate =
    selectedVehicleObj?.prices?.hourly?.amount ||
    (isHourly && duration > 0 ? Math.round(baseVehicleFare / duration) : 60);

  const isContactSupport = quote?.quote_status === "CONTACT_SUPPORT";

  const nightTravelItem = addOns?.find(
    (a) => a.code === "NIGHT_TRAVEL" || a.name.toLowerCase().includes("night") || a.name.toLowerCase().includes("midnight")
  );
  const nightSurchargePrice = nightTravelItem?.price ?? 10;

  // Selected add-ons for Review and Fare Breakdown
  const selectedAddOnsList: {
    id: string;
    title: string;
    subtitle?: string;
    amount: number;
    amountText: string;
  }[] = [];

  if (quote && quote.quote_status === "AVAILABLE" && quote.quote.add_ons && quote.quote.add_ons.length > 0) {
    quote.quote.add_ons.forEach((item) => {
      let details = "";
      if (item.code === "BABY_SEAT") {
        details = `${item.quantity} ${bookingData.babySeatType || "Toddler"} seat${item.quantity > 1 ? "s" : ""}${bookingData.babySeatAge ? ` (${bookingData.babySeatAge})` : ""}`;
      } else if (item.code === "MEET_GREET") {
        details = "Arrival Meet & Greet with personalized signboard (60m grace period)";
      } else if (item.code === "NIGHT_TRAVEL" || item.code.includes("NIGHT")) {
        details = "Late-Night Transfer Surcharge (10:00 PM – 6:00 AM)";
      } else if (item.code.includes("STOP")) {
        details = `${item.quantity} stop${item.quantity > 1 ? "s" : ""}${bookingData.additionalStopAddress ? ` (${bookingData.additionalStopAddress})` : ""}`;
      } else {
        details = `${item.quantity}x`;
      }

      selectedAddOnsList.push({
        id: item.code,
        title: item.name,
        subtitle: details,
        amount: item.amount,
        amountText: `+$${item.amount}.00`,
      });
    });

    const hasNightInQuote = quote.quote.add_ons.some(
      (a) => a.code === "NIGHT_TRAVEL" || a.name.toLowerCase().includes("night")
    );
    if ((bookingData.nightTravel || isNightPickup) && !hasNightInQuote) {
      selectedAddOnsList.push({
        id: "night-surcharge",
        title: "Late-Night Transfer Surcharge",
        subtitle: "Night chauffeur dispatch & flight radar buffer (10:00 PM – 6:00 AM)",
        amount: nightSurchargePrice,
        amountText: `+$${nightSurchargePrice}.00`,
      });
    }
  } else {
    const meetGreetItem = addOns?.find(
      (a) => a.code === "MEET_GREET" || a.name.toLowerCase().includes("meet")
    );
    const meetGreetPrice = meetGreetItem?.price ?? 20;

    const babySeatItem = addOns?.find(
      (a) => a.code === "BABY_SEAT" || a.name.toLowerCase().includes("baby") || a.name.toLowerCase().includes("child")
    );
    const babySeatPrice = babySeatItem?.price ?? 20;

    const stopItem = addOns?.find(
      (a) => a.code === "STOP_WITHIN_2KM" || a.name.toLowerCase().includes("stop")
    );
    const stopPrice = stopItem?.price ?? 10;

    if (bookingData.meetAndGreet) {
      selectedAddOnsList.push({
        id: "meet-greet",
        title: "Meet & Greet Service",
        subtitle: "Arrival meetpoint greeting with personalized signboard (60m buffer)",
        amount: meetGreetPrice,
        amountText: `+$${meetGreetPrice}.00`,
      });
    }

    if (bookingData.babySeat) {
      const seats = bookingData.babySeatsCount || 1;
      const amt = babySeatPrice * seats;
      const typeStr = bookingData.babySeatType || "Toddler";
      const ageStr = bookingData.babySeatAge ? ` (${bookingData.babySeatAge})` : "";
      selectedAddOnsList.push({
        id: "baby-seat",
        title: `Child Seat (${seats}x ${typeStr}${ageStr})`,
        subtitle: "LTA compliant sanitized and secured child safety seat",
        amount: amt,
        amountText: `+$${amt}.00`,
      });
    }

    const stops = bookingData.additionalStopsCount || bookingData.extraStopsWithin2km || 0;
    if (stops > 0) {
      const tier = bookingData.additionalStopDistanceTier || "<2km";
      let amt = 0;
      let amtText = "";
      let tierLabel = "< 2 km";
      if (tier === "<2km") {
        amt = 10 * stops;
        amtText = `+$${amt}.00`;
        tierLabel = "< 2 km (+$10/stop)";
      } else if (tier === "2-5km") {
        amt = 15 * stops;
        amtText = `+$${amt}.00`;
        tierLabel = "2–5 km (+$15/stop)";
      } else {
        amt = 0;
        amtText = "Enquiry (WhatsApp)";
        tierLabel = "Above 5 km (Please enquire)";
      }

      selectedAddOnsList.push({
        id: "additional-stops",
        title: `Additional Stop${stops > 1 ? "s" : ""} (${stops} stop${stops > 1 ? "s" : ""})`,
        subtitle: `${tierLabel}${bookingData.additionalStopAddress ? ` • Via: ${bookingData.additionalStopAddress}` : ""}`,
        amount: amt,
        amountText: amtText,
      });
    }

    if (bookingData.wheelchairAccessible || (bookingData.wheelchairCount && bookingData.wheelchairCount > 0)) {
      const count = bookingData.wheelchairCount || 1;
      selectedAddOnsList.push({
        id: "wheelchair",
        title: "Wheelchair-Accessible Maxi Cab",
        subtitle: bookingData.wheelchairRequirement
          ? `${count} Wheelchair: ${bookingData.wheelchairRequirement}`
          : `${count} Wheelchair with hydraulic ramp & safety harness`,
        amount: 0,
        amountText: "Included ($0)",
      });
    }

    if (bookingData.nightTravel || isNightPickup) {
      selectedAddOnsList.push({
        id: "night-surcharge",
        title: "Late-Night Transfer Surcharge",
        subtitle: "Night chauffeur dispatch & flight radar buffer (10:00 PM – 6:00 AM)",
        amount: nightSurchargePrice,
        amountText: `+$${nightSurchargePrice}.00`,
      });
    }
  }

  const distanceChargeAmount =
    quote && quote.quote_status === "AVAILABLE" && quote.quote?.distance_amount
      ? quote.quote.distance_amount
      : 0;

  const addOnsTotalAmount = selectedAddOnsList.reduce((sum, item) => sum + (item.amount || 0), 0);

  // Authoritative total fare displayed to the customer:
  // Strictly guarantees that the total exactly equals the sum of line items displayed on screen
  const totalFare = baseVehicleFare + distanceChargeAmount + addOnsTotalAmount;

  const handleProceed = async () => {
    // 1. Validate passenger contact and itinerary details before proceeding
    const validation = validateBookingDetails({
      name: bookingData.name,
      phone: bookingData.phone,
      email: bookingData.email,
      pickupDate: bookingData.pickupDate,
      pickupTime: bookingData.pickupTime,
    });

    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      setValidationError(firstError || "Please complete all required passenger information.");
      return;
    }
    setValidationError(null);

    const forwardToWhatsApp = () => {
      const text =
        `*New Singapore Maxi Cab Booking Request*%0A` +
        `--------------------------------%0A` +
        `*Service:* ${bookingData.serviceType}%0A` +
        (isHourly ? `*Duration:* ${duration} Hours%0A` : "") +
        `*Vehicle:* ${bookingData.selectedFleet || "7-Seater Maxi Cab"}%0A` +
        `*Pickup:* ${displayPickup}%0A` +
        (!isHourly
          ? `*Dropoff:* ${displayDropoff}%0A`
          : `*Dropoff / Scope:* ${displayDropoff}%0A`) +
        `*Date & Time:* ${formatDateDisplay(bookingData.pickupDate)}${bookingData.pickupTime ? ` at ${formatTimeDisplay(bookingData.pickupTime)} (${bookingData.pickupTime} SGT)` : ""}%0A` +
        `*Pax:* ${bookingData.passengers || 7} | *Luggage:* ${bookingData.luggage || 5} Bags%0A` +
        `*Passenger Name:* ${bookingData.name || "Customer"}%0A` +
        `*Phone/WhatsApp:* ${bookingData.phone ? `${bookingData.countryCode} ${bookingData.phone}` : "Via WhatsApp"}%0A` +
        `*Email:* ${bookingData.email || "booking@singaporemaxicabs.com.sg"}%0A` +
        (bookingData.flightNumber ? `*Flight Number:* ${bookingData.flightNumber}%0A` : "") +
        (bookingData.signboardName ? `*Signboard Name:* ${bookingData.signboardName}%0A` : "") +
        (isNightPickup ? `*Late-Night Surcharge (10 PM–6 AM):* +$${nightSurchargePrice}.00 SGD Included%0A` : "") +
        `*Booking Created At:* ${uaeTime.timeString}%0A` +
        `*Final Tariff:* $${totalFare}.00 SGD NETT%0A` +
        `--------------------------------%0A` +
        `Please confirm driver dispatch availability. Thank you!`;

      const waUrl = `https://wa.me/6588006006?text=${text}`;
      const opened = window.open(waUrl, "_blank");
      if (!opened) {
        window.location.href = waUrl;
      }
      setIsSuccess(true);
    };

    const forwardToWhatsAppWithPayNow = () => {
      const text =
        `*Singapore Maxi Cab Booking — PayNow Transfer Requested*%0A` +
        `--------------------------------%0A` +
        `*Service:* ${bookingData.serviceType}%0A` +
        (isHourly ? `*Duration:* ${duration} Hours%0A` : "") +
        `*Vehicle:* ${bookingData.selectedFleet || "7-Seater Maxi Cab"}%0A` +
        `*Pickup Location:* ${displayPickup}%0A` +
        (!isHourly
          ? `*Dropoff Location:* ${displayDropoff}%0A`
          : `*Dropoff / Charter Scope:* ${displayDropoff}%0A`) +
        `*Date & Time:* ${formatDateDisplay(bookingData.pickupDate)}${bookingData.pickupTime ? ` at ${formatTimeDisplay(bookingData.pickupTime)} (${bookingData.pickupTime} SGT)` : ""}%0A` +
        `*Passengers:* ${bookingData.passengers || 7} Pax | *Luggage:* ${bookingData.luggage || 5} Bags%0A` +
        `*Passenger Name:* ${bookingData.name || "Customer"}%0A` +
        `*Contact Number:* ${bookingData.phone ? `${bookingData.countryCode} ${bookingData.phone}` : "Via WhatsApp"}%0A` +
        `*Email:* ${bookingData.email || "booking@singaporemaxicabs.com.sg"}%0A` +
        (bookingData.flightNumber ? `*Flight Number:* ${bookingData.flightNumber}%0A` : "") +
        (bookingData.signboardName ? `*Signboard Name:* ${bookingData.signboardName}%0A` : "") +
        (isNightPickup ? `*Late-Night Surcharge (10 PM–6 AM):* +$${nightSurchargePrice}.00 SGD Included%0A` : "") +
        `--------------------------------%0A` +
        `*PAYMENT DETAILS*%0A` +
        `*Payment Method:* PayNow%0A` +
        `*Total Tariff:* $${totalFare}.00 SGD NETT%0A` +
        `*Payment Status:* Pending Official PayNow QR from Dispatch Desk%0A` +
        `--------------------------------%0A` +
        `Hello Operations Desk, please send me the official PayNow QR code for $${totalFare}.00 SGD to confirm and track my booking. Thank you!`;

      const waUrl = `https://wa.me/6588006006?text=${text}`;
      const opened = window.open(waUrl, "_blank");
      if (!opened) {
        window.location.href = waUrl;
      }
      setIsSuccess(true);
    };

    if (isContactSupport) {
      // Direct to WhatsApp for customized quotation
      const text =
        `*Customized Route Quotation Request*%0A` +
        `--------------------------------%0A` +
        `*Service:* ${bookingData.serviceType}%0A` +
        `*Pickup:* ${displayPickup}%0A` +
        `*Dropoff:* ${displayDropoff}%0A` +
        `*Vehicle:* ${bookingData.selectedFleet || "7-Seater Maxi Cab"}%0A` +
        `*Pax:* ${bookingData.passengers} | *Luggage:* ${bookingData.luggage}%0A` +
        `*Contact:* ${bookingData.name} (${bookingData.countryCode} ${bookingData.phone})%0A` +
        `--------------------------------%0A` +
        `Please provide a custom quotation for this route.`;
      const waUrl = `https://wa.me/6588006006?text=${text}`;
      const opened = window.open(waUrl, "_blank");
      if (!opened) {
        window.location.href = waUrl;
      }
      return;
    }

    // 2. Late-Night Booking Creation (10:00 PM to 6:00 AM UAE Time)
    // When created during late night in UAE, forward directly to WhatsApp Operations
    if (isBookingCreationNight) {
      forwardToWhatsApp();
      return;
    }

    // 3. Daytime Payment: PayNow Option -> Call checkout API with paymentType: 'paynow'
    if (selectedPaymentMethod === "paynow") {
      try {
        const checkoutRes = await submitLiveCheckout("paynow");
        if (checkoutRes && "stripe_checkout_url" in checkoutRes && checkoutRes.stripe_checkout_url) {
          setIsRedirecting(true);
          return;
        }
        setIsRedirecting(false);
        forwardToWhatsAppWithPayNow();
      } catch (e) {
        console.warn("PayNow checkout error, forwarding to WhatsApp:", e);
        setIsRedirecting(false);
        forwardToWhatsAppWithPayNow();
      }
      return;
    }

    // 4. Daytime Payment: Stripe Card / Digital Wallets Option
    try {
      // Initiate live Stripe checkout and redirect to Stripe Checkout URL
      const checkoutRes = await submitLiveCheckout("stripe");
      if (checkoutRes && "stripe_checkout_url" in checkoutRes && checkoutRes.stripe_checkout_url) {
        setIsRedirecting(true);
        return;
      }
      // If Stripe checkout cannot be created, forward directly to WhatsApp
      setIsRedirecting(false);
      forwardToWhatsApp();
    } catch (e) {
      console.warn("Stripe checkout error, forwarding to WhatsApp:", e);
      setIsRedirecting(false);
      forwardToWhatsApp();
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full max-w-[562px] mx-auto bg-white rounded-2xl border border-[#E9ECEF] p-6 sm:p-10 text-center flex flex-col items-center justify-center gap-6 shadow-2xl relative max-h-[92vh] overflow-y-auto selection:bg-[#C6A45A] selection:text-[#071E3B]">
        {isModal && closeModal && (
          <button
            type="button"
            onClick={closeModal}
            className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 p-2 rounded-full text-[#667085] hover:text-[#071E3B] hover:bg-slate-100 active:scale-95 transition-all z-20 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        )}

        {/* Success Icon Circle */}
        <div className="w-20 h-20 bg-[#E8F8EE] rounded-full flex items-center justify-center text-[#16803C] shrink-0 border border-[#22C55E]/30">
          <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
        </div>

        {/* Title & Description */}
        <div className="flex flex-col items-center gap-2 max-w-sm">
          <h3 className="text-2xl sm:text-3xl font-semibold text-[#071E3B] font-manrope">
            Booking Confirmed!
          </h3>
          <p className="text-sm sm:text-base text-[#5F6B7A] font-manrope leading-relaxed">
            Thank you, <span className="font-semibold text-[#071E3B]">{bookingData.name || "Valued Customer"}</span>! Your booking request has been received. We&apos;ll confirm via WhatsApp within 15 minutes.
          </p>
        </div>

        {/* Itinerary Quick Summary Pill */}
        <div className="w-full max-w-sm p-4 rounded-xl bg-[#FBF7EC] border border-[#F4EAD1] text-left text-xs space-y-1.5 text-[#071E3B] font-manrope">
          <div className="flex justify-between font-semibold">
            <span className="text-[#5F6B7A]">Passenger:</span>
            <span>{bookingData.name || "Customer"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#5F6B7A]">Vehicle:</span>
            <span>{bookingData.selectedFleet || "7 Seater Maxi Cab"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#5F6B7A]">Date &amp; Time:</span>
            <span>
              {formatDateDisplay(bookingData.pickupDate)}{bookingData.pickupTime ? ` at ${formatTimeDisplay(bookingData.pickupTime)} (${bookingData.pickupTime} SGT)` : ""}
            </span>
          </div>
          {selectedAddOnsList.length > 0 && (
            <div className="flex justify-between">
              <span className="text-[#5F6B7A]">Add-Ons:</span>
              <span className="font-semibold text-right truncate max-w-[200px]">
                {selectedAddOnsList.map((a) => a.title).join(", ")}
              </span>
            </div>
          )}
          <div className="flex justify-between font-bold pt-2 border-t border-[#C6A45A]/20 text-[#8A5A00] text-sm">
            <span>Guaranteed Final Tariff:</span>
            <span>${totalFare}.00 SGD NETT</span>
          </div>
        </div>

        {/* Action Buttons: WhatsApp Chat & Make Another Booking */}
        <div className="flex flex-col gap-3 w-full max-w-sm">
          <a
            href={`https://wa.me/6588006006?text=${encodeURIComponent(`Hi, I just placed a booking for ${bookingData.name || "Customer"} (${bookingData.selectedFleet || "7 Seater Maxi Cab"}) on ${formatDateDisplay(bookingData.pickupDate)}${bookingData.pickupTime ? ` at ${formatTimeDisplay(bookingData.pickupTime)} (${bookingData.pickupTime} SGT)` : ""}. Total: $${totalFare}.00 SGD.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-6 bg-[#E8F8EE] hover:bg-[#d5f4e0] border border-[#16803C] text-[#16803C] rounded-lg text-base font-semibold font-manrope transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <WhatsAppIcon className="w-5 h-5" />
            <span>Chat with us on WhatsApp</span>
          </a>
          <button
            type="button"
            onClick={() => {
              setIsSuccess(false);
              resetBooking();
              if (closeModal) closeModal();
            }}
            className="w-full py-3.5 px-6 bg-[#071E3B] hover:bg-[#0B2A4A] text-white rounded-lg text-base font-semibold font-manrope transition-all cursor-pointer shadow-md"
          >
            Make Another Booking
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[562px] mx-auto p-3.5 sm:p-6 md:p-7 bg-white rounded-2xl border border-slate-200 flex flex-col justify-start items-start gap-4 sm:gap-5 shadow-2xl relative max-h-[92vh] overflow-y-auto overflow-x-hidden selection:bg-[#C6A45A] selection:text-[#071E3B]">
      {/* Close button if in modal */}
      {isModal && closeModal && (
        <button
          type="button"
          onClick={closeModal}
          className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 p-2 rounded-full text-[#667085] hover:text-[#071E3B] hover:bg-slate-100 active:scale-95 transition-all z-30 cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      )}

      {/* Header */}
      <div className="flex flex-col justify-start items-start pr-8 sm:pr-0">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#C6A45A] font-manrope">
            Step 4 of 4
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-xs font-medium text-[#667085] font-manrope">
            Review &amp; Payment
          </span>
        </div>
        <div className="text-[#071E3B] text-xl font-semibold font-manrope leading-7 pt-0.5">
          Review Your Journey
        </div>
      </div>

      {/* Validation Alert if passenger details are missing */}
      {validationError && (
        <div className="self-stretch p-3.5 bg-rose-50 rounded-xl border border-rose-200 flex items-center justify-between gap-3 text-rose-800 text-xs font-manrope animate-in fade-in">
          <div className="flex items-center gap-2 min-w-0">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-semibold text-rose-900 truncate">{validationError}</span>
          </div>
          <button
            type="button"
            onClick={() => setStep(3)}
            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold transition-all text-[11px] shrink-0 cursor-pointer"
          >
            Edit Passenger Details
          </button>
        </div>
      )}

      {/* Confirmed Vehicle Class Hero Card */}
      <div className="w-full h-[240px] sm:h-[288px] min-h-[240px] sm:min-h-[288px] shrink-0 relative rounded-2xl flex flex-col justify-between p-3.5 sm:p-5 overflow-hidden bg-slate-900 shadow-md">
        <Image
          src="/images/bookinpage3.png"
          alt={bookingData.selectedFleet || "7 Seater Maxi Cab"}
          fill
          sizes="(max-width: 640px) 100vw, 560px"
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 via-55% to-transparent pointer-events-none" />

        {/* Top Badges */}
        <div className="relative z-10 flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="px-2.5 py-1 bg-[#071E3B]/80 rounded-md border border-white/20 backdrop-blur-md flex items-center gap-1.5 shadow-sm">
            <div className="w-3.5 h-3.5 rounded-full bg-[#C6A45A] flex items-center justify-center shrink-0">
              <Star className="w-2 h-2 text-[#071E3B] fill-[#071E3B]" />
            </div>
            <span className="text-white text-[10px] sm:text-xs font-bold font-manrope tracking-wider leading-none uppercase">
              VIP CHANGI CONCIERGE
            </span>
          </div>
          <div className="px-2.5 py-1 bg-[#071E3B]/80 rounded-md border border-white/20 backdrop-blur-md flex items-center shadow-sm">
            <span className="text-white text-[10px] sm:text-xs font-bold font-manrope tracking-wider leading-none uppercase">
              {bookingData.selectedFleet ? bookingData.selectedFleet.toUpperCase() : "7 SEATER MAXI CAB"}
            </span>
          </div>
        </div>

        {/* Bottom Vehicle Info */}
        <div className="relative z-10 flex flex-col justify-start items-start gap-1 sm:gap-1.5">
          <div className="self-stretch flex items-center justify-between gap-2 flex-wrap">
            <span className="text-[#C6A45A] text-[11px] sm:text-sm font-bold font-manrope tracking-wider uppercase">
              CONFIRMED VEHICLE CLASS
            </span>
            <div className="px-2 sm:px-2.5 py-1 bg-[#071E3B]/80 rounded-md border border-white/20 backdrop-blur-md flex items-center gap-1.5 text-white text-[10px] sm:text-xs font-semibold font-manrope shadow-sm">
              <Users className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-[#C6A45A]" />
              <span>Max {bookingData.passengers || 7} Pax</span>
              <span className="text-white/60 font-normal">•</span>
              <Briefcase className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-[#C6A45A]" />
              <span>
                {bookingData.luggage || 5}{" "}
                <span className="hidden sm:inline">Luggage</span>
                <span className="sm:hidden">Lug</span>
              </span>
            </div>
          </div>
          <div className="text-white text-lg sm:text-2xl font-bold font-manrope leading-tight tracking-tight drop-shadow-sm">
            {bookingData.selectedFleet === "6 Seater Maxi Cab"
              ? "Toyota Vellfire / Toyota Alphard"
              : bookingData.selectedFleet === "9 Seater Maxi Cab"
              ? "Toyota HiAce / Mercedes Vito"
              : bookingData.selectedFleet === "13 Seater Minibus"
              ? "Toyota HiAce Commuter Minibus"
              : bookingData.selectedFleet === "VIP Lounge 7-Seater"
              ? "Mercedes V-Class / Luxury MPV"
              : bookingData.selectedFleet === "Wheelchair Maxi Cab"
              ? "Modified Toyota HiAce Accessible"
              : "Mercedes-Benz V-Class / Toyota Vellfire"}
          </div>
        </div>
      </div>

      {/* Journey & Booking Details Flow */}
      <div className="self-stretch flex flex-col justify-start items-start gap-6 sm:gap-8">
        {/* Row 1: Pick Up & Destination */}
        <div className="self-stretch grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 items-start">
          {/* Pick Up */}
          <div className="flex flex-col justify-start items-start gap-1 sm:gap-2 min-w-0">
            <div className="inline-flex items-center gap-1.5 flex-wrap">
              <span className="text-[#8A5A00] text-sm font-medium font-inter leading-5">
                Pick Up
              </span>
              {bookingData.terminal && (
                <span className="px-2 py-0.5 bg-[#123F6B] rounded-sm text-white text-xs font-normal font-manrope leading-4">
                  {bookingData.terminal}
                </span>
              )}
            </div>
            <div className="text-[#071E3B] text-base font-bold font-manrope leading-snug sm:leading-7 break-words">
              {displayPickup}
            </div>
            {(bookingData.flightNumber || bookingData.flightNo) ? (
              <div className="text-[#667085] text-xs sm:text-sm font-normal font-manrope leading-5">
                Flight {bookingData.flightNumber || bookingData.flightNo} · Flight buffer active
              </div>
            ) : null}
          </div>

          {/* Destination */}
          <div className="flex flex-col justify-start items-start gap-1 sm:gap-2 min-w-0">
            <span className="text-[#8A5A00] text-sm font-medium font-inter leading-5">
              Destination
            </span>
            <div className="text-[#071E3B] text-base font-bold font-manrope leading-snug sm:leading-7 break-words">
              {displayDropoff}
            </div>
            {isHourly && (
              <div className="text-[#667085] text-xs sm:text-sm font-normal font-manrope leading-5">
                {duration} Hours Dedicated Chauffeur Charter
              </div>
            )}
          </div>
        </div>

        {/* Row 2: Date & Time and Meet & Greet Signboard OR Selected Fleet */}
        <div className="self-stretch grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 items-start">
          <div className="flex flex-col justify-start items-start gap-1 min-w-0">
            <span className="text-[#C6A45A] text-xs font-bold font-manrope leading-4 uppercase">
              DATE &amp; TIME
            </span>
            <div className="text-[#071E3B] text-base font-bold font-manrope leading-6">
              {formatDateDisplay(bookingData.pickupDate)}
            </div>
            <div className="text-[#5F6B7A] text-xs sm:text-sm font-medium font-manrope leading-5">
              {bookingData.pickupTime ? `${formatTimeDisplay(bookingData.pickupTime)} (${bookingData.pickupTime} SGT)` : "—"} {(bookingData.flightNumber || bookingData.flightNo) ? `(${bookingData.flightNumber || bookingData.flightNo} Buffer)` : ""}
            </div>
          </div>

          {bookingData.meetAndGreet ? (
            <div className="flex flex-col justify-start items-start gap-1 min-w-0">
              <span className="text-[#C6A45A] text-xs font-bold font-manrope leading-4 uppercase">
                ARRIVAL MEET &amp; GREET SIGNBOARD
              </span>
              <div className="text-[#071E3B] text-base font-bold font-manrope leading-6 break-words">
                {(bookingData.signboardName || bookingData.name || "VALUED PASSENGER").toUpperCase()}
              </div>
              <div className="text-[#5F6B7A] text-xs sm:text-sm font-medium font-manrope leading-5">
                Chauffeur will hold in terminal arrival hall
              </div>
            </div>
          ) : (
            <div className="flex flex-col justify-start items-start gap-1 min-w-0">
              <span className="text-[#C6A45A] text-xs font-bold font-manrope leading-4 uppercase">
                SELECTED FLEET
              </span>
              <div className="text-[#071E3B] text-base font-bold font-manrope leading-6 break-words">
                {bookingData.selectedFleet || "7-Seater Maxi Cab"}
              </div>
              <div className="text-[#5F6B7A] text-xs sm:text-sm font-medium font-manrope leading-5">
                Up to {bookingData.passengers || 7} Passengers · {bookingData.luggage || 5} Bags
              </div>
            </div>
          )}
        </div>

        {/* Row 3: Passenger */}
        <div className="flex flex-col justify-start items-start gap-1">
          <span className="text-[#C6A45A] text-xs font-bold font-manrope leading-4 uppercase">
            PASSENGER
          </span>
          <div className="text-[#071E3B] text-base font-bold font-manrope leading-6">
            {bookingData.name || "Customer"}
          </div>
          <div className="text-[#5F6B7A] text-xs sm:text-sm font-medium font-manrope leading-5">
            {bookingData.phone ? `${bookingData.countryCode} ${bookingData.phone}` : "Contact on file"}
          </div>
        </div>

        {/* Contact Support Alert if Route > 35km */}
        {isContactSupport && (
          <div className="self-stretch p-4 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-3 text-amber-800">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <span className="text-sm font-bold font-manrope">Custom Quotation Required</span>
              <p className="text-xs font-manrope leading-relaxed">
                This route exceeds standard limits ({quote.distance?.value || ""} km). Please contact our WhatsApp dispatch team for a personalized VIP quote.
              </p>
            </div>
          </div>
        )}

        {/* Live Quoting Loading Indicator */}
        {isQuoting && (
          <div className="self-stretch p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center gap-2 text-slate-600 text-xs font-medium font-manrope">
            <Loader2 className="w-4 h-4 animate-spin text-[#C6A45A]" />
            <span>Calculating live route distance &amp; tariff...</span>
          </div>
        )}

        {/* Live Checkout Error Alert */}
        {checkoutError && (
          <div className="self-stretch p-4 bg-rose-50 rounded-xl border border-rose-200 flex items-start gap-3 text-rose-800 animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1.5 flex-1">
              <span className="text-sm font-bold font-manrope text-rose-900">
                Payment Session Could Not Be Started
              </span>
              <p className="text-xs font-manrope leading-relaxed text-rose-700">
                {checkoutError}
              </p>
              <div className="flex items-center gap-3 pt-1 text-xs font-manrope">
                <button
                  type="button"
                  onClick={handleProceed}
                  className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded font-semibold transition-colors cursor-pointer"
                >
                  Retry Stripe Payment
                </button>
                <a
                  href="https://wa.me/6588006006"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-emerald-700 hover:text-emerald-900 underline inline-flex items-center gap-1"
                >
                  <WhatsAppIcon className="w-3 h-3 text-[#16803C]" />
                  <span>Book via WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Tariff Breakdown Section */}
        <div className="self-stretch bg-white rounded-2xl flex flex-col justify-start items-start gap-4">
          {/* Header */}
          <div className="self-stretch flex justify-between items-center gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <ShieldCheck className="w-5 h-5 text-[#8A5A00] shrink-0" />
              <span className="text-[#071E3B] text-base sm:text-lg font-bold font-manrope leading-tight">
                Tariff Breakdown
              </span>
            </div>
            <span className="px-2 py-0.5 sm:py-1 bg-[#FFF8E7] rounded-xl text-[#8A5A00] text-[11px] sm:text-xs font-semibold font-manrope leading-4 shrink-0">
              Zero Hidden Charges
            </span>
          </div>

          <div className="self-stretch flex flex-col justify-start items-start gap-3 sm:gap-4">
            {/* Transfer / Charter Line Item */}
            <div className="self-stretch py-2 flex justify-between items-start gap-3 border-b border-slate-100">
              <div className="flex flex-col justify-start items-start min-w-0 flex-1">
                <span className="text-slate-900 text-sm font-medium font-inter leading-5">
                  {bookingData.selectedFleet || "7-Seater Maxi Cab"} {isHourly ? `(${duration} Hours Charter)` : "Transfer"}
                </span>
                <span className="text-zinc-600 text-xs font-normal font-manrope leading-4 mt-0.5">
                  {isHourly
                    ? `${duration} hours dedicated chauffeur @ $${hourlyRate}/hr`
                    : "Includes arrival driveway pickup, toll systems, and driver dispatch"}
                </span>
              </div>
              <div className="text-right shrink-0 flex flex-col items-end">
                <span className="text-slate-900 text-lg sm:text-xl font-semibold font-manrope leading-tight">
                  ${baseVehicleFare}.00
                </span>
                <span className="text-slate-500 text-[11px] sm:text-xs font-normal font-manrope">
                  SGD
                </span>
              </div>
            </div>

            {/* Selected Add-Ons Line Items in Tariff Breakdown */}
            {selectedAddOnsList.map((addon) => (
              <div
                key={addon.id}
                className="self-stretch py-2 flex justify-between items-start gap-3 border-b border-slate-100"
              >
                <div className="flex flex-col justify-start items-start min-w-0 flex-1">
                  <span className="text-slate-900 text-sm font-medium font-inter leading-5">
                    {addon.title}
                  </span>
                  {addon.subtitle && (
                    <span className="text-zinc-600 text-xs font-normal font-manrope leading-4 mt-0.5">
                      {addon.subtitle}
                    </span>
                  )}
                </div>
                <div className="text-right shrink-0 flex flex-col items-end">
                  <span className="text-slate-900 text-sm sm:text-base font-semibold font-manrope leading-tight">
                    {addon.amountText}
                  </span>
                  <span className="text-slate-500 text-[10px] font-normal font-manrope">
                    {addon.amount > 0 ? "SGD" : "Included"}
                  </span>
                </div>
              </div>
            ))}

            {/* Distance Charge if present from live quote */}
            {quote && quote.quote_status === "AVAILABLE" && quote.quote.distance_amount > 0 && (
              <div className="self-stretch py-1.5 flex justify-between items-start gap-3 border-b border-slate-100 text-xs">
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-slate-900 font-semibold font-manrope">
                    Distance Surcharge ({formatDistanceRule(quote.quote.distance_charge?.rule, quote.quote.route?.distance_km)})
                  </span>
                  <span className="text-[#667085]">Verified Google Distance Matrix Route</span>
                </div>
                <span className="text-slate-900 font-bold font-manrope text-sm shrink-0">
                  +${quote.quote.distance_amount}.00 SGD
                </span>
              </div>
            )}

            {/* Inclusions */}
            <div className="self-stretch flex flex-col justify-start items-start gap-2 pt-1">
              <div className="self-stretch flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-[#8A5A00] fill-[#8A5A00] shrink-0" />
                <span className="text-[#5F6B7A] text-[11px] sm:text-xs font-bold font-manrope leading-tight uppercase tracking-wider">
                  ALL-INCLUSIVE BENEFITS ($0 EXTRA CHARGES)
                </span>
              </div>
              <div className="w-full flex sm:grid sm:grid-cols-3 gap-2 overflow-x-auto no-scrollbar items-stretch pb-0.5">
                <div className="flex-1 min-w-[130px] sm:min-w-0 p-2 sm:p-2.5 bg-[#FAF7F0] rounded-xl border border-[#EADBBD]/70 flex flex-col justify-between items-start gap-1 h-full min-h-[64px] sm:min-h-[70px]">
                  <span className="text-[#5F6B7A] text-xs font-medium font-manrope">
                    ERP &amp; Tolls
                  </span>
                  <span className="text-[#8A5A00] text-xs font-bold font-manrope">
                    INCLUDED ($0)
                  </span>
                </div>
                <div className="flex-1 min-w-[130px] sm:min-w-0 p-2 sm:p-2.5 bg-[#FAF7F0] rounded-xl border border-[#EADBBD]/70 flex flex-col justify-between items-start gap-1 h-full min-h-[64px] sm:min-h-[70px]">
                  <span className="text-[#5F6B7A] text-xs font-medium font-manrope">
                    {bookingData.meetAndGreet ? "Meet & Greet + 60m Wait" : "Driveway Pickup + 60m"}
                  </span>
                  <span className="text-[#8A5A00] text-xs font-bold font-manrope">
                    INCLUDED ($0)
                  </span>
                </div>
                <div className="flex-1 min-w-[130px] sm:min-w-0 p-2 sm:p-2.5 bg-[#FAF7F0] rounded-xl border border-[#EADBBD]/70 flex flex-col justify-between items-start gap-1 h-full min-h-[64px] sm:min-h-[70px]">
                  <span className="text-[#5F6B7A] text-xs font-medium font-manrope">
                    {isNightPickup ? "Late-Night Dispatch" : "Peak & Surge Multiplier"}
                  </span>
                  <span className="text-[#8A5A00] text-xs font-bold font-manrope">
                    {isNightPickup ? `+$${nightSurchargePrice}.00 SGD` : "WAIVED ($0)"}
                  </span>
                </div>
              </div>
            </div>

            {/* Final Tariff */}
            <div className="self-stretch flex flex-col justify-start items-start pt-2">
              <div className="self-stretch rounded-xl p-3 sm:p-4 bg-[#FBF7EC]/80 border border-[#F4EAD1] flex justify-between items-center gap-3">
                <div className="flex flex-col justify-start items-start min-w-0">
                  <span className="text-[#8A5A00] text-sm sm:text-base font-bold font-manrope leading-tight">
                    Final Tariff
                  </span>
                  <span className="text-[#5F6B7A] text-xs font-medium font-manrope leading-tight mt-0.5">
                    Guaranteed fixed rate · Zero surge or hidden fees
                  </span>
                </div>
                <div className="flex flex-col justify-between items-end shrink-0">
                  <div className="text-slate-900 text-2xl sm:text-3xl font-extrabold font-manrope leading-none">
                    ${totalFare}.00
                  </div>
                  <div className="text-[#8A5A00] text-[10px] sm:text-xs font-bold font-manrope mt-1 tracking-wider uppercase">
                    SGD NETT
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Night Dispatch Protocol Notice OR Payment Method Selection */}
        {isBookingCreationNight ? (
          /* Late-Night Booking Creation (10:00 PM – 6:00 AM UAE Time) */
          <div className="self-stretch p-4 bg-[#071E3B] text-white rounded-2xl border border-[#C6A45A]/40 shadow-sm flex flex-col gap-2.5 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#C6A45A] font-bold text-sm font-manrope">
                <Moon className="w-4 h-4 shrink-0 text-[#C6A45A]" />
                <span>Late-Night Operations Window (10 PM – 6 AM UAE)</span>
              </div>
              <span className="px-2 py-0.5 bg-[#C6A45A]/20 text-[#C6A45A] text-[10px] font-bold rounded-md uppercase tracking-wider font-manrope">
                {uaeTime.timeString}
              </span>
            </div>
            <p className="text-xs text-slate-200 font-manrope leading-relaxed">
              Your booking is being created during our late-night UAE operations window (current UAE time: <strong className="text-white">{uaeTime.timeString}</strong>). To guarantee direct chauffeur tracking, terminal meet &amp; greet buffer, and priority assignment, this ride is confirmed directly with our Operations Concierge via WhatsApp.
            </p>
            <div className="pt-1.5 border-t border-slate-700/60 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#C6A45A] font-semibold font-manrope">
              <span>✓ Guaranteed Priority Chauffeur</span>
              <span>✓ Live Operations Desk</span>
              <span>✓ {isNightPickup ? `+$${nightSurchargePrice}.00 SGD Night Transfer Surcharge Included` : "No Extra Night Surcharge"}</span>
            </div>
          </div>
        ) : (
          /* Daytime Booking Creation in UAE */
          <div className="self-stretch flex flex-col gap-2.5 pt-1">
            {/* If fleet is needed at night, inform user about the late-night surcharge */}
            {isNightPickup && (
              <div className="p-3.5 bg-[#FAF7F0] border border-[#EADBBD] rounded-xl flex items-start gap-2.5 text-xs text-[#071E3B] font-manrope animate-in fade-in">
                <Moon className="w-4 h-4 text-[#8A5A00] shrink-0 mt-0.5" />
                <div className="flex-1 leading-snug">
                  <span className="font-bold text-[#8A5A00]">
                    Late-Night Transfer Schedule (10:00 PM – 6:00 AM):
                  </span>{" "}
                  Pickup scheduled for <strong>{bookingData.pickupTime}</strong>. A +${nightSurchargePrice}.00 SGD late-night surcharge has been added to your tariff. You can complete checkout directly below.
                </div>
              </div>
            )}
            {/* Payment Method Selector */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-[#8A5A00]" />
                <span className="text-[#071E3B] text-sm sm:text-base font-bold font-manrope">
                  Select Payment Method
                </span>
              </div>
              <span className="text-[11px] text-[#8A5A00] font-semibold font-manrope">
                Zero Hidden Charges
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Option 1: PayNow */}
              <div
                onClick={() => setSelectedPaymentMethod("paynow")}
                className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-2 text-left relative ${
                  selectedPaymentMethod === "paynow"
                    ? "border-[#071E3B] bg-[#F4F7FB] shadow-sm"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#071E3B] text-[#C6A45A] flex items-center justify-center shrink-0">
                      <QrCode className="w-4 h-4 text-[#C6A45A]" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-[#071E3B] font-manrope">
                        PayNow
                      </div>
                      <span className="text-[10px] text-[#8A5A00] font-bold uppercase tracking-wider font-manrope">
                        SGQR · WhatsApp Dispatch
                      </span>
                    </div>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                      selectedPaymentMethod === "paynow" ? "border-[#071E3B] bg-[#071E3B]" : "border-slate-300"
                    }`}
                  >
                    {selectedPaymentMethod === "paynow" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>
                <p className="text-[11px] text-[#5F6B7A] font-manrope leading-snug">
                  Official PayNow QR code sent directly to your WhatsApp by our operations desk. Scan &amp; pay to track.
                </p>
                <div className="text-[10px] text-[#8A5A00] font-semibold font-manrope flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#C6A45A]" />
                  <span>≈ AED {(totalFare * 2.72).toFixed(2)} (Standard bank rate)</span>
                </div>
              </div>

              {/* Option 2: Credit / Debit Card (Stripe) */}
              <div
                onClick={() => setSelectedPaymentMethod("stripe")}
                className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-2 text-left relative ${
                  selectedPaymentMethod === "stripe"
                    ? "border-[#071E3B] bg-[#F4F7FB] shadow-sm"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#071E3B] text-[#C6A45A] flex items-center justify-center shrink-0">
                      <CreditCard className="w-4 h-4 text-[#C6A45A]" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-[#071E3B] font-manrope">
                        Credit / Debit Card
                      </div>
                      <span className="text-[10px] text-[#071E3B] font-bold uppercase tracking-wider font-manrope">
                        Stripe Global Checkout
                      </span>
                    </div>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                      selectedPaymentMethod === "stripe" ? "border-[#071E3B] bg-[#071E3B]" : "border-slate-300"
                    }`}
                  >
                    {selectedPaymentMethod === "stripe" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>
                <p className="text-[11px] text-[#5F6B7A] font-manrope leading-snug">
                  Visa, Mastercard, AMEX, Apple Pay &amp; Google Pay. Instant digital confirmation invoice emailed.
                </p>
                <div className="text-[10px] text-emerald-700 font-semibold font-manrope flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>256-Bit SSL Encrypted</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Disclaimer & Buttons */}
        <div className="self-stretch flex flex-col justify-start items-start gap-2 pt-1">
          <div className="self-stretch text-center text-[#5F6B7A] text-[11px] sm:text-xs font-normal font-manrope leading-4">
            Singapore trips only — cross-border rides to Malaysia not available.
          </div>
          <div className="self-stretch flex items-center gap-2.5 sm:gap-4 w-full">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="px-3.5 sm:px-6 py-3 sm:py-3.5 bg-[#E9ECEF] hover:bg-slate-200 active:scale-95 rounded-xl flex items-center justify-center gap-1.5 sm:gap-2 transition-colors cursor-pointer text-[#5F6B7A] text-xs sm:text-base font-bold font-manrope shrink-0"
            >
              <ArrowLeft className="w-4 h-4 text-[#5F6B7A]" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={handleProceed}
              disabled={isCheckingOut || isRedirecting}
              className={`flex-1 min-w-0 px-4 sm:px-6 py-3.5 min-h-[48px] active:scale-[0.98] text-white rounded-xl flex items-center justify-center gap-2 sm:gap-3 transition-all shadow-md hover:shadow-lg cursor-pointer text-xs sm:text-base font-bold font-manrope disabled:opacity-75 ${
                isBookingCreationNight || selectedPaymentMethod === "paynow"
                  ? "bg-[#16803C] hover:bg-[#126831]"
                  : "bg-[#071E3B] hover:bg-[#0B2A4A]"
              }`}
            >
              {isCheckingOut ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#C6A45A] shrink-0" />
                  <span>
                    {selectedPaymentMethod === "paynow"
                      ? "Connecting to PayNow..."
                      : "Connecting to Stripe..."}
                  </span>
                </>
              ) : isRedirecting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#C6A45A] shrink-0" />
                  <span>
                    {selectedPaymentMethod === "paynow"
                      ? "Redirecting to PayNow..."
                      : "Redirecting to Stripe..."}
                  </span>
                </>
              ) : isContactSupport ? (
                <>
                  <span>Chat on WhatsApp</span>
                  <WhatsAppIcon className="w-4 h-4 shrink-0" />
                </>
              ) : isBookingCreationNight ? (
                <>
                  <span>Confirm via WhatsApp (UAE Night Dispatch)</span>
                  <WhatsAppIcon className="w-4 h-4 shrink-0" />
                </>
              ) : selectedPaymentMethod === "paynow" ? (
                <>
                  <span>Proceed via PayNow (${totalFare}.00 SGD)</span>
                  <WhatsAppIcon className="w-4 h-4 shrink-0" />
                </>
              ) : (
                <>
                  <span>Proceed to Card Checkout (${totalFare}.00 SGD)</span>
                  <CreditCard className="w-4 h-4 text-[#C6A45A] shrink-0" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Sub Links */}
        <div className="self-stretch flex flex-wrap justify-between items-center gap-2 pt-1">
          <Link
            href="/pricing"
            onClick={closeModal}
            className="flex justify-start items-center gap-1 group transition-colors"
          >
            <span className="text-[#667085] group-hover:text-[#071E3B] text-xs sm:text-sm font-normal font-manrope leading-5">
              View all prices
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-[#667085] group-hover:text-[#071E3B]" />
          </Link>
          <a
            href="https://wa.me/6588006006"
            target="_blank"
            rel="noopener noreferrer"
            className="flex justify-start items-center gap-1.5 group transition-colors"
          >
            <span className="text-[#16803C] group-hover:text-emerald-700 text-xs sm:text-sm font-semibold font-manrope leading-5">
              Book via whatsapp us
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-[#16803C]" />
          </a>
        </div>

        {/* Footer Info Ribbon */}
        <div className="self-stretch pt-2 flex flex-wrap items-center justify-center gap-2 text-xs text-[#071E3B] font-manrope text-center border-t border-slate-100 mt-1">
          <span className="font-normal text-[#5F6B7A]">All-inclusive transparent rates</span>
          <span className="text-[#C6A45A]">·</span>
          <span className="font-normal text-[#5F6B7A]">Fixed Price Guarantee</span>
          <span className="text-[#C6A45A]">·</span>
          <span className="font-semibold text-[#C6A45A]">(+65) 8800 6006</span>
        </div>
      </div>
    </div>
  );
}
