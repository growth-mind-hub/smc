"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Check, Zap } from "lucide-react";
import { useBookingModal } from "@/context/BookingContext";
import WhatsAppIcon from "@/Components/Shared/WhatsAppIcon";
import { findMatchingApiVehicle, getVehicleImage } from "@/lib/fleetResolver";

export interface VehicleDetail {
  id: string;
  slug: string;
  apiVehicleId?: number;
  name: string;
  model: string;
  price: string;
  currency: string;
  description: string;
  heroDescription: string;
  pax: string;
  bags: string;
  pointToPoint: string;
  meetAndGreet: string;
  charter3h: string;
  charter8h: string;
  vehicleType: string;
  inclusions: string[];
  image?: string;
  isApiConnected?: boolean;
}

export default function FleetDetailTemplate({ vehicle }: { vehicle: VehicleDetail }) {
  const { openModal, vehicles: liveVehicles } = useBookingModal();
  // If live vehicles loaded in BookingContext, check for live pricing & image synchronization
  const matchedLiveVehicle =
    liveVehicles.find(
      (lv) =>
        lv.id === vehicle.apiVehicleId ||
        lv.name.toLowerCase() === vehicle.name.toLowerCase()
    ) || findMatchingApiVehicle(vehicle.slug || vehicle.id, liveVehicles);

  const [imgSrc, setImgSrc] = useState(
    getVehicleImage(matchedLiveVehicle, vehicle.image || "/images/Cab.png")
  );

  useEffect(() => {
    const liveImg = getVehicleImage(matchedLiveVehicle, vehicle.image || "/images/Cab.png");
    setImgSrc(liveImg);
  }, [vehicle.image, matchedLiveVehicle]);

  const displayPrice = matchedLiveVehicle?.prices?.departure_transfer?.amount
    ? `$${matchedLiveVehicle.prices.departure_transfer.amount}`
    : vehicle.price;

  const baseFareNum = parseInt(displayPrice.replace(/[^0-9]/g, ""), 10) || 65;

  const liveCharter8h = matchedLiveVehicle?.prices?.hourly?.eightHourAmount
    ? `$${matchedLiveVehicle.prices.hourly.eightHourAmount} SGD`
    : matchedLiveVehicle?.prices?.hourly?.amount
    ? `$${matchedLiveVehicle.prices.hourly.amount * 8} SGD`
    : vehicle.charter8h;

  const liveCharter3h = matchedLiveVehicle?.prices?.hourly?.threeHourAmount
    ? `$${matchedLiveVehicle.prices.hourly.threeHourAmount} SGD`
    : matchedLiveVehicle?.prices?.hourly?.amount
    ? `$${matchedLiveVehicle.prices.hourly.amount * 3} SGD`
    : vehicle.charter3h;

  const displayDescription =
    matchedLiveVehicle?.description || vehicle.heroDescription || vehicle.description;

  const handleBookNow = () => {
    openModal({
      initialStep: 0,
      vehicleId: matchedLiveVehicle?.id || vehicle.apiVehicleId,
      selectedFleet: vehicle.name,
      selectedFleetSlug: vehicle.slug,
      baseFare: baseFareNum,
    });
  };

  const specs = [
    { label: "Passengers", value: vehicle.pax },
    { label: "Luggage", value: vehicle.bags },
    { label: "Changi Meet & Greet", value: vehicle.meetAndGreet },
    { label: "3-Hour Charter", value: liveCharter3h },
    { label: "8-Hour Charter", value: liveCharter8h },
    { label: "Vehicle Type", value: vehicle.vehicleType },
  ];

  return (
    <div className="w-full flex flex-col bg-white selection:bg-[#C6A45A] selection:text-[#071E3B]">
      {/* 1. Hero Banner matching singleFleetPage.html */}
      <section className="w-full bg-gradient-to-r from-[#071E3B] to-slate-900/90 text-white py-12 sm:py-16 px-4 sm:px-8 lg:px-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#C6A45A]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-[1440px] mx-auto relative z-10 flex flex-col gap-6 sm:gap-8">
          {/* Breadcrumb Back */}
          <Link
            href="/fleets"
            className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors font-manrope group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to All Fleets</span>
          </Link>

          {/* Hero Content Header */}
          <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 sm:gap-8">
            <div className="flex flex-col items-start gap-3 sm:gap-4 max-w-3xl">
              <div className="flex items-center gap-3">
                <span className="text-base sm:text-lg font-bold text-[#C6A45A] tracking-wide font-manrope">
                  Our Fleet
                </span>
                {vehicle.isApiConnected && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-[#16803C]/20 text-[#60D669] border border-[#16803C]/40">
                    <Zap className="w-3 h-3" />
                    <span>Live API Rates</span>
                  </span>
                )}
              </div>

              <h1 className="text-4xl sm:text-6xl font-bold text-white tracking-tight leading-[1.15] font-manrope">
                {vehicle.name}
              </h1>

              <span className="text-base sm:text-lg font-bold text-[#C6A45A] tracking-wide font-manrope">
                {vehicle.model}
              </span>

              <p className="text-base sm:text-lg text-white/90 leading-relaxed max-w-[500px] font-medium font-manrope">
                {displayDescription}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-3 sm:pt-4 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleBookNow}
                  className="w-full sm:w-60 sm:min-w-[240px] px-6 sm:px-8 py-3 rounded-lg bg-[#C6A45A] hover:bg-[#B58E45] active:scale-[0.98] text-white text-base font-semibold font-manrope flex items-center justify-center gap-4 transition-all shadow-md cursor-pointer"
                >
                  <span>Book Now</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>

                <Link
                  href="/fleets"
                  className="w-full sm:w-60 sm:min-w-[240px] px-6 sm:px-8 py-3 rounded-lg border border-[#C6A45A] hover:bg-[#C6A45A]/10 active:scale-[0.98] text-[#C6A45A] text-base font-semibold font-manrope flex items-center justify-center gap-4 transition-all"
                >
                  <span>Explore our Fleet</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </Link>
              </div>
            </div>

            {/* Starting Price Display */}
            <div className="flex flex-col lg:items-end bg-white/10 lg:bg-transparent p-4 sm:p-5 lg:p-0 rounded-2xl border border-white/10 lg:border-none w-full sm:w-auto">
              <span className="text-5xl sm:text-7xl font-bold text-[#C6A45A] leading-none font-manrope">
                {displayPrice}
              </span>
              <span className="text-base sm:text-lg font-medium text-white/70 mt-2 font-manrope">
                Starting from ({vehicle.currency || "SGD"})
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Specs & Image Row matching singleFleetPage.html */}
      <section className="py-12 sm:py-16 px-4 sm:px-8 lg:px-12 max-w-[1440px] mx-auto w-full flex flex-col gap-12 sm:gap-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
          {/* Vehicle Showcase Card */}
          <div className="w-full h-72 sm:h-96 lg:h-[404px] rounded-2xl overflow-hidden bg-[#071E3B] border border-slate-800 shadow-xl relative group">
            {/* Gold Accent Line */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-[#C6A45A] z-30 shadow-sm" />
            <Image
              src={imgSrc}
              alt={vehicle.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
              priority
              onError={() => setImgSrc("/images/Cab.png")}
            />
          </div>

          {/* Pricing & Specs Table */}
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#071E3B] font-manrope leading-10">
              Pricing &amp; Specs
            </h2>

            <div className="w-full rounded-xl border border-[#E9ECEF] overflow-hidden">
              {specs.map((item, idx) => (
                <div
                  key={item.label}
                  className={`flex items-center justify-between px-5 py-3.5 text-sm sm:text-base ${
                    idx % 2 === 0 ? "bg-white" : "bg-[#F7F5EF]"
                  }`}
                >
                  <span className="text-base font-normal text-[#071E3B] font-manrope leading-6">
                    {item.label}
                  </span>
                  <span className="text-sm font-semibold text-[#A77E3C] font-manrope leading-5">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. What's Included Section */}
        <div className="flex flex-col gap-6">
          <h2 className="text-xl font-bold text-[#071E3B] font-manrope leading-8">
            What&apos;s Included
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {vehicle.inclusions.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#ECFDF3] border border-[#16803C] flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-[#16803C] stroke-[3]" />
                </div>
                <span className="text-sm font-normal text-[#5F6B7A] font-manrope leading-5">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Ready to Book CTA Card matching singleFleetPage.html */}
        <div className="w-full rounded-[32px] bg-[#071E3B] text-white px-6 sm:px-16 lg:px-48 py-12 sm:py-16 text-center flex flex-col items-center gap-8 relative overflow-hidden shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-[#071E3B] via-[#0B2A4A] to-[#071E3B] pointer-events-none" />
          <div className="relative z-10 flex flex-col items-center gap-4 max-w-3xl">
            <h3 className="text-3xl sm:text-5xl font-bold tracking-tight text-white font-manrope leading-[56px]">
              Ready to Book Your Ride?
            </h3>
            <p className="text-sm sm:text-base text-white font-normal font-manrope leading-6">
              Call us at (+65) 8800 6006 or book online in just a few clicks —
              <br className="hidden sm:inline" />
              it&apos;s quick and easy.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleBookNow}
                className="w-full sm:w-60 sm:min-w-[240px] px-6 sm:px-8 py-3 rounded-lg bg-[#C6A45A] hover:bg-[#B58E45] active:scale-[0.98] text-white text-base font-semibold font-manrope flex items-center justify-center gap-4 transition-all shadow-md cursor-pointer"
              >
                <span>Book Now</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>

              <a
                href="https://wa.me/6588006006"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-60 sm:min-w-[240px] px-6 sm:px-8 py-3 rounded-lg border border-[#C6A45A] hover:bg-[#C6A45A]/10 active:scale-[0.98] text-[#C6A45A] text-base font-semibold font-manrope flex items-center justify-center gap-4 transition-all"
              >
                <WhatsAppIcon className="w-4 h-4" />
                <span>WhatsApp Us</span>
              </a>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs text-white font-normal font-manrope leading-4 opacity-80 border-t border-white/10 w-full mt-4">
              <span>SINGAPORE MAXICABS</span>
              <span>•</span>
              <span>booking@singaporemaxicabs.com.sg</span>
              <span>•</span>
              <span>45A Campbell Lane Singapore 209917</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
