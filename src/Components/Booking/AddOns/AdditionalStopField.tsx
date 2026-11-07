"use client";

import React, { useState } from "react";
import { Check } from "lucide-react";
import { useBookingModal } from "@/context/BookingContext";

interface AdditionalStopFieldProps {
  onRemove: () => void;
  onChange?: (data: { stops: number; address: string }) => void;
}

export default function AdditionalStopField({ onRemove, onChange }: AdditionalStopFieldProps) {
  const { addOns } = useBookingModal();
  const [stops, setStops] = useState(1);
  const [address, setAddress] = useState("");

  const stopAddOn = addOns?.find(
    (a) => a.code === "STOP_WITHIN_2KM" || a.name.toLowerCase().includes("stop")
  );
  const stopPrice = stopAddOn?.price ?? 10;

  const handleStopChange = (delta: number) => {
    const newVal = Math.max(1, stops + delta);
    setStops(newVal);
    onChange?.({ stops: newVal, address });
  };

  const handleAddressChange = (newAddress: string) => {
    setAddress(newAddress);
    onChange?.({ stops, address: newAddress });
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
              Additional Stops
            </h4>
            <span className="text-xs sm:text-sm font-semibold text-[#C6A45A] font-inter">
              From +${stopPrice} / stop
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#667085] font-manrope">
            Additional stops can be included during your journey.
          </p>
        </div>
      </div>

      {/* Stepper & Input */}
      <div className="flex flex-col gap-3">
        {/* Stepper */}
        <div className="px-3 py-2 bg-[#F8F7F4] rounded-lg border border-slate-200/80 flex items-center justify-between">
          <span className="text-xs font-semibold text-[#5F6B7A] font-manrope">
            Number of Additional Stops
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleStopChange(-1)}
              className="w-6 h-6 bg-white rounded shadow-xs flex items-center justify-center text-xs font-bold text-[#5F6B7A] hover:bg-slate-100 cursor-pointer active:scale-95"
            >
              -
            </button>
            <span className="w-4 text-center text-xs font-medium text-[#071E3B] font-manrope">
              {stops}
            </span>
            <button
              type="button"
              onClick={() => handleStopChange(1)}
              className="w-6 h-6 bg-white rounded shadow-xs flex items-center justify-center text-xs font-bold text-[#5F6B7A] hover:bg-slate-100 cursor-pointer active:scale-95"
            >
              +
            </button>
          </div>
        </div>

        {/* Address Input */}
        <div className="p-3 bg-[#F8F7F4] rounded-lg border border-slate-200/80 focus-within:border-[#C6A45A] focus-within:bg-white transition-all">
          <input
            type="text"
            placeholder="Add an additional stop to your ride (e.g. 10 Bayfront Ave)"
            value={address}
            onChange={(e) => handleAddressChange(e.target.value)}
            className="w-full text-xs text-[#071E3B] placeholder:text-[#667085] bg-transparent outline-none font-manrope"
          />
        </div>

        <p className="text-xs text-[#667085] font-manrope leading-relaxed">
          Additional stops are charged at $10 per stop within 2km and $20 per stop beyond 2km.
        </p>
      </div>
    </div>
  );
}
