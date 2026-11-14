import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Phone } from "lucide-react";
import WhatsAppIcon from "@/Components/Shared/WhatsAppIcon";

export default function Footer() {
  const footerData = {
    brand: {
      name: "SINGAPORE MAXICABS",
      description:
        "Airport transfers, corporate transport, and comfortable rides across Singapore with fixed flat rates.",
      whatsappHref: "https://wa.me/6588006006",
    },
    columns: [
      {
        title: "FLEET",
        links: [
          { label: "6-Seater Maxi Cab", href: "/fleets/6-seater" },
          { label: "7-Seater Maxi Cab", href: "/fleets/7-seater" },
          { label: "9-Seater Maxi Cab", href: "/fleets/9-seater" },
          { label: "13-Seater Minibus", href: "/fleets/13-seater" },
          { label: "Wheelchair Cab", href: "/fleets/wheelchair-cab" },
          { label: "VIP Lounge", href: "/fleets/vip-lounge" },
        ],
      },
      {
        title: "MAXI CAB TYPE",
        links: [
          { label: "6-Seater Maxi Cab", href: "/fleets/6-seater" },
          { label: "7-Seater Maxi Cab", href: "/fleets/7-seater" },
          { label: "9-Seater Maxi Cab", href: "/fleets/9-seater" },
          { label: "13-Seater Minibus", href: "/fleets/13-seater" },
          { label: "Wheelchair Maxi Cab", href: "/fleets/wheelchair-cab" },
          { label: "Executive Minibus", href: "/fleets/13-seater" },
        ],
      },
      {
        title: "SERVICES",
        links: [
          { label: "Airport Transfers", href: "/services/airport-transfers" },
          { label: "VIP Limousine & Chauffeur", href: "/services/vip-delegate-limousine" },
          { label: "City Tours & Sightseeing", href: "/services/city-tours-sightseeing" },
          { label: "Corporate Transport", href: "/services/corporate-business" },
          { label: "Weddings & Special Occasions", href: "/services/weddings-special-occasions" },
          { label: "Shipping Crew & Port Services", href: "/services/shipping-crew-agent-services" },
        ],
      },
      {
        title: "COMPANY",
        links: [
          { label: "About Us", href: "/about" },
          { label: "Contact", href: "/contact" },
          { label: "Pricing Matrix", href: "/pricing" },
          { label: "Corporate Accounts", href: "/corporate" },
          { label: "All Fleets", href: "/fleets" },
        ],
      },
    ],
  };

  return (
    <footer className="w-full bg-white text-[#5F6B7A] border-t border-[#E9ECEF] py-10 sm:py-12 px-4 sm:px-8 lg:px-12">
      <div className="max-w-[1440px] mx-auto flex flex-col gap-8 sm:gap-10">
        {/* Top Section: Brand Info + 4 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 sm:gap-10">
          {/* Brand Info Column (Span 2) */}
          <div className="lg:col-span-2 flex flex-col items-start gap-4">
            <Link href="/" className="flex items-center gap-3 group">
              <Image
                src="/app-icon.png"
                alt="Singapore Maxicabs"
                width={48}
                height={48}
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain shrink-0 group-hover:scale-105 transition-transform"
              />
              <div className="flex flex-col items-start">
                <span className="text-xs sm:text-sm font-extrabold text-[#071E3B] uppercase tracking-[2px] sm:tracking-[2.64px] font-manrope leading-tight">
                  {footerData.brand.name}
                </span>
                <span className="text-[10px] text-[#C6A45A] font-semibold uppercase tracking-wider">
                  Your Preferred Chauffeurs
                </span>
              </div>
            </Link>

            <p className="text-xs sm:text-sm font-normal text-[#667085] font-manrope leading-relaxed max-w-sm">
              {footerData.brand.description}
            </p>

            {/* WhatsApp Booking Pill */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <a
                href={footerData.brand.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-[#ECFDF3] rounded-xl border border-[#16803C]/40 inline-flex items-center gap-2 text-[#16803C] text-xs sm:text-sm font-bold font-manrope hover:bg-emerald-100 transition-colors active:scale-95"
              >
                <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-green-600 to-green-400 flex items-center justify-center text-white">
                  <WhatsAppIcon className="w-2.5 h-2.5" />
                </div>
                <span>WhatsApp Booking</span>
              </a>

              <a
                href="tel:+6588006006"
                className="px-3.5 py-2 bg-slate-100 rounded-xl border border-slate-200 inline-flex items-center gap-2 text-[#071E3B] text-xs sm:text-sm font-semibold font-manrope hover:bg-slate-200 transition-colors active:scale-95"
              >
                <Phone className="w-3.5 h-3.5 text-[#C6A45A]" />
                <span>(+65) 8800 6006</span>
              </a>
            </div>
          </div>

          {/* 4 Link Columns (2 columns per row on mobile, 4 on desktop) */}
          <div className="lg:col-span-4 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
            {footerData.columns.map((col, idx) => (
              <div key={idx} className="flex flex-col gap-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#071E3B] font-inter">
                  {col.title}
                </h4>
                <ul className="flex flex-col gap-2">
                  {col.links.map((link, lIdx) => (
                    <li key={lIdx}>
                      <Link
                        href={link.href}
                        className="text-xs sm:text-sm font-normal text-[#667085] hover:text-[#071E3B] font-manrope leading-5 transition-colors block py-0.5"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Section: Copyright + Secondary Navigation */}
        <div className="pt-4 border-t border-[#E9ECEF] flex flex-col sm:flex-row items-center justify-between text-xs sm:text-sm text-[#667085] font-normal font-manrope gap-4 text-center sm:text-left">
          <p>© 2026 Singapore Maxi Cabs • All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <Link href="/about" className="hover:text-[#071E3B] transition-colors py-1">
              About
            </Link>
            <Link href="/contact" className="hover:text-[#071E3B] transition-colors py-1">
              Contact
            </Link>
            <Link href="/services" className="hover:text-[#071E3B] transition-colors py-1">
              Services
            </Link>
            <Link href="/pricing" className="hover:text-[#071E3B] transition-colors py-1">
              Pricing
            </Link>
            <Link href="/fleets" className="hover:text-[#071E3B] transition-colors py-1">
              Fleet
            </Link>

          </div>
        </div>
      </div>
    </footer>
  );
}


