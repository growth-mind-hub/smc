import Navbar from "@/Components/Header/Navbar";
import HeroSection from "@/Components/Hero/HeroSection";
import HowItWorks from "@/Components/HowItWorks/HowItWorks";
import StatsSection from "@/Components/Stats/StatsSection";
import FleetSection from "@/Components/Fleet/FleetSection";
import OccasionsSection from "@/Components/Occasions/OccasionsSection";
import ServicesSection from "@/Components/Services/ServicesSection";
import CTASection from "@/Components/CTA/CTASection";
import Footer from "@/Components/Footer/Footer";
import { getPrismicServices } from "@/lib/prismic/services";

export const revalidate = 60; // Auto-revalidate every 60 seconds (ISR)

export default async function Home() {
  const services = await getPrismicServices();

  return (
    <main className="min-h-screen flex flex-col w-full selection:bg-[#C49B55] selection:text-[#070D1E]">
      {/* 1. Header / Navbar */}
      <Navbar />

      {/* 2. Hero Section with Booking Card */}
      <HeroSection />

      {/* 3. Three Simple Steps (How It Works) */}
      <HowItWorks />

      {/* 4. Statistics Ribbon */}
      <StatsSection />

      {/* 5. Fleet Grid (Spacious, Clean & Always On Time) */}
      <FleetSection />

      {/* 6. Why Choose Us / Occasions Banner */}
      <OccasionsSection />

      {/* 7. Rides for Every Need (Services Grid) */}
      <ServicesSection services={services} />

      {/* 8. Final CTA */}
      <CTASection />

      {/* 9. Footer */}
      <Footer />
    </main>
  );
}
