"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Moon,
  Sun,
  Sparkles,
  Check,
  Plus,
  Minus,
} from "lucide-react";
import {
  formatDateDisplay,
  formatTimeDisplay,
  isNightOrEarlyMorningTime,
} from "@/utils/timeValidation";

interface CustomDateTimePickerProps {
  dateValue: string; // "YYYY-MM-DD"
  timeValue: string; // "HH:mm"
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  dateError?: string;
  timeError?: string;
  className?: string;
}

export default function CustomDateTimePicker({
  dateValue,
  timeValue,
  onDateChange,
  onTimeChange,
  dateError,
  timeError,
  className = "",
}: CustomDateTimePickerProps) {
  const [isCalendarExpanded, setIsCalendarExpanded] = useState(false);
  const [isCustomTimeExpanded, setIsCustomTimeExpanded] = useState(false);

  // Today reference at midnight
  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  const formatISO = (d: Date): string => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  // If no date is set yet, default to tomorrow for smooth first experience
  useEffect(() => {
    if (!dateValue) {
      const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
      onDateChange(formatISO(tomorrow));
    }
  }, [dateValue, today, onDateChange]);

  // If no time is set yet, default to 10:00 AM
  useEffect(() => {
    if (!timeValue) {
      onTimeChange("10:00");
    }
  }, [timeValue, onTimeChange]);

  // Parse currently selected date
  const selectedDateObj = useMemo(() => {
    if (!dateValue) return null;
    const parts = dateValue.split("-").map(Number);
    if (parts.length !== 3) return null;
    const [y, m, d] = parts;
    const date = new Date(y, m - 1, d);
    return isNaN(date.getTime()) ? null : date;
  }, [dateValue]);

  // Calendar month/year navigation state
  const [viewYear, setViewYear] = useState<number>(() => {
    return selectedDateObj ? selectedDateObj.getFullYear() : today.getFullYear();
  });
  const [viewMonth, setViewMonth] = useState<number>(() => {
    return selectedDateObj ? selectedDateObj.getMonth() : today.getMonth();
  });

  useEffect(() => {
    if (selectedDateObj) {
      setViewYear(selectedDateObj.getFullYear());
      setViewMonth(selectedDateObj.getMonth());
    }
  }, [selectedDateObj]);

  // Generate 7-day quick strip cards starting from Today
  const quickDays = useMemo(() => {
    const days: Array<{
      tag: string;
      dayOfWeek: string;
      dayNum: number;
      monthShort: string;
      iso: string;
      isToday: boolean;
    }> = [];

    const monthNamesShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const dayNamesShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    for (let i = 0; i < 6; i++) {
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
      const iso = formatISO(d);
      let tag = "";
      if (i === 0) tag = "Today";
      else if (i === 1) tag = "Tomorrow";

      days.push({
        tag,
        dayOfWeek: dayNamesShort[d.getDay()],
        dayNum: d.getDate(),
        monthShort: monthNamesShort[d.getMonth()],
        iso,
        isToday: i === 0,
      });
    }

    return days;
  }, [today]);

  const isSelectedDateInQuickDays = quickDays.some((d) => d.iso === dateValue);

  // Month navigation helpers
  const isPrevDisabled =
    viewYear < today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth <= today.getMonth());

  const handlePrevMonth = () => {
    if (isPrevDisabled) return;
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  // Month names
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  // Calendar Days Grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const lastDay = new Date(viewYear, viewMonth + 1, 0);
    const totalDays = lastDay.getDate();

    let startDayOfWeek = firstDay.getDay() - 1; // 0 = Mon, 6 = Sun
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const days: Array<{
      dayNumber: number;
      iso: string;
      isPast: boolean;
      isToday: boolean;
      isSelected: boolean;
    }> = [];

    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null as unknown as (typeof days)[0]);
    }

    for (let d = 1; d <= totalDays; d++) {
      const date = new Date(viewYear, viewMonth, d);
      const iso = formatISO(date);
      const isPast = date < today;
      const isToday =
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate();
      const isSelected = dateValue === iso;

      days.push({
        dayNumber: d,
        iso,
        isPast,
        isToday,
        isSelected,
      });
    }

    return days;
  }, [viewYear, viewMonth, today, dateValue]);

  // Parse time
  const parsedTime = useMemo(() => {
    if (!timeValue) return { h24: 10, m: 0, h12: 10, period: "AM" as const };
    const [hStr, mStr] = timeValue.split(":");
    let h24 = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);
    if (isNaN(h24)) h24 = 10;
    const minute = isNaN(m) ? 0 : m;
    const period: "AM" | "PM" = h24 >= 12 ? "PM" : "AM";
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    return { h24, m: minute, h12, period };
  }, [timeValue]);

  const isNight = isNightOrEarlyMorningTime(timeValue);

  // Stepper: step by 15 minutes
  const handleStepTime = (minutesDelta: number) => {
    const totalMinutes = parsedTime.h24 * 60 + parsedTime.m + minutesDelta;
    // Wrap around 24 hours (1440 minutes)
    const normalized = (totalMinutes % 1440 + 1440) % 1440;
    const newH = Math.floor(normalized / 60);
    const newM = normalized % 60;
    const newTime = `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
    onTimeChange(newTime);
  };

  // Quick preset transfer slots
  const quickTimeSlots = [
    { label: "⚡ ASAP (+45m)", isAsap: true },
    { label: "09:00 AM", time: "09:00" },
    { label: "12:00 PM", time: "12:00" },
    { label: "03:30 PM", time: "15:30" },
    { label: "07:00 PM", time: "19:00" },
    { label: "10:30 PM", time: "22:30", isNight: true },
  ];

  const handleApplySlot = (slot: (typeof quickTimeSlots)[0]) => {
    if (slot.isAsap) {
      const now = new Date();
      const future = new Date(now.getTime() + 45 * 60 * 1000);
      const remainder = future.getMinutes() % 5;
      const roundedMinutes = remainder === 0 ? future.getMinutes() : future.getMinutes() + (5 - remainder);
      if (roundedMinutes >= 60) {
        future.setHours(future.getHours() + 1);
        future.setMinutes(0);
      } else {
        future.setMinutes(roundedMinutes);
      }
      const newTime = `${String(future.getHours()).padStart(2, "0")}:${String(future.getMinutes()).padStart(2, "0")}`;
      onTimeChange(newTime);
    } else if (slot.time) {
      onTimeChange(slot.time);
    }
  };

  // Custom Hour/Minute setter
  const handleSetCustomTime = (newH12: number, newM: number, newPeriod: "AM" | "PM") => {
    let h24 = newH12;
    if (newPeriod === "AM" && newH12 === 12) h24 = 0;
    if (newPeriod === "PM" && newH12 < 12) h24 = newH12 + 12;
    const newTime = `${String(h24).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
    onTimeChange(newTime);
  };

  return (
    <div
      className={`w-full bg-[#FAF9F5] rounded-2xl border ${
        dateError || timeError ? "border-rose-400 ring-1 ring-rose-400" : "border-slate-200/90"
      } p-3.5 sm:p-5 flex flex-col gap-4 sm:gap-5 shadow-xs ${className}`}
    >
      {/* 1. Header & Live Summary Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/70 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#071E3B] text-[#C6A45A] flex items-center justify-center shrink-0 shadow-xs">
            <CalendarIcon className="w-4 h-4 text-[#C6A45A]" strokeWidth={2.2} />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#C6A45A] font-manrope">
              Schedule Your Pickup
            </span>
            <span className="text-xs sm:text-sm font-bold text-[#071E3B] font-manrope">
              Date &amp; Chauffeur Time
            </span>
          </div>
        </div>

        {/* Live Active Schedule Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#C6A45A]/30 shadow-2xs self-start sm:self-auto">
          <span className="text-xs font-bold text-[#071E3B] font-manrope">
            {formatDateDisplay(dateValue)}
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-xs font-bold text-[#C6A45A] font-manrope">
            {formatTimeDisplay(timeValue)} SGT
          </span>
          {isNight && (
            <span className="ml-1 text-[10px] font-extrabold text-[#8A5A00] bg-[#FFF8E7] px-1.5 py-0.5 rounded flex items-center gap-0.5">
              <Moon className="w-2.5 h-2.5" /> Night
            </span>
          )}
        </div>
      </div>

      {/* 2. DATE SELECTION SECTION */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#5F6B7A] font-manrope">
            1. Select Pickup Date <span className="text-rose-500">*</span>
          </span>

          <button
            type="button"
            onClick={() => setIsCalendarExpanded((prev) => !prev)}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#C6A45A] hover:text-[#B58E45] cursor-pointer transition-colors"
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>{isCalendarExpanded ? "Hide Full Calendar" : "View Full Calendar"}</span>
            {isCalendarExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Horizontal Date Strip (Quick Selection Cards) */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {quickDays.map((day) => {
            const isSelected = dateValue === day.iso;
            return (
              <button
                key={day.iso}
                type="button"
                onClick={() => {
                  onDateChange(day.iso);
                }}
                className={`p-2 sm:p-2.5 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer border ${
                  isSelected
                    ? "bg-[#071E3B] text-white border-[#C6A45A] shadow-md ring-2 ring-[#C6A45A]/60"
                    : "bg-white hover:bg-[#FAF7F0] text-[#071E3B] border-slate-200/80 hover:border-[#C6A45A]/50 shadow-2xs"
                }`}
              >
                <span
                  className={`text-[10px] font-bold uppercase tracking-tight ${
                    isSelected ? "text-[#C6A45A]" : day.tag ? "text-[#8A5A00]" : "text-slate-400"
                  }`}
                >
                  {day.tag || day.dayOfWeek}
                </span>
                <span className="text-base sm:text-lg font-extrabold font-manrope leading-tight">
                  {day.dayNum}
                </span>
                <span
                  className={`text-[10px] font-medium font-manrope ${
                    isSelected ? "text-white/80" : "text-slate-500"
                  }`}
                >
                  {day.monthShort}
                </span>
              </button>
            );
          })}
        </div>

        {/* If selected date is outside quick cards, show active custom chip */}
        {!isSelectedDateInQuickDays && dateValue && (
          <div className="p-2.5 bg-white rounded-xl border border-[#C6A45A] flex items-center justify-between text-xs font-manrope shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-[#071E3B] text-[#C6A45A] text-[10px] font-bold uppercase">
                Selected
              </span>
              <span className="font-bold text-[#071E3B]">{formatDateDisplay(dateValue)}</span>
            </div>
            <button
              type="button"
              onClick={() => setIsCalendarExpanded(true)}
              className="text-[#C6A45A] font-bold hover:underline"
            >
              Change Date
            </button>
          </div>
        )}

        {/* Collapsible Full Month Calendar View */}
        {isCalendarExpanded && (
          <div className="p-3 sm:p-4 bg-white rounded-2xl border border-slate-200 shadow-md flex flex-col gap-3 animate-in fade-in duration-150">
            {/* Month Header Navigation */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <button
                type="button"
                onClick={handlePrevMonth}
                disabled={isPrevDisabled}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
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
                className="p-1.5 rounded-lg hover:bg-slate-100 text-[#071E3B] transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((day) => (
                <span
                  key={day}
                  className="text-[11px] font-bold font-manrope text-slate-400 uppercase py-0.5"
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
                    onClick={() => {
                      onDateChange(iso);
                    }}
                    className={`w-8 h-8 sm:w-9 sm:h-9 mx-auto rounded-xl flex items-center justify-center text-xs font-manrope transition-all cursor-pointer relative ${
                      isPast
                        ? "opacity-25 cursor-not-allowed text-slate-400"
                        : isSelected
                        ? "bg-[#071E3B] text-white font-bold shadow-md ring-2 ring-[#C6A45A]"
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
          </div>
        )}

        {dateError && (
          <span className="text-rose-600 text-[11px] font-medium font-manrope">{dateError}</span>
        )}
      </div>

      {/* 3. TIME SELECTION SECTION */}
      <div className="flex flex-col gap-2.5 pt-2 border-t border-slate-200/70">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#5F6B7A] font-manrope">
            2. Select Pickup Time (SGT) <span className="text-rose-500">*</span>
          </span>

          <button
            type="button"
            onClick={() => setIsCustomTimeExpanded((prev) => !prev)}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#C6A45A] hover:text-[#B58E45] cursor-pointer transition-colors"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{isCustomTimeExpanded ? "Hide Hour Dial" : "Fine-tune Exact Hour"}</span>
            {isCustomTimeExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Interactive Time Controller Card (Stepper + AM/PM) */}
        <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3">
          {/* Stepper buttons & Time display */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => handleStepTime(-15)}
              className="w-8 h-8 rounded-lg bg-[#F8F7F4] hover:bg-slate-200 active:scale-95 flex items-center justify-center text-[#071E3B] font-bold transition-all cursor-pointer border border-slate-200/60"
              aria-label="Decrease time by 15 minutes"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            <div className="flex flex-col items-center px-1">
              <span className="text-xl sm:text-2xl font-black font-manrope text-[#071E3B] tracking-tight">
                {String(parsedTime.h12).padStart(2, "0")}:{String(parsedTime.m).padStart(2, "0")}
              </span>
              <span className="text-[10px] font-bold text-[#C6A45A] font-manrope uppercase">
                {parsedTime.period} • {timeValue} SGT
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleStepTime(15)}
              className="w-8 h-8 rounded-lg bg-[#F8F7F4] hover:bg-slate-200 active:scale-95 flex items-center justify-center text-[#071E3B] font-bold transition-all cursor-pointer border border-slate-200/60"
              aria-label="Increase time by 15 minutes"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* AM / PM Segmented Switch */}
          <div className="grid grid-cols-2 p-1 bg-[#F8F7F4] rounded-xl border border-slate-200/60 shrink-0">
            <button
              type="button"
              onClick={() => handleSetCustomTime(parsedTime.h12, parsedTime.m, "AM")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-manrope flex items-center gap-1 transition-all cursor-pointer ${
                parsedTime.period === "AM"
                  ? "bg-[#071E3B] text-white shadow-xs"
                  : "text-[#5F6B7A] hover:text-[#071E3B]"
              }`}
            >
              <Sun className="w-3 h-3 text-[#C6A45A]" />
              <span>AM</span>
            </button>
            <button
              type="button"
              onClick={() => handleSetCustomTime(parsedTime.h12, parsedTime.m, "PM")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-manrope flex items-center gap-1 transition-all cursor-pointer ${
                parsedTime.period === "PM"
                  ? "bg-[#071E3B] text-white shadow-xs"
                  : "text-[#5F6B7A] hover:text-[#071E3B]"
              }`}
            >
              <Moon className="w-3 h-3 text-[#C6A45A]" />
              <span>PM</span>
            </button>
          </div>
        </div>

        {/* Popular Limousine Time Slot Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {quickTimeSlots.map((slot) => {
            const isSelected = slot.time === timeValue;
            return (
              <button
                key={slot.label}
                type="button"
                onClick={() => handleApplySlot(slot)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold font-manrope whitespace-nowrap transition-all cursor-pointer border ${
                  isSelected
                    ? "bg-[#071E3B] text-white border-[#C6A45A] shadow-xs ring-1 ring-[#C6A45A]"
                    : "bg-white hover:bg-[#FAF7F0] text-[#071E3B] hover:text-[#C6A45A] border-slate-200/80 shadow-2xs"
                }`}
              >
                {slot.label}
              </button>
            );
          })}
        </div>

        {/* Expandable Hour & Minute Dial Grid */}
        {isCustomTimeExpanded && (
          <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-md flex flex-col gap-3 animate-in fade-in duration-150">
            {/* Hours 1 - 12 */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold font-manrope uppercase text-slate-400">
                Select Hour (1–12)
              </span>
              <div className="grid grid-cols-6 gap-1.5">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((h) => {
                  const isSelected = parsedTime.h12 === h;
                  return (
                    <button
                      key={h}
                      type="button"
                      onClick={() => handleSetCustomTime(h, parsedTime.m, parsedTime.period)}
                      className={`h-8 sm:h-9 rounded-xl text-xs font-manrope font-bold flex items-center justify-center transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#071E3B] text-white shadow-md ring-2 ring-[#C6A45A]"
                          : "bg-[#F8F7F4] hover:bg-[#FAF7F0] text-[#071E3B] hover:text-[#C6A45A] border border-slate-200/60"
                      }`}
                    >
                      {String(h).padStart(2, "0")}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Minutes (00, 15, 30, 45) */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold font-manrope uppercase text-slate-400">
                Select Minute
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {[0, 15, 30, 45].map((m) => {
                  const isSelected = parsedTime.m === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => handleSetCustomTime(parsedTime.h12, m, parsedTime.period)}
                      className={`h-8 rounded-xl text-xs font-manrope font-bold flex items-center justify-center transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#C6A45A] text-white shadow-xs ring-2 ring-[#071E3B]"
                          : "bg-[#F8F7F4] hover:bg-[#FAF7F0] text-[#071E3B] hover:text-[#C6A45A] border border-slate-200/60"
                      }`}
                    >
                      :{String(m).padStart(2, "0")}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Night Window Notice */}
        {isNight && (
          <div className="p-2.5 bg-[#FAF7F0] rounded-xl border border-[#C6A45A]/40 flex items-start gap-2 text-[11px] text-[#8A5A00] font-manrope leading-tight animate-in fade-in">
            <Moon className="w-3.5 h-3.5 shrink-0 text-[#8A5A00] mt-0.5" />
            <span>
              <strong>Late-Night Transfer Window (10:00 PM – 6:00 AM SGT):</strong> A +$10 SGD dispatch surcharge is automatically applied to confirm dedicated night drivers.
            </span>
          </div>
        )}

        {timeError && (
          <span className="text-rose-600 text-[11px] font-medium font-manrope">{timeError}</span>
        )}
      </div>
    </div>
  );
}

