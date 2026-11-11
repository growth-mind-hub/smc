"use client";

import React from "react";
import { Star } from "lucide-react";

export default function StatsSection() {
  const statsList = [
    { value: "$0", label: "HIDDEN FEES" },
    { value: "6.5k+", label: "Happy Customers" },
    { value: "4.9", label: "GOOGLE RATING", hasStar: true },
    { value: "Always", label: "AVAILABLE ANYTIME" },
    { value: "10+", label: "Drivers" },
    { value: "$0", label: "HIDDEN FEES" },
    { value: "6.5k+", label: "Happy Customers" },
    { value: "4.9", label: "GOOGLE RATING", hasStar: true },
    { value: "Always", label: "ROUND-THE-CLOCK" },
    { value: "10+", label: "Drivers" },
  ];

  // Duplicated for continuous seamless infinite loop
  const infiniteStats = [...statsList, ...statsList];

  return (
    <div className="self-stretch px-4 sm:px-16 py-6 sm:py-8 flex flex-col justify-center items-center bg-white overflow-hidden border-y border-slate-100">
      <div className="w-full flex overflow-hidden">
        <div className="animate-marquee flex items-center gap-4 sm:gap-6 shrink-0">
          {infiniteStats.map((stat, idx) => (
            <div
              key={idx}
              className="w-48 sm:w-64 p-3 sm:p-4 rounded-xl inline-flex flex-col justify-start items-center gap-1 shrink-0"
            >
              <div className="self-stretch flex flex-col justify-start items-center">
                {stat.hasStar ? (
                  <div className="self-stretch inline-flex justify-center items-center gap-1.5">
                    <div className="text-center justify-center text-[#071E3B] text-2xl sm:text-4xl font-extrabold font-manrope leading-tight sm:leading-[48px] tracking-wider">
                      {stat.value}
                    </div>
                    <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-500 text-amber-500 -mt-1" />
                  </div>
                ) : (
                  <div className="text-center justify-center text-[#071E3B] text-2xl sm:text-4xl font-extrabold font-manrope leading-tight sm:leading-[48px] tracking-wider">
                    {stat.value}
                  </div>
                )}
              </div>
              <div className="self-stretch flex flex-col justify-start items-center">
                <div className="text-center justify-center text-[#5F6B7A] text-xs sm:text-sm font-bold font-manrope leading-5 uppercase tracking-wide">
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}





