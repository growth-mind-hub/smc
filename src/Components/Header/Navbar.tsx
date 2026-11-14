"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import navData from "@/data/navigation.json";
import { ArrowRight, Menu, X, Phone, ShieldCheck, ChevronDown } from "lucide-react";
import { useBookingModal } from "@/context/BookingContext";
import WhatsAppIcon from "@/Components/Shared/WhatsAppIcon";
import FleetsDropdown from "./FleetsDropdown";
import ServicesDropdown from "./ServicesDropdown";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<"fleets" | "services" | null>(null);
  const [mobileExpandedSection, setMobileExpandedSection] = useState<"fleets" | "services" | null>(null);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { openModal } = useBookingModal();

  const handleMouseEnter = (menu: "fleets" | "services") => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setActiveDropdown(menu);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 180);
  };

  useEffect(() => {
    return () => {
      if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full h-16 sm:h-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-[1440px] mx-auto h-full px-4 sm:px-8 lg:px-12 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group">
          <Image
            src="/app-icon.png"
            alt="Singapore Maxicabs"
            width={48}
            height={48}
            className="w-9 h-9 sm:w-11 sm:h-11 object-contain shrink-0 group-hover:scale-105 transition-transform"
            priority
          />
          <div className="flex flex-col items-start">
            <span className="text-xs sm:text-[13px] font-extrabold text-[#071E3B] uppercase tracking-[1.5px] sm:tracking-[2.2px] font-manrope leading-tight">
              {navData.brand.name}
            </span>
            <span className="text-[9px] sm:text-[10px] text-[#C6A45A] tracking-wider uppercase font-semibold">
              Your Preferred Chauffeurs
            </span>
          </div>
        </Link>

        {/* Center Desktop Links */}
        <nav className="hidden lg:flex items-center gap-8 xl:gap-10">
          {navData.navLinks.map((item) => {
            const isFleets = item.label.toLowerCase().includes("fleet");
            const isServices = item.label.toLowerCase().includes("service");

            if (isFleets) {
              return (
                <div
                  key={item.label}
                  className="relative py-6"
                  onMouseEnter={() => handleMouseEnter("fleets")}
                  onMouseLeave={handleMouseLeave}
                >
                  <Link
                    href={item.href}
                    className="flex items-center gap-1.5 text-sm font-semibold uppercase text-[#071E3B] hover:text-[#C6A45A] tracking-normal transition-colors"
                  >
                    <span>{item.label}</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        activeDropdown === "fleets" ? "rotate-180 text-[#C6A45A]" : ""
                      }`}
                    />
                  </Link>

                  {/* Dropdown Menu */}
                  {activeDropdown === "fleets" && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 animate-in fade-in slide-in-from-top-1 duration-150">
                      <FleetsDropdown onItemClick={() => setActiveDropdown(null)} />
                    </div>
                  )}
                </div>
              );
            }

            if (isServices) {
              return (
                <div
                  key={item.label}
                  className="relative py-6"
                  onMouseEnter={() => handleMouseEnter("services")}
                  onMouseLeave={handleMouseLeave}
                >
                  <Link
                    href={item.href}
                    className="flex items-center gap-1.5 text-sm font-semibold uppercase text-[#071E3B] hover:text-[#C6A45A] tracking-normal transition-colors"
                  >
                    <span>{item.label}</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        activeDropdown === "services" ? "rotate-180 text-[#C6A45A]" : ""
                      }`}
                    />
                  </Link>

                  {/* Dropdown Menu */}
                  {activeDropdown === "services" && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 animate-in fade-in slide-in-from-top-1 duration-150">
                      <ServicesDropdown onItemClick={() => setActiveDropdown(null)} />
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm font-semibold uppercase text-[#071E3B] hover:text-[#C6A45A] tracking-normal transition-colors"
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right CTAs Desktop */}
        <div className="hidden sm:flex items-center gap-4 lg:gap-5">
          {/* WhatsApp Booking */}
          <a
            href={navData.whatsappButton.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-emerald-50 border border-emerald-200/60 hover:bg-emerald-100/70 transition-all text-[#16803C] text-sm font-semibold"
          >
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#1FAF38] to-[#60D669] flex items-center justify-center text-white shadow-xs">
              <WhatsAppIcon className="w-3.5 h-3.5" />
            </div>
            <span>{navData.whatsappButton.label}</span>
          </a>

          {/* Book Now button triggering modal */}
          <button
            type="button"
            onClick={() => openModal({ initialStep: 0 })}
            className="flex items-center gap-3 px-6 lg:px-7 py-2.5 rounded-lg bg-[#071E3B] hover:bg-[#0B2A4A] text-white text-sm lg:text-base font-semibold transition-all shadow-sm hover:shadow cursor-pointer"
          >
            <span>{navData.bookButton.label}</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Mobile Action Buttons (Right) */}
        <div className="flex sm:hidden items-center gap-2">
          {/* Quick WhatsApp Mini Button */}
          <a
            href={navData.whatsappButton.href}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/70 flex items-center justify-center text-emerald-600 active:scale-95 transition-all"
            aria-label="WhatsApp"
          >
            <WhatsAppIcon className="w-5 h-5" />
          </a>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-[#071E3B] active:scale-95 transition-all cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-16 bg-white/98 backdrop-blur-xl border-b border-slate-200 px-5 py-6 space-y-4 shadow-2xl z-50 max-h-[85vh] overflow-y-auto animate-in slide-in-from-top-2 duration-200">
          <div className="space-y-1">
            {navData.navLinks.map((item) => {
              const isFleets = item.label.toLowerCase().includes("fleet");
              const isServices = item.label.toLowerCase().includes("service");

              if (isFleets) {
                return (
                  <div key={item.label} className="flex flex-col">
                    <button
                      type="button"
                      onClick={() =>
                        setMobileExpandedSection(mobileExpandedSection === "fleets" ? null : "fleets")
                      }
                      className="w-full flex items-center justify-between py-3 px-3 rounded-xl text-base font-bold uppercase text-[#071E3B] hover:bg-[#FBF7EC] hover:text-[#C6A45A] transition-colors"
                    >
                      <span>{item.label}</span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          mobileExpandedSection === "fleets" ? "rotate-180 text-[#C6A45A]" : ""
                        }`}
                      />
                    </button>
                    {mobileExpandedSection === "fleets" && (
                      <div className="pl-2 pb-2">
                        <FleetsDropdown
                          onItemClick={() => {
                            setMobileMenuOpen(false);
                            setMobileExpandedSection(null);
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              }

              if (isServices) {
                return (
                  <div key={item.label} className="flex flex-col">
                    <button
                      type="button"
                      onClick={() =>
                        setMobileExpandedSection(mobileExpandedSection === "services" ? null : "services")
                      }
                      className="w-full flex items-center justify-between py-3 px-3 rounded-xl text-base font-bold uppercase text-[#071E3B] hover:bg-[#FBF7EC] hover:text-[#C6A45A] transition-colors"
                    >
                      <span>{item.label}</span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          mobileExpandedSection === "services" ? "rotate-180 text-[#C6A45A]" : ""
                        }`}
                      />
                    </button>
                    {mobileExpandedSection === "services" && (
                      <div className="pl-2 pb-2">
                        <ServicesDropdown
                          onItemClick={() => {
                            setMobileMenuOpen(false);
                            setMobileExpandedSection(null);
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-3 px-3 rounded-xl text-base font-bold uppercase text-[#071E3B] hover:bg-[#FBF7EC] hover:text-[#C6A45A] transition-colors"
                >
                  <span>{item.label}</span>
                  <ArrowRight className="w-4 h-4 opacity-40" />
                </Link>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
            <a
              href={navData.whatsappButton.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[#16803C] text-sm font-bold shadow-xs active:scale-98 transition-all"
            >
              <WhatsAppIcon className="w-4 h-4" />
              <span>Chat via WhatsApp (+65 8800 6006)</span>
            </a>

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                openModal({ initialStep: 0 });
              }}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl bg-[#071E3B] hover:bg-[#0B2A4A] text-white text-base font-bold shadow-md cursor-pointer active:scale-98 transition-all"
            >
              <span>{navData.bookButton.label}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>

            <div className="pt-2 flex items-center justify-center gap-4 text-xs text-[#667085] font-medium">
              <a href="tel:+6588006006" className="inline-flex items-center gap-1.5 hover:text-[#071E3B]">
                <Phone className="w-3.5 h-3.5 text-[#C6A45A]" />
                <span>Call Hotline</span>
              </a>
              <span>•</span>
              <span className="inline-flex items-center gap-1 text-[#16803C]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Fixed Flat Rates</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

