"use client";

import React from "react";
import Link from "next/link";
import servicesData from "@/data/services.json";
import {
  Plane,
  Briefcase,
  Sparkles,
  Users,
  Clock,
  HeartHandshake,
  Crown,
  Anchor,
  Flag,
  Building2,
  Compass,
  MapPin,
  ArrowRight,
} from "lucide-react";

interface ServicesSectionProps {
  isPage?: boolean;
}

export default function ServicesSection({ isPage = false }: ServicesSectionProps) {
  const getServiceIcon = (iconName: string) => {
    switch (iconName) {
      case "Plane":
        return <Plane className="w-6 h-6 text-[#123F6B]" strokeWidth={1.5} />;
      case "Briefcase":
        return <Briefcase className="w-6 h-6 text-[#123F6B]" />;
      case "Sparkles":
        return <Sparkles className="w-6 h-6 text-[#123F6B]" />;
      case "Users":
        return <Users className="w-6 h-6 text-[#123F6B]" />;
      case "Clock":
        return <Clock className="w-6 h-6 text-[#123F6B]" />;
      case "HeartHandshake":
        return <HeartHandshake className="w-6 h-6 text-[#123F6B]" />;
      case "Crown":
        return <Crown className="w-6 h-6 text-[#123F6B]" />;
      case "Anchor":
        return <Anchor className="w-6 h-6 text-[#123F6B]" />;
      case "Flag":
        return <Flag className="w-6 h-6 text-[#123F6B]" />;
      case "Building2":
        return <Building2 className="w-6 h-6 text-[#123F6B]" />;
      case "Compass":
        return <Compass className="w-6 h-6 text-[#123F6B]" />;
      case "MapPin":
        return <MapPin className="w-6 h-6 text-[#123F6B]" />;
      default:
        return <Plane className="w-6 h-6 text-[#123F6B]" strokeWidth={1.5} />;
    }
  };

  return (
    <section id="services" className="w-full px-4 sm:px-8 lg:px-12 py-12 sm:py-20 flex flex-col justify-start items-center gap-10 sm:gap-14 bg-white selection:bg-[#C6A45A] selection:text-[#071E3B]">
      {/* Header (shown when on homepage or not isPage) */}
      {!isPage && (
        <div className="self-stretch flex flex-col justify-start items-center gap-3 sm:gap-4">
          <div className="w-full max-w-[760px] flex flex-col justify-start items-center gap-2 sm:gap-3">
            <span className="self-stretch text-center justify-center text-[#C6A45A] text-xs sm:text-sm font-bold font-manrope uppercase leading-4 tracking-wide">
              {servicesData.badge}
            </span>
            <h2 className="self-stretch text-center justify-center text-[#071E3B] text-2xl sm:text-4xl lg:text-5xl font-bold font-manrope leading-tight">
              {servicesData.title}
            </h2>
          </div>
          <div className="w-full max-w-[760px] flex flex-col justify-start items-center">
            <p className="self-stretch text-center justify-center text-[#667085] text-sm sm:text-base font-normal font-manrope leading-relaxed">
              {servicesData.subtitle}
            </p>
          </div>
        </div>
      )}

      {/* 2-Column Grid matching servicepagedesign.html */}
      <div className="w-full max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 xl:gap-10 items-stretch">
        {servicesData.services.map((service) => (
          <Link
            key={service.id}
            href={`/services/${service.slug}`}
            className="p-6 sm:p-8 bg-white rounded-2xl border border-[#E9ECEF] flex flex-col justify-between gap-5 hover:border-[#C6A45A] hover:shadow-lg transition-all duration-300 group cursor-pointer"
          >
            {/* Top: Icon & Text */}
            <div className="flex items-start gap-4 sm:gap-5">
              <div className="w-12 h-12 bg-[#EEF5FB] rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                {getServiceIcon(service.icon)}
              </div>
              <div className="flex flex-col gap-1 sm:gap-2 flex-1">
                <h3 className="text-xl font-semibold text-[#071E3B] font-manrope leading-8 group-hover:text-[#C6A45A] transition-colors line-clamp-1">
                  {service.title}
                </h3>
                <p className="text-sm font-normal text-[#667085] font-manrope leading-5 line-clamp-2 h-10">
                  {service.shortDescription}
                </p>
              </div>
            </div>

            {/* Middle: Tag Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {service.tags.map((tag, tIdx) => {
                const isRec = tag.toLowerCase().includes("recommended");
                return (
                  <span
                    key={tIdx}
                    className={`px-3 py-1 bg-white border border-[#E9ECEF] text-xs font-normal text-[#5F6B7A] font-manrope leading-4 ${
                      isRec ? "rounded-full" : "rounded-md"
                    }`}
                  >
                    {tag}
                  </span>
                );
              })}
            </div>

            {/* Bottom: Learn More */}
            <div className="flex justify-end items-center pt-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#071E3B] group-hover:text-[#C6A45A] transition-colors font-manrope leading-5">
                <span>Learn More</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}





