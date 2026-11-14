"use client";

import React from "react";
import { Check, ShieldCheck } from "lucide-react";
import { useBookingModal } from "@/context/BookingContext";

interface MeetAndGreetFieldProps {
  onRemove: () => void;
  onChange?: () => void;
}

export default function MeetAndGreetField({ onRemove }: MeetAndGreetFieldProps) {
  const { addOns } = useBookingModal();

  const meetGreetAddOn = addOns?.find(
    (a) => a.code === "MEET_GREET" || a.name.toLowerCase().includes("meet")
  );
  const meetGreetPrice = meetGreetAddOn?.price ?? 20;

  return (
    <div className="w-full p-4 sm:p-5 bg-white rounded-xl border border-slate-200/90 shadow-sm flex flex-col gap-3 transition-all">
      {/* Top Header with Checkbox */}
      <div className="flex items-start gap-3 pb-3 border-b border-slate-100">
        <button
          type="button"
          onClick={onRemove}
          title="Uncheck to remove add-on"
          className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-[#C6A45A] text-white flex items-center justify-center shrink-0 cursor-pointer shadow-xs hover:bg-[#b59249] transition-all"
        >
          <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
        </button>

        <div className="flex-1 flex flex-col gap-0.5">
          <div className="flex items-center justify-between">
            <h4 className="text-sm sm:text-base font-semibold text-[#071E3B] font-inter">
              Meet &amp; Greet Service
            </h4>
            <span className="text-xs sm:text-sm font-semibold text-[#C6A45A] font-inter">
              +${meetGreetPrice} SGD
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#667085] font-manrope">
            Arrival meet &amp; greet at terminal arrival hall with name banner.
          </p>
        </div>
      </div>

      {/* Inclusions badge & details */}
      <div className="px-3 py-2 bg-[#F8F7F4] rounded-lg border border-slate-200/80 flex items-center justify-between text-xs font-manrope">
        <span className="text-[#5F6B7A] font-medium flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#C6A45A]" />
          <span>Flat Rate per Booking</span>
        </span>
        <span className="font-bold text-[#071E3B]">
          Covers entire group
        </span>
      </div>

      <p className="text-xs text-[#667085] font-manrope leading-relaxed">
        Includes dedicated terminal greeting, 60-min flight delay buffer, and chauffeur luggage assistance.
      </p>
    </div>
  );
}
