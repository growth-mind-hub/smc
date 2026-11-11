"use client";

import React from "react";
import Link from "next/link";
import { Clock, ShieldCheck, Users, ArrowRight } from "lucide-react";
import WhatsAppIcon from "@/Components/Shared/WhatsAppIcon";

interface BookingValuePropsComponentProps {
  className?: string;
}

export default function BookingValueProps({
  className = "",
}: BookingValuePropsComponentProps) {
  const whyBookItems = [
    {
      icon: <Clock className="w-5 h-5 text-[#C6A45A]" />,
      title: "Always Punctual",
      description: "We track your flight. We arrive even if your flight is delayed.",
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-[#C6A45A]" />,
      title: "Fixed Fares",
      description: "The price shown is exactly what you pay — no surge, no surprises.",
    },
    {
      icon: <Users className="w-5 h-5 text-[#C6A45A]" />,
      title: "6 to 13 Seats",
      description: "Perfect for families, groups, and corporate teams.",
    },
    {
      icon: <WhatsAppIcon className="w-5 h-5 text-[#C6A45A]" />,
      title: "WhatsApp Support",
      description: "Real people respond fast via WhatsApp, day or night.",
    },
  ];

  const rateReference = [
    { name: "Mercedes Vito / Toyota Hiace 6S", price: "From $55" },
    { name: "Mercedes Vito / Toyota Hiace 7S", price: "From $60" },
    { name: "Mercedes Vito / Toyota Hiace 9S", price: "From $70" },
    { name: "Toyota HiAce / Ford Transit 13S", price: "From $110" },
  ];

  return (
    <div className={`flex flex-col gap-6 sm:gap-8 ${className}`}>
      {/* Why Book With Us Card */}
      <div className="p-6 sm:p-8 bg-white rounded-2xl border border-[#E9ECEF] shadow-sm flex flex-col gap-5">
        <h2 className="text-xl sm:text-2xl font-bold text-[#071E3B] font-manrope">
          Why Book With Us?
        </h2>

        <div className="flex flex-col gap-4 sm:gap-5">
          {whyBookItems.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#F8F7F4] flex items-center justify-center shrink-0">
                {item.icon}
              </div>
              <div className="flex flex-col gap-0.5">
                <h3 className="text-sm sm:text-base font-bold text-[#071E3B] font-manrope">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#667085] leading-relaxed font-manrope">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fixed Rate Reference Card */}
      <div className="p-6 sm:p-8 bg-[#071E3B] text-white rounded-2xl shadow-md flex flex-col gap-4 relative overflow-hidden">
        <span className="text-xs font-bold text-[#C6A45A] uppercase tracking-widest font-manrope">
          Fixed Rate Reference
        </span>

        <div className="flex flex-col gap-3 divide-y divide-white/10">
          {rateReference.map((r, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between text-xs sm:text-sm pt-2.5 first:pt-0"
            >
              <span className="text-white/90 font-manrope">{r.name}</span>
              <span className="text-[#C6A45A] font-bold font-manrope shrink-0 ml-2">
                {r.price}
              </span>
            </div>
          ))}
        </div>

        <Link
          href="/pricing"
          className="mt-2 text-xs font-bold text-[#C6A45A] hover:text-amber-300 transition-colors inline-flex items-center gap-1 self-start font-manrope group"
        >
          <span>See full pricing</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
