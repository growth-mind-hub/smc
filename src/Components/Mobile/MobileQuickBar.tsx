"use client";

import React from "react";
import { Phone, ArrowRight } from "lucide-react";
import { useBookingModal } from "@/context/BookingContext";
import WhatsAppIcon from "@/Components/Shared/WhatsAppIcon";

export default function MobileQuickBar() {
  const { openModal, isModalOpen } = useBookingModal();

  // Hide when modal is open to avoid clutter
  if (isModalOpen) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 p-2.5 px-3 bg-[#071E3B]/95 backdrop-blur-lg border-t border-[#C6A45A]/30 shadow-[0_-4px_20px_rgba(0,0,0,0.25)] pb-[calc(env(safe-area-inset-bottom)+10px)] transition-all">
      <div className="flex items-center gap-2 max-w-lg mx-auto">
        {/* Quick Call Button */}
        <a
          href="tel:+6588006006"
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 bg-white/10 hover:bg-white/20 active:scale-95 text-white rounded-xl text-xs font-semibold font-manrope transition-all border border-white/10"
          aria-label="Call Singapore Maxi Cab"
        >
          <Phone className="w-3.5 h-3.5 text-[#C6A45A]" />
          <span>Call Hotline</span>
        </a>

        {/* Quick WhatsApp Button */}
        <a
          href="https://wa.me/6588006006"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-semibold font-manrope transition-all shadow-sm"
          aria-label="WhatsApp Singapore Maxi Cab"
        >
          <WhatsAppIcon className="w-3.5 h-3.5" />
          <span>WhatsApp</span>
        </a>

        {/* Quick Book Modal Button */}
        <button
          type="button"
          onClick={() => openModal({ initialStep: 0 })}
          className="flex-[1.2] flex items-center justify-center gap-1.5 py-2.5 px-3 bg-gradient-to-r from-[#C6A45A] to-[#B58E45] active:scale-95 text-[#071E3B] rounded-xl text-xs font-extrabold font-manrope transition-all shadow-md cursor-pointer"
          aria-label="Book Maxi Cab Now"
        >
          <span>Book Now</span>
          <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
        </button>
      </div>
    </div>
  );
}
