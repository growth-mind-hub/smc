"use client";

import React, { useState } from "react";
import { useBookingModal } from "@/context/BookingContext";
import LocationAutocompleteInput from "./LocationAutocompleteInput";
import fleetData from "@/data/fleet.json";
import { ChevronDown, ArrowRight, X } from "lucide-react";
import { getRecommendedFleet } from "@/utils/recommendation";
import { getVehicleFareForBooking } from "@/utils/serviceResolver";
import { resolveSlugFromApiVehicle } from "@/lib/fleetResolver";

interface CityTourCardProps {
  isModal?: boolean;
}

export default function CityTourCard({ isModal = true }: CityTourCardProps) {
  const { bookingData, updateBookingData, setStep, closeModal, vehicles, services } = useBookingModal();

  const [tourDays, setTourDays] = useState(2);
  const dayPills = [2, 3, 5, 7, 10];

  // Derive fleet options from live API or fallback to fleet.json
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

  // Automatic recommendation based on pax and bags
  const calculateRecommendation = (p: number, l: number) => {
    const rec = getRecommendedFleet(p, l, bookingData, vehicles);
    return {
      slug: rec.selectedFleetSlug,
      name: rec.selectedFleet,
      fare: rec.baseFare,
      vId: rec.vehicleId,
    };
  };

  const handlePaxChange = (delta: number) => {
    const currentPax = bookingData.passengers ?? 1;
    const newPax = Math.max(1, Math.min(13, currentPax + delta));
    const currentLug = bookingData.luggage ?? 0;
    const rec = calculateRecommendation(newPax, currentLug);

    updateBookingData({
      passengers: newPax,
      selectedFleet: rec.name,
      selectedFleetSlug: rec.slug,
      vehicleId: rec.vId,
      baseFare: rec.fare,
    });
  };

  const handleLuggageChange = (delta: number) => {
    const currentLug = bookingData.luggage ?? 0;
    const newLug = Math.max(0, Math.min(15, currentLug + delta));
    const currentPax = bookingData.passengers ?? 1;
    const rec = calculateRecommendation(currentPax, newLug);

    updateBookingData({
      luggage: newLug,
      selectedFleet: rec.name,
      selectedFleetSlug: rec.slug,
      vehicleId: rec.vId,
      baseFare: rec.fare,
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

  const handleDaysChange = (newDays: number) => {
    const validDays = Math.max(1, Math.min(30, newDays));
    setTourDays(validDays);
    updateBookingData({
      durationHours: validDays * 10,
    });
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    updateBookingData({
      serviceType: "City Tour",
      durationHours: tourDays * 10,
      dropoff: "Singapore Island Tour (Free & Easy)",
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
      <div className="self-stretch flex flex-col justify-start items-start gap-1 pr-8 sm:pr-0">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#C6A45A] font-manrope">
            Step 1 of 4
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-xs font-medium text-[#667085] font-manrope">
            City Tour
          </span>
        </div>
        <h2 className="text-[#071E3B] text-base sm:text-lg font-bold font-manrope uppercase leading-6 tracking-wide">
          FIXED ALL-INCLUSIVE FARE
        </h2>
      </div>

      <form onSubmit={handleContinue} className="self-stretch flex flex-col justify-start items-start gap-4">
        {/* Pickup Location */}
        <LocationAutocompleteInput
          label="Pickup Location"
          value={bookingData.pickup}
          onChange={(val) => updateBookingData({ pickup: val })}
          placeholder="e.g. Singapore Changi Airport (T1-T4) or Hotel"
          required
          className="w-full"
        />

        {/* Number of days */}
        <div className="self-stretch flex flex-col justify-start items-start gap-2">
          <div className="self-stretch flex items-center justify-between">
            <span className="text-[#071E3B] text-xs sm:text-sm font-medium font-inter leading-5">
              Number of days
            </span>
            <div className="px-3 py-1 bg-[#FBF7EC] rounded-md border border-[#C6A45A] flex items-center">
              <span className="text-[#B58E45] text-xs font-bold font-manrope leading-4">
                10% OFF — EVERY TOUR
              </span>
            </div>
          </div>

          {/* Quick Days Pills */}
          <div className="self-stretch flex items-center gap-2">
            {dayPills.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => handleDaysChange(d)}
                className={`flex-1 py-2 rounded-lg border text-xs font-semibold font-manrope transition-all cursor-pointer ${
                  tourDays === d
                    ? "bg-[#C6A45A] text-white border-[#C6A45A] shadow-xs"
                    : "bg-white text-[#5F6B7A] border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {d}d
              </button>
            ))}
          </div>

          {/* Days Stepper */}
          <div className="self-stretch px-3 py-2 bg-[#F8F7F4] rounded-lg border border-slate-200/90 flex justify-between items-center">
            <span className="text-[#5F6B7A] text-xs font-semibold font-manrope leading-4">
              Days
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleDaysChange(tourDays - 1)}
                className="w-6 h-6 bg-white rounded-sm shadow-[0px_0px_0px_1px_rgba(0,0,0,0.09)] flex justify-center items-center text-[#5F6B7A] text-xs font-bold font-manrope hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
                aria-label="Decrease days"
              >
                -
              </button>
              <span className="w-6 text-center text-xs font-medium font-manrope text-[#071E3B]">
                {tourDays}
              </span>
              <button
                type="button"
                onClick={() => handleDaysChange(tourDays + 1)}
                className="w-6 h-6 bg-white rounded-sm shadow-[0px_0px_0px_1px_rgba(0,0,0,0.09)] flex justify-center items-center text-[#5F6B7A] text-xs font-bold font-manrope hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
                aria-label="Increase days"
              >
                +
              </button>
            </div>
          </div>

          <p className="text-[#98A2B3] text-xs font-normal font-manrope leading-5">
            Free &amp; easy — no fixed itinerary or tour guide. Your driver is on call for 10 hours each day; where you go and when is entirely up to you. Schedule and stops can be discussed with your driver directly.
          </p>
        </div>

        {/* Passengers & Luggage Steppers */}
        <div className="self-stretch grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 items-center">
          {/* Passengers */}
          <div className="px-2.5 sm:px-3 py-2 sm:py-2.5 bg-[#F8F7F4] rounded-lg border border-slate-200/90 flex justify-between items-center">
            <span className="text-[#5F6B7A] text-xs font-semibold font-manrope leading-4">
              Pax
            </span>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => handlePaxChange(-1)}
                className="w-6 h-6 bg-white rounded-sm shadow-[0px_0px_0px_1px_rgba(0,0,0,0.09)] flex justify-center items-center text-[#5F6B7A] text-xs font-bold font-manrope hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
                aria-label="Decrease passengers"
              >
                -
              </button>
              <span className="w-4 text-center text-xs font-medium font-manrope text-[#071E3B]">
                {bookingData.passengers ?? 1}
              </span>
              <button
                type="button"
                onClick={() => handlePaxChange(1)}
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
                onClick={() => handleLuggageChange(-1)}
                className="w-6 h-6 bg-white rounded-sm shadow-[0px_0px_0px_1px_rgba(0,0,0,0.09)] flex justify-center items-center text-[#5F6B7A] text-xs font-bold font-manrope hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
                aria-label="Decrease luggage"
              >
                -
              </button>
              <span className="w-4 text-center text-xs font-medium font-manrope text-[#071E3B]">
                {bookingData.luggage ?? 0}
              </span>
              <button
                type="button"
                onClick={() => handleLuggageChange(1)}
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
          <span className="text-[#071E3B] font-bold text-sm">From ${bookingData.baseFare || 80}</span>
        </div>

        {/* Booking Notice & CTA */}
        <div className="self-stretch flex flex-col justify-start items-start gap-2 pt-1">
          <div className="self-stretch flex justify-center items-center text-center">
            <span className="text-[#98A2B3] text-xs font-normal font-manrope leading-4">
              Singapore trips only — cross-border rides to Malaysia not available.
            </span>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-8 bg-[#071E3B] hover:bg-[#0B2A4A] active:scale-[0.98] text-white rounded-lg flex justify-center items-center gap-4 transition-all shadow-md cursor-pointer"
          >
            <span className="text-center text-white text-base font-semibold font-manrope leading-6">
              Choose Vehicle
            </span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Value Props Footer */}
        <div className="self-stretch pt-2 flex flex-col justify-center items-center border-t border-slate-100">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs text-[#071E3B] font-manrope">
            <span>All-inclusive transparent rates</span>
            <span className="text-[#C6A45A] font-bold">·</span>
            <span>Fixed Price Guarantee</span>
            <span className="text-[#C6A45A] font-bold">·</span>
            <span className="font-semibold">(+65) 8800 6006</span>
          </div>
        </div>
      </form>
    </div>
  );
}
