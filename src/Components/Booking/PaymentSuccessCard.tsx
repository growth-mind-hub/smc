"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react";
import { useBookingModal } from "@/context/BookingContext";
import WhatsAppIcon from "@/Components/Shared/WhatsAppIcon";

interface PaymentSuccessCardProps {
  title?: string;
  bookingId?: string;
  customerName?: string;
  amount?: number | string;
  currency?: string;
  className?: string;
}

export default function PaymentSuccessCard({
  title = "Booking & Payment Confirmed",
  bookingId,
  customerName,
  amount,
  currency = "SGD",
  className = "",
}: PaymentSuccessCardProps) {
  const { bookingData, resetBooking } = useBookingModal();

  const [resolvedBookingId, setResolvedBookingId] = useState<string>(bookingId || "");
  const [resolvedAmount, setResolvedAmount] = useState<string>(amount ? String(amount) : "");

  useEffect(() => {
    if (!resolvedBookingId && typeof window !== "undefined") {
      const storedId = sessionStorage.getItem("last_booking_id");
      if (storedId) setResolvedBookingId(storedId);

      const storedAmt = sessionStorage.getItem("last_booking_amount");
      if (storedAmt && !resolvedAmount) setResolvedAmount(storedAmt);
    }
  }, [resolvedBookingId, resolvedAmount]);

  const displayName = customerName || bookingData?.name?.trim() || "Valued Customer";
  const displayBookingId = resolvedBookingId || "CONFIRMED";

  const whatsappMessage = encodeURIComponent(
    `Hi Singapore Maxicabs! I just completed my Stripe payment for Booking Reference: ${displayBookingId} (${displayName}). Could you please share the driver dispatch details when ready? Thank you!`
  );
  const whatsappUrl = `https://wa.me/6588006006?text=${whatsappMessage}`;

  return (
    <div
      className={`w-full max-w-[633px] p-6 sm:p-10 bg-white rounded-2xl shadow-[0px_4px_24px_rgba(0,0,0,0.06)] border border-[#E9ECEF] flex flex-col justify-start items-center overflow-hidden transition-all duration-200 selection:bg-[#C6A45A] selection:text-[#071E3B] ${className}`}
    >
      <div className="w-full py-2 sm:py-4 flex flex-col justify-start items-center gap-6 sm:gap-7">
        {/* Success Icon Circle */}
        <div className="w-20 h-20 rounded-full bg-[#E8F8EE] border border-[#22C55E]/30 flex items-center justify-center text-[#16803C] shadow-xs shrink-0 animate-in fade-in zoom-in duration-300">
          <div className="w-12 h-12 rounded-full bg-emerald-100/70 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 stroke-[2.5] text-[#16803C]" />
          </div>
        </div>

        {/* Title & Description */}
        <div className="w-full max-w-md flex flex-col items-center text-center gap-2">
          <span className="text-[#C6A45A] text-xs font-bold font-manrope uppercase tracking-widest">
            PAYMENT SUCCESSFUL
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#071E3B] font-manrope tracking-tight leading-tight">
            {title}
          </h2>
          <p className="text-sm sm:text-base text-[#5F6B7A] font-normal font-manrope leading-relaxed">
            Thank you, <span className="font-semibold text-[#071E3B]">{displayName}</span>! Your payment was processed securely via Stripe. A driver will be assigned and dispatch confirmation sent via WhatsApp.
          </p>
        </div>

        {/* Booking Reference Card */}
        <div className="w-full max-w-md p-4 sm:p-5 rounded-xl bg-[#FBF7EC] border border-[#F4EAD1] text-left text-xs sm:text-sm space-y-2.5 text-[#071E3B] font-manrope">
          <div className="flex justify-between items-center pb-2 border-b border-[#C6A45A]/20">
            <span className="text-[#5F6B7A] font-medium">Booking Reference</span>
            <span className="font-bold text-[#071E3B] font-mono tracking-wider text-sm bg-white px-2.5 py-0.5 rounded border border-slate-200">
              {displayBookingId}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-[#5F6B7A]">Payment Status</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              PAID (Stripe)
            </span>
          </div>

          {bookingData?.selectedFleet && (
            <div className="flex justify-between items-center">
              <span className="text-[#5F6B7A]">Confirmed Vehicle</span>
              <span className="font-semibold">{bookingData.selectedFleet}</span>
            </div>
          )}

          {bookingData?.pickup && (
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#5F6B7A]">Pickup</span>
              <span className="font-medium text-right truncate max-w-[220px]">
                {bookingData.pickup}
              </span>
            </div>
          )}

          {bookingData?.dropoff && (
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#5F6B7A]">Dropoff</span>
              <span className="font-medium text-right truncate max-w-[220px]">
                {bookingData.dropoff}
              </span>
            </div>
          )}

          {resolvedAmount && (
            <div className="flex justify-between items-center pt-2 border-t border-[#C6A45A]/20 text-[#8A5A00] font-bold text-sm">
              <span>Amount Paid</span>
              <span>${resolvedAmount}.00 {currency}</span>
            </div>
          )}
        </div>

        {/* Chauffeur Guarantee Banner */}
        <div className="w-full max-w-md p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2.5 text-xs text-[#5F6B7A] font-manrope">
          <ShieldCheck className="w-4 h-4 text-[#C6A45A] shrink-0" />
          <span>
            Chauffeur meetpoint banner &amp; live vehicle registration will be dispatched via WhatsApp 30 mins prior to pickup.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="w-full max-w-sm flex flex-col items-center gap-3 pt-1">
          {/* WhatsApp Concierge CTA */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-6 rounded-lg bg-[#E8F8EE] hover:bg-[#d5f4e0] active:scale-[0.98] border border-[#16803C] text-[#16803C] text-base font-semibold font-manrope transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-xs text-center"
          >
            <WhatsAppIcon className="w-5 h-5 text-[#16803C]" />
            <span>Chat With Dispatch Team</span>
          </a>

          {/* Book Another Journey CTA */}
          <Link
            href="/book"
            onClick={() => resetBooking()}
            className="w-full py-3.5 px-6 rounded-lg bg-[#071E3B] hover:bg-[#0B2A4A] active:scale-[0.98] text-white text-base font-semibold font-manrope transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg text-center"
          >
            <span>Book Another Journey</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </Link>
        </div>
      </div>
    </div>
  );
}
