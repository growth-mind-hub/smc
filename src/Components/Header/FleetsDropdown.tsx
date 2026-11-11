"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useBookingModal } from "@/context/BookingContext";
import { resolveSlugFromApiVehicle, getVehicleImage } from "@/lib/fleetResolver";
import fleetData from "@/data/fleet.json";

interface FleetsDropdownProps {
  onItemClick?: () => void;
}

export default function FleetsDropdown({ onItemClick }: FleetsDropdownProps) {
  const { vehicles: liveVehicles, isLoadingVehicles } = useBookingModal();

  // Fallback to static fleetData.vehicles when liveVehicles is empty so dropdown never hangs on skeleton loading
  const staticFleets = React.useMemo(() => {
    const seen = new Set<string>();
    return fleetData.vehicles
      .filter((v) => {
        const key = v.slug || v.id;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map((v) => ({
        id: v.id,
        name: v.name,
        capacity: `${v.pax} | ${v.bags}`,
        slug: v.slug || v.id,
        image: v.image || "/images/Cab.png",
      }));
  }, []);

  const fleets =
    liveVehicles && liveVehicles.length > 0
      ? liveVehicles.map((v) => {
          const slug = resolveSlugFromApiVehicle(v);
          const pax = v.passengerCapacity ?? 7;
          const bags = v.luggageCapacity ?? 4;
          return {
            id: String(v.id),
            name: v.name,
            capacity: `${pax} Pax | ${bags} Bags`,
            slug,
            image: getVehicleImage(v, "/images/Cab.png"),
          };
        })
      : staticFleets;

  return (
    <div className="w-[360px] sm:w-[504px] max-h-[calc(100vh-100px)] overflow-hidden bg-white rounded-2xl shadow-2xl border border-slate-200/90 flex flex-col z-50">
      {/* Full Vehicle List with natural height */}
      <div className="min-h-0 flex-1 overflow-y-auto p-2 sm:p-3 flex flex-col divide-y divide-slate-100 [scrollbar-width:thin] [scrollbar-color:#C6A45A_transparent]">
        {fleets.length === 0 ? (
          <div className="flex flex-col gap-2 p-2">
            <div className="h-12 bg-slate-100 rounded-lg animate-pulse" />
            <div className="h-12 bg-slate-100 rounded-lg animate-pulse" />
            <div className="h-12 bg-slate-100 rounded-lg animate-pulse" />
          </div>
        ) : (
          fleets.map((fleet) => (
            <Link
              key={fleet.id}
              href={`/fleets/${fleet.slug}`}
              onClick={onItemClick}
              className="p-2.5 sm:p-3 rounded-xl flex items-center gap-3.5 hover:bg-[#FBF7EC] active:scale-[0.99] transition-all group"
            >
              <div className="w-14 h-11 shrink-0 relative rounded-md overflow-hidden bg-slate-100 flex items-center justify-center p-1 border border-slate-200/70">
                <Image
                  src={fleet.image}
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
          ))
        )}
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
