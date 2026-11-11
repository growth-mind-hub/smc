"use client";

import React, { useState } from "react";
import { Check, MessageSquare } from "lucide-react";
import WhatsAppIcon from "@/Components/Shared/WhatsAppIcon";

export type DistanceTier = "<2km" | "2-5km" | ">5km";

interface AdditionalStopFieldProps {
  onRemove: () => void;
  initialStops?: number;
  initialAddress?: string;
  initialTier?: DistanceTier;
  onChange?: (data: { stops: number; address: string; tier: DistanceTier }) => void;
}

export default function AdditionalStopField({
  onRemove,
  initialStops = 1,
  initialAddress = "",
  initialTier = "<2km",
  onChange,
}: AdditionalStopFieldProps) {
  const [stops, setStops] = useState(initialStops);
  const [address, setAddress] = useState(initialAddress);
  const [tier, setTier] = useState<DistanceTier>(initialTier);

  const tiers: { id: DistanceTier; label: string; rate: string; price: number | null }[] = [
    { id: "<2km", label: "Less than 2 km", rate: "$10", price: 10 },
    { id: "2-5km", label: "2 – 5 km", rate: "$15", price: 15 },
    { id: ">5km", label: "Above 5 km", rate: "Please enquire", price: null },
  ];

  const handleStopChange = (delta: number) => {
    const newVal = Math.max(1, stops + delta);
    setStops(newVal);
    onChange?.({ stops: newVal, address, tier });
  };

  const handleAddressChange = (newAddress: string) => {
    setAddress(newAddress);
    onChange?.({ stops, address: newAddress, tier });
  };

  const handleTierSelect = (newTier: DistanceTier) => {
    setTier(newTier);
    onChange?.({ stops, address, tier: newTier });
  };

  const activeTierObj = tiers.find((t) => t.id === tier) || tiers[0];

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
              {activeTierObj.price ? `+$${activeTierObj.price * stops} SGD` : "Please enquire"}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#667085] font-manrope">
            Include en-route passenger pickups or drop-offs during your journey.
          </p>
        </div>
      </div>

      {/* Distance Tier Selector */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-[#071E3B] font-manrope">
          Stop Distance Tier
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {tiers.map((t) => {
            const isSelected = tier === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => handleTierSelect(t.id)}
                className={`px-3 py-2.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between gap-1 ${
                  isSelected
                    ? "border-[#C6A45A] bg-[#FBF7EC] text-[#071E3B] shadow-xs ring-1 ring-[#C6A45A]"
                    : "border-slate-200 bg-[#F8F7F4] text-[#5F6B7A] hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold font-manrope">{t.label}</span>
                  {isSelected && (
                    <div className="w-3.5 h-3.5 rounded-full bg-[#C6A45A] text-white flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                </div>
                <span className={`text-[11px] font-semibold font-manrope ${isSelected ? "text-[#C6A45A]" : "text-[#7A8593]"}`}>
                  {t.rate}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stepper & Address Input */}
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
              aria-label="Decrease stops"
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
              aria-label="Increase stops"
            >
              +
            </button>
          </div>
        </div>

        {/* Address Input */}
        <div className="p-3 bg-[#F8F7F4] rounded-lg border border-slate-200/80 focus-within:border-[#C6A45A] focus-within:bg-white transition-all">
          <input
            type="text"
            placeholder="Additional stop address (e.g. 10 Bayfront Ave / Hotel lobby)"
            value={address}
            onChange={(e) => handleAddressChange(e.target.value)}
            className="w-full text-xs text-[#071E3B] placeholder:text-[#667085] bg-transparent outline-none font-manrope"
          />
        </div>

        {/* Tier Pricing Summary & Notice */}
        {tier === ">5km" ? (
          <div className="p-2.5 rounded-lg bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-between gap-2 text-xs font-manrope text-[#92400E]">
            <span>Detours &gt;5 km are confirmed via WhatsApp dispatch.</span>
            <a
              href={`https://wa.me/6588006006?text=${encodeURIComponent("Hi Singapore Maxi Cabs, I need an additional stop that is more than 5 km away. Please quote this custom route.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-bold text-[#16803C] hover:underline shrink-0"
            >
              <WhatsAppIcon className="w-3.5 h-3.5" />
              <span>Enquire</span>
            </a>
          </div>
        ) : (
          <p className="text-[11px] text-[#667085] font-manrope leading-relaxed">
            Standard stop rates: <strong>Less than 2 km: $10</strong> · <strong>2–5 km: $15</strong> · <strong>Above 5 km: Please enquire</strong>.
          </p>
        )}
      </div>
    </div>
  );
}
