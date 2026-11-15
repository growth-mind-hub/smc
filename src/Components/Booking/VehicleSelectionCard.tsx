"use client";

import React, { useMemo, useEffect, useState } from "react";
import Image from "next/image";
import { useBookingModal } from "@/context/BookingContext";
import { ArrowLeft, ArrowRight, Check, Users, Luggage, X, Info } from "lucide-react";
import fleetData from "@/data/fleet.json";
import { getRecommendedFleet, checkVehicleCapacityFit } from "@/utils/recommendation";
import { resolveSlugFromApiVehicle, getVehicleImage } from "@/lib/fleetResolver";
import { getVehicleFareForBooking } from "@/utils/serviceResolver";

interface VehicleSelectionCardProps {
  isModal?: boolean;
}

// Subcomponent for robust vehicle image rendering with error fallback & direct loading
function VehicleShowcaseImage({
  src,
  alt,
  priority = false,
}: {
  src: string;
  alt: string;
  priority?: boolean;
}) {
  const [imgSrc, setImgSrc] = useState(src);

  useEffect(() => {
    setImgSrc(src);
  }, [src]);

  return (
    <Image
      src={imgSrc || "/images/Cab.png"}
      alt={alt}
      fill
      unoptimized
      sizes="(max-width: 640px) 100vw, 600px"
      className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
      priority={priority}
      onError={() => {
        if (imgSrc !== "/images/Cab.png") {
          setImgSrc("/images/Cab.png");
        }
      }}
    />
  );
}

