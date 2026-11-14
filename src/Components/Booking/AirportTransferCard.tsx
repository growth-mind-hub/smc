"use client";

import React, { useState } from "react";
import { useBookingModal } from "@/context/BookingContext";
import { ArrowRight, ChevronDown, Info, X } from "lucide-react";
import fleetData from "@/data/fleet.json";
import LocationAutocompleteInput from "./LocationAutocompleteInput";
import { getRecommendedFleet } from "@/utils/recommendation";
import { getVehicleFareForBooking } from "@/utils/serviceResolver";
import { resolveSlugFromApiVehicle } from "@/lib/fleetResolver";

interface AirportTransferCardProps {
  isModal?: boolean;
}

export default function AirportTransferCard({ isModal = true }: AirportTransferCardProps) {
  const { bookingData, updateBookingData, setStep, closeModal, vehicles, services, addOns } = useBookingModal();
  const [showTooltip, setShowTooltip] = useState(false);

  // Dynamic meet & greet add-on rate from live API
  const meetGreetAddOn = addOns?.find(
    (a) => a.code === "MEET_GREET" || a.name.toLowerCase().includes("meet")
  );
  const meetGreetPrice = meetGreetAddOn?.price ?? 20;

  // Derive fleet options from live API vehicles with fallback to fleet.json
  const fleetOptions =
    vehicles && vehicles.length > 0
      ? vehicles.map((v) => {
          const slug = resolveSlugFromApiVehicle(v);
          const fare = getVehicleFareForBooking(v, bookingData, services);
          return {
            id: String(v.id),
            numericId: v.id,
            slug,
            name: v.name,
            model: v.description || v.vehicleType || "Executive Maxi Cab",
            fare,
          };
        })
      : fleetData.vehicles.map((v) => ({
          id: v.id,
          numericId:
            v.id === "6-seater"
              ? 1
              : v.id === "7-seater"
              ? 3
              : v.id === "9-seater"
              ? 12
              : 6,
          slug: v.slug || v.id,
          name: v.name,
          model: v.model,
          fare: getVehicleFareForBooking({ slug: v.slug, passengerCapacity: v.paxCount }, bookingData, services),
        }));

  const handlePaxChange = (newPax: number) => {
    const val = Math.max(1, Math.min(13, newPax));
    const rec = getRecommendedFleet(val, bookingData.luggage, bookingData, vehicles);
    updateBookingData({
      passengers: val,
      ...rec,
    });
  };

  const handleLuggageChange = (newLug: number) => {
    const val = Math.max(0, Math.min(15, newLug));
    const rec = getRecommendedFleet(bookingData.passengers, val, bookingData, vehicles);
    updateBookingData({
      luggage: val,
      ...rec,
    });
  };

  const handleFleetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = fleetOptions.find(
      (v) => v.id === e.target.value || v.slug === e.target.value
    );
    if (selected) {
      updateBookingData({
        vehicleId: selected.numericId,
        selectedFleet: selected.name,
        selectedFleetSlug: selected.slug,
        baseFare: selected.fare,
      });
    }
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    updateBookingData({
      serviceType: "Airport Transfer",
    });
    setStep(2);
  };

  return (
    <div className="w-full max-w-[620px] mx-auto p-5 sm:p-9 bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xl flex flex-col justify-start items-start gap-4 sm:gap-5 relative max-h-[92vh] overflow-y-auto">
      {/* Close button if in modal */}
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

      {/* Header */}
      <div className="self-stretch flex flex-col justify-start items-start pr-8 sm:pr-0">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#C6A45A] font-manrope">
            Step 1 of 4
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-xs font-medium text-[#667085] font-manrope">
            Airport Transfer
          </span>
        </div>
        <div className="self-stretch pt-1 flex flex-col justify-start items-start">
          <div className="text-left text-[#071E3B] text-base sm:text-lg font-bold font-manrope uppercase leading-6 tracking-wide">
            FIXED ALL-INCLUSIVE FARE
          </div>
        </div>
      </div>

      <form onSubmit={handleContinue} className="self-stretch flex flex-col justify-start items-start gap-4">
        {/* Airport Meet & Greet Toggle (+$20) */}
        <div
          onClick={() => updateBookingData({ meetAndGreet: !bookingData.meetAndGreet })}
          className="self-stretch p-3 sm:px-4 sm:py-3 bg-[#F8F7F4] rounded-xl border border-slate-200/80 flex justify-between items-center cursor-pointer hover:border-[#C6A45A] active:scale-[0.99] transition-all select-none"
        >
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div
              className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                bookingData.meetAndGreet ? "bg-[#C6A45A] text-white" : "border border-[#7A8593] bg-white"
              }`}
            >
              {bookingData.meetAndGreet && (
                <svg className="w-3 h-2.5 text-white" viewBox="0 0 10 8" fill="none">
                  <path d="M1.5 4L3.8 6.5L8.5 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[#071E3B] text-sm sm:text-base font-semibold font-manrope leading-6">
                Airport Meet &amp; Greet
              </span>
              <div
                className="relative inline-flex items-center text-[#667085] hover:text-[#071E3B]"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTooltip(!showTooltip);
                }}
              >
                <Info className="w-3.5 h-3.5" />
                {showTooltip && (
                  <div className="absolute left-0 bottom-full mb-1.5 w-60 p-2.5 bg-[#071E3B] text-white text-xs rounded-lg shadow-xl z-30 font-normal leading-relaxed">
                    Personalized chauffeur holding your name banner at Arrival Hall with 60-min flight buffer.
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="px-2 py-0.5 rounded bg-[#FEF3C7] text-[#92400E] text-sm sm:text-base font-bold font-manrope leading-6">
            +${meetGreetPrice}
          </div>
        </div>

        {/* Pickup Location */}
        <LocationAutocompleteInput
          label="Pickup Location"
          placeholder="e.g. Singapore Changi Airport (T1-T4 / TBA)"
          value={bookingData.pickup}
          onChange={(val) => {
            const lower = val.toLowerCase();
            let detectedTerminal: string | undefined;
            if (lower.includes("terminal 1") || lower.includes("t1")) detectedTerminal = "Terminal 1";
            else if (lower.includes("terminal 2") || lower.includes("t2")) detectedTerminal = "Terminal 2";
            else if (lower.includes("terminal 3") || lower.includes("t3")) detectedTerminal = "Terminal 3";
            else if (lower.includes("terminal 4") || lower.includes("t4")) detectedTerminal = "Terminal 4";
            else if (lower.includes("tba") || lower.includes("to be advised")) detectedTerminal = "Terminal (TBA)";
            updateBookingData({ pickup: val, ...(detectedTerminal ? { terminal: detectedTerminal } : {}) });
          }}
          onSelect={(val) => {
            const lower = val.toLowerCase();
            let detectedTerminal: string | undefined;
            if (lower.includes("terminal 1") || lower.includes("t1")) detectedTerminal = "Terminal 1";
            else if (lower.includes("terminal 2") || lower.includes("t2")) detectedTerminal = "Terminal 2";
            else if (lower.includes("terminal 3") || lower.includes("t3")) detectedTerminal = "Terminal 3";
            else if (lower.includes("terminal 4") || lower.includes("t4")) detectedTerminal = "Terminal 4";
            else if (lower.includes("tba") || lower.includes("to be advised")) detectedTerminal = "Terminal (TBA)";
            updateBookingData({ pickup: val, ...(detectedTerminal ? { terminal: detectedTerminal } : {}) });
          }}
          required
        />

        {/* Dropoff Location */}
        <LocationAutocompleteInput
          label="Dropoff Location"
          placeholder="e.g. Marina Bay Sands Hotel / Orchard Rd"
          value={bookingData.dropoff}
          onChange={(val) => updateBookingData({ dropoff: val })}
          required
        />

        {/* Steppers: Passengers & Luggage */}
        <div className="self-stretch grid grid-cols-2 gap-3 sm:gap-8 items-start">
          {/* Passengers */}
          <div className="px-2.5 sm:px-3 py-2 sm:py-2.5 bg-[#F8F7F4] rounded-lg border border-slate-200/90 flex justify-between items-center">
            <span className="text-[#5F6B7A] text-xs font-semibold font-manrope leading-4">
              Pax
            </span>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => handlePaxChange(bookingData.passengers - 1)}
                className="w-6 h-6 bg-white rounded-sm shadow-[0px_0px_0px_1px_rgba(0,0,0,0.09)] flex justify-center items-center text-[#5F6B7A] text-xs font-bold font-manrope hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
                aria-label="Decrease passengers"
              >
                -
              </button>
              <span className="w-4 text-center text-xs font-medium font-manrope text-[#071E3B]">
                {bookingData.passengers}
              </span>
              <button
                type="button"
                onClick={() => handlePaxChange(bookingData.passengers + 1)}
                className="w-6 h-6 bg-white rounded-sm shadow-[0px_0px_0px_1px_rgba(0,0,0,0.09)] flex justify-center items-center text-[#5F6B7A] text-xs font-bold font-manrope hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
                aria-label="Increase passengers"
              >
                +
              </button>
            </div>
          </div>

          {/* Luggage */}
          <div className="px-3 py-2 sm:py-2.5 bg-[#F8F7F4] rounded-lg border border-slate-200/90 flex justify-between items-center gap-2">
            <span className="text-[#5F6B7A] text-xs font-semibold font-manrope leading-4 shrink-0 pr-1">
              Luggage
            </span>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => handleLuggageChange(bookingData.luggage - 1)}
                className="w-6 h-6 bg-white rounded-sm shadow-[0px_0px_0px_1px_rgba(0,0,0,0.09)] flex justify-center items-center text-[#5F6B7A] text-xs font-bold font-manrope hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
                aria-label="Decrease luggage"
              >
                -
              </button>
              <span className="w-4 text-center text-xs font-medium font-manrope text-[#071E3B]">
                {bookingData.luggage}
              </span>
              <button
                type="button"
                onClick={() => handleLuggageChange(bookingData.luggage + 1)}
                className="w-6 h-6 bg-white rounded-sm shadow-[0px_0px_0px_1px_rgba(0,0,0,0.09)] flex justify-center items-center text-[#5F6B7A] text-xs font-bold font-manrope hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
                aria-label="Increase luggage"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Next Step Preview */}
        <div className="self-stretch px-3.5 py-2.5 bg-[#F8F7F4] rounded-lg border border-slate-200/90 flex justify-between items-center text-xs font-manrope">
          <div className="flex items-center gap-2">
            <span className="text-[#C6A45A] font-bold">Next Step:</span>
            <span className="text-[#071E3B] font-medium">Choose vehicle to suit your group</span>
          </div>
          <span className="text-[#071E3B] font-bold text-sm">From ${bookingData.baseFare || 70}</span>
        </div>

        {/* Disclaimer & Choose Vehicle Button */}
        <div className="self-stretch flex flex-col justify-start items-start gap-2 pt-1">
          <div className="self-stretch rounded-sm text-center text-[#667085] text-xs font-normal font-manrope leading-4">
            Singapore trips only — cross-border rides to Malaysia not available.
          </div>
          <button
            type="submit"
            className="self-stretch px-8 py-3.5 bg-[#071E3B] hover:bg-[#0B2A4A] active:scale-[0.98] text-white rounded-lg flex justify-center items-center gap-3 font-semibold font-manrope text-base leading-6 transition-all shadow-md hover:shadow-lg cursor-pointer group"
          >
            <span>Choose Vehicle</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5] group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Footer Info Bar */}
        <div className="self-stretch pt-2 flex flex-wrap items-center justify-center gap-2 text-xs text-[#071E3B] font-manrope text-center border-t border-slate-100">
          <span className="font-normal">All-inclusive transparent rates</span>
          <span>·</span>
          <span className="font-normal">Fixed Price Guarantee</span>
          <span>·</span>
          <span className="font-semibold text-[#C6A45A]">(+65) 8800 6006</span>
        </div>
      </form>
    </div>
  );
}
