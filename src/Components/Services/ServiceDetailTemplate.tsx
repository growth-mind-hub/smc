"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Check, ShieldCheck } from "lucide-react";
import { useBookingModal } from "@/context/BookingContext";
import WhatsAppIcon from "@/Components/Shared/WhatsAppIcon";

export interface ServiceDetail {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  shortDescription: string;
  heroDescription: string;
  icon: string;
  tags: string[];
  inclusions: string[];
  pricing: { vehicle: string; rate: string }[];
  faqs: { question: string; answer: string }[];
}

export default function ServiceDetailTemplate({ service }: { service: ServiceDetail }) {
  const { openModal } = useBookingModal();

  const handleBookNow = () => {
    openModal({
      initialStep: 0,
      serviceType: service.title,
    });
  };

  return (
    <div className="w-full flex flex-col bg-white">
      {/* 1. Hero Banner */}
      <section className="w-full bg-[#071E3B] text-white py-12 sm:py-20 px-4 sm:px-8 lg:px-12 relative overflow-hidden">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/Home/Hero_tab.png"
            alt={service.title}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#071E3B] via-[#071E3B]/90 to-[#071E3B]/75 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#071E3B] via-transparent to-[#071E3B]/40 pointer-events-none" />
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#C6A45A]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-[1440px] mx-auto relative z-10 flex flex-col gap-6 sm:gap-8">
          {/* Breadcrumb Back */}
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-xs sm:text-sm text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Services</span>
          </Link>

          {/* Hero Content */}
          <div className="flex flex-col items-start gap-3 sm:gap-4 max-w-3xl">
            <span className="text-xs sm:text-sm font-bold text-[#C6A45A] uppercase tracking-[0.5px]">
              Our Services
            </span>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.15]">
              {service.title}
            </h1>
            <span className="text-base sm:text-xl font-bold text-[#C6A45A]">
              {service.subtitle}
            </span>
            <p className="text-sm sm:text-lg text-white/90 leading-relaxed max-w-2xl font-normal">
              {service.heroDescription}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-3 sm:pt-4 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleBookNow}
                className="w-full sm:w-auto min-h-[48px] sm:min-h-[52px] px-6 sm:px-8 py-3.5 rounded-lg bg-[#C6A45A] hover:bg-[#B58E45] active:scale-[0.98] text-white text-sm sm:text-base font-semibold flex items-center justify-center gap-3 transition-all shadow-md hover:shadow-lg cursor-pointer whitespace-nowrap"
              >
                <span>Book Now</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5] shrink-0" />
              </button>

              <Link
                href="/fleets"
                className="w-full sm:w-auto min-h-[48px] sm:min-h-[52px] px-6 sm:px-8 py-3.5 rounded-lg border border-[#C6A45A] hover:bg-[#C6A45A]/10 active:scale-[0.98] text-[#C6A45A] text-sm sm:text-base font-semibold flex items-center justify-center gap-3 transition-all whitespace-nowrap"
              >
                <span>Explore our Fleet</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5] shrink-0" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Main Content: What's Included & Pricing Table */}
      <section className="py-12 sm:py-20 px-4 sm:px-8 lg:px-12 max-w-[1440px] mx-auto w-full flex flex-col gap-12 sm:gap-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
          {/* Left Column: What's Included */}
          <div className="flex flex-col gap-4 sm:gap-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#071E3B]">
              What&apos;s Included
            </h2>

            <div className="flex flex-col gap-3 sm:gap-4">
              {service.inclusions.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#ECFDF3] border border-[#16803C] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-[#16803C] stroke-[3]" />
                  </div>
                  <span className="text-xs sm:text-[15px] text-[#5F6B7A] leading-relaxed">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Pricing Table & Guarantee Card */}
          <div className="flex flex-col gap-4 sm:gap-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#071E3B]">
              Pricing
            </h2>

            {/* Pricing Matrix */}
            <div className="w-full rounded-xl border border-[#E9ECEF] overflow-hidden shadow-xs">
              {service.pricing.map((p, idx) => (
                <div
                  key={p.vehicle}
                  className={`flex items-center justify-between px-4 sm:px-5 py-3 sm:py-3.5 text-xs sm:text-sm ${
                    idx % 2 === 0 ? "bg-white" : "bg-[#F7F5EF]"
                  } border-b border-slate-100 last:border-none`}
                >
                  <span className="text-[#5F6B7A] font-medium">{p.vehicle}</span>
                  <span className="text-[#A77E3C] font-bold">{p.rate}</span>
                </div>
              ))}
            </div>

            {/* Fixed Fares Guaranteed Card */}
            <div className="p-4 sm:p-5 rounded-xl bg-[#EEF5FB] border border-[#E9ECEF] flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#123F6B] shrink-0" />
                <h4 className="text-xs sm:text-sm font-bold text-[#071E3B]">
                  Fixed Fares Guaranteed
                </h4>
              </div>
              <p className="text-xs sm:text-sm text-[#667085] leading-relaxed">
                All prices are final. No hidden fees, no surge multipliers, transparent fixed rates.
              </p>
            </div>
          </div>
        </div>

        {/* 3. Frequently Asked Questions (Permanently Open) */}
        {service.faqs && service.faqs.length > 0 && (
          <div className="flex flex-col gap-4 sm:gap-6 pt-2 sm:pt-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#071E3B]">
              Frequently Asked Questions
            </h2>

            <div className="flex flex-col gap-3 sm:gap-3.5">
              {service.faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-[#E9ECEF] bg-white p-4 sm:p-6 shadow-2xs transition-colors"
                >
                  <h3 className="font-bold text-sm sm:text-lg text-[#071E3B] font-manrope">
                    {faq.question}
                  </h3>

                  <p className="pt-2 sm:pt-2.5 text-xs sm:text-base text-[#667085] leading-relaxed font-manrope">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Ready to Book CTA Card */}
        <div className="w-full rounded-3xl bg-[#071E3B] text-white p-6 sm:p-14 lg:p-16 text-center flex flex-col items-center gap-6 shadow-2xl relative overflow-hidden mt-2 sm:mt-4">
          <div className="absolute inset-0 bg-gradient-to-r from-[#071E3B] via-[#0B2A4A] to-[#071E3B] pointer-events-none" />
          <div className="relative z-10 flex flex-col items-center gap-4 max-w-2xl">
            <h3 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
              Ready to Book Your Ride?
            </h3>
            <p className="text-sm sm:text-base text-white/90 leading-relaxed">
              Call us at (+65) 8800 6006 or book online in just a few clicks — it&apos;s quick and easy.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleBookNow}
                className="w-full sm:w-auto min-h-[48px] sm:min-h-[52px] px-6 sm:px-8 py-3.5 rounded-lg bg-[#C6A45A] hover:bg-[#B58E45] active:scale-[0.98] text-white text-sm sm:text-base font-semibold flex items-center justify-center gap-3 transition-all shadow-lg cursor-pointer whitespace-nowrap"
              >
                <span>Book Now</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5] shrink-0" />
              </button>

              <a
                href="https://wa.me/6588006006"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto min-h-[48px] sm:min-h-[52px] px-6 sm:px-8 py-3.5 rounded-lg border border-[#C6A45A] hover:bg-[#C6A45A]/10 active:scale-[0.98] text-[#C6A45A] text-sm sm:text-base font-semibold flex items-center justify-center gap-2.5 transition-all whitespace-nowrap"
              >
                <WhatsAppIcon className="w-4 h-4 shrink-0" />
                <span>WhatsApp Us</span>
              </a>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs text-white font-normal font-manrope leading-4 opacity-80 border-t border-white/10 w-full mt-4">
              <span>SINGAPORE MAXICABS</span>
              <span>•</span>
              <span>booking@singaporemaxicabs.com.sg</span>
              <span>•</span>
              <span>45A Campbell Lane Singapore 209917</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
