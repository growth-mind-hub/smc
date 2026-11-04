"use client";

import React, { useState } from "react";
import { Check } from "lucide-react";
import { useBookingModal } from "@/context/BookingContext";

interface ChildSeatFieldProps {
  onRemove: () => void;
  onChange?: (data: { seats: number; type: "Infant" | "Toddler"; age: string }) => void;
}

export default function ChildSeatField({ onRemove, onChange }: ChildSeatFieldProps) {
  const { addOns } = useBookingModal();
  const [seats, setSeats] = useState(1);
  const [seatType, setSeatType] = useState<"Infant" | "Toddler">("Toddler");
  const [childAge, setChildAge] = useState("");

  const babySeatAddOn = addOns?.find(
    (a) => a.code === "BABY_SEAT" || a.name.toLowerCase().includes("baby") || a.name.toLowerCase().includes("child")
  );
  const babySeatPrice = babySeatAddOn?.price ?? 20;

  const handleSeatChange = (delta: number) => {
    const newVal = Math.max(1, seats + delta);
    setSeats(newVal);
    onChange?.({ seats: newVal, type: seatType, age: childAge });
  };

  const handleTypeSelect = (type: "Infant" | "Toddler") => {
    setSeatType(type);
    onChange?.({ seats, type, age: childAge });
  };

  const handleAgeChange = (val: string) => {
    setChildAge(val);
    onChange?.({ seats, type: seatType, age: val });
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
              Child Seat
            </h4>
            <span className="text-xs sm:text-sm font-semibold text-[#C6A45A] font-inter">
              +${babySeatPrice} / seat
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#667085] font-manrope">
            Infant or toddler seat — specify type and age below.
          </p>
        </div>
      </div>

      {/* Inputs */}
      <div className="flex flex-col gap-3">
        {/* Stepper */}
        <div className="px-3 py-2 bg-[#F8F7F4] rounded-lg border border-slate-200/80 flex items-center justify-between">
          <span className="text-xs font-semibold text-[#5F6B7A] font-manrope">
            Number of seats
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSeatChange(-1)}
              className="w-6 h-6 bg-white rounded shadow-xs flex items-center justify-center text-xs font-bold text-[#5F6B7A] hover:bg-slate-100 cursor-pointer active:scale-95"
            >
              -
            </button>
            <span className="w-4 text-center text-xs font-medium text-[#071E3B] font-manrope">
              {seats}
            </span>
            <button
              type="button"
              onClick={() => handleSeatChange(1)}
              className="w-6 h-6 bg-white rounded shadow-xs flex items-center justify-center text-xs font-bold text-[#5F6B7A] hover:bg-slate-100 cursor-pointer active:scale-95"
            >
              +
            </button>
          </div>
        </div>

        {/* Seat Type Selector */}
        <div className="flex items-center justify-between py-1">
          <span className="text-xs sm:text-sm font-medium text-[#5F6B7A] font-inter">
            Seat type
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleTypeSelect("Infant")}
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium font-inter transition-all cursor-pointer ${
                seatType === "Infant"
                  ? "bg-[#071E3B] text-white"
                  : "bg-slate-100 text-[#5F6B7A] hover:bg-slate-200"
              }`}
            >
              Infant (0-1 yr)
            </button>
            <button
              type="button"
              onClick={() => handleTypeSelect("Toddler")}
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium font-inter transition-all cursor-pointer ${
                seatType === "Toddler"
                  ? "bg-[#C6A45A] text-white"
                  : "bg-slate-100 text-[#5F6B7A] hover:bg-slate-200"
              }`}
            >
              Toddler (1-4 yrs)
            </button>
          </div>
        </div>

        {/* Child's age input */}
        <div className="p-3 bg-[#F8F7F4] rounded-lg border border-slate-200/80 focus-within:border-[#C6A45A] focus-within:bg-white transition-all">
          <input
            type="text"
            placeholder="Child’s age (e.g. 2 years old)"
            value={childAge}
            onChange={(e) => handleAgeChange(e.target.value)}
            className="w-full text-xs text-[#071E3B] placeholder:text-[#667085] bg-transparent outline-none font-manrope"
          />
        </div>

        <p className="text-xs text-[#667085] font-manrope leading-relaxed">
          Cleaned and sanitized child seats secured according to Singapore traffic safety laws.
        </p>
      </div>
    </div>
  );
}
