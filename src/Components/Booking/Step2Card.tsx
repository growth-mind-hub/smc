"use client";

import React, { useState } from "react";
import { useBookingModal } from "@/context/BookingContext";
import { ArrowRight, ArrowLeft, ChevronDown, X, Moon, AlertCircle } from "lucide-react";
import Link from "next/link";
import WhatsAppIcon from "@/Components/Shared/WhatsAppIcon";
import AddOnDropdown from "./AddOns/AddOnDropdown";
import MeetAndGreetField from "./AddOns/MeetAndGreetField";
import ChildSeatField from "./AddOns/ChildSeatField";
import AdditionalStopField from "./AddOns/AdditionalStopField";
import WheelchairField from "./AddOns/WheelchairField";
import { isNightOrEarlyMorningTime, validateBookingDetails } from "@/utils/timeValidation";

interface Step2CardProps {
  isModal?: boolean;
}

export default function Step2Card({ isModal = true }: Step2CardProps) {
  const { bookingData, updateBookingData, setStep, closeModal } = useBookingModal();
  const [isAddOnDropdownOpen, setIsAddOnDropdownOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  const isNightPickup = isNightOrEarlyMorningTime(bookingData.pickupTime);
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<string[]>(() => {
    if (bookingData.selectedAddOnIds && bookingData.selectedAddOnIds.length > 0) {
      return bookingData.selectedAddOnIds;
    }
    const list: string[] = [];
    if (bookingData.meetAndGreet) list.push("meet-greet");
    if (bookingData.babySeat) list.push("baby-seat");
    if (bookingData.additionalStopsCount || bookingData.extraStopsWithin2km) list.push("additional-stops");
    if (bookingData.wheelchairAccessible || bookingData.wheelchairCount) list.push("wheelchair");
    return list;
  });

  const handleToggleAddOn = (id: string) => {
    if (selectedAddOnIds.includes(id)) {
      handleRemoveAddOn(id);
    } else {
      const next = [...selectedAddOnIds, id];
      setSelectedAddOnIds(next);
      const updates: Partial<typeof bookingData> = { selectedAddOnIds: next };
      if (id === "meet-greet") {
        updates.meetAndGreet = true;
        updates.meetGreetPax = bookingData.meetGreetPax || 1;
      } else if (id === "baby-seat") {
        updates.babySeat = true;
        updates.babySeatsCount = bookingData.babySeatsCount || 1;
        updates.babySeatType = bookingData.babySeatType || "Toddler";
      } else if (id === "additional-stops") {
        updates.additionalStopsCount = bookingData.additionalStopsCount || 1;
        updates.extraStopsWithin2km = bookingData.extraStopsWithin2km || 1;
      } else if (id === "wheelchair") {
        updates.wheelchairAccessible = true;
        updates.wheelchairCount = bookingData.wheelchairCount || 1;
      }
      updateBookingData(updates);
      setIsAddOnDropdownOpen(false);
    }
  };

  const handleRemoveAddOn = (id: string) => {
    const next = selectedAddOnIds.filter((item) => item !== id);
    setSelectedAddOnIds(next);
    const updates: Partial<typeof bookingData> = { selectedAddOnIds: next };
    if (id === "meet-greet") {
      updates.meetAndGreet = false;
      updates.meetGreetPax = 0;
    } else if (id === "baby-seat") {
      updates.babySeat = false;
      updates.babySeatsCount = 0;
    } else if (id === "additional-stops") {
      updates.additionalStopsCount = 0;
      updates.extraStopsWithin2km = 0;
      updates.extraStopsOver2km = 0;
      updates.additionalStopAddress = "";
    } else if (id === "wheelchair") {
      updates.wheelchairAccessible = false;
      updates.wheelchairCount = 0;
      updates.wheelchairRequirement = "";
    }
    updateBookingData(updates);
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);

    const validation = validateBookingDetails({
      name: bookingData.name,
      phone: bookingData.phone,
      email: bookingData.email,
      pickupDate: bookingData.pickupDate,
      pickupTime: bookingData.pickupTime,
    });

    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    setFormErrors({});
    setStep(4);
  };

  const countryCodes = [
    { code: "+65", label: "+65 (SG)" },
    { code: "+971", label: "+971 (UAE)" },
    { code: "+966", label: "+966 (SA)" },
    { code: "+974", label: "+974 (QA)" },
    { code: "+965", label: "+965 (KW)" },
    { code: "+968", label: "+968 (OM)" },
    { code: "+973", label: "+973 (BH)" },
    { code: "+44", label: "+44 (UK)" },
    { code: "+1", label: "+1 (US)" },
    { code: "+60", label: "+60 (MY)" },
    { code: "+91", label: "+91 (IN)" },
    { code: "+61", label: "+61 (AU)" },
    { code: "+81", label: "+81 (JP)" },
    { code: "+86", label: "+86 (CN)" },
    { code: "+62", label: "+62 (ID)" },
  ];

  return (
    <div className="w-full max-w-[562px] mx-auto p-4 sm:p-7 bg-white rounded-2xl border border-slate-200 backdrop-blur-lg flex flex-col justify-start items-start gap-4 sm:gap-5 shadow-2xl relative max-h-[92vh] overflow-y-auto">
      {/* Close button if in modal */}
      {isModal && closeModal && (
        <button
          type="button"
          onClick={closeModal}
          className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 p-2 rounded-full text-[#667085] hover:text-[#071E3B] hover:bg-slate-100 active:scale-95 transition-all z-20 cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      )}

      {/* Header */}
      <div className="flex flex-col justify-start items-start pr-8 sm:pr-0">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#C6A45A] font-manrope">
            Step 3 of 4
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-xs font-medium text-[#667085] font-manrope">
            Passenger Details
          </span>
        </div>
        <div className="text-[#071E3B] text-lg sm:text-xl font-bold font-manrope leading-6 sm:leading-7 pt-0.5">
          Tell Us About Your Journey
        </div>
      </div>

      <form onSubmit={handleContinue} className="self-stretch flex flex-col justify-start items-start gap-3.5 sm:gap-4">
        {/* Date & Time Row */}
        <div className="self-stretch grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 items-start">
          {/* Pickup Date */}
          <div className="flex flex-col justify-start items-start gap-1">
            <label className="text-[#071E3B] text-xs sm:text-sm font-medium font-inter leading-5">
              Pickup Date <span className="text-rose-500">*</span>
            </label>
            <div
              className={`self-stretch relative p-3 sm:p-3.5 bg-white rounded-xl border ${
                hasAttemptedSubmit && formErrors.pickupDate ? "border-rose-500 ring-1 ring-rose-500" : "border-[#7A8593]"
              } flex justify-between items-center overflow-hidden focus-within:border-[#C6A45A] focus-within:ring-1 focus-within:ring-[#C6A45A] transition-all`}
            >
              <input
                type="date"
                value={bookingData.pickupDate}
                onChange={(e) => {
                  updateBookingData({ pickupDate: e.target.value });
                  if (formErrors.pickupDate) {
                    setFormErrors((prev) => ({ ...prev, pickupDate: "" }));
                  }
                }}
                required
                className="w-full text-sm sm:text-xs font-normal font-manrope text-[#071E3B] outline-none bg-transparent cursor-pointer"
              />
              <svg
                className="w-4 h-4 text-[#C6A45A] shrink-0 ml-1 pointer-events-none"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect x="1.5" y="2.5" width="11" height="9.5" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                <path d="M1.5 5.5H12.5" stroke="currentColor" strokeWidth="1.2" />
                <path d="M4.5 1V3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                <path d="M9.5 1V3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </div>
            {hasAttemptedSubmit && formErrors.pickupDate && (
              <span className="text-rose-600 text-[11px] font-medium font-manrope">
                {formErrors.pickupDate}
              </span>
            )}
          </div>

          {/* Pickup Time */}
          <div className="flex flex-col justify-start items-start gap-1">
            <div className="flex items-center justify-between w-full">
              <label className="text-[#071E3B] text-xs sm:text-sm font-medium font-inter leading-5">
                Pickup Time <span className="text-rose-500">*</span>
              </label>
              {isNightPickup && (
                <span className="text-[10px] font-bold text-[#8A5A00] bg-[#FFF8E7] px-2 py-0.5 rounded-md flex items-center gap-1 font-manrope">
                  <Moon className="w-3 h-3 text-[#8A5A00]" />
                  Night Dispatch
                </span>
              )}
            </div>
            <div
              className={`self-stretch relative p-3 sm:p-3.5 bg-white rounded-xl border ${
                hasAttemptedSubmit && formErrors.pickupTime ? "border-rose-500 ring-1 ring-rose-500" : "border-[#7A8593]"
              } flex justify-between items-center overflow-hidden focus-within:border-[#C6A45A] focus-within:ring-1 focus-within:ring-[#C6A45A] transition-all`}
            >
              <input
                type="time"
                value={bookingData.pickupTime}
                onChange={(e) => {
                  updateBookingData({ pickupTime: e.target.value });
                  if (formErrors.pickupTime) {
                    setFormErrors((prev) => ({ ...prev, pickupTime: "" }));
                  }
                }}
                required
                className="w-full text-sm sm:text-xs font-normal font-manrope text-[#071E3B] outline-none bg-transparent cursor-pointer"
              />
              <svg
                className="w-4 h-4 text-[#C6A45A] shrink-0 ml-1 pointer-events-none"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" />
                <path d="M7 4V7L9 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </div>
            {hasAttemptedSubmit && formErrors.pickupTime && (
              <span className="text-rose-600 text-[11px] font-medium font-manrope">
                {formErrors.pickupTime}
              </span>
            )}
          </div>

          {/* Night pickup alert callout */}
          {isNightPickup && (
            <div className="self-stretch sm:col-span-2 p-3 bg-[#FAF7F0] rounded-xl border border-[#C6A45A]/40 flex items-start gap-2.5 text-xs text-[#8A5A00] font-manrope animate-in fade-in">
              <Moon className="w-4 h-4 shrink-0 text-[#8A5A00] mt-0.5" />
              <div className="flex flex-col gap-0.5 leading-relaxed">
                <span className="font-bold text-[#071E3B]">
                  Late-Night / Early-Morning Dispatch (10:00 PM – 7:00 AM SGT)
                </span>
                <span>
                  You selected <strong>{bookingData.pickupTime}</strong>. To ensure direct chauffeur tracking and priority assignment during off-peak hours, this ride will be finalized directly with our 24/7 Operations Desk via WhatsApp.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Add Ons Dropdown & Dynamic Input Fields */}
        <div className="self-stretch flex flex-col justify-start items-start gap-2 relative">
          <label className="text-[#071E3B] text-xs sm:text-sm font-medium font-inter leading-5">
            Add Ons
          </label>

          {/* Dropdown Toggle Header */}
          <div
            onClick={() => setIsAddOnDropdownOpen(!isAddOnDropdownOpen)}
            className="self-stretch px-3.5 py-3 bg-white rounded-xl border border-[#7A8593] flex justify-between items-center cursor-pointer hover:border-[#C6A45A] active:scale-[0.99] transition-all select-none"
          >
            <div className="flex items-center gap-2">
              <span className="text-[#071E3B] text-xs sm:text-sm font-semibold font-manrope">
                Select Add Ons {selectedAddOnIds.length > 0 ? `(${selectedAddOnIds.length} added)` : ""}
              </span>
            </div>
            <div className="flex justify-start items-center gap-2">
              <span className="text-xs text-[#C6A45A] font-bold font-manrope">
                {isAddOnDropdownOpen ? "Close Menu" : "+ Add Option"}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-[#667085] transition-transform ${
                  isAddOnDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </div>
          </div>

          {/* Add-on dropdown options */}
          {isAddOnDropdownOpen && (
            <div className="w-full">
              <AddOnDropdown
                activeIds={selectedAddOnIds}
                onSelect={handleToggleAddOn}
              />
            </div>
          )}

          {/* Render selected add-on input fields */}
          <div className="w-full flex flex-col gap-3 pt-1">
            {selectedAddOnIds.includes("meet-greet") && (
              <MeetAndGreetField
                onRemove={() => handleRemoveAddOn("meet-greet")}
                onChange={(data) => {
                  updateBookingData({ meetAndGreet: true, meetGreetPax: data.passengers });
                }}
              />
            )}
            {selectedAddOnIds.includes("baby-seat") && (
              <ChildSeatField
                onRemove={() => handleRemoveAddOn("baby-seat")}
                onChange={(data) => {
                  updateBookingData({
                    babySeat: true,
                    babySeatsCount: data.seats,
                    babySeatType: data.type,
                    babySeatAge: data.age,
                  });
                }}
              />
            )}
            {selectedAddOnIds.includes("additional-stops") && (
              <AdditionalStopField
                onRemove={() => handleRemoveAddOn("additional-stops")}
                onChange={(data) => {
                  updateBookingData({
                    additionalStopsCount: data.stops,
                    extraStopsWithin2km: data.stops,
                    additionalStopAddress: data.address,
                  });
                }}
              />
            )}
            {selectedAddOnIds.includes("wheelchair") && (
              <WheelchairField
                onRemove={() => handleRemoveAddOn("wheelchair")}
                onChange={(data) => {
                  updateBookingData({
                    wheelchairAccessible: true,
                    wheelchairCount: data.count,
                    wheelchairRequirement: data.requirement,
                  });
                }}
              />
            )}
          </div>
        </div>

        {/* Special Request */}
        <div className="self-stretch flex flex-col justify-start items-start gap-1">
          <label className="text-[#071E3B] text-xs sm:text-sm font-medium font-inter leading-5">
            Flight Number / Special Request
          </label>
          <div className="self-stretch p-3 bg-white rounded-xl border border-[#7A8593] flex justify-start items-center overflow-hidden focus-within:border-[#C6A45A] focus-within:ring-1 focus-within:ring-[#C6A45A] transition-all">
            <textarea
              rows={2}
              placeholder="Eg. Flight SQ 321, extra luggage buffer, or special stop request..."
              value={bookingData.specialRequests}
              onChange={(e) => updateBookingData({ specialRequests: e.target.value })}
              className="flex-1 text-sm sm:text-xs font-normal font-manrope leading-relaxed text-[#071E3B] placeholder:text-[#667085] outline-none bg-transparent resize-none"
            />
          </div>
        </div>

        {/* Name & WhatsApp Number */}
        <div className="self-stretch grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 items-start">
          {/* Name */}
          <div className="flex flex-col justify-start items-start gap-1">
            <label className="text-[#071E3B] text-xs sm:text-sm font-medium font-inter leading-5">
              Passenger Name <span className="text-rose-500">*</span>
            </label>
            <div
              className={`self-stretch p-3 sm:p-3.5 bg-white rounded-xl border ${
                hasAttemptedSubmit && formErrors.name ? "border-rose-500 ring-1 ring-rose-500" : "border-[#7A8593]"
              } flex justify-start items-center overflow-hidden focus-within:border-[#C6A45A] focus-within:ring-1 focus-within:ring-[#C6A45A] transition-all`}
            >
              <input
                type="text"
                placeholder="John Smith"
                value={bookingData.name}
                onChange={(e) => {
                  updateBookingData({ name: e.target.value });
                  if (formErrors.name) setFormErrors((prev) => ({ ...prev, name: "" }));
                }}
                required
                className="w-full text-sm sm:text-xs font-normal font-manrope text-[#071E3B] placeholder:text-[#667085] outline-none bg-transparent"
              />
            </div>
            {hasAttemptedSubmit && formErrors.name && (
              <span className="text-rose-600 text-[11px] font-medium font-manrope">
                {formErrors.name}
              </span>
            )}
          </div>

          {/* WhatsApp Number */}
          <div className="flex flex-col justify-start items-start gap-1">
            <label className="text-[#071E3B] text-xs sm:text-sm font-medium font-inter leading-5">
              WhatsApp Contact <span className="text-rose-500">*</span>
            </label>
            <div className="self-stretch flex justify-start items-center gap-1.5">
              <div className="relative shrink-0 w-[96px] sm:w-[104px]">
                <select
                  value={bookingData.countryCode}
                  onChange={(e) => updateBookingData({ countryCode: e.target.value })}
                  className="w-full appearance-none pl-2.5 pr-6 py-3 sm:py-3.5 bg-white rounded-xl border border-[#7A8593] text-xs sm:text-sm font-bold font-manrope text-[#071E3B] outline-none focus:border-[#C6A45A] cursor-pointer"
                >
                  {countryCodes.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#667085] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <div
                className={`flex-1 min-w-0 p-3 sm:p-3.5 bg-white rounded-xl border ${
                  hasAttemptedSubmit && formErrors.phone ? "border-rose-500 ring-1 ring-rose-500" : "border-[#7A8593]"
                } flex justify-start items-center overflow-hidden focus-within:border-[#C6A45A] focus-within:ring-1 focus-within:ring-[#C6A45A] transition-all`}
              >
                <input
                  type="tel"
                  placeholder="8800 6006"
                  value={bookingData.phone}
                  onChange={(e) => {
                    updateBookingData({ phone: e.target.value });
                    if (formErrors.phone) setFormErrors((prev) => ({ ...prev, phone: "" }));
                  }}
                  required
                  className="w-full min-w-0 text-sm sm:text-xs font-normal font-manrope text-[#071E3B] placeholder:text-[#667085] outline-none bg-transparent"
                />
              </div>
            </div>
            {hasAttemptedSubmit && formErrors.phone && (
              <span className="text-rose-600 text-[11px] font-medium font-manrope">
                {formErrors.phone}
              </span>
            )}
          </div>
        </div>

        {/* Email ID */}
        <div className="self-stretch flex flex-col justify-start items-start gap-1">
          <label className="text-[#071E3B] text-xs sm:text-sm font-medium font-inter leading-5">
            Email ID (For Confirmation Invoice) <span className="text-rose-500">*</span>
          </label>
          <div
            className={`self-stretch p-3 sm:p-3.5 bg-white rounded-xl border ${
              hasAttemptedSubmit && formErrors.email ? "border-rose-500 ring-1 ring-rose-500" : "border-[#7A8593]"
            } flex justify-start items-center overflow-hidden focus-within:border-[#C6A45A] focus-within:ring-1 focus-within:ring-[#C6A45A] transition-all`}
          >
            <input
              type="email"
              placeholder="Sample@example.com"
              value={bookingData.email}
              onChange={(e) => {
                updateBookingData({ email: e.target.value });
                if (formErrors.email) setFormErrors((prev) => ({ ...prev, email: "" }));
              }}
              required
              className="w-full text-sm sm:text-xs font-normal font-manrope text-[#071E3B] placeholder:text-[#667085] outline-none bg-transparent"
            />
          </div>
          {hasAttemptedSubmit && formErrors.email && (
            <span className="text-rose-600 text-[11px] font-medium font-manrope">
              {formErrors.email}
            </span>
          )}
        </div>

        {/* Disclaimer */}
        <div className="self-stretch text-center text-[#5F6B7A] text-[11px] sm:text-xs font-normal font-manrope">
          Singapore trips only — cross-border rides to Malaysia not available.
        </div>

        {/* Action Buttons: Back & Continue */}
        <div className="self-stretch flex items-center gap-2.5 sm:gap-3 w-full">
          <button
            type="button"
            onClick={() => setStep(2)}
            className="px-3.5 sm:px-6 py-3 sm:py-3.5 bg-[#E9ECEF] hover:bg-slate-200 active:scale-95 rounded-xl flex items-center justify-center gap-1.5 sm:gap-2 transition-colors cursor-pointer text-[#5F6B7A] text-xs sm:text-base font-bold font-manrope shrink-0"
          >
            <ArrowLeft className="w-4 h-4 text-[#5F6B7A]" />
            <span>Back</span>
          </button>
          <button
            type="submit"
            className="flex-1 min-w-0 py-3 sm:py-3.5 px-3 sm:px-6 bg-[#071E3B] hover:bg-[#0B2A4A] active:scale-98 text-white rounded-xl flex items-center justify-center gap-2 sm:gap-3 transition-all shadow-md hover:shadow-lg cursor-pointer group text-xs sm:text-base font-bold font-manrope whitespace-nowrap"
          >
            <span className="text-white">
              Review Itinerary
            </span>
            <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform shrink-0" />
          </button>
        </div>

        {/* Sub Links */}
        <div className="self-stretch flex flex-wrap justify-between items-center gap-2 pt-1">
          <Link
            href="/pricing"
            onClick={closeModal}
            className="flex justify-start items-center gap-1 group transition-colors"
          >
            <span className="text-[#667085] group-hover:text-[#071E3B] text-xs sm:text-sm font-normal font-manrope leading-5">
              View all prices
            </span>
            <ChevronDown className="w-3.5 h-3.5 -rotate-90 text-[#667085] group-hover:text-[#071E3B]" />
          </Link>
          <a
            href="https://wa.me/6588006006"
            target="_blank"
            rel="noopener noreferrer"
            className="flex justify-start items-center gap-1.5 group transition-colors"
          >
            <span className="text-[#16803C] group-hover:text-emerald-700 text-xs sm:text-sm font-bold font-manrope leading-5">
              WhatsApp Us
            </span>
            <WhatsAppIcon className="w-3.5 h-3.5 text-[#16803C]" />
          </a>
        </div>
      </form>
    </div>
  );
}

