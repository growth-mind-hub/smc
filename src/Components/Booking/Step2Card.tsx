"use client";

import React, { useState } from "react";
import { useBookingModal } from "@/context/BookingContext";
import { ArrowRight, ArrowLeft, ChevronDown, X } from "lucide-react";
import Link from "next/link";
import WhatsAppIcon from "@/Components/Shared/WhatsAppIcon";
import AddOnDropdown from "./AddOns/AddOnDropdown";
import MeetAndGreetField from "./AddOns/MeetAndGreetField";
import ChildSeatField from "./AddOns/ChildSeatField";
import AdditionalStopField from "./AddOns/AdditionalStopField";
import WheelchairField from "./AddOns/WheelchairField";

interface Step2CardProps {
  isModal?: boolean;
}

export default function Step2Card({ isModal = true }: Step2CardProps) {
  const { bookingData, updateBookingData, setStep, closeModal } = useBookingModal();
  const [isAddOnDropdownOpen, setIsAddOnDropdownOpen] = useState(false);
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
    setStep(4);
  };

  const countryCodes = [
    { code: "+65", country: "SG" },
    { code: "+60", country: "MY" },
    { code: "+91", country: "IN" },
    { code: "+1", country: "US" },
    { code: "+44", country: "UK" },
    { code: "+61", country: "AU" },
    { code: "+81", country: "JP" },
    { code: "+86", country: "CN" },
    { code: "+62", country: "ID" },
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
        <div className="text-[#C6A45A] text-[11px] sm:text-xs font-bold font-manrope leading-4 uppercase tracking-wider">
          QUICK &amp; EASY BOOKING
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
              Pickup Date
            </label>
            <div className="self-stretch relative p-3 sm:p-3.5 bg-white rounded-xl border border-[#7A8593] flex justify-between items-center overflow-hidden focus-within:border-[#C6A45A] focus-within:ring-1 focus-within:ring-[#C6A45A] transition-all">
              <input
                type="date"
                value={bookingData.pickupDate}
                onChange={(e) => updateBookingData({ pickupDate: e.target.value })}
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
          </div>

          {/* Pickup Time */}
          <div className="flex flex-col justify-start items-start gap-1">
            <label className="text-[#071E3B] text-xs sm:text-sm font-medium font-inter leading-5">
              Pickup Time
            </label>
            <div className="self-stretch relative p-3 sm:p-3.5 bg-white rounded-xl border border-[#7A8593] flex justify-between items-center overflow-hidden focus-within:border-[#C6A45A] focus-within:ring-1 focus-within:ring-[#C6A45A] transition-all">
              <input
                type="time"
                value={bookingData.pickupTime}
                onChange={(e) => updateBookingData({ pickupTime: e.target.value })}
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
          </div>
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
              Passenger Name
            </label>
            <div className="self-stretch p-3 sm:p-3.5 bg-white rounded-xl border border-[#7A8593] flex justify-start items-center overflow-hidden focus-within:border-[#C6A45A] focus-within:ring-1 focus-within:ring-[#C6A45A] transition-all">
              <input
                type="text"
                placeholder="John Smith"
                value={bookingData.name}
                onChange={(e) => updateBookingData({ name: e.target.value })}
                required
                className="w-full text-sm sm:text-xs font-normal font-manrope text-[#071E3B] placeholder:text-[#667085] outline-none bg-transparent"
              />
            </div>
          </div>

          {/* WhatsApp Number */}
          <div className="flex flex-col justify-start items-start gap-1">
            <label className="text-[#071E3B] text-xs sm:text-sm font-medium font-inter leading-5">
              WhatsApp Contact
            </label>
            <div className="self-stretch flex justify-start items-center gap-1.5">
              <div className="relative shrink-0">
                <select
                  value={bookingData.countryCode}
                  onChange={(e) => updateBookingData({ countryCode: e.target.value })}
                  className="appearance-none px-2.5 py-3 sm:py-3.5 bg-white rounded-xl border border-[#7A8593] text-xs sm:text-sm font-bold font-manrope text-[#071E3B] pr-6 outline-none focus:border-[#C6A45A] cursor-pointer"
                >
                  {countryCodes.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#667085] absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <div className="flex-1 p-3 sm:p-3.5 bg-white rounded-xl border border-[#7A8593] flex justify-start items-center overflow-hidden focus-within:border-[#C6A45A] focus-within:ring-1 focus-within:ring-[#C6A45A] transition-all">
                <input
                  type="tel"
                  placeholder="8800 6006"
                  value={bookingData.phone}
                  onChange={(e) => updateBookingData({ phone: e.target.value })}
                  required
                  className="w-full text-sm sm:text-xs font-normal font-manrope text-[#071E3B] placeholder:text-[#667085] outline-none bg-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Email ID */}
        <div className="self-stretch flex flex-col justify-start items-start gap-1">
          <label className="text-[#071E3B] text-xs sm:text-sm font-medium font-inter leading-5">
            Email ID (For Confirmation Invoice)
          </label>
          <div className="self-stretch p-3 sm:p-3.5 bg-white rounded-xl border border-[#7A8593] flex justify-start items-center overflow-hidden focus-within:border-[#C6A45A] focus-within:ring-1 focus-within:ring-[#C6A45A] transition-all">
            <input
              type="email"
              placeholder="Sample@example.com"
              value={bookingData.email}
              onChange={(e) => updateBookingData({ email: e.target.value })}
              required
              className="w-full text-sm sm:text-xs font-normal font-manrope text-[#071E3B] placeholder:text-[#667085] outline-none bg-transparent"
            />
          </div>
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

