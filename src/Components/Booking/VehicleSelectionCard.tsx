"use client";

import React, { useMemo } from "react";
import { useBookingModal } from "@/context/BookingContext";
import { ArrowLeft, ArrowRight, Check, Users, Luggage, X, Sparkles } from "lucide-react";
import fleetData from "@/data/fleet.json";
import { getRecommendedFleet } from "@/utils/recommendation";
import { resolveSlugFromApiVehicle } from "@/lib/fleetResolver";

interface VehicleSelectionCardProps {
  isModal?: boolean;
}

export default function VehicleSelectionCard({ isModal = true }: VehicleSelectionCardProps) {
  const { bookingData, updateBookingData, setStep, closeModal, vehicles: liveVehicles } = useBookingModal();

  // Find the algorithmic recommendation for this group size
  const recommendedInfo = useMemo(() => {
    return getRecommendedFleet(
      bookingData.passengers,
      bookingData.luggage,
      bookingData.serviceType,
      liveVehicles
    );
  }, [bookingData.passengers, bookingData.luggage, bookingData.serviceType, liveVehicles]);

  // Build the list of selectable vehicles strictly from live API
  const vehicleList = useMemo(() => {
    const isAirport =
      bookingData.serviceType?.toLowerCase().includes("airport") ||
      bookingData.serviceType?.toLowerCase().includes("arrival");
    const isHourly =
      bookingData.serviceType?.toLowerCase().includes("hourly") ||
      bookingData.serviceType?.toLowerCase().includes("charter");

    if (!liveVehicles || liveVehicles.length === 0) {
      return [];
    }

    return liveVehicles
      .filter((v) => v.status !== "inactive" && v.isActive !== false)
      .map((v) => {
        const slug = resolveSlugFromApiVehicle(v);
        const fleetMatch = fleetData.vehicles.find((fv) => fv.slug === slug || fv.id === slug);

        // Determine appropriate fare based on service type
        let fare = 70;
        if (isAirport) {
          fare =
            v.prices?.arrival?.amount ||
            (fleetMatch?.meetAndGreet ? parseInt(fleetMatch.meetAndGreet.replace(/[^0-9]/g, "")) : 80);
        } else if (isHourly) {
          const hourlyRate =
            v.prices?.hourly?.amount ||
            (fleetMatch?.price ? parseInt(fleetMatch.price.replace(/[^0-9]/g, "")) : 65);
          fare = hourlyRate * (bookingData.durationHours || 3);
        } else {
          fare =
            v.prices?.departure_transfer?.amount ||
            v.prices?.arrival?.amount ||
            (fleetMatch?.price ? parseInt(fleetMatch.price.replace(/[^0-9]/g, "")) : 70);
        }

        const paxCount = v.passengerCapacity ?? 7;
        const luggageCount = v.luggageCapacity ?? 4;

        const isRecommended =
          recommendedInfo.selectedFleetSlug === slug ||
          recommendedInfo.vehicleId === v.id;

        const fitsPassengers = paxCount >= bookingData.passengers;
        const fitsLuggage = luggageCount >= bookingData.luggage;
        const fitsGroup = fitsPassengers && fitsLuggage;

        const shortModel = v.vehicleType || fleetMatch?.model || v.name;

        return {
          id: String(v.id),
          numericId: v.id,
          slug,
          name: v.name,
          model: shortModel,
          paxCount,
          luggageCount,
          fare,
          isRecommended,
          fitsGroup,
          fitsPassengers,
        };
      })
      .sort((a, b) => {
        // Prioritize recommended vehicle first
        if (a.isRecommended && !b.isRecommended) return -1;
        if (!a.isRecommended && b.isRecommended) return 1;
        // Then prioritize vehicles that fit group
        if (a.fitsGroup && !b.fitsGroup) return -1;
        if (!a.fitsGroup && b.fitsGroup) return 1;
        // Then sort by passenger capacity
        return a.paxCount - b.paxCount;
      });
  }, [liveVehicles, bookingData.serviceType, bookingData.durationHours, bookingData.passengers, bookingData.luggage, recommendedInfo]);

  // Check if a vehicle is currently selected
  const selectedSlug = bookingData.selectedFleetSlug || "7-seater";

  const handleSelectVehicle = (vehicle: (typeof vehicleList)[0]) => {
    updateBookingData({
      vehicleId: vehicle.numericId,
      selectedFleet: vehicle.name,
      selectedFleetSlug: vehicle.slug,
      baseFare: vehicle.fare,
    });
  };

  const handleContinue = () => {
    setStep(3);
  };

  return (
    <div className="w-full max-w-[562px] mx-auto p-4 sm:p-6 bg-white rounded-2xl border border-slate-200 flex flex-col justify-start items-start gap-4 sm:gap-5 shadow-2xl relative max-h-[92vh] overflow-hidden selection:bg-[#C6A45A] selection:text-[#071E3B]">
      {/* Header Bar */}
      <div className="self-stretch flex justify-between items-start border-b border-slate-100 pb-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#C6A45A] font-manrope">
              Step 2 of 4
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-medium text-[#667085] font-manrope">
              {bookingData.passengers} Pax, {bookingData.luggage} Bags
            </span>
          </div>
          <h2 className="text-[#071E3B] text-xl sm:text-2xl font-bold font-manrope leading-tight">
            Choose Your Vehicle
          </h2>
          <p className="text-xs text-[#667085] font-normal font-manrope">
            Select a vehicle suited for your group. Fixed flat rates with zero surge fees.
          </p>
        </div>

        {isModal && closeModal && (
          <button
            type="button"
            onClick={closeModal}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 -mr-1 -mt-1 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Route & Group Summary Banner */}
      <div className="self-stretch px-3.5 py-2.5 bg-[#F8F7F4] rounded-xl border border-slate-200/80 flex items-center justify-between gap-3 text-xs font-manrope">
        <div className="flex items-center gap-2 min-w-0">
          <span className="px-2 py-0.5 rounded bg-[#071E3B] text-white text-[10px] font-bold uppercase tracking-wider shrink-0">
            {bookingData.serviceType || "Point-to-Point"}
          </span>
          <span className="text-[#071E3B] font-semibold truncate">
            {bookingData.pickup?.split(",")[0] || "Pick-up"} → {bookingData.dropoff?.split(",")[0] || "Drop-off"}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setStep(1)}
          className="text-[#C6A45A] hover:text-[#B58E45] font-bold text-xs shrink-0 underline cursor-pointer"
        >
          Edit Trip
        </button>
      </div>

      {/* Vehicle Options List (Scrollable) */}
      <div className="self-stretch flex flex-col gap-2.5 overflow-y-auto max-h-[46vh] sm:max-h-[50vh] pr-1 py-1">
        {vehicleList.length === 0 ? (
          <div className="flex flex-col gap-2.5 py-1">
            <div className="h-16 bg-slate-100 rounded-xl animate-pulse" />
            <div className="h-16 bg-slate-100 rounded-xl animate-pulse" />
            <div className="h-16 bg-slate-100 rounded-xl animate-pulse" />
          </div>
        ) : (
          vehicleList.map((v) => {
          const isSelected = selectedSlug === v.slug;

          return (
            <div
              key={v.id}
              onClick={() => handleSelectVehicle(v)}
              className={`p-3.5 sm:p-4 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-3 border ${
                isSelected
                  ? "border-[#C6A45A] bg-[#FDFBF7] shadow-sm ring-1 ring-[#C6A45A]"
                  : "border-slate-200 bg-white hover:border-[#C6A45A]/60 hover:bg-[#FAF9F5]"
              }`}
            >
              {/* Radio Indicator & Vehicle Info */}
              <div className="flex items-start gap-3 min-w-0 flex-1">
                {/* Radio Button */}
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                    isSelected
                      ? "border-[#C6A45A] bg-[#C6A45A] text-white shadow-xs"
                      : "border-slate-300 bg-white"
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                </div>

                {/* Details */}
                <div className="flex flex-col min-w-0 flex-1 gap-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-sm sm:text-base text-[#071E3B] font-manrope leading-tight">
                      {v.name}
                    </h3>

                    {/* Recommendation / Fit Badges */}
                    {v.isRecommended ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#C6A45A] text-[#071E3B] text-[10px] font-extrabold uppercase tracking-wide">
                        <Sparkles className="w-2.5 h-2.5 fill-current" />
                        <span>Recommended</span>
                      </span>
                    ) : v.fitsGroup ? (
                      <span className="px-2 py-0.5 rounded-md bg-[#E8F8EE] text-[#16803C] text-[10px] font-bold">
                        Fits Group
                      </span>
                    ) : !v.fitsPassengers ? (
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-medium">
                        Max {v.paxCount} Pax
                      </span>
                    ) : null}
                  </div>

                  <p className="text-xs text-[#667085] font-manrope line-clamp-1">
                    {v.model}
                  </p>

                  {/* Capacity Badges */}
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#F7F5EF] text-[#071E3B] font-bold text-[11px] font-manrope border border-[#E9ECEF]">
                      <Users className="w-3 h-3 text-[#C6A45A]" />
                      <span>{v.paxCount} Pax</span>
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#F7F5EF] text-[#071E3B] font-bold text-[11px] font-manrope border border-[#E9ECEF]">
                      <Luggage className="w-3 h-3 text-[#C6A45A]" />
                      <span>
                        {v.luggageCount}{" "}
                        <span className="hidden sm:inline">Luggage</span>
                        <span className="sm:hidden">Lug</span>
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Price & Select Label */}
              <div className="flex flex-col items-end shrink-0 pl-2">
                <span className="text-base sm:text-lg font-extrabold text-[#071E3B] font-manrope leading-none">
                  ${v.fare}
                </span>
                <span className="text-[10px] text-[#667085] font-medium font-manrope mt-0.5">
                  Fixed Fare
                </span>
              </div>
            </div>
          );
        })
      )}
      </div>

      {/* Actions Footer */}
      <div className="self-stretch flex items-center justify-between gap-2.5 sm:gap-3 pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="px-3.5 sm:px-6 py-3 rounded-lg border border-slate-200 hover:bg-slate-50 active:scale-98 text-xs sm:text-sm font-bold text-[#5F6B7A] font-manrope transition-all flex items-center gap-1.5 sm:gap-2 shrink-0 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={handleContinue}
          className="flex-1 min-w-0 px-3 sm:px-6 py-3 rounded-lg bg-[#071E3B] hover:bg-[#0B2A4A] active:scale-98 text-white text-xs sm:text-sm font-bold font-manrope transition-all shadow-md flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer whitespace-nowrap"
        >
          <span>
            <span className="inline sm:hidden">Passenger Details</span>
            <span className="hidden sm:inline">Continue to Passenger Details</span>
          </span>
          <ArrowRight className="w-4 h-4 stroke-[2.5] shrink-0" />
        </button>
      </div>
    </div>
  );
}