export default function VehicleSelectionCard({ isModal = true }: VehicleSelectionCardProps) {
  const { bookingData, updateBookingData, setStep, closeModal, vehicles: liveVehicles, services } = useBookingModal();
  const [infoVehicleId, setInfoVehicleId] = useState<string | null>(null);

  const isHourly = (bookingData.serviceType || "").toLowerCase().includes("hour");

  // Find the algorithmic recommendation for this group size
  const recommendedInfo = useMemo(() => {
    return getRecommendedFleet(
      bookingData.passengers,
      bookingData.luggage,
      bookingData,
      liveVehicles
    );
  }, [bookingData.passengers, bookingData.luggage, bookingData, liveVehicles]);

  // Build the list of selectable vehicles strictly matching backend API catalog pricing
  const vehicleList = useMemo(() => {
    const sourceVehicles =
      liveVehicles && liveVehicles.length > 0
        ? liveVehicles.filter((v) => v.status !== "inactive" && v.isActive !== false)
        : fleetData.vehicles.map((fv) => ({
            id: fv.id === "6-seater" ? 1 : fv.id === "7-seater" ? 3 : fv.id === "9-seater" ? 12 : 6,
            name: fv.name,
            vehicleType: fv.model,
            passengerCapacity: fv.paxCount,
            luggageCapacity: fv.luggageCount,
            imageUrl: (fv as any).imageUrl || (fv as any).image,
            image: (fv as any).image,
            status: "active" as const,
            isActive: true,
            prices: {
              departure_transfer: { amount: parseInt(fv.pointToPoint.replace(/[^0-9]/g, "")) || 70 },
              arrival: { amount: parseInt(fv.meetAndGreet.replace(/[^0-9]/g, "")) || 80 },
              hourly: { amount: 60, threeHourAmount: 180, eightHourAmount: 480 },
            },
          }));

    return sourceVehicles
      .map((v) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const slug = resolveSlugFromApiVehicle(v as any);
        const fleetMatch = fleetData.vehicles.find((fv) => fv.slug === slug || fv.id === slug);

        // Determine appropriate fare based on service type and route
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const fare = getVehicleFareForBooking(v as any, bookingData, services);

        const fitInfo = checkVehicleCapacityFit(
          slug,
          bookingData.passengers,
          bookingData.luggage,
          bookingData.wheelchairAccessible
        );

        const isRecommended =
          recommendedInfo.selectedFleetSlug === slug ||
          recommendedInfo.vehicleId === v.id;

        const fitsGroup = fitInfo.fits;
        const fitsPassengers = fitInfo.maxPax >= bookingData.passengers;

        let shortModel = v.vehicleType || fleetMatch?.model || v.name;
        if (slug.includes("alphard") || v.name.toLowerCase().includes("alphard") || slug === "6-seater") {
          shortModel = "Premium Executive MPV";
        } else if (slug.includes("viano") || slug.includes("vito") || v.name.toLowerCase().includes("viano")) {
          shortModel = "7/9 Seater Luxury Transporter";
        } else if (slug.includes("v-class")) {
          shortModel = "Mercedes V-Class / Luxury MPV";
        } else if (slug.includes("hiace") || slug.includes("13-seater")) {
          shortModel = "Toyota HiAce Commuter / 13 Seater";
        } else if (slug.includes("e-class")) {
          shortModel = "Executive Limousine Sedan";
        } else if (slug.includes("s-class")) {
          shortModel = "VIP Flagship Limousine";
        } else if (slug.includes("coach") || slug.includes("40-seater")) {
          shortModel = "40 Seater Luxury Coach";
        } else if (slug.includes("23-seater")) {
          shortModel = "23 Seater Mini Coach";
        } else if (slug.includes("wheelchair")) {
          shortModel = "Wheelchair Accessible Cab";
        }

        const resolvedImage = getVehicleImage(v as any, fleetMatch?.image || "/images/Cab.png");

        return {
          id: String(v.id),
          numericId: v.id,
          slug,
          name: v.name,
          model: shortModel,
          paxCount: fitInfo.maxPax,
          luggageCount: fitInfo.maxLuggage,
          fare,
          image: resolvedImage,
          imageUrl: resolvedImage,
          isRecommended,
          fitsGroup,
          fitsPassengers,
          badgeNote: fitInfo.badgeNote,
          fitReason: fitInfo.reason,
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
  }, [liveVehicles, bookingData, services, recommendedInfo]);

  // Ensure bookingData.baseFare stays strictly synchronized with the selected vehicle fare
  useEffect(() => {
    if (vehicleList.length > 0) {
      const current =
        vehicleList.find((v) => v.numericId === bookingData.vehicleId) ||
        vehicleList.find((v) => v.slug === bookingData.selectedFleetSlug) ||
        vehicleList.find((v) => v.isRecommended) ||
        vehicleList[0];

      if (current) {
        const needsUpdate =
          bookingData.baseFare !== current.fare ||
          bookingData.vehicleId !== current.numericId ||
          bookingData.selectedFleetSlug !== current.slug ||
          bookingData.selectedFleet !== current.name;

        if (needsUpdate) {
          updateBookingData({
            vehicleId: current.numericId,
            selectedFleet: current.name,
            selectedFleetSlug: current.slug,
            baseFare: current.fare,
          });
        }
      }
    }
  }, [vehicleList, bookingData.vehicleId, bookingData.selectedFleetSlug, bookingData.baseFare, bookingData.selectedFleet, updateBookingData]);

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
    <div className="w-full max-w-[620px] mx-auto p-4 sm:p-6 bg-white rounded-2xl sm:rounded-3xl border border-slate-200 flex flex-col justify-start items-start gap-4 sm:gap-5 shadow-2xl relative max-h-[92vh] overflow-hidden selection:bg-[#C6A45A] selection:text-[#071E3B]">
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

      {/* Vehicle Options Showcase List (Scrollable) */}
      <div className="self-stretch flex flex-col gap-4 overflow-y-auto max-h-[50vh] sm:max-h-[54vh] pr-1 py-1 [scrollbar-width:thin] [scrollbar-color:#C6A45A_transparent]">
        {vehicleList.length === 0 ? (
          <div className="flex flex-col gap-3 py-1">
            <div className="h-44 bg-slate-100 rounded-2xl animate-pulse" />
            <div className="h-44 bg-slate-100 rounded-2xl animate-pulse" />
          </div>
        ) : (
          vehicleList.map((v, idx) => {
            const isSelected =
              bookingData.vehicleId != null
                ? v.numericId === bookingData.vehicleId
                : v.slug === (bookingData.selectedFleetSlug || "7-seater");

            return (
              <div
                key={v.id}
                onClick={() => handleSelectVehicle(v)}
                className={`group relative rounded-2xl sm:rounded-[22px] transition-all overflow-hidden cursor-pointer flex flex-col bg-white ${
                  isSelected
                    ? "border-2 border-[#C6A45A] shadow-md ring-1 ring-[#C6A45A]/20"
                    : "border border-slate-200/90 shadow-xs hover:border-[#C6A45A]/60"
                }`}
              >
                {/* 1. Top Showcase Image Area */}
                <div className="relative w-full h-44 sm:h-52 bg-slate-900/10 overflow-hidden">
                  <VehicleShowcaseImage
                    src={v.imageUrl || v.image || "/images/Cab.png"}
                    alt={v.name}
                    priority={idx < 2}
                  />

                  {/* Soft gradient fade out at bottom of image matching mockup */}
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white via-white/50 to-transparent pointer-events-none" />

                  {/* Recommended Badge Top-Left */}
                  {v.isRecommended ? (
                    <div className="absolute top-3 left-3 sm:top-3.5 sm:left-3.5 z-10 px-3 py-1 rounded-full bg-white/95 backdrop-blur-xs text-[#071E3B] text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider shadow-sm border border-slate-100">
                      RECOMMENDED
                    </div>
                  ) : v.fitsGroup ? (
                    <div className="absolute top-3 left-3 sm:top-3.5 sm:left-3.5 z-10 px-3 py-1 rounded-full bg-white/95 backdrop-blur-xs text-[#16803C] text-[10px] sm:text-[11px] font-bold uppercase tracking-wider shadow-sm border border-slate-100">
                      FITS GROUP
                    </div>
                  ) : null}

                  {/* Selection Radio / Check Circle Top-Right */}
                  <div
                    className={`absolute top-3 right-3 sm:top-3.5 sm:right-3.5 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all ${
                      isSelected
                        ? "bg-[#C6A45A] text-white shadow-md scale-105"
                        : "border-2 border-white/90 bg-black/40 backdrop-blur-xs shadow-md"
                    }`}
                  >
                    {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                  </div>
                </div>

                {/* 2. Bottom Card Body */}
                <div className="p-4 sm:p-5 flex items-end justify-between gap-3 bg-white relative z-10">
                  {/* Left: Info & Specs */}
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base sm:text-lg font-bold text-[#071E3B] font-manrope leading-tight">
                        {v.name}
                      </h3>
                      {isSelected && (
                        <span className="px-2 py-0.5 rounded bg-[#FEF9EE] border border-[#EADBBD] text-[#8A5A00] text-[10px] font-bold uppercase tracking-wider">
                          SELECTED
                        </span>
                      )}
                    </div>

                    <p className={`text-xs font-manrope mt-1 line-clamp-1 ${isSelected ? "text-[#8A5A00] font-semibold" : "text-[#667085]"}`}>
                      {v.model}
                    </p>

                    {/* Specs Pills: Pax, Luggage, Highlight */}
                    <div className="flex items-center gap-2 flex-wrap mt-3">
                      {/* Pax Pill */}
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700 font-manrope shadow-2xs">
                        <Users className="w-3.5 h-3.5 text-slate-500" strokeWidth={1.8} />
                        <span>{v.paxCount} pax</span>
                      </span>

                      {/* Luggage Pill */}
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700 font-manrope shadow-2xs">
                        <Luggage className="w-3.5 h-3.5 text-slate-500" strokeWidth={1.8} />
                        <span>{v.luggageCount} × 28&quot;</span>
                      </span>

                      {/* Highlight Pill: Most popular / Fits Group / Best Value */}
                      {v.isRecommended ? (
                        <span className="px-2.5 py-1 rounded-lg bg-[#FEF9EE] border border-[#EADBBD] text-[#8A5A00] text-xs font-bold font-manrope">
                          Most popular
                        </span>
                      ) : v.fitsGroup ? (
                        <span className="px-2.5 py-1 rounded-lg bg-[#E8F8EE] border border-[#B6EAD0] text-[#16803C] text-xs font-bold font-manrope">
                          Fits group
                        </span>
                      ) : v.badgeNote ? (
                        <span className="px-2.5 py-1 rounded-lg bg-[#FEF9EE] border border-[#EADBBD] text-[#8A5A00] text-xs font-bold font-manrope">
                          {v.badgeNote}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {/* Right: Info button & Fare */}
                  <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0 self-center sm:self-end">
                    {/* Info circle button with popover */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setInfoVehicleId(infoVehicleId === v.id ? null : v.id);
                        }}
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-[#071E3B] transition-colors cursor-pointer"
                        aria-label="Vehicle details"
                        title="View vehicle details and inclusions"
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>

                      {infoVehicleId === v.id && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-white rounded-xl shadow-xl border border-slate-200 text-xs font-manrope z-30 animate-in fade-in duration-150"
                        >
                          <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 font-bold text-[#071E3B]">
                            <span>{v.name} Details</span>
                            <button
                              type="button"
                              onClick={() => setInfoVehicleId(null)}
                              className="text-slate-400 hover:text-slate-600"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="flex flex-col gap-1.5 pt-2 text-[#5F6B7A]">
                            <div className="flex justify-between">
                              <span>Max Capacity:</span>
                              <strong className="text-[#071E3B]">{v.paxCount} Pax • {v.luggageCount} Bags</strong>
                            </div>
                            <div className="flex justify-between">
                              <span>Wait Time Buffer:</span>
                              <strong className="text-[#071E3B]">60m Free Airport Buffer</strong>
                            </div>
                            <div className="flex justify-between">
                              <span>Tolls &amp; ERP:</span>
                              <strong className="text-emerald-700">Included ($0)</strong>
                            </div>
                            <div className="flex justify-between">
                              <span>Surge Pricing:</span>
                              <strong className="text-emerald-700">Zero Surge</strong>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Price & Transfer Fare Label */}
                    <div className="flex flex-col items-end">
                      <div className="flex items-baseline gap-0.5 leading-none">
                        <span className="text-base sm:text-lg font-bold text-[#C6A45A] font-manrope">$</span>
                        <span className="text-2xl sm:text-3xl font-extrabold text-[#071E3B] font-manrope leading-none">
                          {v.fare}
                        </span>
                      </div>
                      <span className={`text-[9px] sm:text-[10px] font-bold tracking-wider uppercase font-manrope mt-1.5 ${isSelected ? "text-[#8A5A00]" : "text-slate-400"}`}>
                        {isHourly ? "HOURLY FARE" : "TRANSFER FARE"}
                      </span>
                    </div>
                  </div>
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

      {/* Footer Info Ribbon */}
      <div className="self-stretch pt-2 flex flex-wrap items-center justify-center gap-2 text-xs text-[#071E3B] font-manrope text-center border-t border-slate-100">
        <span className="font-normal text-[#5F6B7A]">All-inclusive transparent rates</span>
        <span className="text-[#C6A45A]">·</span>
        <span className="font-normal text-[#5F6B7A]">Fixed Price Guarantee</span>
        <span className="text-[#C6A45A]">·</span>
        <span className="font-semibold text-[#C6A45A]">(+65) 8800 6006</span>
      </div>
    </div>
  );
}
