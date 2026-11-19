import type { Metadata } from "next";
import Navbar from "@/Components/Header/Navbar";
import ServicesSection from "@/Components/Services/ServicesSection";
import CTASection from "@/Components/CTA/CTASection";
import Footer from "@/Components/Footer/Footer";
import { getPrismicServices } from "@/lib/prismic/services";

export const metadata: Metadata = {
  title: "Services | Singapore Maxicabs - Airport, Corporate, Weddings & Tours",
  description:
    "Explore Singapore Maxicabs' chauffeured services. Changi Airport Meet & Greet, Corporate Accounts, Hourly Standby, Wedding Convoys, and Wheelchair Transport.",
};

export const revalidate = 60; // Auto-revalidate every 60 seconds (ISR)

export default async function ServicesPage() {
  const services = await getPrismicServices();

  return (
    <main className="min-h-screen flex flex-col w-full selection:bg-[#C6A45A] selection:text-[#071E3B] bg-white">
      {/* 1. Navbar */}
      <Navbar />

      {/* 2. Hero Banner matching servicepagedesign.html */}
      <section className="w-full bg-[#071E3B] text-white py-12 sm:py-16 px-4 sm:px-8 lg:px-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#071E3B] via-[#0B2A4A] to-[#071E3B] opacity-90 pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#C6A45A]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-[1440px] mx-auto relative z-10 flex flex-col items-start gap-2 sm:gap-3">
          <span className="text-base sm:text-lg font-bold text-[#C6A45A] tracking-wide font-manrope">
            Our Services
          </span>
          <h1 className="text-4xl sm:text-6xl font-bold text-white tracking-tight leading-[1.15] font-manrope">
            Rides for Every Need
          </h1>
          <p className="text-base sm:text-lg text-white/90 leading-relaxed max-w-[600px] font-medium font-manrope pt-2">
            Airport pickups, hourly bookings, corporate transfers, and event transport — all with clear, fixed pricing and no hidden fees.
          </p>
        </div>
      </section>

      {/* 3. Services Grid */}
      <ServicesSection isPage={true} services={services} />

      {/* 4. CTA */}
      <CTASection />

      {/* 5. Footer */}
      <Footer />
    </main>
  );
}
