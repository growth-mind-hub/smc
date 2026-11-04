"use client";

import React, { useState } from "react";
import { Check } from "lucide-react";
import { useBookingModal } from "@/context/BookingContext";

interface MeetAndGreetFieldProps {
  onRemove: () => void;
  onChange?: (data: { passengers: number }) => void;
}

export default function MeetAndGreetField({ onRemove, onChange }: MeetAndGreetFieldProps) {
  const { addOns } = useBookingModal();
  const [passengers, setPassengers] = useState(1);

  const meetGreetAddOn = addOns?.find(
    (a) => a.code === "MEET_GREET" || a.name.toLowerCase().includes("meet")
  );
  const meetGreetPrice = meetGreetAddOn?.price ?? 20;

  const handlePaxChange = (delta: number) => {
    const newVal = Math.max(1, passengers + delta);
    setPassengers(newVal);
    onChange?.({ passengers: newVal });
  };

  return (
    <div className="w-full p-4 sm:p-5 bg-white rounded-xl border border-slate-200/90 shadow-sm flex flex-col gap-3.5 transition-all">
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
              Meet &amp; Greet service
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

      {/* Stepper & Details */}
      <div className="flex flex-col gap-2.5">
        <div className="px-3 py-2 bg-[#F8F7F4] rounded-lg border border-slate-200/80 flex items-center justify-between">
          <span className="text-xs font-semibold text-[#5F6B7A] font-manrope">
            Pax
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handlePaxChange(-1)}
              className="w-6 h-6 bg-white rounded shadow-xs flex items-center justify-center text-xs font-bold text-[#5F6B7A] hover:bg-slate-100 cursor-pointer active:scale-95"
            >
              -
            </button>
            <span className="w-4 text-center text-xs font-medium text-[#071E3B] font-manrope">
              {passengers}
            </span>
            <button
              type="button"
              onClick={() => handlePaxChange(1)}
              className="w-6 h-6 bg-white rounded shadow-xs flex items-center justify-center text-xs font-bold text-[#5F6B7A] hover:bg-slate-100 cursor-pointer active:scale-95"
            >
              +
            </button>
          </div>
        </div>

        <p className="text-xs text-[#667085] font-manrope leading-relaxed">
          Arrival Meet &amp; Greet — $20 · Includes 60-min terminal buffer and chauffeur luggage assistance.
        </p>
      </div>
    </div>
  );
}
