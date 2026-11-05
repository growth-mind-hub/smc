"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useBookingModal } from "@/context/BookingContext";

export default function CTASection() {
  const { openModal } = useBookingModal();

  return (
    <section className="py-12 sm:py-20 px-4 sm:px-8 lg:px-12 bg-[#071E3B] text-white text-center flex flex-col justify-center items-center gap-6 sm:gap-8">
      {/* Title */}
      <div className="flex flex-col items-center">
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold font-manrope leading-tight sm:leading-[56px] text-white">
          Ready to Book Your Ride?
        </h2>
      </div>

      {/* Subtitle */}
      <div className="flex flex-col items-center max-w-xl">
        <p className="text-sm sm:text-base font-normal font-manrope leading-relaxed text-white/90">
          Call us at (+65) 8800 6006 or book online in just a few clicks —
          <br className="hidden sm:inline" />
          {" "}it&apos;s quick and easy.
        </p>
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto">
        {/* Book Now Button */}
        <button
          type="button"
          onClick={() => openModal({ initialStep: 0 })}
          className="w-full sm:w-auto min-h-[48px] sm:min-h-[52px] px-6 sm:px-8 py-3.5 bg-[#C6A45A] hover:bg-[#B58E45] active:scale-98 text-white text-base font-bold font-manrope rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center whitespace-nowrap"
        >
          Book Now
        </button>

        {/* Explore our Fleet Button */}
        <Link
          href="/fleets"
          className="w-full sm:w-auto min-h-[48px] sm:min-h-[52px] px-6 sm:px-8 py-3.5 rounded-xl border border-[#C6A45A] hover:bg-[#C6A45A]/10 active:scale-98 text-[#C6A45A] text-base font-bold font-manrope flex items-center justify-center gap-2.5 transition-all whitespace-nowrap"
        >
          <span>Explore our Fleet</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5] shrink-0" />
        </Link>
      </div>

      {/* Contact Details Ribbon */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs font-normal font-manrope text-white/80 pt-2">
        <span>SINGAPORE MAXICABS</span>
        <span>•</span>
        <a
          href="mailto:booking@singaporemaxicabs.com.sg"
          className="hover:underline hover:text-white transition-colors"
        >
          booking@singaporemaxicabs.com.sg
        </a>
        <span className="hidden sm:inline">•</span>
        <span className="w-full sm:w-auto text-center">45A Campbell Lane Singapore 209917</span>
      </div>
    </section>
  );
}


