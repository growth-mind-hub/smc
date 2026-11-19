import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/Components/Header/Navbar";
import ServiceDetailTemplate, { ServiceDetail } from "@/Components/Services/ServiceDetailTemplate";
import Footer from "@/Components/Footer/Footer";
import { getPrismicServices, getPrismicServiceBySlug } from "@/lib/prismic/services";

interface ServicePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const revalidate = 60; // Auto-revalidate every 60 seconds (ISR)
export const dynamicParams = true; // Allow newly created Prismic services to be rendered on demand

export async function generateStaticParams() {
  const services = await getPrismicServices();
  return services.map((s) => ({
    slug: s.slug || s.id,
  }));
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = await getPrismicServiceBySlug(slug);

  if (!service) {
    return {
      title: "Service Not Found | Singapore Maxicabs",
    };
  }

  return {
    title: service.metaTitle || `${service.title} | Singapore Maxicabs Flat-Rate Booking`,
    description: service.metaDescription || service.heroDescription || service.shortDescription,
  };
}

export default async function ServiceDetailPage({ params }: ServicePageProps) {
  const { slug } = await params;
  const service = await getPrismicServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  return (
    <main className="min-h-screen flex flex-col w-full selection:bg-[#C6A45A] selection:text-[#071E3B]">
      {/* 1. Navbar */}
      <Navbar />

      {/* 2. Reusable Service Detail Template */}
      <ServiceDetailTemplate service={service as unknown as ServiceDetail} />

      {/* 3. Footer */}
      <Footer />
    </main>
  );
}
