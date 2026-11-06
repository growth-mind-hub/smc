"use client";

import React, { useState } from "react";
import testimonialsData from "@/data/testimonials.json";

export default function TestimonialsSection() {
  const [activeCategory, setActiveCategory] = useState("All Reviews (63)");

  return (
    <section id="reviews" className="py-10 sm:py-16 px-4 sm:px-8 lg:px-16 bg-white border-t border-[#E9ECEF]">
      <div className="max-w-[1312px] mx-auto flex flex-col gap-6 sm:gap-8">
        {/* Header */}
        <div className="text-center flex flex-col items-center gap-2 sm:gap-3 max-w-2xl mx-auto">
          <span className="text-xs font-bold text-[#C6A45A] uppercase tracking-wide font-manrope">
            {testimonialsData.badge}
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold text-[#071E3B] leading-tight font-manrope">
            {testimonialsData.title}
          </h2>
          <p className="text-sm sm:text-lg text-[#667085] font-medium leading-relaxed font-manrope max-w-[576px]">
            {testimonialsData.subtitle}
          </p>
        </div>

        {/* Categories Bar & Google Score */}
        <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Filter Tabs (Horizontal Scrollable on Mobile) */}
          <div className="w-full lg:w-auto flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none justify-start lg:justify-center">
            {testimonialsData.categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-2 ${
                  cat.toLowerCase().includes("recommended") ? "rounded-full" : "rounded-md"
                } text-xs font-bold font-manrope transition-all shrink-0 cursor-pointer ${
                  activeCategory === cat
                    ? "bg-[#071E3B] text-white shadow-sm"
                    : "bg-[#F8F7F4] text-[#5F6B7A] hover:bg-slate-200 active:scale-95"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Google Verified Rating Badge */}
          <div className="w-full sm:w-auto px-4 py-2 bg-white rounded-xl shadow-xs border border-[#E9ECEF] flex items-center justify-between sm:justify-end gap-3">
            <div className="flex flex-col sm:items-end">
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg font-bold text-[#071E3B] font-manrope leading-none">
                  {testimonialsData.rating}
                </span>
                <span className="text-amber-500 text-xs font-normal tracking-widest">
                  ★★★★★
                </span>
              </div>
              <span className="text-[11px] text-[#5F6B7A] font-normal font-manrope">
                {testimonialsData.verifiedCount}
              </span>
            </div>
          </div>
        </div>

        {/* Reviews Layout */}
        <div className="w-full flex flex-col gap-4 sm:gap-6">
          {/* Row 1: Featured Big Card (Left) + 2 Stacked Medium Cards (Right) */}
          <div className="w-full flex flex-col lg:flex-row gap-4 sm:gap-6 items-stretch">
            {/* Featured Left Card */}
            <div className="w-full lg:w-[668px] min-h-[380px] sm:min-h-[480px] p-5 sm:p-10 relative bg-white rounded-2xl sm:rounded-3xl shadow-xs border border-[#E9ECEF] flex flex-col justify-between overflow-hidden">
              {/* Luxury Quotation Mark Watermark */}
              <div className="absolute left-4 top-2 sm:left-6 sm:top-3 text-[#C6A45A]/25 text-5xl sm:text-7xl font-semibold font-playfair select-none pointer-events-none">
                &ldquo;
              </div>

              <div className="relative z-10 flex flex-col gap-4 sm:gap-6">
                {/* 3 Badges */}
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-[#EEF5FB] rounded-md border border-[#E9ECEF] text-[#123F6B] text-[11px] sm:text-xs font-normal font-manrope">
                    ✈️ Flight Delayed 40min - Driver Waited
                  </span>
                  <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-white rounded-md border border-[#E9ECEF] text-[#071E3B] text-[11px] sm:text-xs font-bold font-manrope">
                    7-Seater Maxi Cab
                  </span>
                  <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-[#ECFDF3] rounded-md border border-[#16803C] text-[#16803C] text-[11px] sm:text-xs font-bold font-manrope">
                    100% On-Time
                  </span>
                </div>

                {/* Main Quote */}
                <p className="text-[#071E3B] text-base sm:text-lg font-medium font-manrope leading-relaxed">
                  &ldquo;Our driver was already waiting at arrivals with a name board - even though our flight was 40 minutes late. He tracked it automatically. Four bags loaded in seconds. Best airport pickup experience for a family.&rdquo;
                </p>
              </div>

              {/* Author Footer */}
              <div className="relative z-10 pt-4 border-t border-[#E9ECEF] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#071E3B] text-white rounded-full flex items-center justify-center font-bold text-sm font-inter shrink-0">
                    JT
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-[#071E3B] font-manrope">
                        Jennifer Tan
                      </span>
                      <span className="text-xs font-semibold text-[#16803C] font-manrope">
                        ✓ Verified Ride
                      </span>
                    </div>
                    <span className="text-xs font-medium text-[#667085] font-manrope">
                      Family of 5 • Changi T3 to Sentosa
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="text-amber-500 text-sm tracking-wider">★★★★★</span>
                  <span className="px-2 py-0.5 bg-white rounded-sm border border-[#E9ECEF] text-xs font-medium text-[#5F6B7A] font-manrope">
                    $0 waiting fee absorbed
                  </span>
                </div>
              </div>
            </div>

            {/* Right Stacked 2 Cards */}
            <div className="flex-1 flex flex-col gap-4 sm:gap-6">
              {/* Card 1: Michael Hartmann */}
              <div className="flex-1 p-5 sm:p-8 bg-white rounded-2xl shadow-xs border border-[#E9ECEF] flex flex-col justify-between gap-3 sm:gap-4">
                <div className="flex flex-col gap-2 sm:gap-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-[#EEF5FB] rounded-sm text-[#5F6B7A] text-[10px] sm:text-xs font-bold font-manrope uppercase">
                      MERCEDES V-CLASS
                    </span>
                    <span className="text-amber-500 text-xs tracking-wider">★★★★★</span>
                  </div>
                  <p className="text-xs sm:text-sm font-normal text-[#667085] font-manrope leading-relaxed">
                    &ldquo;We&apos;ve used them for three years and they&apos;ve never been late. Not once. The best option for picking up corporate guests.&rdquo;
                  </p>
                </div>

                <div className="pt-3 border-t border-[#E9ECEF] flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#F8F7F4] text-[#071E3B] rounded-full flex items-center justify-center text-xs font-bold font-inter shrink-0">
                    MH
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-[#071E3B] font-manrope">
                      Michael Hartmann
                    </span>
                    <span className="text-xs font-medium text-[#667085] font-manrope">
                      Regional Director • Financial District
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: Sharina Aziz */}
              <div className="flex-1 p-5 sm:p-8 bg-white rounded-2xl shadow-xs border border-[#E9ECEF] flex flex-col justify-between gap-3 sm:gap-4">
                <div className="flex flex-col gap-2 sm:gap-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-[#EEF5FB] rounded-sm text-[#5F6B7A] text-[10px] sm:text-xs font-bold font-manrope uppercase">
                      FIXED MIDNIGHT RATE
                    </span>
                    <span className="text-amber-500 text-xs tracking-wider">★★★★★</span>
                  </div>
                  <p className="text-xs sm:text-sm font-normal text-[#667085] font-manrope leading-relaxed">
                    &ldquo;Landing alone at midnight, I felt completely safe. My driver was punctual, polite, and professional - no awkward small talk.&rdquo;
                  </p>
                </div>

                <div className="pt-3 border-t border-[#E9ECEF] flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#F8F7F4] text-[#071E3B] rounded-full flex items-center justify-center text-xs font-bold font-inter shrink-0">
                    SA
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-[#071E3B] font-manrope">
                      Sharina Aziz
                    </span>
                    <span className="text-xs font-medium text-[#667085] font-manrope">
                      Solo Traveler • Changi T1 Midnight Arrival
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: 3 Bottom Review Cards */}
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {/* Bottom Card 1: Rahman & Family */}
            <div className="p-5 sm:p-6 bg-white rounded-2xl shadow-xs border border-[#E9ECEF] flex flex-col justify-between gap-2.5 sm:gap-3">
              <div className="flex items-center justify-between">
                <span className="text-amber-500 text-xs tracking-wider">★★★★★</span>
                <span className="text-xs font-medium text-[#667085] font-manrope">
                  Toyota Hiace 9S
                </span>
              </div>
              <p className="text-xs sm:text-sm font-normal text-[#5F6B7A] font-manrope leading-relaxed">
                &ldquo;8 large bags fit easily - no stress even with kids. The driver folded the rear seats right away when he saw all our luggage.&rdquo;
              </p>
              <div className="pt-1">
                <span className="text-sm font-bold text-[#071E3B] font-manrope">
                  Rahman &amp; Family
                </span>
              </div>
            </div>

            {/* Bottom Card 2: Karen Tan */}
            <div className="p-5 sm:p-6 bg-white rounded-2xl shadow-xs border border-[#E9ECEF] flex flex-col justify-between gap-2.5 sm:gap-3">
              <div className="flex items-center justify-between">
                <span className="text-amber-500 text-xs tracking-wider">★★★★★</span>
                <span className="text-xs font-medium text-[#667085] font-manrope">
                  Wheelchair Access
                </span>
              </div>
              <p className="text-xs sm:text-sm font-normal text-[#5F6B7A] font-manrope leading-relaxed">
                &ldquo;The wheelchair ramp made leaving the hospital so smooth and safe. The driver was gentle and caring with my elderly mum.&rdquo;
              </p>
              <div className="pt-1">
                <span className="text-sm font-bold text-[#071E3B] font-manrope">
                  Karen Tan
                </span>
              </div>
            </div>

            {/* Bottom Card 3: Marcus Bergmann */}
            <div className="p-5 sm:p-6 bg-white rounded-2xl shadow-xs border border-[#E9ECEF] flex flex-col justify-between gap-2.5 sm:gap-3">
              <div className="flex items-center justify-between">
                <span className="text-amber-500 text-xs tracking-wider">★★★★★</span>
                <span className="text-xs font-medium text-[#667085] font-manrope">
                  Group Minibus
                </span>
              </div>
              <p className="text-xs sm:text-sm font-normal text-[#5F6B7A] font-manrope leading-relaxed">
                &ldquo;Organized transport for 23 people across a 3-day conference. Everything ran on schedule with clear billing and a dedicated coordinator.&rdquo;
              </p>
              <div className="pt-1">
                <span className="text-sm font-bold text-[#071E3B] font-manrope">
                  Marcus Bergmann
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note Link */}
        <div className="text-center pt-2 flex flex-wrap items-center justify-center gap-1 text-xs font-manrope">
          <span className="text-[#5F6B7A] font-normal">
            100% genuine reviews directly collected from verified passengers •{" "}
          </span>
          <a
            href="https://google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#071E3B] font-bold underline hover:text-[#C6A45A] transition-colors"
          >
            Read all 63 + Google reviews →
          </a>
        </div>
      </div>
    </section>
  );
}


