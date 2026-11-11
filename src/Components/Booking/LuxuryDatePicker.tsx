"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Calendar, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { formatDateDisplay } from "@/utils/timeValidation";

interface LuxuryDatePickerProps {
  label?: string;
  value: string; // "YYYY-MM-DD"
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
  className?: string;
}

export default function LuxuryDatePicker({
  label = "Pickup Date",
  value,
  onChange,
  required = false,
  error,
  className = "",
}: LuxuryDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Today reference at midnight
  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  // Parse currently selected date if valid
  const selectedDate = useMemo(() => {
    if (!value) return null;
    const parts = value.split("-").map(Number);
    if (parts.length !== 3) return null;
    const [y, m, d] = parts;
    const date = new Date(y, m - 1, d);
    return isNaN(date.getTime()) ? null : date;
  }, [value]);

  // Calendar view navigation (Year & Month)
  const [viewYear, setViewYear] = useState<number>(() => {
    return selectedDate ? selectedDate.getFullYear() : today.getFullYear();
  });
  const [viewMonth, setViewMonth] = useState<number>(() => {
    return selectedDate ? selectedDate.getMonth() : today.getMonth();
  });

  // Keep view aligned if value changes externally
  useEffect(() => {
    if (selectedDate) {
      setViewYear(selectedDate.getFullYear());
      setViewMonth(selectedDate.getMonth());
    }
  }, [selectedDate]);

  // Close when clicking outside
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

  // Format date helper: Date -> "YYYY-MM-DD"
  const formatISO = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  // Month navigation helpers
  const isPrevDisabled =
    viewYear < today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth <= today.getMonth());

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPrevDisabled) return;
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  // Quick Chips
  const quickChips = useMemo(() => {
    const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    const inTwoDays = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2);
    const inThreeDays = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3);

    return [
      { label: "Today", date: today, iso: formatISO(today) },
      { label: "Tomorrow", date: tomorrow, iso: formatISO(tomorrow) },
      { label: "+2 Days", date: inTwoDays, iso: formatISO(inTwoDays) },
      { label: "+3 Days", date: inThreeDays, iso: formatISO(inThreeDays) },
    ];
  }, [today]);

  // Calendar Grid generation for viewYear & viewMonth
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
    const lastDayOfMonth = new Date(viewYear, viewMonth + 1, 0);
    const totalDays = lastDayOfMonth.getDate();

    // Monday as start of week (0 = Monday, 6 = Sunday)
    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const days: Array<{
      dayNumber: number;
      date: Date;
      iso: string;
      isPast: boolean;
      isToday: boolean;
      isSelected: boolean;
    }> = [];

    // Blank cells before month start
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null as unknown as (typeof days)[0]);
    }

    // Days of the month
    for (let d = 1; d <= totalDays; d++) {
      const date = new Date(viewYear, viewMonth, d);
      const iso = formatISO(date);
      const isPast = date < today;
      const isToday =
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate();
      const isSelected = value === iso;

      days.push({
        dayNumber: d,
        date,
        iso,
        isPast,
        isToday,
        isSelected,
      });
    }

    return days;
  }, [viewYear, viewMonth, today, value]);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  // Relative badge for trigger display
  const relativeBadge = useMemo(() => {
    if (!selectedDate) return null;
    const diffTime = selectedDate.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays === 2) return "In 2 Days";
    return null;
  }, [selectedDate, today]);

  const handleSelectDate = (iso: string) => {
    onChange(iso);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative flex flex-col justify-start items-start gap-1 w-full ${className}`}>
      {label && (
        <label className="text-[#071E3B] text-xs sm:text-sm font-medium font-inter leading-5">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

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
            <Calendar className="w-4 h-4 text-[#C6A45A]" strokeWidth={2} />
          </div>

          <div className="flex flex-col min-w-0">
            <span
              className={`text-xs sm:text-sm font-manrope truncate ${
                value ? "font-bold text-[#071E3B]" : "font-normal text-slate-400"
              }`}
            >
              {value ? formatDateDisplay(value) : "Select pickup date"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {relativeBadge && (
            <span className="text-[10px] sm:text-[11px] font-bold font-manrope text-[#8A5A00] bg-[#FFF8E7] px-2 py-0.5 rounded-md border border-[#C6A45A]/30">
              {relativeBadge}
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-[#C6A45A]" : ""
            }`}
          />
        </div>
      </button>

      {error && (
        <span className="text-rose-600 text-[11px] font-medium font-manrope animate-in fade-in">
          {error}
        </span>
      )}

      {/* Floating Modern Calendar Popover */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-full sm:w-[320px] bg-white rounded-2xl border border-slate-200/90 shadow-2xl z-50 p-3.5 sm:p-4 flex flex-col gap-3.5 animate-in fade-in zoom-in-95 duration-150">
          {/* Quick Selection Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {quickChips.map((chip) => {
              const isSelected = value === chip.iso;
              return (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => handleSelectDate(chip.iso)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold font-manrope whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#071E3B] text-white shadow-xs"
                      : "bg-[#F8F7F4] hover:bg-[#FAF7F0] text-[#5F6B7A] hover:text-[#C6A45A] border border-slate-200/60"
                  }`}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>

          {/* Month / Year Navigation */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <button
              type="button"
              onClick={handlePrevMonth}
              disabled={isPrevDisabled}
              aria-label="Previous month"
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                isPrevDisabled
                  ? "opacity-30 cursor-not-allowed text-slate-300"
                  : "hover:bg-slate-100 text-[#071E3B]"
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-sm font-bold font-manrope text-[#071E3B]">
              {monthNames[viewMonth]} {viewYear}
            </span>

            <button
              type="button"
              onClick={handleNextMonth}
              aria-label="Next month"
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-100 text-[#071E3B] transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((day) => (
              <span
                key={day}
                className="text-[11px] font-bold font-manrope text-slate-400 uppercase tracking-tight py-0.5"
              >
                {day}
              </span>
            ))}
          </div>

          {/* Calendar Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((cell, idx) => {
              if (!cell) {
                return <div key={`empty-${idx}`} className="w-8 h-8 sm:w-9 sm:h-9" />;
              }

              const { dayNumber, iso, isPast, isToday, isSelected } = cell;

              return (
                <button
                  key={iso}
                  type="button"
                  disabled={isPast}
                  onClick={() => handleSelectDate(iso)}
                  className={`w-8 h-8 sm:w-9 sm:h-9 mx-auto rounded-xl flex items-center justify-center text-xs font-manrope transition-all cursor-pointer relative ${
                    isPast
                      ? "opacity-25 cursor-not-allowed text-slate-400"
                      : isSelected
                      ? "bg-[#071E3B] text-white font-bold shadow-md shadow-[#071E3B]/25 ring-2 ring-[#C6A45A]"
                      : isToday
                      ? "border border-[#C6A45A] text-[#C6A45A] font-bold hover:bg-[#FAF7F0]"
                      : "text-[#071E3B] font-medium hover:bg-[#FAF7F0] hover:text-[#C6A45A] active:scale-95"
                  }`}
                >
                  <span>{dayNumber}</span>
                  {isToday && !isSelected && (
                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#C6A45A]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom helper */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px] font-manrope text-slate-400">
            <span>Singapore Time (SGT)</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-[#C6A45A] font-bold hover:underline cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

