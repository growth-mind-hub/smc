"use client";

import React from "react";
import pricingData from "@/data/pricing.json";
import { ShieldCheck, Clock, Plane, ArrowRight, Users, Luggage } from "lucide-react";
import { useBookingModal } from "@/context/BookingContext";
import WhatsAppIcon from "@/Components/Shared/WhatsAppIcon";
import Link from "next/link";

export default function PricingSection() {
  const { openModal, vehicles: liveVehicles } = useBookingModal();

  const handleBookVehicle = (slug: string, name: string, fareStr: string) => {
    const fare = parseInt(fareStr.replace(/[^0-9]/g, "")) || 65;
    openModal({
      initialStep: 0,
      selectedFleet: name,
      selectedFleetSlug: slug,
      baseFare: fare,
    });
  };

  // Derive matrix rows from pricingData.matrix, enriching with live API rates where available
  const matrixRows = (() => {
    // 1. Map all canonical vehicles from pricing matrix
    const rows = pricingData.matrix.map((item) => {
      // Find matching vehicle from live API by apiId or exact/close name match
      const liveMatch = liveVehicles?.find(
        (v) =>
          v.id === item.apiId ||
          v.name.toLowerCase().trim() === item.name.toLowerCase().trim() ||
          (item.id === "mercedes-e-class" && v.name.toLowerCase().includes("e class")) ||
          (item.id === "mercedes-s-class" && v.name.toLowerCase().includes("s class")) ||
          (item.id === "6-seater" && (v.passengerCapacity === 6 || v.name.toLowerCase().includes("alphard"))) ||
          (item.id === "7-seater" && (v.name.toLowerCase().includes("vito") || v.name.toLowerCase().includes("viano"))) ||
          (item.id === "mercedes-v-class" && v.name.toLowerCase().includes("v-class")) ||
          (item.id === "9-seater" && v.passengerCapacity === 9) ||
          (item.id === "13-seater" && v.name.toLowerCase().includes("13") && !v.name.toLowerCase().includes("vip")) ||
          (item.id === "vip-lounge" && (v.name.toLowerCase().includes("vip") || v.name.toLowerCase().includes("executive"))) ||
          (item.id === "wheelchair-cab" && v.name.toLowerCase().includes("wheelchair")) ||
          (item.id === "23-seater" && v.passengerCapacity === 23)
      );

      const pointToPoint = liveMatch?.prices?.departure_transfer?.amount
        ? `$${liveMatch.prices.departure_transfer.amount} SGD`
        : item.pointToPoint;

      const meetAndGreet = liveMatch?.prices?.arrival?.amount
        ? `$${liveMatch.prices.arrival.amount} SGD`
        : item.meetAndGreet;

      const hourlyRate = liveMatch?.prices?.hourly?.amount;
      const charter3h = liveMatch?.prices?.hourly?.threeHourAmount
        ? `$${liveMatch.prices.hourly.threeHourAmount} SGD`
        : hourlyRate
        ? `$${hourlyRate * 3} SGD`
        : item.charter3h;

      const charter8h = liveMatch?.prices?.hourly?.eightHourAmount
        ? `$${liveMatch.prices.hourly.eightHourAmount} SGD`
        : hourlyRate
        ? `$${hourlyRate * 8} SGD`
        : item.charter8h;

      const pax = liveMatch?.passengerCapacity ? String(liveMatch.passengerCapacity) : item.pax;
      const luggage = liveMatch?.luggageCapacity ? String(liveMatch.luggageCapacity) : item.luggage;

      return {
        id: String(liveMatch?.id ?? item.id),
        slug: item.slug,
        name: item.name,
        model: item.model,
        pax,
        luggage,
        pointToPoint,
        meetAndGreet,
        charter3h,
        charter8h,
      };
    });

    // 2. Append any live API vehicles that might not be in the static matrix
    if (liveVehicles && liveVehicles.length > 0) {
      liveVehicles.forEach((v) => {
        const alreadyIncluded = rows.some(
          (r) =>
            r.id === String(v.id) ||
            r.name.toLowerCase().trim() === v.name.toLowerCase().trim()
        );
        if (!alreadyIncluded) {
          const pointToPoint =
            v.prices?.departure_transfer?.amount ||
            v.prices?.arrival?.amount ||
            70;
          const meetAndGreet =
            v.prices?.arrival?.amount || pointToPoint + 10;
          const hourlyRate = v.prices?.hourly?.amount || 65;
          rows.push({
            id: String(v.id),
            slug: `vehicle-${v.id}`,
            name: v.name,
            model: v.description || v.vehicleType || "Executive Maxi Cab",
            pax: `${v.passengerCapacity || 7}`,
            luggage: `${v.luggageCapacity || 5}`,
            pointToPoint: `$${pointToPoint} SGD`,
            meetAndGreet: `$${meetAndGreet} SGD`,
            charter3h: `$${hourlyRate * 3} SGD`,
            charter8h: `$${hourlyRate * 8} SGD`,
          });
        }
      });
    }

    return rows;
  })();

  const getGuaranteeIcon = (iconName: string) => {
    switch (iconName) {
      case "ban":
        return <ShieldCheck className="w-8 h-8 text-[#C6A45A]" />;
      case "clock":
        return <Clock className="w-8 h-8 text-[#C6A45A]" />;
      case "hourglass":
      case "plane":
        return <Plane className="w-8 h-8 text-[#C6A45A]" strokeWidth={1.5} />;
      default:
        return <ShieldCheck className="w-8 h-8 text-[#C6A45A]" />;
    }
  };

  return (
    <div className="w-full flex flex-col bg-white selection:bg-[#C6A45A] selection:text-[#071E3B]">
      {/* 1. Hero Header */}
      <section className="w-full bg-[#071E3B] text-white py-12 sm:py-16 px-4 sm:px-8 lg:px-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#071E3B] via-[#0B2A4A] to-[#071E3B] pointer-events-none opacity-90" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#C6A45A]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-[1440px] mx-auto relative z-10 flex flex-col items-start gap-2 sm:gap-3">
          <span className="text-base sm:text-lg font-bold text-[#C6A45A] tracking-wide font-manrope">
            {pricingData.badge}
          </span>
          <h1 className="text-4xl sm:text-6xl font-bold text-white tracking-tight leading-[1.15] font-manrope">
            {pricingData.title}
          </h1>
          <p className="text-base sm:text-lg text-white/90 leading-relaxed max-w-[600px] font-medium font-manrope pt-2">
            {pricingData.subtitle}
          </p>
        </div>
      </section>

      {/* 2. Main Content Area */}
      <section className="py-12 sm:py-16 px-4 sm:px-8 lg:px-12 max-w-[1440px] mx-auto w-full flex flex-col gap-12 sm:gap-16">
        {/* 3 Guarantees Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-12 lg:gap-20">
          {pricingData.guarantees.map((item, idx) => (
            <div
              key={idx}
              className="p-6 rounded-xl bg-[#F7F5EF] border border-[#E9ECEF] flex flex-col items-center text-center gap-4 transition-shadow hover:shadow-sm"
            >
              <div className="w-12 h-12 flex items-center justify-center">
                {getGuaranteeIcon(item.icon)}
              </div>
              <h3 className="text-base font-bold text-[#071E3B] font-manrope leading-6 line-clamp-1">
                {item.title}
              </h3>
              <p className="text-xs text-[#667085] font-normal font-manrope leading-5 line-clamp-2 h-10">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        {/* Vehicle Pricing Table & Mobile Cards */}
        <div className="flex flex-col gap-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-[#071E3B] font-manrope leading-[48px]">
                Vehicle Pricing
              </h2>
            </div>
          </div>

          {/* Mobile Pricing Cards (shown on < md) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
            {matrixRows.map((row) => (
              <div
                key={row.id}
                className="bg-white rounded-2xl border border-[#E9ECEF] p-5 flex flex-col justify-between gap-4 shadow-xs"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 pr-1">
                      <Link
                        href={`/fleets/${row.slug}`}
                        className="font-bold text-lg text-[#071E3B] hover:text-[#C6A45A] transition-colors font-manrope block leading-snug"
                      >
                        {row.name}
                      </Link>
                      <span className="block text-xs text-[#667085] mt-0.5 font-manrope line-clamp-1">
                        {row.model}
                      </span>
                    </div>
                    {/* Capacity icons: Pax & Luggage */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[#F7F5EF] text-[#071E3B] font-bold text-xs font-manrope border border-[#E9ECEF]"
                        title={`${row.pax} Pax`}
                      >
                        <Users className="w-3.5 h-3.5 text-[#C6A45A]" />
                        <span>{row.pax}</span>
                      </span>
                      {row.luggage && (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[#F7F5EF] text-[#071E3B] font-bold text-xs font-manrope border border-[#E9ECEF]"
                          title={`${row.luggage} Luggage`}
                        >
                          <Luggage className="w-3.5 h-3.5 text-[#C6A45A]" />
                          <span>{row.luggage}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Rates Breakdown */}
                  <div className="mt-4 grid grid-cols-3 gap-2 bg-[#F8F7F4] p-3 rounded-xl border border-slate-100 text-center">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-[#667085] uppercase font-bold font-inter">Point-to-Point</span>
                      <span className="text-base font-bold text-[#C6A45A] font-manrope">{row.pointToPoint}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-[#667085] uppercase font-bold font-inter">3h Charter</span>
                      <span className="text-sm font-semibold text-[#A77E3C] font-manrope">{row.charter3h}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-[#667085] uppercase font-bold font-inter">8h Charter</span>
                      <span className="text-sm font-semibold text-[#A77E3C] font-manrope">{row.charter8h}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Link
                    href={`/fleets/${row.slug}`}
                    className="flex-1 py-2.5 text-center rounded-lg border border-[#E9ECEF] hover:bg-slate-50 text-xs font-bold text-[#071E3B] transition-colors min-h-[44px] flex items-center justify-center font-manrope"
                  >
                    View Specs
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleBookVehicle(row.slug, row.name, row.pointToPoint)}
                    className="flex-1 py-2.5 rounded-lg bg-[#C6A45A] hover:bg-[#B58E45] active:scale-[0.98] text-white text-xs font-bold transition-all shadow-xs cursor-pointer min-h-[44px] flex items-center justify-center gap-1.5 font-manrope"
                  >
                    <span>Book Ride</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table Container (hidden on < md) */}
          <div className="hidden md:block w-full rounded-2xl border border-[#E9ECEF] overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#071E3B] text-white text-sm font-bold font-manrope">
                  <th className="py-4 px-6">Vehicle</th>
                  <th className="py-4 px-4 text-center">Capacity</th>
                  <th className="py-4 px-4 text-center">Point-to-Point</th>
                  <th className="py-4 px-4 text-center">3h Charter</th>
                  <th className="py-4 px-4 text-center">8h Charter</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {matrixRows.map((row, idx) => (
                  <tr
                    key={row.id}
                    className={`${
                      idx % 2 === 0 ? "bg-white" : "bg-[#F7F5EF]"
                    } hover:bg-[#FBF7EC] transition-colors`}
                  >
                    <td className="py-4 px-6">
                      <Link
                        href={`/fleets/${row.slug}`}
                        className="group flex flex-col"
                      >
                        <span className="font-semibold text-xl text-[#071E3B] group-hover:text-[#C6A45A] transition-colors font-manrope leading-8">
                          {row.name}
                        </span>
                        <span className="text-sm font-normal text-[#667085] font-manrope leading-5">
                          {row.model}
                        </span>
                      </Link>
                    </td>
                    <td className="py-4 px-4 text-center font-manrope">
                      <div className="inline-flex items-center justify-center gap-1.5">
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-[#E9ECEF] text-xs font-bold text-[#071E3B]"
                          title={`${row.pax} Pax`}
                        >
                          <Users className="w-3.5 h-3.5 text-[#C6A45A]" />
                          <span>{row.pax}</span>
                        </span>
                        {row.luggage && (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-[#E9ECEF] text-xs font-bold text-[#071E3B]"
                            title={`${row.luggage} Luggage`}
                          >
                            <Luggage className="w-3.5 h-3.5 text-[#C6A45A]" />
                            <span>{row.luggage}</span>
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center font-bold text-base text-[#C6A45A] font-manrope leading-6">
                      {row.pointToPoint}
                    </td>
                    <td className="py-4 px-4 text-center text-sm font-semibold text-[#A77E3C] font-manrope leading-5">
                      {row.charter3h}
                    </td>
                    <td className="py-4 px-4 text-center text-sm font-semibold text-[#A77E3C] font-manrope leading-5">
                      {row.charter8h}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pricing Notes Card */}
        <div className="p-6 rounded-xl bg-[#F7F5EF] border border-[#E9ECEF] flex flex-col gap-4">
          <h3 className="text-base font-bold text-[#071E3B] font-manrope leading-6">
            Pricing Notes
          </h3>

          <div className="flex flex-col gap-2">
            {pricingData.pricingNotes.map((note, nIdx) => (
              <div key={nIdx} className="flex items-start gap-2">
                <span className="text-xs font-normal text-[#C6A45A] font-manrope leading-5 shrink-0">
                  •
                </span>
                <span className="text-sm font-normal text-[#667085] font-manrope leading-5">
                  {note}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Ready to Book CTA Card */}
        <div className="w-full rounded-[32px] bg-[#071E3B] text-white px-6 sm:px-16 lg:px-48 py-12 sm:py-16 text-center flex flex-col items-center gap-8 relative overflow-hidden shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-[#071E3B] via-[#0B2A4A] to-[#071E3B] pointer-events-none" />
          <div className="relative z-10 flex flex-col items-center gap-4 max-w-3xl">
            <h3 className="text-3xl sm:text-5xl font-bold tracking-tight text-white font-manrope leading-[56px]">
              Ready to Book Your Ride?
            </h3>
            <p className="text-sm sm:text-base text-white font-normal font-manrope leading-6">
              Call us at (+65) 8800 6006 or book online in just a few clicks —<br className="hidden sm:inline" />
              it&apos;s quick and easy.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => openModal({ initialStep: 0 })}
                className="w-full sm:w-auto min-h-[48px] sm:min-h-[52px] px-6 sm:px-8 py-3 rounded-lg bg-[#C6A45A] hover:bg-[#B58E45] active:scale-[0.98] text-white text-base font-semibold font-manrope flex items-center justify-center gap-3 transition-all shadow-md cursor-pointer whitespace-nowrap"
              >
                <span>Book Now</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5] shrink-0" />
              </button>

              <a
                href="https://wa.me/6588006006"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto min-h-[48px] sm:min-h-[52px] px-6 sm:px-8 py-3 rounded-lg border border-[#C6A45A] hover:bg-[#C6A45A]/10 active:scale-[0.98] text-[#C6A45A] text-base font-semibold font-manrope flex items-center justify-center gap-2.5 transition-all whitespace-nowrap"
              >
                <WhatsAppIcon className="w-4 h-4 shrink-0" />
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

