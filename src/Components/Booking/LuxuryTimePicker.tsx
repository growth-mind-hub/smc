"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Clock, ChevronDown, Moon, Sun, Check } from "lucide-react";
import { formatTimeDisplay, isNightOrEarlyMorningTime } from "@/utils/timeValidation";

interface LuxuryTimePickerProps {
  label?: string;
  value: string; // "HH:mm" 24h format, e.g. "22:30"
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
  className?: string;
}

export default function LuxuryTimePicker({
  label = "Pickup Time",
  value,
  onChange,
  required = false,
  error,
  className = "",
}: LuxuryTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse 24h value to 12h state (hour12: 1-12, minute: 0-59, period: "AM" | "PM")
  const parsedTime = useMemo(() => {
    if (!value) {
      return { hour12: 10, minute: 0, period: "AM" as const };
    }
    const [hStr, mStr] = value.split(":");
    let h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);
    if (isNaN(h)) h = 10;
    const period: "AM" | "PM" = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    const minute = isNaN(m) ? 0 : m;
    return { hour12, minute, period };
  }, [value]);

  const [selectedHour, setSelectedHour] = useState<number>(parsedTime.hour12);
  const [selectedMinute, setSelectedMinute] = useState<number>(parsedTime.minute);
  const [selectedPeriod, setSelectedPeriod] = useState<"AM" | "PM">(parsedTime.period);

  // Keep internal state aligned if value changes from outside
  useEffect(() => {
    setSelectedHour(parsedTime.hour12);
    setSelectedMinute(parsedTime.minute);
    setSelectedPeriod(parsedTime.period);
  }, [parsedTime]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Helper to convert 12h + AM/PM -> "HH:mm" (24h)
  const to24HourStr = (h12: number, m: number, period: "AM" | "PM"): string => {
    let h24 = h12;
    if (period === "AM" && h12 === 12) h24 = 0;
    if (period === "PM" && h12 < 12) h24 = h12 + 12;
    return `${String(h24).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };

  const isNight = isNightOrEarlyMorningTime(value);

  // Calculate if the currently configured hour/period in picker is night
  const isPickerNight = useMemo(() => {
    const time24 = to24HourStr(selectedHour, selectedMinute, selectedPeriod);
    return isNightOrEarlyMorningTime(time24);
  }, [selectedHour, selectedMinute, selectedPeriod]);

  // Quick Shortcuts
  const handleQuickShortcut = (h24: number, m: number) => {
    const period: "AM" | "PM" = h24 >= 12 ? "PM" : "AM";
    const hour12 = h24 % 12 === 0 ? 12 : h24 % 12;
    setSelectedHour(hour12);
    setSelectedMinute(m);
    setSelectedPeriod(period);
    const newTime = `${String(h24).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    onChange(newTime);
  };

  // ASAP Shortcut (+45 minutes from now in SGT)
  const handleASAP = () => {
    const now = new Date();
    // Add 45 minutes buffer for limousine dispatch
    const future = new Date(now.getTime() + 45 * 60 * 1000);
    // Round to nearest 5 minutes
    const remainder = future.getMinutes() % 5;
    const roundedMinutes = remainder === 0 ? future.getMinutes() : future.getMinutes() + (5 - remainder);
    if (roundedMinutes >= 60) {
      future.setHours(future.getHours() + 1);
      future.setMinutes(0);
    } else {
      future.setMinutes(roundedMinutes);
    }
    handleQuickShortcut(future.getHours(), future.getMinutes());
    setIsOpen(false);
  };

  const handleApplyHour = (h: number) => {
    setSelectedHour(h);
    const time24 = to24HourStr(h, selectedMinute, selectedPeriod);
    onChange(time24);
  };

  const handleApplyMinute = (m: number) => {
    setSelectedMinute(m);
    const time24 = to24HourStr(selectedHour, m, selectedPeriod);
    onChange(time24);
  };

  const handleApplyPeriod = (p: "AM" | "PM") => {
    setSelectedPeriod(p);
    const time24 = to24HourStr(selectedHour, selectedMinute, p);
    onChange(time24);
  };

  const handleConfirm = () => {
    const time24 = to24HourStr(selectedHour, selectedMinute, selectedPeriod);
    onChange(time24);
    setIsOpen(false);
  };

  const minuteOptions = [0, 15, 30, 45];
  const fineMinuteOptions = [5, 10, 20, 25, 35, 40, 50, 55];

  return (
    <div ref={containerRef} className={`relative flex flex-col justify-start items-start gap-1 w-full ${className}`}>
      <div className="flex items-center justify-between w-full">
        {label && (
          <label className="text-[#071E3B] text-xs sm:text-sm font-medium font-inter leading-5">
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
        )}
        {isNight && (
          <span className="text-[10px] font-bold text-[#8A5A00] bg-[#FFF8E7] px-2 py-0.5 rounded-md flex items-center gap-1 font-manrope border border-[#C6A45A]/30">
            <Moon className="w-3 h-3 text-[#8A5A00]" />
            Night Dispatch
          </span>
        )}
      </div>

      {/* Trigger Box */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full min-h-[48px] p-3 sm:p-3.5 bg-white rounded-xl border ${
          error
            ? "border-rose-500 ring-1 ring-rose-500"
            : isOpen
            ? "border-[#C6A45A] ring-1 ring-[#C6A45A]"
            : "border-slate-300 hover:border-[#C6A45A]/70"
        } flex items-center justify-between gap-2.5 transition-all cursor-pointer text-left shadow-xs`}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] flex items-center justify-center shrink-0 text-[#C6A45A] border border-[#C6A45A]/20">
            <Clock className="w-4 h-4 text-[#C6A45A]" strokeWidth={2} />
          </div>

          <div className="flex flex-col min-w-0">
            <span
              className={`text-xs sm:text-sm font-manrope truncate ${
                value ? "font-bold text-[#071E3B]" : "font-normal text-slate-400"
              }`}
            >
              {value ? `${formatTimeDisplay(value)} (${value} SGT)` : "Select pickup time"}
            </span>
          </div>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180 text-[#C6A45A]" : ""
          }`}
        />
      </button>

      {error && (
        <span className="text-rose-600 text-[11px] font-medium font-manrope animate-in fade-in">
          {error}
        </span>
      )}

      {/* Floating Modern Time Popover */}
      {isOpen && (
        <div className="absolute right-0 sm:left-0 top-full mt-2 w-full sm:w-[340px] bg-white rounded-2xl border border-slate-200/90 shadow-2xl z-50 p-4 flex flex-col gap-3.5 animate-in fade-in zoom-in-95 duration-150">
          {/* Quick Shortcuts */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <button
              type="button"
              onClick={handleASAP}
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold font-manrope whitespace-nowrap bg-[#FAF7F0] text-[#8A5A00] hover:bg-[#F3ECE0] border border-[#C6A45A]/30 transition-all cursor-pointer"
            >
              ⚡ ASAP (+45m)
            </button>
            <button
              type="button"
              onClick={() => handleQuickShortcut(9, 0)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold font-manrope whitespace-nowrap bg-[#F8F7F4] hover:bg-[#FAF7F0] text-[#5F6B7A] hover:text-[#C6A45A] border border-slate-200/60 transition-all cursor-pointer"
            >
              09:00 AM
            </button>
            <button
              type="button"
              onClick={() => handleQuickShortcut(14, 0)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold font-manrope whitespace-nowrap bg-[#F8F7F4] hover:bg-[#FAF7F0] text-[#5F6B7A] hover:text-[#C6A45A] border border-slate-200/60 transition-all cursor-pointer"
            >
              02:00 PM
            </button>
            <button
              type="button"
              onClick={() => handleQuickShortcut(19, 0)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold font-manrope whitespace-nowrap bg-[#F8F7F4] hover:bg-[#FAF7F0] text-[#5F6B7A] hover:text-[#C6A45A] border border-slate-200/60 transition-all cursor-pointer"
            >
              07:00 PM
            </button>
            <button
              type="button"
              onClick={() => handleQuickShortcut(23, 0)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold font-manrope whitespace-nowrap bg-[#F8F7F4] hover:bg-[#FAF7F0] text-[#5F6B7A] hover:text-[#C6A45A] border border-slate-200/60 transition-all cursor-pointer"
            >
              11:00 PM
            </button>
          </div>

          {/* AM / PM Segmented Control */}
          <div className="grid grid-cols-2 p-1 bg-[#F8F7F4] rounded-xl border border-slate-200/60">
            <button
              type="button"
              onClick={() => handleApplyPeriod("AM")}
              className={`py-1.5 rounded-lg text-xs font-bold font-manrope flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                selectedPeriod === "AM"
                  ? "bg-[#071E3B] text-white shadow-xs"
                  : "text-[#5F6B7A] hover:text-[#071E3B]"
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-[#C6A45A]" />
              <span>AM (Morning)</span>
            </button>
            <button
              type="button"
              onClick={() => handleApplyPeriod("PM")}
              className={`py-1.5 rounded-lg text-xs font-bold font-manrope flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                selectedPeriod === "PM"
                  ? "bg-[#071E3B] text-white shadow-xs"
                  : "text-[#5F6B7A] hover:text-[#071E3B]"
              }`}
            >
              <Moon className="w-3.5 h-3.5 text-[#C6A45A]" />
              <span>PM (Afternoon/Night)</span>
            </button>
          </div>

          {/* Hour Selector Grid */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold font-manrope uppercase text-slate-400 tracking-wider">
              Select Hour
            </span>
            <div className="grid grid-cols-6 gap-1.5">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((hour) => {
                const isSelected = selectedHour === hour;
                return (
                  <button
                    key={hour}
                    type="button"
                    onClick={() => handleApplyHour(hour)}
                    className={`h-9 rounded-xl text-xs font-manrope font-bold flex items-center justify-center transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#071E3B] text-white shadow-md shadow-[#071E3B]/20 ring-2 ring-[#C6A45A]"
                        : "bg-[#F8F7F4] hover:bg-[#FAF7F0] text-[#071E3B] hover:text-[#C6A45A] border border-slate-200/60"
                    }`}
                  >
                    {String(hour).padStart(2, "0")}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Minute Selector */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold font-manrope uppercase text-slate-400 tracking-wider">
              Select Minute
            </span>
            {/* Primary intervals */}
            <div className="grid grid-cols-4 gap-1.5">
              {minuteOptions.map((min) => {
                const isSelected = selectedMinute === min;
                return (
                  <button
                    key={min}
                    type="button"
                    onClick={() => handleApplyMinute(min)}
                    className={`h-8 rounded-xl text-xs font-manrope font-bold flex items-center justify-center transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#C6A45A] text-white shadow-sm ring-2 ring-[#071E3B]"
                        : "bg-[#F8F7F4] hover:bg-[#FAF7F0] text-[#071E3B] hover:text-[#C6A45A] border border-slate-200/60"
                    }`}
                  >
                    :{String(min).padStart(2, "0")}
                  </button>
                );
              })}
            </div>

            {/* Fine minutes row */}
            <div className="grid grid-cols-8 gap-1 pt-0.5">
              {fineMinuteOptions.map((min) => {
                const isSelected = selectedMinute === min;
                return (
                  <button
                    key={min}
                    type="button"
                    onClick={() => handleApplyMinute(min)}
                    className={`h-6 rounded-md text-[10px] font-manrope font-medium flex items-center justify-center transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#C6A45A] text-white font-bold"
                        : "bg-slate-50 hover:bg-[#FAF7F0] text-slate-600 hover:text-[#C6A45A]"
                    }`}
                  >
                    :{String(min).padStart(2, "0")}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Night dispatch banner if selected time is night */}
          {isPickerNight && (
            <div className="p-2.5 bg-[#FAF7F0] rounded-xl border border-[#C6A45A]/40 flex items-start gap-2 text-[11px] text-[#8A5A00] font-manrope leading-tight">
              <Moon className="w-3.5 h-3.5 shrink-0 text-[#8A5A00] mt-0.5" />
              <span>
                <strong>Late-Night Window (10 PM – 6 AM):</strong> A +$10 SGD dispatch surcharge applies to confirm night drivers.
              </span>
            </div>
          )}

          {/* Confirm & Close */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-xs font-bold font-manrope text-[#071E3B]">
              {selectedHour}:{String(selectedMinute).padStart(2, "0")} {selectedPeriod}
            </span>

            <button
              type="button"
              onClick={handleConfirm}
              className="px-4 py-2 rounded-xl bg-[#071E3B] hover:bg-[#0B2A4A] active:scale-95 text-white text-xs font-bold font-manrope flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 text-[#C6A45A]" />
              <span>Set Time</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

