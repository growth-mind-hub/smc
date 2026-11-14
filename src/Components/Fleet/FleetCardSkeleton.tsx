"use client";

import React from "react";

export default function FleetCardSkeleton() {
  return (
    <div className="w-full bg-[#071E3B] rounded-2xl sm:rounded-[20px] shadow-[0px_12px_32px_0px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col justify-between border border-[#0B2A4A] animate-pulse">
      {/* Top Section: Image & Body */}
      <div className="flex flex-col">
        {/* Vehicle Image Banner Placeholder */}
        <div className="relative w-full h-52 sm:h-64 bg-[#0B2A4A]/70 overflow-hidden flex items-center justify-center">
          <div className="w-20 h-10 rounded bg-white/5" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#071E3B]/85 via-transparent to-transparent pointer-events-none" />
          {/* Badge Placeholder */}
          <div className="absolute top-3.5 left-3.5 w-24 h-5 rounded-md bg-[#C6A45A]/20" />
        </div>

        {/* Card Body */}
        <div className="p-5 sm:p-7 flex flex-col gap-4 sm:gap-6">
          {/* Header & Price */}
          <div className="flex items-start justify-between gap-3">
            <div className="h-6 sm:h-7 bg-[#16365C] rounded-md w-3/5" />
            <div className="h-6 sm:h-7 bg-[#C6A45A]/25 rounded-md w-16 shrink-0" />
          </div>

          {/* Description Lines */}
          <div className="flex flex-col gap-2 h-10 justify-center">
            <div className="h-3.5 bg-[#16365C] rounded w-full" />
            <div className="h-3.5 bg-[#16365C] rounded w-4/5" />
          </div>

          {/* Specs Rows with Border Top & Bottom */}
          <div className="py-4 sm:py-5 border-t border-b border-[#7A8593]/30 flex flex-col gap-3 sm:gap-3.5">
            {/* Row 1: Passenger / Bags */}
            <div className="flex items-center justify-between">
              <div className="h-3.5 bg-[#16365C] rounded w-28" />
              <div className="h-3.5 bg-[#16365C] rounded w-20" />
            </div>

            {/* Row 2: Arrival Driveway Pickup */}
            <div className="flex items-center justify-between">
              <div className="h-3.5 bg-[#16365C] rounded w-32" />
              <div className="h-4 bg-[#C6A45A]/30 rounded w-16" />
            </div>

            {/* Row 3: 3-Hour Charter / LTA */}
            <div className="flex items-center justify-between">
              <div className="h-3.5 bg-[#16365C] rounded w-24" />
              <div className="h-4 bg-[#C6A45A]/30 rounded w-16" />
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer Buttons */}
      <div className="px-5 sm:px-7 pt-0 pb-5 sm:pb-7 flex items-center gap-2.5 sm:gap-3">
        <div className="flex-1 h-11 rounded-xl bg-[#0B2A4A] border border-[#C6A45A]/20" />
        <div className="flex-1 h-11 rounded-xl bg-[#C6A45A]/35" />
      </div>
    </div>
  );
}

