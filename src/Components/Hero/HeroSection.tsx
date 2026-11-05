"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import heroData from "@/data/hero.json";
import BookingCard from "./BookingCard";
import { ArrowRight } from "lucide-react";
import WhatsAppIcon from "@/Components/Shared/WhatsAppIcon";

export default function HeroSection() {
  return (
    <section className="relative w-full bg-[#0B2A4A] overflow-hidden py-10 sm:py-20 lg:py-24 px-4 sm:px-8 lg:px-12">
      {/* Background Image from Figma */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/Home/Hero_tab.png"
          alt="Singapore Maxi Cab Chauffeur Service"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-75"
        />
        {/* Gradients from design.html */}
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(16,24,39,0.88)] via-[rgba(16,24,39,0.65)] to-[rgba(16,24,39,0.40)] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(16,24,39,0.60)] via-[rgba(16,24,39,0.30)] to-[rgba(16,24,39,0.45)] pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-[1440px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-16">
        {/* Left Column Content */}
        <div className="flex-1 flex flex-col items-start gap-6 sm:gap-8 max-w-2xl w-full">
          {/* Eyebrow and Headline */}
          <div className="flex flex-col gap-2">
            <span className="text-xs sm:text-base font-bold tracking-[0.5px] text-[#C6A45A] uppercase font-manrope">
              {heroData.badge}
            </span>
            <h1 className="text-3xl sm:text-5xl lg:text-[56px] font-bold text-white leading-[1.18] sm:leading-[1.14] tracking-tight font-manrope">
              Comfortable Rides.
              <br />
              Fixed Fares.
            </h1>
          </div>

          {/* Subtitle */}
          <p className="text-sm sm:text-lg font-medium text-white/95 max-w-[500px] leading-relaxed font-manrope">
            {heroData.subtitle}
          </p>

          {/* 4 Feature Badges */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 max-w-full">
            {heroData.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-white/20 backdrop-blur-[6px] text-white text-[11px] sm:text-xs font-semibold tracking-wide uppercase border border-white/10 whitespace-nowrap shrink-0"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-1 w-full sm:w-auto">
            {/* Primary Gold CTA */}
            <Link
              href="/fleets"
              className="w-full sm:w-auto min-h-[48px] sm:min-h-[52px] px-6 sm:px-8 py-3.5 rounded-xl bg-[#C6A45A] hover:bg-[#B58E45] text-white text-sm sm:text-base font-bold flex items-center justify-center gap-2.5 transition-all shadow-md hover:shadow-lg active:scale-98 whitespace-nowrap"
            >
              <span>Explore our Fleet</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5] shrink-0" />
            </Link>

            {/* Secondary WhatsApp CTA */}
            <a
              href="https://wa.me/6588006006"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto min-h-[48px] sm:min-h-[52px] px-6 sm:px-8 py-3.5 rounded-xl border border-[#C6A45A] hover:bg-[#C6A45A]/10 text-[#C6A45A] text-sm sm:text-base font-bold flex items-center justify-center gap-2.5 transition-all active:scale-98 bg-black/20 backdrop-blur-xs whitespace-nowrap"
            >
              <WhatsAppIcon className="w-4 h-4 shrink-0" />
              <span>Book via WhatsApp</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5] shrink-0" />
            </a>
          </div>
        </div>

        {/* Right Column Booking Form */}
        <div className="w-full lg:w-auto flex justify-center">
          <BookingCard />
        </div>
      </div>
    </section>
  );
}

