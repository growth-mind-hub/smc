import type { Metadata, Viewport } from "next";
import { manrope, inter, playfair } from "@/fonts";
import "./globals.css";
import { BookingModalProvider } from "@/context/BookingContext";
import BookingModal from "@/Components/Booking/BookingModal";
import MobileQuickBar from "@/Components/Mobile/MobileQuickBar";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.singaporemaxicabs.com.sg"),
  title: {
    default: "Singapore Maxicabs | Premium Maxi Cab & Luxury Chauffeur Service",
    template: "%s | Singapore Maxicabs",
  },
  description:
    "Book Singapore's premium maxi cab service. Enjoy comfortable rides, fixed flat-rate fares, airport transfers, corporate transport, and wheelchair mobility.",
  keywords: [
    "maxi cab",
    "maxicab singapore",
    "airport transfer singapore",
    "7 seater taxi",
    "9 seater taxi",
    "wheelchair taxi singapore",
    "luxury chauffeur singapore",
    "minibus booking",
    "corporate transport singapore",
  ],
  authors: [{ name: "Singapore Maxicabs" }],
  creator: "Singapore Maxicabs",
  publisher: "Singapore Maxicabs",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.ico?v=2", sizes: "any" },
      { url: "/app-icon.png?v=2", type: "image/png" },
    ],
    apple: [
      { url: "/app-icon.png?v=2", sizes: "180x180", type: "image/png" },
    ],
    shortcut: ["/favicon.ico?v=2"],
  },
  openGraph: {
    title: "Singapore Maxicabs | Premium Maxi Cab & Luxury Chauffeur Service",
    description:
      "Book Singapore's premium maxi cab service. Comfortable rides, fixed flat-rate fares, and reliable airport transfers.",
    url: "https://www.singaporemaxicabs.com.sg",
    siteName: "Singapore Maxicabs",
    images: [
      {
        url: "/logo.jpeg",
        width: 1200,
        height: 1200,
        alt: "Singapore Maxicabs Logo",
      },
    ],
    locale: "en_SG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Singapore Maxicabs | Premium Maxi Cab & Luxury Chauffeur Service",
    description:
      "Book Singapore's premium maxi cab service. Comfortable rides, fixed flat-rate fares, and reliable airport transfers.",
    images: ["/logo.jpeg"],
    creator: "@singaporemaxicabs",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://www.singaporemaxicabs.com.sg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#071E3B",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TaxiService",
    name: "Singapore Maxicabs",
    image: "https://www.singaporemaxicabs.com.sg/logo.jpeg",
    logo: "https://www.singaporemaxicabs.com.sg/app-icon.png",
    "@id": "https://www.singaporemaxicabs.com.sg",
    url: "https://www.singaporemaxicabs.com.sg",
    telephone: "+6591234567",
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Singapore",
      addressLocality: "Singapore",
      addressRegion: "SG",
      postalCode: "000000",
      addressCountry: "SG",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 1.3521,
      longitude: 103.8198,
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "00:00",
      closes: "23:59",
    },
  };

  return (
    <html
      lang="en"
      className={`${manrope.variable} ${inter.variable} ${playfair.variable} scroll-smooth antialiased`}
    >
      <head>
        <link rel="icon" href="/favicon.ico?v=2" sizes="any" />
        <link rel="icon" href="/app-icon.png?v=2" type="image/png" />
        <link rel="apple-touch-icon" href="/app-icon.png?v=2" />
      </head>
      <body className="min-h-screen flex flex-col font-sans bg-white text-[#071E3B] pb-16 md:pb-0">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <BookingModalProvider>
          {children}
          <BookingModal />
          <MobileQuickBar />
        </BookingModalProvider>
      </body>
    </html>
  );
}

