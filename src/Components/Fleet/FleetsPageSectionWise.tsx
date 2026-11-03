"use client";

import React, { useMemo } from "react";
import FleetCard, { Vehicle } from "./FleetCard";
import fleetData from "@/data/fleet.json";
import { useBookingModal } from "@/context/BookingContext";
import { buildSectionVehicles } from "@/lib/fleetResolver";
import { VehicleCard } from "@/types/api";
import WhatsAppIcon from "@/Components/Shared/WhatsAppIcon";
import { ArrowRight } from "lucide-react";

interface FleetsPageSectionWiseProps {
  initialVehicles?: VehicleCard[];
}

export default function FleetsPageSectionWise({ initialVehicles = [] }: FleetsPageSectionWiseProps) {
  const { openModal, vehicles: liveVehicles } = useBookingModal();

  // Prefer live client catalog from BookingContext, fall back to SSR-fetched API vehicles
  const apiVehicles =
    liveVehicles && liveVehicles.length > 0 ? liveVehicles : initialVehicles;

  // 1. Executive Travel Section Fallbacks
  const fallbackExecutive: Vehicle[] = [
    {
      id: "mercedes-e-class",
      slug: "mercedes-e-class",
      name: "Mercedes-Benz E-Class",
      model: "Mercedes-Benz E-Class Sedan",
      price: "$85",
      currency: "SGD",
      description: "Executive luxury sedan with leather seating, quiet cabin, and discreet chauffeur etiquette.",
      pax: "4 Pax",
      paxCount: 4,
      bags: "2 Bags",
      luggageCount: 2,
      badge: "Executive Sedan",
      image: "/images/Cab.png",
      meetAndGreet: "$95 SGD",
      charter3h: "$210 SGD",
      buttonText: "Reserve E-Class",
    },
    {
      id: "mercedes-s-class",
      slug: "mercedes-s-class",
      name: "Mercedes-Benz S-Class",
      model: "Mercedes-Benz S-Class Flagship",
      price: "$160",
      currency: "SGD",
      description: "Flagship first-class prestige with reclining executive seating, acoustic glazing, and VIP buffer.",
      pax: "4 Pax",
      paxCount: 4,
      bags: "2 Bags",
      luggageCount: 2,
      badge: "VIP Flagship",
      image: "/images/Cab.png",
      meetAndGreet: "$180 SGD",
      charter3h: "$380 SGD",
      buttonText: "Reserve S-Class",
    },
    fleetData.vehicles.find((v) => v.id === "vip-lounge") || {
      id: "vip-lounge",
      slug: "vip-lounge",
      name: "VIP Lounge 7-Seater",
      model: "Mercedes V-Class / Luxury MPV",
      price: "$90",
      currency: "SGD",
      description: "Plush leather reclining captain chairs, ambient cabin illumination, and discreet chauffeur etiquette.",
      pax: "7 Pax",
      paxCount: 7,
      bags: "4–5 Bags",
      luggageCount: 5,
      badge: "VIP Luxury",
      image: "/images/Cab.png",
      meetAndGreet: "$100 SGD",
      charter3h: "$255 SGD",
      buttonText: "Reserve VIP Lounge",
    },
  ];

  // 2. Maxi Cabs & MPVs Section Fallbacks
  const fallbackMaxi: Vehicle[] = [
    fleetData.vehicles.find((v) => v.id === "6-seater") || {
      id: "6-seater",
      slug: "6-seater",
      name: "6 Seater Maxi Cab",
      model: "Toyota Vellfire / Toyota Alphard",
      price: "$65",
      currency: "SGD",
      description: "Comfortable Toyota Vellfire or Alphard — great for small groups and city rides.",
      pax: "6 Pax",
      paxCount: 6,
      bags: "4–5 Bags",
      luggageCount: 4,
      image: "/images/Cab.png",
      meetAndGreet: "$75 SGD",
      charter3h: "$180 SGD",
      buttonText: "Reserve 6-Seater",
    },
    fleetData.vehicles.find((v) => v.id === "7-seater") || {
      id: "7-seater",
      slug: "7-seater",
      name: "7 Seater Maxi Cab",
      model: "Toyota Vellfire / Toyota Alphard",
      price: "$70",
      currency: "SGD",
      description: "Roomy Toyota Vellfire or Alphard — ideal for families and airport pickups.",
      pax: "7 Pax",
      paxCount: 7,
      bags: "5–6 Bags",
      luggageCount: 5,
      badge: "Most Popular",
      image: "/images/Cab.png",
      meetAndGreet: "$75 SGD",
      charter3h: "$180 SGD",
      buttonText: "Reserve 7-Seater",
    },
    fleetData.vehicles.find((v) => v.id === "9-seater") || {
      id: "9-seater",
      slug: "9-seater",
      name: "9 Seater Maxi Cab",
      model: "Toyota HiAce / Mercedes Vito",
      price: "$75",
      currency: "SGD",
      description: "Perfect mid-size option for group airport transfers and business travel.",
      pax: "9 Pax",
      paxCount: 9,
      bags: "5–6 Bags",
      luggageCount: 6,
      image: "/images/Cab.png",
      meetAndGreet: "$80 SGD",
      charter3h: "$200 SGD",
      buttonText: "Reserve 9-Seater",
    },
  ];

  // 3. Minibuses & Specialized Vehicles Section Fallbacks
  const fallbackMinibus: Vehicle[] = [
    fleetData.vehicles.find((v) => v.id === "13-seater") || {
      id: "13-seater",
      slug: "13-seater",
      name: "13 Seater Minibus",
      model: "Toyota HiAce Commuter",
      price: "$80",
      currency: "SGD",
      description: "Spacious minibus for larger groups, corporate visitors, and special events.",
      pax: "13 Pax",
      paxCount: 13,
      bags: "11–13 Bags",
      luggageCount: 12,
      badge: "High Capacity",
      image: "/images/Cab.png",
      meetAndGreet: "$85 SGD",
      charter3h: "$220 SGD",
      buttonText: "Reserve 13-Seater",
    },
    fleetData.vehicles.find((v) => v.id === "wheelchair-cab") || {
      id: "wheelchair-cab",
      slug: "wheelchair-cab",
      name: "Wheelchair Maxi Cab",
      model: "Modified Toyota HiAce",
      price: "$75+",
      currency: "SGD",
      description: "Built-in wheelchair ramp with secure safety harness for safe hospital and home transfers.",
      pax: "7 Pax",
      paxCount: 7,
      bags: "4 Bags",
      luggageCount: 4,
      badge: "LTA Certified",
      image: "/images/Cab.png",
      meetAndGreet: "$85 SGD",
      charter3h: "$220+ SGD",
      buttonText: "Reserve Wheelchair Cab",
    },
    {
      id: "23-seater-coach",
      slug: "23-seater-coach",
      name: "23-Seater Executive Coach",
      model: "Mitsubishi Rosa / Toyota Coaster",
      price: "$130",
      currency: "SGD",
      description: "Premium coach transportation for corporate conferences, school delegations, and tourist groups.",
      pax: "23 Pax",
      paxCount: 23,
      bags: "20 Bags",
      luggageCount: 20,
      badge: "Corporate Coach",
      image: "/images/Cab.png",
      meetAndGreet: "$150 SGD",
      charter3h: "$330 SGD",
      buttonText: "Reserve 23-Seater",
    },
  ];

  // Dynamically assemble sections from live API vehicles
  const { executive, maxiCabs, minibuses } = useMemo(() => {
    return buildSectionVehicles(apiVehicles, fallbackExecutive, fallbackMaxi, fallbackMinibus);
  }, [apiVehicles]);

  return (
    <div className="w-full flex flex-col items-center bg-white">
      {/* 1. Page Header (from fleetdeign.html) */}
      <section className="w-full bg-[#071E3B] text-white py-14 sm:py-20 px-4 sm:px-8 lg:px-12 relative overflow-hidden">
        <div className="max-w-[1440px] mx-auto flex flex-col items-start gap-4 sm:gap-6 relative z-10">
          <div className="flex flex-col items-start gap-2">
            <span className="text-[#C6A45A] text-sm sm:text-base font-bold font-manrope tracking-wider uppercase">
              Our Vehicles
            </span>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-manrope leading-tight sm:leading-[64px] text-white">
              Spacious, Clean &amp; Always On Time
            </h1>
          </div>
          <p className="text-white/80 text-base sm:text-lg font-medium font-manrope max-w-2xl leading-relaxed">
            Well-maintained Mercedes-Benz, Toyota Vellfire, and HiAce minibuses driven by experienced, licensed chauffeurs.
          </p>
        </div>
      </section>

      {/* 2. Content Sections Container */}
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-16 sm:py-20 flex flex-col gap-16 sm:gap-24">
        {/* Section A: Executive Travel */}
        <section id="executive-travel" className="flex flex-col gap-8 sm:gap-10">
          <div className="flex flex-col gap-3 max-w-3xl">
            <span className="text-[#C6A45A] text-xs sm:text-sm font-bold font-manrope tracking-wider uppercase">
              EXECUTIVE TRAVEL · E-CLASS, S-CLASS &amp; VIP MPVS
            </span>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold font-manrope text-[#071E3B] leading-tight">
              Travel in Executive Comfort
            </h2>
            <p className="text-sm sm:text-base text-[#667085] font-manrope leading-relaxed">
              Choose between the Mercedes-Benz E-Class, S-Class, and VIP Lounge MPVs for a refined journey with a clear, all-inclusive fixed fare.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {executive.map((vehicle) => (
              <FleetCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        </section>

        {/* Section B: Maxi Cabs & MPVs */}
        <section id="maxi-cabs" className="flex flex-col gap-8 sm:gap-10">
          <div className="flex flex-col gap-3 max-w-3xl">
            <span className="text-[#C6A45A] text-xs sm:text-sm font-bold font-manrope tracking-wider uppercase">
              MAXI CABS · TOYOTA VELLFIRE &amp; ALPHARD
            </span>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold font-manrope text-[#071E3B] leading-tight">
              Spacious Maxi Cabs For Every Group
            </h2>
            <p className="text-sm sm:text-base text-[#667085] font-manrope leading-relaxed">
              Singapore&apos;s most popular maxi cabs for airport arrivals, family outings, and point-to-point transfers with generous luggage room.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {maxiCabs.map((vehicle) => (
              <FleetCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        </section>

        {/* Section C: Minibuses & Accessible Travel */}
        <section id="minibuses" className="flex flex-col gap-8 sm:gap-10">
          <div className="flex flex-col gap-3 max-w-3xl">
            <span className="text-[#C6A45A] text-xs sm:text-sm font-bold font-manrope tracking-wider uppercase">
              HIGH-CAPACITY MINIBUSES &amp; WHEELCHAIR ACCESSIBLE
            </span>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold font-manrope text-[#071E3B] leading-tight">
              Group Transits &amp; Dedicated Wheelchair Travel
            </h2>
            <p className="text-sm sm:text-base text-[#667085] font-manrope leading-relaxed">
              High-roof minibuses for larger delegations and LTA-certified wheelchair accessible vans with hydraulic ramps and safety harnesses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {minibuses.map((vehicle) => (
              <FleetCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        </section>
      </div>

      {/* 3. Bottom Banner: "Not sure which vehicle to choose?" (from fleetdeign.html lines 803-822) */}
      <section className="w-full bg-[#FBF7EC] border-t border-[#C6A45A]/20 py-16 px-6 sm:px-12 flex flex-col items-center text-center gap-6">
        <div className="max-w-2xl flex flex-col items-center gap-2.5">
          <h3 className="text-2xl sm:text-4xl lg:text-5xl font-bold font-manrope text-[#071E3B] leading-tight">
            Not sure which vehicle to choose?
          </h3>
          <p className="text-sm sm:text-base text-[#5F6B7A] font-manrope leading-relaxed">
            Our team will help you pick the right vehicle for your group size, luggage requirements, and journey itinerary.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          {/* WhatsApp Button */}
          <a
            href="https://wa.me/6588006006"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-60 sm:min-w-[240px] px-6 sm:px-8 py-3.5 bg-[#16803C] hover:bg-[#126b32] active:scale-95 text-white font-semibold font-manrope rounded-xl shadow-md flex items-center justify-center gap-2.5 transition-all cursor-pointer"
          >
            <WhatsAppIcon className="w-4 h-4 text-white" />
            <span>WhatsApp Us</span>
          </a>

          {/* Book Now Button */}
          <button
            type="button"
            onClick={() => openModal({ initialStep: 0 })}
            className="w-full sm:w-60 sm:min-w-[240px] px-6 sm:px-8 py-3.5 bg-[#071E3B] hover:bg-[#0B2A4A] active:scale-95 text-white font-semibold font-manrope rounded-xl shadow-md flex items-center justify-center gap-2.5 transition-all cursor-pointer"
          >
            <span>Book Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
}
