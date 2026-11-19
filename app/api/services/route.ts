import { NextResponse } from "next/server";
import { getPrismicServices } from "@/lib/prismic/services";

export const revalidate = 60; // Cache for 60 seconds

export async function GET() {
  try {
    const services = await getPrismicServices();
    return NextResponse.json({
      success: true,
      count: services.length,
      services,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch services",
      },
      { status: 500 }
    );
  }
}
