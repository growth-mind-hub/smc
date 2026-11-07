"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useBookingModal } from "@/context/BookingContext";

export interface Vehicle {
  id: string;
  slug?: string;
  name: string;
  model?: string;
  price: string;
  currency: string;
  description: string;
  heroDescription?: string;
  pax: string;
  paxCount?: number | string;
  bags: string;
  luggageCount?: number;
  badge?: string;
  image?: string;
  meetAndGreet?: string;
  charter3h?: string;
  specsRow1Label?: string;
  specsRow1Value?: string;
  specsRow2Label?: string;
  specsRow2Value?: string;
  specsRow3Label?: string;
  specsRow3Value?: string;
  extras?: { label: string; price: string }[];
  buttonText: string;
}

export default function FleetCard({ vehicle }: { vehicle: Vehicle }) {
  const { openModal } = useBookingModal();
  const slug = vehicle.slug || vehicle.id;

  const handleReserve = () => {
    openModal({
      initialStep: 0,
      selectedFleet: vehicle.name,
      selectedFleetSlug: slug,
      baseFare: parseInt(vehicle.price.replace(/[^0-9]/g, "")) || 70,
    });
  };

  // Row 1: Passenger / Bags
  const row1Label = vehicle.specsRow1Label || "Passenger / Bags";
  const row1Value = vehicle.specsRow1Value || `${vehicle.pax} • ${vehicle.bags}`;

  // Row 2: Changi Meet & Greet
  const row2Label = vehicle.specsRow2Label || "Changi Meet & Greet";
  const row2Value = vehicle.specsRow2Value || vehicle.meetAndGreet || "$80 SGD";

  // Row 3: 3-Hour Charter or LTA
  const row3Label = vehicle.specsRow3Label || (vehicle.id === "wheelchair-cab" ? "LTA Certified" : "3-Hour Charter");
  const row3Value = vehicle.specsRow3Value || vehicle.charter3h || (vehicle.id === "wheelchair-cab" ? "Full Safety Harness" : "$180 SGD");

  return (
    <div className="w-full bg-[#071E3B] rounded-2xl sm:rounded-[20px] shadow-[0px_12px_32px_0px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col justify-between border border-[#0B2A4A] group hover:shadow-2xl transition-all duration-300">
      {/* Top Section: Image & Body */}
      <div className="flex flex-col">
        {/* Vehicle Image Banner */}
        <Link
          href={`/fleets/${slug}`}
          className="block relative w-full h-52 sm:h-64 bg-[#071E3B] overflow-hidden cursor-pointer"
        >
          <Image
            src={vehicle.image || "/images/Cab.png"}
            alt={vehicle.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500 rounded-t-2xl sm:rounded-t-[20px]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#071E3B]/85 via-transparent to-transparent pointer-events-none" />

          {vehicle.badge && (
            <div className="absolute top-3.5 left-3.5 z-10 bg-[#C6A45A] text-[#071E3B] px-2.5 py-1 rounded-md text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider shadow-md">
              {vehicle.badge}
            </div>
          )}
        </Link>

        {/* Card Body */}
        <div className="p-5 sm:p-7 flex flex-col gap-4 sm:gap-6">
          {/* Header & Price */}
          <div className="flex items-start justify-between gap-3">
            <Link href={`/fleets/${slug}`}>
              <h3 className="text-lg sm:text-xl font-bold text-white font-manrope group-hover:text-[#C6A45A] transition-colors leading-snug line-clamp-1">
                {vehicle.name}
              </h3>
            </Link>
            <div className="flex items-baseline gap-1 shrink-0">
              <span className="text-xl sm:text-2xl font-extrabold text-[#C6A45A] font-manrope">
                {vehicle.price}
              </span>
              <span className="text-[10px] sm:text-xs text-white/80 font-normal font-manrope">
                {vehicle.currency}
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm font-normal text-white/90 leading-5 font-manrope line-clamp-2 h-10">
            {vehicle.description}
          </p>

          {/* Specs Rows with Border Top & Bottom */}
          <div className="py-4 sm:py-5 border-t border-b border-[#7A8593]/40 flex flex-col gap-2.5 sm:gap-3.5">
            {/* Row 1: Passenger / Bags */}
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="font-normal text-white/90 font-manrope">
                {row1Label}
              </span>
              <span className="font-semibold text-white font-manrope">
                {row1Value}
              </span>
            </div>

            {/* Row 2: Changi Meet & Greet */}
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="font-normal text-white/90 font-manrope">
                {row2Label}
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-base sm:text-lg font-bold text-[#C6A45A] font-manrope">
                  {row2Value.split(" ")[0]}
                </span>
                {row2Value.split(" ")[1] && (
                  <span className="text-[10px] sm:text-xs font-normal text-white/80 font-manrope">
                    {row2Value.split(" ")[1]}
                  </span>
                )}
              </div>
            </div>

            {/* Row 3: 3-Hour Charter / LTA */}
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="font-normal text-white/90 font-manrope">
                {row3Label}
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-base sm:text-lg font-bold text-[#C6A45A] font-manrope">
                  {row3Value.includes("SGD") ? row3Value.split(" ")[0] : row3Value}
                </span>
                {row3Value.includes("SGD") && (
                  <span className="text-[10px] sm:text-xs font-normal text-white/80 font-manrope">
                    SGD
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer Buttons */}
      <div className="px-5 sm:px-7 pt-0 pb-5 sm:pb-7 flex items-center gap-2.5 sm:gap-3">
        <Link
          href={`/fleets/${slug}`}
          className="flex-1 py-3 px-3 text-center rounded-xl border border-[#C6A45A]/50 hover:border-[#C6A45A] hover:bg-[#C6A45A]/10 text-white text-xs sm:text-sm font-bold font-manrope transition-all flex items-center justify-center min-h-[44px]"
        >
          <span>View Details</span>
        </Link>
        <button
          type="button"
          onClick={handleReserve}
          className="flex-1 px-4 py-3 bg-[#C6A45A] hover:bg-[#B58E45] active:scale-[0.98] rounded-xl flex items-center justify-center gap-2 text-[#071E3B] text-xs sm:text-sm font-extrabold font-manrope transition-all shadow-md group-hover:shadow-lg cursor-pointer min-h-[44px]"
        >
          <span>Book Now</span>
          <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
        </button>
      </div>
    </div>
  );
}


