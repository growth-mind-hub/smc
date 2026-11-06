import type { Metadata } from "next";
import Navbar from "@/Components/Header/Navbar";
import PricingSection from "@/Components/Pricing/PricingSection";
import Footer from "@/Components/Footer/Footer";

export const metadata: Metadata = {
  title: "Pricing Matrix | Singapore Maxicabs - Fixed Flat Rates & No Hidden Fees",
  description:
    "Transparent Singapore Maxi Cab rates. Flat fees for 6, 7, 9, 13 Seater and Mercedes Limousines. Fixed $10 late-night surcharge (10 PM – 6 AM) and complimentary flight delay waiting buffer.",
};

export default function PricingPage() {
  return (
    <main className="min-h-screen flex flex-col w-full selection:bg-[#C6A45A] selection:text-[#071E3B]">
      {/* 1. Navbar */}
      <Navbar />

      {/* 2. Full Pricing Matrix & Guarantees */}
      <PricingSection />

      {/* 3. Footer */}
      <Footer />
    </main>
  );
}
