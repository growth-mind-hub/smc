"use client";

import React from "react";
import Link from "next/link";
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
  Heart,
  ArrowRight,
} from "lucide-react";
import { useServices } from "@/hooks/useServices";
import { NormalizedService, normalizeServiceIcon } from "@/lib/prismic/services";

interface ServicesSectionProps {
  isPage?: boolean;
  services?: NormalizedService[];
}

export default function ServicesSection({ isPage = false, services: initialServices }: ServicesSectionProps) {
  const { services: hookServices } = useServices();

  const services = initialServices && initialServices.length > 0 ? initialServices : hookServices;

  const getServiceIcon = (iconName: string) => {
    const iconClass = "w-6 h-6 text-[#123F6B] group-hover:text-[#C6A45A] transition-colors";
    const normalized = normalizeServiceIcon(iconName);

    switch (normalized) {
      case "Plane":
        return <Plane className={iconClass} strokeWidth={1.5} />;
      case "Briefcase":
        return <Briefcase className={iconClass} />;
      case "Clock":
        return <Clock className={iconClass} />;
      case "Sparkles":
        return <Sparkles className={iconClass} />;
      case "Heart":
        return <Heart className={iconClass} />;
      case "Users":
        return <Users className={iconClass} />;
      case "HeartHandshake":
        return <HeartHandshake className={iconClass} />;
      case "Crown":
        return <Crown className={iconClass} />;
      case "Anchor":
        return <Anchor className={iconClass} />;
      case "Flag":
        return <Flag className={iconClass} />;
      case "Building2":
        return <Building2 className={iconClass} />;
      case "Compass":
        return <Compass className={iconClass} />;
      case "MapPin":
        return <MapPin className={iconClass} />;
      default:
        return <Plane className={iconClass} strokeWidth={1.5} />;
    }
  };

  // Robust edge-case selection:
  // - On /services: show all services
  // - On Home: show featured first, backfilled by lowest display_order up to 4
  const displayedServices = React.useMemo(() => {
    if (isPage) {
      return services;
    }
    const featured = services.filter((s) => s.isFeatured);
    const unfeatured = services.filter((s) => !s.isFeatured);
    const combined = [...featured, ...unfeatured];
    return combined.slice(0, 4);
  }, [isPage, services]);

  return (
    <section id="services" className="w-full px-4 sm:px-8 lg:px-12 py-12 sm:py-20 flex flex-col justify-start items-center gap-10 sm:gap-14 bg-white selection:bg-[#C6A45A] selection:text-[#071E3B]">
      {/* Header (shown when on homepage or not isPage) */}
      {!isPage && (
        <div className="self-stretch flex flex-col justify-start items-center gap-3 sm:gap-4">
          <div className="w-full max-w-[760px] flex flex-col justify-start items-center gap-2 sm:gap-3">
            <span className="self-stretch text-center justify-center text-[#C6A45A] text-xs sm:text-sm font-bold font-manrope uppercase leading-4 tracking-wide">
              Our Services
            </span>
            <h2 className="self-stretch text-center justify-center text-[#071E3B] text-2xl sm:text-4xl lg:text-5xl font-bold font-manrope leading-tight">
              Rides for Every Need
            </h2>
          </div>
          <div className="w-full max-w-[760px] flex flex-col justify-start items-center">
            <p className="self-stretch text-center justify-center text-[#667085] text-sm sm:text-base font-normal font-manrope leading-relaxed">
              Airport pickups, hourly bookings, corporate transfers, and event transport — all with clear, fixed pricing and no hidden fees.
            </p>
          </div>
        </div>
      )}

      {/* 2-Column Grid matching servicepagedesign.html */}
      <div className="w-full max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 xl:gap-10 items-stretch">
        {displayedServices.map((service, idx) => (
          <Link
            key={`${service.slug || service.id}-${idx}`}
            href={`/services/${service.slug}`}
            className="p-6 sm:p-8 bg-white rounded-2xl border border-[#E9ECEF] flex flex-col justify-between gap-5 hover:border-[#C6A45A] hover:shadow-lg transition-all duration-300 group cursor-pointer"
          >
            {/* Top: Icon & Text */}
            <div className="flex items-start gap-4 sm:gap-5">
              <div className="w-12 h-12 bg-[#EEF5FB] group-hover:bg-[#FBF7EC] rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-all">
                {getServiceIcon(service.icon)}
              </div>
              <div className="flex flex-col gap-1 sm:gap-2 flex-1">
                <h3 className="text-xl font-semibold text-[#071E3B] font-manrope leading-8 group-hover:text-[#C6A45A] transition-colors line-clamp-1">
                  {service.title}
                </h3>
                <p className="text-sm font-normal text-[#667085] font-manrope leading-5 line-clamp-2 h-10">
                  {service.shortDescription || service.heroDescription || service.subtitle || "Fixed flat rates with professional chauffeurs."}
                </p>
              </div>
            </div>

            {/* Middle: Tag Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {(service.tags && service.tags.length > 0 ? service.tags : [service.subtitle, service.startingPrice].filter(Boolean)).map((tag, tIdx) => {
                const isRec = typeof tag === "string" && tag.toLowerCase().includes("recommended");
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

      {/* Show More CTA on Home Page */}
      {!isPage && (
        <div className="flex justify-center pt-2 sm:pt-4">
          <Link
            href="/services"
            className="px-6 sm:px-8 py-3.5 rounded-xl bg-[#071E3B] hover:bg-[#0B2A4A] text-white text-sm font-bold font-manrope flex items-center justify-center gap-2.5 transition-all shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer"
          >
            <span>Show More Services</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </Link>
        </div>
      )}
    </section>
  );
}
