"use client";

import React, { useMemo, useState, useEffect } from "react";
import FleetCard, { Vehicle } from "./FleetCard";
import FleetCardSkeleton from "./FleetCardSkeleton";
import fleetData from "@/data/fleet.json";
import { useBookingModal } from "@/context/BookingContext";
import { buildSectionVehicles } from "@/lib/fleetResolver";
import { VehicleCard } from "@/types/api";
import WhatsAppIcon from "@/Components/Shared/WhatsAppIcon";
import { ArrowRight } from "lucide-react";

interface FleetsPageSectionWiseProps {
  initialVehicles?: VehicleCard[];
}

export default function FleetsPageSectionWise({ initialVehicles = [] }: FleetsPageSectionWiseProps) {
  const { openModal, vehicles: liveVehicles, isLoadingVehicles } = useBookingModal();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prefer live client catalog from BookingContext, fall back to SSR-fetched API vehicles
  const apiVehicles =
    liveVehicles && liveVehicles.length > 0 ? liveVehicles : initialVehicles;

  const showSkeleton =
    !mounted || (isLoadingVehicles && (!initialVehicles || initialVehicles.length === 0));

  // Dynamically assemble sections strictly from live API vehicles
  const { executive, maxiCabs, minibuses } = useMemo(() => {
    return buildSectionVehicles(apiVehicles);
  }, [apiVehicles]);

  return (
    <div className="w-full flex flex-col items-center bg-white">
      {/* 1. Page Header (from fleetdeign.html) */}
      <section className="w-full bg-[#071E3B] text-white py-14 sm:py-20 px-4 sm:px-8 lg:px-12 relative overflow-hidden">
        <div className="max-w-[1440px] mx-auto flex flex-col items-start gap-4 sm:gap-6 relative z-10">
          <div className="flex flex-col items-start gap-2">
            <span className="text-[#C6A45A] text-sm sm:text-base font-bold font-manrope tracking-wider uppercase">
              Our Vehicles
            </span>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-manrope leading-tight sm:leading-[64px] text-white">
              Spacious, Clean &amp; Always On Time
            </h1>
          </div>
          <p className="text-white/80 text-base sm:text-lg font-medium font-manrope max-w-2xl leading-relaxed">
            Well-maintained Mercedes-Benz, Toyota Vellfire, and HiAce minibuses driven by experienced, licensed chauffeurs.
          </p>
        </div>
      </section>

      {/* 2. Content Sections Container */}
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-16 sm:py-20 flex flex-col gap-16 sm:gap-24">
        {/* Section A: Executive Travel */}
        {(showSkeleton || executive.length > 0) && (
          <section id="executive-travel" className="flex flex-col gap-8 sm:gap-10">
            <div className="flex flex-col gap-3 max-w-3xl">
              <span className="text-[#C6A45A] text-xs sm:text-sm font-bold font-manrope tracking-wider uppercase">
                EXECUTIVE TRAVEL · VIP MINIBUSES &amp; MPVS
              </span>
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold font-manrope text-[#071E3B] leading-tight">
                Travel in Executive Comfort
              </h2>
              <p className="text-sm sm:text-base text-[#667085] font-manrope leading-relaxed">
                Premium vehicles for executive transfers, VIP delegations, and business charters with guaranteed fixed fares.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {showSkeleton ? (
                <>
                  <FleetCardSkeleton />
                  <FleetCardSkeleton />
                  <FleetCardSkeleton />
                </>
              ) : (
                executive.map((vehicle) => (
                  <FleetCard key={vehicle.id} vehicle={vehicle} />
                ))
              )}
            </div>
          </section>
        )}

        {/* Section B: Maxi Cabs & MPVs */}
        {(showSkeleton || maxiCabs.length > 0) && (
          <section id="maxi-cabs" className="flex flex-col gap-8 sm:gap-10">
            <div className="flex flex-col gap-3 max-w-3xl">
              <span className="text-[#C6A45A] text-xs sm:text-sm font-bold font-manrope tracking-wider uppercase">
                MAXI CABS · 7 &amp; 9 SEATER PASSENGER CARRIERS
              </span>
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold font-manrope text-[#071E3B] leading-tight">
                Spacious Maxi Cabs For Every Group
              </h2>
              <p className="text-sm sm:text-base text-[#667085] font-manrope leading-relaxed">
                Singapore&apos;s most popular maxi cabs for airport arrivals, family outings, and point-to-point transfers with generous luggage room.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {showSkeleton ? (
                <>
                  <FleetCardSkeleton />
                  <FleetCardSkeleton />
                  <FleetCardSkeleton />
                </>
              ) : (
                maxiCabs.map((vehicle) => (
                  <FleetCard key={vehicle.id} vehicle={vehicle} />
                ))
              )}
            </div>
          </section>
        )}

        {/* Section C: Minibuses & Accessible Travel */}
        {(showSkeleton || minibuses.length > 0) && (
          <section id="minibuses" className="flex flex-col gap-8 sm:gap-10">
            <div className="flex flex-col gap-3 max-w-3xl">
              <span className="text-[#C6A45A] text-xs sm:text-sm font-bold font-manrope tracking-wider uppercase">
                HIGH-CAPACITY MINIBUSES &amp; COACHES
              </span>
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold font-manrope text-[#071E3B] leading-tight">
                Group Transits &amp; Dedicated Coaches
              </h2>
              <p className="text-sm sm:text-base text-[#667085] font-manrope leading-relaxed">
                High-roof minibuses for larger delegations, corporate events, and coaches with ample seating and luggage space.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {showSkeleton ? (
                <>
                  <FleetCardSkeleton />
                  <FleetCardSkeleton />
                  <FleetCardSkeleton />
                </>
              ) : (
                minibuses.map((vehicle) => (
                  <FleetCard key={vehicle.id} vehicle={vehicle} />
                ))
              )}
            </div>
          </section>
        )}
      </div>

      {/* 3. Bottom Banner: "Not sure which vehicle to choose?" (from fleetdeign.html lines 803-822) */}
      <section className="w-full bg-[#FBF7EC] border-t border-[#C6A45A]/20 py-16 px-6 sm:px-12 flex flex-col items-center text-center gap-6">
        <div className="max-w-2xl flex flex-col items-center gap-2.5">
          <h3 className="text-2xl sm:text-4xl lg:text-5xl font-bold font-manrope text-[#071E3B] leading-tight">
            Not sure which vehicle to choose?
          </h3>
          <p className="text-sm sm:text-base text-[#5F6B7A] font-manrope leading-relaxed">
            Our team will help you pick the right vehicle for your group size, luggage requirements, and journey itinerary.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          {/* WhatsApp Button */}
          <a
            href="https://wa.me/6588006006"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto min-h-[48px] sm:min-h-[52px] px-6 sm:px-8 py-3.5 bg-[#16803C] hover:bg-[#126b32] active:scale-95 text-white font-semibold font-manrope rounded-xl shadow-md flex items-center justify-center gap-2.5 transition-all cursor-pointer whitespace-nowrap"
          >
            <WhatsAppIcon className="w-4 h-4 text-white shrink-0" />
            <span>WhatsApp Us</span>
          </a>

          {/* Book Now Button */}
          <button
            type="button"
            onClick={() => openModal({ initialStep: 0 })}
            className="w-full sm:w-auto min-h-[48px] sm:min-h-[52px] px-6 sm:px-8 py-3.5 bg-[#071E3B] hover:bg-[#0B2A4A] active:scale-95 text-white font-semibold font-manrope rounded-xl shadow-md flex items-center justify-center gap-2.5 transition-all cursor-pointer whitespace-nowrap"
          >
            <span>Book Now</span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </button>
        </div>
      </section>
    </div>
  );
}
