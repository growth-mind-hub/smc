"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useBookingModal } from "@/context/BookingContext";
import { findMatchingApiVehicle, getVehicleImage } from "@/lib/fleetResolver";

interface FleetItem {
  name: string;
  capacity: string;
  slug: string;
  image: string;
}

const fleets: FleetItem[] = [
  {
    name: "Mercedes E-Class",
    capacity: "4 Pax | 2 Bags",
    slug: "mercedes-e-class",
    image: "/images/Cab.png",
  },
  {
    name: "Mercedes S-Class",
    capacity: "4 Pax | 2 Bags",
    slug: "mercedes-s-class",
    image: "/images/Cab.png",
  },
  {
    name: "Toyota Alphard / Vellfire",
    capacity: "6 Pax | 4 Bags",
    slug: "6-seater",
    image: "/images/Cab.png",
  },
  {
    name: "Mercedes Vito / Viano",
    capacity: "7 Pax | 6 Bags",
    slug: "7-seater",
    image: "/images/Cab.png",
  },
  {
    name: "Mercedes V-Class",
    capacity: "7 Pax | 6 Bags",
    slug: "7-seater",
    image: "/images/Cab.png",
  },
  {
    name: "Toyota Hiace 13-Seater Minibus",
    capacity: "13 Pax | 11 Bags",
    slug: "13-seater",
    image: "/images/Cab.png",
  },
  {
    name: "VIP / Executive Minibus",
    capacity: "13 Pax | 11 Bags",
    slug: "vip-lounge",
    image: "/images/Cab.png",
  },
  {
    name: "Wheelchair-Accessible Maxi Cab",
    capacity: "Accessible Wheelchair with Ramps",
    slug: "wheelchair-cab",
    image: "/images/Cab.png",
  },
  {
    name: "23-Seater Coach",
    capacity: "23 Pax | 20 Bags",
    slug: "13-seater",
    image: "/images/Cab.png",
  },
  {
    name: "40-Seater Coach",
    capacity: "40 Pax | 20 Bags",
    slug: "13-seater",
    image: "/images/Cab.png",
  },
];

interface FleetsDropdownProps {
  onItemClick?: () => void;
}

export default function FleetsDropdown({ onItemClick }: FleetsDropdownProps) {
  const { vehicles: liveVehicles } = useBookingModal();

  return (
    <div className="w-[360px] sm:w-[504px] max-h-[calc(100vh-100px)] overflow-hidden bg-white rounded-2xl shadow-2xl border border-slate-200/90 flex flex-col z-50">
      {/* Full Vehicle List with natural height */}
      <div className="min-h-0 flex-1 overflow-y-auto p-2 sm:p-3 flex flex-col divide-y divide-slate-100 [scrollbar-width:thin] [scrollbar-color:#C6A45A_transparent]">
      {fleets.map((fleet, index) => {
        const matchedApi = findMatchingApiVehicle(fleet.slug, liveVehicles);
        const resolvedImage = getVehicleImage(matchedApi, fleet.image);

        return (
          <Link
            key={index}
            href={`/fleets#${fleet.slug}`}
            onClick={onItemClick}
            className="p-2.5 sm:p-3 rounded-xl flex items-center gap-3.5 hover:bg-[#FBF7EC] active:scale-[0.99] transition-all group"
          >
            <div className="w-14 h-11 shrink-0 relative rounded-md overflow-hidden bg-slate-100 flex items-center justify-center p-1 border border-slate-200/70">
              <Image
                src={resolvedImage}
                alt={fleet.name}
                fill
                sizes="56px"
                className="object-contain group-hover:scale-105 transition-transform"
              />
            </div>
            <div className="flex flex-col items-start gap-0.5">
              <span className="text-[#071E3B] text-sm sm:text-base font-semibold font-manrope leading-snug group-hover:text-[#C6A45A] transition-colors">
                {fleet.name}
              </span>
              <span className="text-[#667085] text-xs font-normal font-manrope leading-4">
                {fleet.capacity}
              </span>
            </div>
          </Link>
        );
      })}
      </div>

      {/* Sticky Bottom Footer: View All Fleets */}
      <div className="p-2.5 sm:p-3 bg-[#FBF7EC] border-t border-[#C6A45A]/25 rounded-b-2xl shrink-0">
        <Link
          href="/fleets"
          onClick={onItemClick}
          className="w-full py-2.5 px-4 rounded-xl bg-[#071E3B] hover:bg-[#0B2A4A] active:scale-[0.99] text-white flex items-center justify-between text-xs sm:text-sm font-bold font-manrope transition-all shadow-sm group"
        >
          <span className="flex items-center gap-2">
            <span>View All Fleets</span>
            <span className="text-[11px] font-normal text-[#C6A45A]">
              • Full Pricing &amp; Specs
            </span>
          </span>
          <ArrowRight className="w-4 h-4 text-[#C6A45A] group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
