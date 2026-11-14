"use client";

import React from "react";
import heroData from "@/data/hero.json";
import fleetData from "@/data/fleet.json";
import { ArrowRight, Check, ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useBookingModal } from "@/context/BookingContext";
import LocationAutocompleteInput from "@/Components/Booking/LocationAutocompleteInput";
import { getRecommendedFleet } from "@/utils/recommendation";
import { getVehicleFareForBooking } from "@/utils/serviceResolver";
import { resolveSlugFromApiVehicle } from "@/lib/fleetResolver";

export default function BookingCard() {
  const { bookingData, updateBookingData, openModal, vehicles, services } = useBookingModal();

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    openModal({
      initialStep: 2,
      pickup: bookingData.pickup,
      dropoff: bookingData.dropoff,
      selectedFleet: bookingData.selectedFleet,
      selectedFleetSlug: bookingData.selectedFleetSlug,
      baseFare: bookingData.baseFare,
      vehicleId: bookingData.vehicleId,
      durationHours: bookingData.durationHours,
    });
  };

  return (
    <div className="w-full max-w-[520px] p-4 sm:p-7 bg-white/15 rounded-2xl shadow-2xl border border-white/20 backdrop-blur-xl flex flex-col gap-4 sm:gap-5 text-white">
      {/* Eyebrow & Title */}
      <div className="flex flex-col">
        <span className="text-white/80 text-[11px] sm:text-xs font-bold font-manrope uppercase tracking-wider">
          {heroData.bookingForm.eyebrow}
        </span>
        <h3 className="text-white text-lg sm:text-xl font-bold font-manrope leading-6 sm:leading-7 pt-0.5">
          {heroData.bookingForm.title}
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 sm:gap-4">
        {/* Pickup Location */}
        <LocationAutocompleteInput
          label="Pickup Location"
          placeholder={heroData.bookingForm.pickupPlaceholder}
          value={bookingData.pickup}
          onChange={(val) => updateBookingData({ pickup: val })}
          theme="glassDark"
          required
        />

        {/* Dropoff Location */}
        <LocationAutocompleteInput
          label="Dropoff Location"
          placeholder={heroData.bookingForm.dropoffPlaceholder}
          value={bookingData.dropoff}
          onChange={(val) => updateBookingData({ dropoff: val })}
          theme="glassDark"
          required
        />

        {/* Passengers & Luggage Steppers */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          {/* Passengers */}
          <div className="px-3 py-2 sm:py-2.5 bg-white rounded-xl flex items-center justify-between shadow-sm">
            <span className="text-[#5F6B7A] text-[11px] sm:text-xs font-bold font-manrope uppercase tracking-tight">
              Pax
            </span>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => handlePaxChange(bookingData.passengers - 1)}
                className="w-7 h-7 sm:w-8 sm:h-8 bg-[#F8F7F4] hover:bg-slate-200 active:bg-slate-300 rounded-lg flex items-center justify-center text-[#071E3B] text-base font-bold font-manrope transition-colors cursor-pointer"
                aria-label="Decrease passengers"
              >
                −
              </button>
              <span className="w-5 text-center text-xs sm:text-sm font-bold font-manrope text-[#071E3B]">
                {bookingData.passengers}
              </span>
              <button
                type="button"
                onClick={() => handlePaxChange(bookingData.passengers + 1)}
                className="w-7 h-7 sm:w-8 sm:h-8 bg-[#F8F7F4] hover:bg-slate-200 active:bg-slate-300 rounded-lg flex items-center justify-center text-[#071E3B] text-base font-bold font-manrope transition-colors cursor-pointer"
                aria-label="Increase passengers"
              >
                +
              </button>
            </div>
          </div>

          {/* Luggage */}
          <div className="px-3 sm:px-3.5 py-2 sm:py-2.5 bg-white rounded-xl flex items-center justify-between gap-2 sm:gap-3 shadow-sm">
            <span className="text-[#5F6B7A] text-[11px] sm:text-xs font-bold font-manrope uppercase tracking-tight shrink-0 pr-1.5 sm:pr-2">
              Luggage
            </span>
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => handleLuggageChange(bookingData.luggage - 1)}
                className="w-7 h-7 sm:w-8 sm:h-8 bg-[#F8F7F4] hover:bg-slate-200 active:bg-slate-300 rounded-lg flex items-center justify-center text-[#071E3B] text-base font-bold font-manrope transition-colors cursor-pointer"
                aria-label="Decrease luggage"
              >
                −
              </button>
              <span className="w-5 text-center text-xs sm:text-sm font-bold font-manrope text-[#071E3B]">
                {bookingData.luggage}
              </span>
              <button
                type="button"
                onClick={() => handleLuggageChange(bookingData.luggage + 1)}
                className="w-7 h-7 sm:w-8 sm:h-8 bg-[#F8F7F4] hover:bg-slate-200 active:bg-slate-300 rounded-lg flex items-center justify-center text-[#071E3B] text-base font-bold font-manrope transition-colors cursor-pointer"
                aria-label="Increase luggage"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Meet & Greet Checkbox */}
        <label className="flex items-center gap-2.5 cursor-pointer select-none py-0.5">
          <input
            type="checkbox"
            checked={bookingData.meetAndGreet}
            onChange={(e) =>
              updateBookingData({ meetAndGreet: e.target.checked })
            }
            className="sr-only"
          />
          <div
            className={`w-4 h-4 rounded-md flex items-center justify-center transition-colors ${
              bookingData.meetAndGreet ? "bg-[#C6A45A]" : "bg-white/40 border border-white"
            }`}
          >
            {bookingData.meetAndGreet && (
              <Check className="w-3 h-3 text-[#071E3B] stroke-[3.5]" />
            )}
          </div>
          <span className="text-white text-xs font-medium font-manrope leading-5">
            {heroData.bookingForm.meetAndGreetLabel}
          </span>
        </label>

        {/* Next Step: Vehicle Preview */}
        <div className="flex items-center justify-between px-3.5 py-2.5 bg-white/10 rounded-xl border border-white/15 text-xs font-manrope">
          <div className="flex items-center gap-2">
            <span className="text-[#C6A45A] font-bold">Recommended:</span>
            <span className="text-white font-medium">{bookingData.selectedFleet || "7 Seater Maxi Cab"}</span>
          </div>
          <span className="text-white font-bold text-sm">From ${bookingData.baseFare || 80}</span>
        </div>

        {/* Singapore Disclaimer */}
        <p className="text-white/85 text-[11px] sm:text-xs font-normal font-manrope leading-4 text-center">
          {heroData.bookingForm.disclaimer}
        </p>

        {/* Choose Vehicle Button */}
        <button
          type="submit"
          className="w-full py-3.5 bg-[#071E3B] hover:bg-[#0B2A4A] active:scale-98 rounded-xl flex justify-center items-center gap-2.5 text-white text-sm sm:text-base font-bold font-manrope transition-all shadow-md cursor-pointer hover:shadow-lg border border-white/10"
        >
          <span>Choose Vehicle</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Footer Sub-links */}
        <div className="flex items-center justify-between pt-1">
          <Link
            href="/pricing"
            className="text-white/80 hover:text-white text-xs font-medium font-manrope leading-5 flex items-center gap-1 transition-colors"
          >
            <span>{heroData.bookingForm.viewPricesLabel}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
          <a
            href="https://wa.me/6588006006"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#C6A45A] hover:text-amber-300 text-xs font-bold font-manrope leading-5 flex items-center gap-1 transition-colors"
          >
            <span>{heroData.bookingForm.whatsappLabel}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Footer Info Ribbon */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-[11px] text-white/80 font-manrope text-center border-t border-white/10">
          <span>All-inclusive transparent rates</span>
          <span className="text-[#C6A45A]">·</span>
          <span>Fixed Price Guarantee</span>
          <span className="text-[#C6A45A]">·</span>
          <span className="font-semibold text-[#C6A45A]">(+65) 8800 6006</span>
        </div>
      </form>
    </div>
  );
}


