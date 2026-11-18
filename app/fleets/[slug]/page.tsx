import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/Components/Header/Navbar";
import FleetDetailTemplate from "@/Components/Fleet/FleetDetailTemplate";
import Footer from "@/Components/Footer/Footer";
import fleetData from "@/data/fleet.json";
import { resolveVehicle, fetchLiveVehicles, resolveSlugFromApiVehicle } from "@/lib/fleetResolver";

export const dynamicParams = true;
export const revalidate = 60;

interface FleetPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const liveVehicles = await fetchLiveVehicles();
  const liveSlugs = liveVehicles.map((v) => ({
    slug: resolveSlugFromApiVehicle(v),
  }));

  const staticSlugs = fleetData.vehicles.map((v) => ({
    slug: v.slug || v.id,
  }));

  // Canonical fleet aliases & legacy compatibility slugs
  const canonicalAliases = [
    "mercedes-e-class",
    "mercedes-s-class",
    "toyota-alphard-vellfire",
    "mercedes-vito-viano",
    "mercedes-v-class",
    "toyota-hiace-13-seater-minibus",
    "vip-executive-minibus",
    "7-seater-maxi-cab-wheelchair",
    "23-seater-coaches",
    "40-seater-coaches",
    "9-seater-minibus",
    "9-seater-maxi-cab-wheelchair",
    "6-seater",
    "7-seater",
    "9-seater",
    "13-seater",
    "vip-minibus",
    "vip-lounge",
    "wheelchair-cab",
    "23-seater-coach",
    "40-seater-coach",
  ].map((slug) => ({ slug }));

  // Include known API vehicle IDs
  const apiIdSlugs = Array.from({ length: 14 }, (_, i) => ({
    slug: String(i + 1),
  }));

  const allSlugs = [...liveSlugs, ...staticSlugs, ...canonicalAliases, ...apiIdSlugs];
  const uniqueSlugs = Array.from(new Set(allSlugs.map((s) => s.slug))).map((slug) => ({ slug }));

  return uniqueSlugs;
}

export async function generateMetadata({ params }: FleetPageProps): Promise<Metadata> {
  const { slug } = await params;
  const vehicle = await resolveVehicle(slug);

  if (!vehicle) {
    return {
      title: "Vehicle Not Found | Singapore Maxicabs",
      description: "The requested vehicle details could not be found.",
    };
  }

  return {
    title: `${vehicle.name} | Singapore Maxicabs Flat Rates & Specs`,
    description: vehicle.heroDescription || vehicle.description,
    openGraph: {
      title: `${vehicle.name} | Fixed Flat Rates Singapore Maxicabs`,
      description: vehicle.heroDescription || vehicle.description,
      images: [vehicle.image || "/images/Cab.png"],
    },
  };
}

export default async function FleetDetailPage({ params }: FleetPageProps) {
  const { slug } = await params;
  const vehicle = await resolveVehicle(slug);

  if (!vehicle) {
    notFound();
  }

  return (
    <main className="min-h-screen flex flex-col w-full selection:bg-[#C6A45A] selection:text-[#071E3B]">
      {/* 1. Navbar */}
      <Navbar />

      {/* 2. Single Fleet Details Section matching singleFleetPage.html */}
      <FleetDetailTemplate vehicle={vehicle} />

      {/* 3. Footer */}
      <Footer />
    </main>
  );
}
