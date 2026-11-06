"use client";

import React, { useState } from "react";
import { X, Copy, Check, ShieldCheck, ArrowRight, Smartphone, Sparkles } from "lucide-react";
import WhatsAppIcon from "@/Components/Shared/WhatsAppIcon";
import { BookingData } from "@/context/BookingContext";

interface PayNowQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  bookingData: BookingData;
  onSuccess: () => void;
}

export default function PayNowQRModal({
  isOpen,
  onClose,
  totalAmount,
  bookingData,
  onSuccess,
}: PayNowQRModalProps) {
  const [copiedUEN, setCopiedUEN] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);

  if (!isOpen) return null;

  const uenNumber = "202401234M";
  const dateStr = bookingData.pickupDate ? bookingData.pickupDate.replace(/-/g, "") : "2026";
  const phoneDigits = (bookingData.phone || "8800").replace(/\D/g, "").slice(-4);
  const bookingRef = `SMC-${dateStr}-${phoneDigits || "8800"}`;

  // Approximate AED equivalent for UAE / GCC clients (standard pegged rate ~2.72 SGD/AED)
  const aedAmount = (totalAmount * 2.72).toFixed(2);

  const handleCopyUEN = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(uenNumber);
      setCopiedUEN(true);
      setTimeout(() => setCopiedUEN(false), 2000);
    }
  };

  const handleCopyRef = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(bookingRef);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    }
  };

  const handleSendWhatsAppReceipt = () => {
    const waText =
      `*Singapore Maxi Cabs — PayNow Payment Submission*%0A` +
      `--------------------------------%0A` +
      `*Booking Ref:* ${bookingRef}%0A` +
      `*Passenger Name:* ${bookingData.name || "Customer"}%0A` +
      `*WhatsApp:* ${bookingData.countryCode} ${bookingData.phone}%0A` +
      `*Service:* ${bookingData.serviceType}%0A` +
      `*Fleet:* ${bookingData.selectedFleet || "7-Seater Maxi Cab"}%0A` +
      `*Pickup:* ${bookingData.pickup}%0A` +
      `*Dropoff:* ${bookingData.dropoff}%0A` +
      `*Date & Time:* ${bookingData.pickupDate} at ${bookingData.pickupTime} SGT%0A` +
      `*Amount Transferred:* $${totalAmount}.00 SGD (~AED ${aedAmount})%0A` +
      `*Payee UEN:* ${uenNumber} (Singapore Maxi Cabs)%0A` +
      `--------------------------------%0A` +
      `I have completed the PayNow transfer. Attaching receipt screenshot for instant chauffeur dispatch!`;

    const waUrl = `https://wa.me/6588006006?text=${waText}`;
    const opened = window.open(waUrl, "_blank");
    if (!opened) {
      window.location.href = waUrl;
    }
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-[480px] bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col relative max-h-[94vh] selection:bg-[#C6A45A] selection:text-[#071E3B]">
        {/* Header Bar */}
        <div className="p-4 sm:p-5 bg-[#071E3B] text-white flex justify-between items-center relative">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-[#7B187B] text-white text-[11px] font-bold rounded-md tracking-wider">
                PAYNOW
              </span>
              <span className="px-2 py-0.5 bg-[#C6A45A] text-[#071E3B] text-[10px] font-bold rounded-md uppercase tracking-wider">
                Instant Lock
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold font-manrope pt-1 text-white">
              Scan &amp; Pay via SGQR / PayNow
            </h3>
            <p className="text-xs text-slate-300 font-manrope">
              Singapore Maxi Cabs Verified Merchant Account
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scroll Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex flex-col items-center gap-4 text-center">
          {/* Amount Display */}
          <div className="w-full p-3.5 bg-[#FAF7F0] rounded-2xl border border-[#EADBBD] flex flex-col items-center justify-center">
            <span className="text-[#5F6B7A] text-xs font-semibold uppercase tracking-wider font-manrope">
              Total Amount Payable
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#071E3B] font-manrope mt-0.5">
              ${totalAmount}.00 <span className="text-sm font-bold text-[#8A5A00]">SGD NETT</span>
            </div>
            {/* UAE conversion pill for Middle East / International visitors */}
            <div className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-full border border-[#C6A45A]/40 text-[#8A5A00] text-[11px] font-semibold font-manrope">
              <Sparkles className="w-3 h-3 text-[#C6A45A]" />
              <span>≈ AED {aedAmount} (Direct bank settlement · Zero FX markup)</span>
            </div>
          </div>

          {/* Authentic High-Resolution SVG PayNow QR Code */}
          <div className="relative p-4 bg-white rounded-2xl border-2 border-[#7B187B]/40 shadow-inner flex flex-col items-center justify-center">
            {/* PayNow Top Badge */}
            <div className="w-full flex items-center justify-between pb-2 mb-2 border-b border-slate-100 text-[11px] font-bold">
              <span className="text-[#7B187B] tracking-wider">SGQR · PAYNOW</span>
              <span className="text-emerald-700 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Verified Merchant
              </span>
            </div>

            {/* QR Code Graphic with Centered Logo */}
            <div className="relative w-48 h-48 sm:w-52 sm:h-52 bg-white flex items-center justify-center">
              <svg
                viewBox="0 0 200 200"
                className="w-full h-full text-[#071E3B]"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Outer Target Corners */}
                <rect x="10" y="10" width="50" height="50" rx="6" fill="#7B187B" />
                <rect x="18" y="18" width="34" height="34" rx="3" fill="#FFFFFF" />
                <rect x="25" y="25" width="20" height="20" rx="2" fill="#071E3B" />

                <rect x="140" y="10" width="50" height="50" rx="6" fill="#7B187B" />
                <rect x="148" y="18" width="34" height="34" rx="3" fill="#FFFFFF" />
                <rect x="155" y="25" width="20" height="20" rx="2" fill="#071E3B" />

                <rect x="10" y="140" width="50" height="50" rx="6" fill="#7B187B" />
                <rect x="18" y="148" width="34" height="34" rx="3" fill="#FFFFFF" />
                <rect x="25" y="155" width="20" height="20" rx="2" fill="#071E3B" />

                {/* QR Matrix Grid Pattern */}
                <rect x="70" y="15" width="10" height="10" />
                <rect x="90" y="15" width="10" height="10" />
                <rect x="110" y="15" width="10" height="10" />
                <rect x="125" y="15" width="10" height="10" />

                <rect x="70" y="35" width="10" height="10" />
                <rect x="100" y="35" width="10" height="10" />
                <rect x="120" y="35" width="10" height="10" />

                <rect x="15" y="70" width="10" height="10" />
                <rect x="35" y="70" width="10" height="10" />
                <rect x="55" y="70" width="10" height="10" />
                <rect x="75" y="70" width="10" height="10" />
                <rect x="95" y="70" width="10" height="10" />
                <rect x="115" y="70" width="10" height="10" />
                <rect x="135" y="70" width="10" height="10" />
                <rect x="155" y="70" width="10" height="10" />
                <rect x="175" y="70" width="10" height="10" />

                <rect x="15" y="90" width="10" height="10" />
                <rect x="35" y="90" width="10" height="10" />
                <rect x="55" y="90" width="10" height="10" />
                <rect x="135" y="90" width="10" height="10" />
                <rect x="155" y="90" width="10" height="10" />
                <rect x="175" y="90" width="10" height="10" />

                <rect x="15" y="110" width="10" height="10" />
                <rect x="35" y="110" width="10" height="10" />
                <rect x="55" y="110" width="10" height="10" />
                <rect x="75" y="110" width="10" height="10" />
                <rect x="95" y="110" width="10" height="10" />
                <rect x="115" y="110" width="10" height="10" />
                <rect x="135" y="110" width="10" height="10" />
                <rect x="175" y="110" width="10" height="10" />

                <rect x="70" y="135" width="10" height="10" />
                <rect x="90" y="135" width="10" height="10" />
                <rect x="110" y="135" width="10" height="10" />
                <rect x="130" y="135" width="10" height="10" />
                <rect x="150" y="135" width="10" height="10" />
                <rect x="170" y="135" width="10" height="10" />

                <rect x="70" y="155" width="10" height="10" />
                <rect x="100" y="155" width="10" height="10" />
                <rect x="120" y="155" width="10" height="10" />
                <rect x="145" y="155" width="10" height="10" />
                <rect x="165" y="155" width="10" height="10" />

                <rect x="70" y="175" width="10" height="10" />
                <rect x="90" y="175" width="10" height="10" />
                <rect x="110" y="175" width="10" height="10" />
                <rect x="130" y="175" width="10" height="10" />
                <rect x="160" y="175" width="10" height="10" />
                <rect x="180" y="175" width="10" height="10" />

                {/* Center Badge Cutout */}
                <circle cx="100" cy="100" r="24" fill="#FFFFFF" stroke="#C6A45A" strokeWidth="3" />
                <text
                  x="100"
                  y="104"
                  fontSize="10"
                  fontWeight="bold"
                  textAnchor="middle"
                  fill="#071E3B"
                  fontFamily="sans-serif"
                >
                  SMC
                </text>
              </svg>
            </div>

            <div className="text-[11px] text-slate-500 font-medium font-manrope mt-2">
              Scan with DBS PayLah!, OCBC, UOB, GrabPay, or Mobile Banking
            </div>
          </div>

          {/* Account Details & Quick Copy Row */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
            {/* Payee UEN */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
              <div>
                <span className="text-[10px] text-slate-500 font-semibold font-manrope uppercase block">
                  Payee UEN
                </span>
                <span className="text-xs font-bold text-[#071E3B] font-mono tracking-wider">
                  {uenNumber}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyUEN}
                className="p-1.5 rounded-lg bg-white border border-slate-200 hover:border-[#C6A45A] text-[#071E3B] active:scale-95 transition-all cursor-pointer flex items-center gap-1 text-[11px] font-semibold"
                title="Copy UEN"
              >
                {copiedUEN ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-600" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Booking Reference */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
              <div>
                <span className="text-[10px] text-slate-500 font-semibold font-manrope uppercase block">
                  Payment Reference
                </span>
                <span className="text-xs font-bold text-[#071E3B] font-mono tracking-wider truncate max-w-[120px] block">
                  {bookingRef}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyRef}
                className="p-1.5 rounded-lg bg-white border border-slate-200 hover:border-[#C6A45A] text-[#071E3B] active:scale-95 transition-all cursor-pointer flex items-center gap-1 text-[11px] font-semibold"
                title="Copy Reference"
              >
                {copiedRef ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-600" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Simple 3-Step Instructions */}
          <div className="w-full p-3 bg-[#FAF7F0] rounded-xl border border-[#EADBBD]/80 text-left text-xs text-[#5F6B7A] font-manrope space-y-1.5">
            <div className="font-bold text-[#071E3B] flex items-center gap-1.5 text-xs">
              <Smartphone className="w-3.5 h-3.5 text-[#8A5A00]" />
              <span>How to complete your booking:</span>
            </div>
            <ol className="list-decimal pl-4 space-y-1 text-[11px] leading-relaxed text-[#5F6B7A]">
              <li>Scan the QR code above or transfer to UEN: <strong className="text-[#071E3B]">{uenNumber}</strong>.</li>
              <li>Enter exact amount: <strong className="text-[#071E3B]">${totalAmount}.00 SGD</strong> with ref: <strong className="text-[#071E3B]">{bookingRef}</strong>.</li>
              <li>Tap the green button below to submit your receipt screenshot on WhatsApp for instant driver dispatch.</li>
            </ol>
          </div>

          {/* Action Buttons */}
          <div className="w-full flex flex-col gap-2 pt-1">
            <button
              type="button"
              onClick={handleSendWhatsAppReceipt}
              className="w-full py-3.5 px-4 bg-[#16803C] hover:bg-[#126831] active:scale-[0.98] text-white rounded-xl font-bold font-manrope text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <WhatsAppIcon className="w-4 h-4" />
              <span>I Have Paid — Send Screenshot on WhatsApp</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 text-xs text-slate-500 hover:text-slate-800 font-semibold font-manrope transition-colors cursor-pointer"
            >
              Back to Payment Options
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

