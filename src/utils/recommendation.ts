import { VehicleCard } from "@/types/api";
import { resolveServiceForBooking, getVehicleFareForBooking, BookingServiceContext } from "./serviceResolver";

export interface RecommendedFleetResult {
  vehicleId: number;
  selectedFleet: string;
  selectedFleetSlug: string;
  baseFare: number;
}

export function getRecommendedFleet(
  passengers: number,
  luggage: number,
  serviceContext: string | BookingServiceContext = "Airport Transfer",
  liveVehicles?: VehicleCard[]
): RecommendedFleetResult {
  const bookingCtx: BookingServiceContext =
    typeof serviceContext === "string" ? { serviceType: serviceContext } : serviceContext;
  const { code } = resolveServiceForBooking(bookingCtx);
  const isAirport = code === "arrival";
  const isHourly = code === "hourly";

  // If live backend catalog is available
  if (liveVehicles && liveVehicles.length > 0) {
    // Filter matching vehicles that fit both pax & luggage
    const suitable = liveVehicles.filter(
      (v) => (v.passengerCapacity ?? 7) >= passengers && (v.luggageCapacity ?? 5) >= luggage
    );

    // Sort by capacity ascending to get the most optimal size
    suitable.sort((a, b) => (a.passengerCapacity ?? 7) - (b.passengerCapacity ?? 7));

    const chosen = suitable[0] || liveVehicles[liveVehicles.length - 1];
    if (chosen) {
      const slug =
        chosen.passengerCapacity === 6
          ? "6-seater"
          : chosen.passengerCapacity === 7
          ? "7-seater"
          : chosen.passengerCapacity === 9
          ? "9-seater"
          : chosen.passengerCapacity === 13
          ? "13-seater"
          : `vehicle-${chosen.id}`;

      const fare = getVehicleFareForBooking(chosen, bookingCtx);

      return {
        vehicleId: chosen.id,
        selectedFleet: chosen.name,
        selectedFleetSlug: slug,
        baseFare: fare,
      };
    }
  }

  // Local rule-based recommendation fallback strictly matching backend API prices
  if (passengers <= 6 && luggage <= 4) {
    return {
      vehicleId: 1,
      selectedFleet: "6 Seater Maxi Cab",
      selectedFleetSlug: "6-seater",
      baseFare: isAirport ? 80 : isHourly ? 60 : 70,
    };
  } else if (passengers <= 7 && luggage <= 5) {
    return {
      vehicleId: 3,
      selectedFleet: "7 Seater Maxi Cab",
      selectedFleetSlug: "7-seater",
      baseFare: isAirport ? 80 : isHourly ? 60 : 70,
    };
  } else if (passengers <= 9 && luggage <= 6) {
    return {
      vehicleId: 12,
      selectedFleet: "9 Seater Maxi Cab",
      selectedFleetSlug: "9-seater",
      baseFare: isAirport ? 75 : isHourly ? 60 : 65,
    };
  } else {
    return {
      vehicleId: 6,
      selectedFleet: "13 Seater Minibus",
      selectedFleetSlug: "13-seater",
      baseFare: isAirport ? 85 : isHourly ? 75 : 80,
    };
  }
}
