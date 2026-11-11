"use client";

import React from "react";
import { useBookingModal } from "@/context/BookingContext";
import { Plane, Clock, Car, MapPin, Check, ShieldCheck, ChevronRight, ArrowRight, X } from "lucide-react";

export default function CommonServiceSelectionModal() {
  const { setStep, updateBookingData, closeModal, vehicles, addOns } = useBookingModal();

  // Dynamic meet & greet add-on rate from live API
  const meetGreetAddOn = addOns?.find(
    (a) => a.code === "MEET_GREET" || a.name.toLowerCase().includes("meet")
  );
  const meetGreetPrice = meetGreetAddOn?.price ?? 20;

  // Dynamic baseline starting rates calculated directly from live API vehicles
  const minAirportFare = React.useMemo(() => {
    if (!vehicles || vehicles.length === 0) return 70;
    const fares = vehicles
      .map((v) => v.prices?.arrival?.amount || v.prices?.departure_transfer?.amount)
      .filter((f): f is number => typeof f === "number" && f > 0);
    return fares.length > 0 ? Math.min(...fares) : 70;
  }, [vehicles]);

  const minCityFare = React.useMemo(() => {
    if (!vehicles || vehicles.length === 0) return 65;
    const fares = vehicles
      .map((v) => v.prices?.departure_transfer?.amount || v.prices?.arrival?.amount)
      .filter((f): f is number => typeof f === "number" && f > 0);
    return fares.length > 0 ? Math.min(...fares) : 65;
  }, [vehicles]);

  const minHourlyRate = React.useMemo(() => {
    if (!vehicles || vehicles.length === 0) return 65;
    const rates = vehicles
      .map((v) => v.prices?.hourly?.amount)
      .filter((r): r is number => typeof r === "number" && r > 0);
    return rates.length > 0 ? Math.min(...rates) : 65;
  }, [vehicles]);

  const minCityTourFare = React.useMemo(() => {
    if (!vehicles || vehicles.length === 0) return 80;
    const fares = vehicles
      .map((v) => v.prices?.departure_transfer?.amount || v.prices?.arrival?.amount)
      .filter((f): f is number => typeof f === "number" && f > 0);
    return fares.length > 0 ? Math.min(...fares) + 10 : 80;
  }, [vehicles]);

  const handleSelect = (service: {
    title: string;
    fleet: string;
    slug: string;
    fare: number;
    pickup: string;
    dropoff: string;
  }) => {
    updateBookingData({
      serviceType: service.title,
      selectedFleet: service.fleet,
      selectedFleetSlug: service.slug,
      baseFare: service.fare,
      pickup: service.pickup,
      dropoff: service.dropoff,
    });
    setStep(1);
  };

  const services = [
    {
      id: "airport",
      title: "Airport Transfer",
      displayTitle: "Arrival / Departure",
      discount: "10% OFF",
      fromPrice: `From $${minAirportFare}`,
      fare: minAirportFare,
      fleet: "Mercedes-Benz V-Class / Toyota Vellfire",
      slug: "7-seater",
      description: `Changi Airport meet & greet (+$${meetGreetPrice}) with flight tracking & 60-min terminal grace period. Fixed rates from $${minAirportFare}.`,
      tags: [`Meet & Greet (+$${meetGreetPrice})`, "60m Grace", "Flight Monitored"],
      icon: <Plane className="w-3.5 h-3.5 text-[#C6A45A]" strokeWidth={1.5} />,
      pickup: "",
      dropoff: "",
      bgImage: "/images/Home/what_are_you_booking.png",
    },
    {
      id: "hourly",
      title: "Hourly Charter",
      displayTitle: "Hourly Charter",
      discount: "10% OFF",
      fromPrice: `From $${minHourlyRate}/hr`,
      fare: minHourlyRate,
      fleet: "Toyota Vellfire / Alphard Executive",
      slug: "7-seater",
      description: `Dedicated chauffeur at your disposal, flexible itinerary, 3 hr minimum. From $${minHourlyRate}/hr.`,
      tags: ["3h Minimum", "Unlimited Stops", "On-Standby"],
      icon: <Clock className="w-3.5 h-3.5 text-[#C6A45A]" />,
      pickup: "",
      dropoff: "",
      bgImage: "/images/Home/what_are_you_booking.png",
    },
    {
      id: "city",
      title: "City Transfer",
      displayTitle: "City Transfer",
      discount: "10% OFF",
      fromPrice: `From $${minCityFare}`,
      fare: minCityFare,
      fleet: "Toyota Vellfire / Alphard",
      slug: "6-seater",
      description: `Effortless hotel, office, and point-to-point journeys across Singapore. Fixed rates from $${minCityFare}.`,
      tags: ["Direct Route", "Zero Surge", "Luggage Assist"],
      icon: <Car className="w-3.5 h-3.5 text-[#C6A45A]" />,
      pickup: "",
      dropoff: "",
      bgImage: "/images/Home/what_are_you_booking.png",
    },
    {
      id: "tour",
      title: "City Tour",
      displayTitle: "City Tour",
      discount: "10% OFF",
      fromPrice: `From $${minCityTourFare}`,
      fare: minCityTourFare,
      fleet: "Mercedes-Benz Vito / Toyota HiAce",
      slug: "9-seater",
      description: `Customized island tour, Marina Bay, Sentosa, cultural landmarks. From $${minCityTourFare}.`,
      tags: ["Full Day Options", "Bespoke Route", "Local Guide"],
      icon: <MapPin className="w-3.5 h-3.5 text-[#C6A45A]" />,
      pickup: "",
      dropoff: "",
      bgImage: "/images/Home/what_are_you_booking.png",
    },
  ];

  return (
    <div className="w-full bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xl p-4 sm:p-7 flex flex-col gap-4 sm:gap-5 max-w-[820px] mx-auto relative max-h-[92vh] overflow-y-auto">
      {/* Close button */}
      <button
        onClick={closeModal}
        className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 active:scale-95 transition-all z-20 cursor-pointer"
        aria-label="Close modal"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 pt-1 pr-8 sm:pr-0">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl sm:text-[28px] font-extrabold text-[#0F172A] tracking-tight font-manrope">
            What are you booking?
          </h2>
          <p className="text-xs sm:text-sm text-[#667085] max-w-xl font-manrope leading-relaxed">
            Select a luxury transfer option to configure your itinerary with dedicated chauffeur service.
          </p>
        </div>

        {/* 100% Fixed Fares Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FBF7EC] border border-[#F4EAD1] text-[#A77E3C] text-[11px] sm:text-xs font-bold shrink-0 self-start sm:self-auto font-manrope">
          <ShieldCheck className="w-3.5 h-3.5 text-[#A77E3C]" />
          <span>100% Fixed Rates · $0 Hidden Fees</span>
        </div>
      </div>

      {/* 2x2 Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-5">
        {services.map((item) => (
          <div
            key={item.id}
            onClick={() => handleSelect(item)}
            className="group relative rounded-xl sm:rounded-2xl overflow-hidden border border-slate-200/90 bg-white shadow-xs hover:shadow-xl hover:border-[#C6A45A] active:scale-98 transition-all duration-300 flex flex-col justify-end min-h-[200px] sm:min-h-[255px] cursor-pointer"
          >
            {/* Background Image with Gradient Overlay */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
              style={{ backgroundImage: `url(${item.bgImage})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1220] via-[#0B1220]/75 to-[#0B1220]/20 pointer-events-none" />

            {/* Top Bar: Left Type Badge + Right Price Badge */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/20 backdrop-blur-md border border-white/20 text-white text-[10px] sm:text-[11px] font-semibold font-manrope shadow-xs">
                {item.icon}
                <span>{item.title}</span>
              </div>

              <span className="px-2.5 py-1 rounded-md bg-[#C6A45A] text-[#071E3B] text-[10px] sm:text-[11px] font-extrabold font-manrope shadow-sm">
                {item.fromPrice}
              </span>
            </div>

            {/* Bottom Content Area */}
            <div className="relative z-10 p-3.5 sm:p-5 pt-6 bg-gradient-to-t from-[#0B1220]/95 via-[#0B1220]/80 to-transparent flex flex-col gap-1.5 sm:gap-2">
              {/* Title & Discount Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-bold text-white tracking-wide font-manrope">
                    {item.displayTitle}
                  </h3>
                  <span className="px-1.5 py-0.5 rounded bg-[#FEF3C7] text-[#92400E] text-[10px] font-bold font-manrope tracking-tight">
                    {item.discount}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform shrink-0" />
              </div>

              {/* Subtitle / Description */}
              <p className="text-[11px] sm:text-xs text-white/90 leading-relaxed line-clamp-2 font-manrope">
                {item.description}
              </p>

              {/* Tag Pills & Select CTA */}
              <div className="pt-2 border-t border-slate-100/20 flex items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1">
                  {item.tags.map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      className="px-1.5 sm:px-2 py-0.5 rounded bg-[#F1F5F9] text-[#475569] text-[10px] sm:text-[11px] font-medium font-manrope leading-tight"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="inline-flex items-center gap-1 text-[#C6A45A] group-hover:text-white transition-colors shrink-0 text-xs font-bold font-manrope">
                  <span>Select</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Ribbon */}
      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-center gap-2 text-xs text-[#071E3B] font-manrope text-center">
        <span className="font-normal text-[#5F6B7A]">All-inclusive transparent rates</span>
        <span className="text-[#C6A45A]">·</span>
        <span className="font-normal text-[#5F6B7A]">Fixed Price Guarantee</span>
        <span className="text-[#C6A45A]">·</span>
        <span className="font-semibold text-[#C6A45A]">(+65) 8800 6006</span>
      </div>
    </div>
  );
}

