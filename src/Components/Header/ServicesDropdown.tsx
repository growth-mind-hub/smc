"use client";

import React from "react";
import Link from "next/link";
import {
  Plane,
  Briefcase,
  Heart,
  Users,
  Clock,
  Accessibility,
  Crown,
  Anchor,
  Flag,
  Building2,
  Compass,
  MapPin,
  ArrowRight,
} from "lucide-react";
import servicesData from "@/data/services.json";

interface ServicesDropdownProps {
  onItemClick?: () => void;
}

export default function ServicesDropdown({ onItemClick }: ServicesDropdownProps) {
  const getServiceIcon = (iconName: string) => {
    switch (iconName) {
      case "Plane":
        return <Plane className="w-5 h-5 text-[#C6A45A]" strokeWidth={1.5} />;
      case "Briefcase":
        return <Briefcase className="w-5 h-5 text-[#C6A45A]" />;
      case "Sparkles":
      case "Heart":
        return <Heart className="w-5 h-5 text-[#C6A45A]" />;
      case "Users":
        return <Users className="w-5 h-5 text-[#C6A45A]" />;
      case "Clock":
        return <Clock className="w-5 h-5 text-[#C6A45A]" />;
      case "HeartHandshake":
      case "Accessibility":
        return <Accessibility className="w-5 h-5 text-[#C6A45A]" />;
      case "Crown":
        return <Crown className="w-5 h-5 text-[#C6A45A]" />;
      case "Anchor":
        return <Anchor className="w-5 h-5 text-[#C6A45A]" />;
      case "Flag":
        return <Flag className="w-5 h-5 text-[#C6A45A]" />;
      case "Building2":
        return <Building2 className="w-5 h-5 text-[#C6A45A]" />;
      case "Compass":
        return <Compass className="w-5 h-5 text-[#C6A45A]" />;
      case "MapPin":
        return <MapPin className="w-5 h-5 text-[#C6A45A]" />;
      default:
        return <Plane className="w-5 h-5 text-[#C6A45A]" strokeWidth={1.5} />;
    }
  };

  return (
    <div className="w-[360px] sm:w-[504px] overflow-hidden bg-white rounded-2xl shadow-2xl border border-slate-200/90 flex flex-col z-50">
      {/* Scrollable Services List */}
      <div className="max-h-[360px] sm:max-h-[380px] overflow-y-auto p-2 sm:p-3 flex flex-col divide-y divide-slate-100">
        {servicesData.services.map((item) => (
          <Link
            key={item.id}
            href={`/services/${item.slug}`}
            onClick={onItemClick}
            className="p-3 sm:p-3.5 rounded-xl flex items-center gap-3.5 hover:bg-[#FBF7EC] active:scale-[0.99] transition-all group"
          >
            <div className="w-11 h-11 shrink-0 rounded-xl bg-[#FBF7EC] border border-[#F4EAD1] flex items-center justify-center group-hover:scale-105 transition-transform">
              {getServiceIcon(item.icon)}
            </div>
            <div className="flex flex-col items-start gap-0.5">
              <span className="text-[#071E3B] text-sm sm:text-base font-semibold font-manrope leading-snug group-hover:text-[#C6A45A] transition-colors line-clamp-1">
                {item.title}
              </span>
              <span className="text-[#667085] text-xs font-normal font-manrope leading-4 line-clamp-1">
                {item.subtitle}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Sticky Bottom Footer: View All Services */}
      <div className="p-2.5 sm:p-3 bg-[#FBF7EC] border-t border-[#C6A45A]/25 rounded-b-2xl shrink-0">
        <Link
          href="/services"
          onClick={onItemClick}
          className="w-full py-2.5 px-4 rounded-xl bg-[#071E3B] hover:bg-[#0B2A4A] active:scale-[0.99] text-white flex items-center justify-between text-xs sm:text-sm font-bold font-manrope transition-all shadow-sm group"
        >
          <span className="flex items-center gap-2">
            <span>View All Services</span>
            <span className="text-[11px] font-normal text-[#C6A45A]">
              • Explore All Options
            </span>
          </span>
          <ArrowRight className="w-4 h-4 text-[#C6A45A] group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
