import { ServiceItem, VehicleCard } from "@/types/api";

export interface BookingServiceContext {
  serviceType?: string;
  serviceCode?: string;
  serviceId?: number;
  pickup?: string;
  dropoff?: string;
  durationHours?: number;
}

/**
 * Resolves the service code ("arrival", "departure_transfer", or "hourly")
 * and matching backend serviceId based on booking itinerary.
 */
export function resolveServiceForBooking(
  booking: BookingServiceContext,
  services?: ServiceItem[]
): { code: "arrival" | "departure_transfer" | "hourly"; id: number } {
  const serviceTypeLower = (booking.serviceType || "").toLowerCase();
  const serviceCodeLower = (booking.serviceCode || "").toLowerCase();
  const pickupLower = (booking.pickup || "").toLowerCase();
  const dropoffLower = (booking.dropoff || "").toLowerCase();

  const isAirportPickup =
    pickupLower.includes("airport") ||
    pickupLower.includes("changi") ||
    pickupLower.includes("terminal") ||
    pickupLower.includes("sin");

  const isAirportDropoff =
    dropoffLower.includes("airport") ||
    dropoffLower.includes("changi") ||
    dropoffLower.includes("terminal") ||
    dropoffLower.includes("sin");

  let code: "arrival" | "departure_transfer" | "hourly" = "arrival";

  if (
    serviceTypeLower.includes("hourly") ||
    serviceTypeLower.includes("charter") ||
    serviceTypeLower.includes("disposal") ||
    serviceCodeLower === "hourly"
  ) {
    code = "hourly";
  } else if (
    serviceTypeLower.includes("city") ||
    serviceTypeLower.includes("point") ||
    serviceTypeLower.includes("port") ||
    serviceTypeLower.includes("tour") ||
    (!serviceTypeLower.includes("airport") && !isAirportPickup)
  ) {
    // City transfers, point-to-point, port transfers map to departure_transfer in backend catalog
    code = "departure_transfer";
  } else if (
    serviceTypeLower.includes("departure") ||
    serviceCodeLower.includes("departure") ||
    (isAirportDropoff && !isAirportPickup)
  ) {
    // Departures from city/hotel to airport
    code = "departure_transfer";
  } else {
    // Airport arrivals (pickup at Changi or Airport Transfer)
    code = "arrival";
  }

  let id = code === "arrival" ? 1 : code === "departure_transfer" ? 2 : 3;
  if (services && services.length > 0) {
    const found = services.find((s) => s.code === code);
    if (found) id = found.id;
  }

  return { code, id };
}

/**
 * Computes the exact vehicle fare matching backend catalog pricing.
 */
export function getVehicleFareForBooking(
  vehicle: Partial<VehicleCard> & { slug?: string },
  booking: BookingServiceContext,
  services?: ServiceItem[]
): number {
  const { code } = resolveServiceForBooking(booking, services);
  const pax = vehicle.passengerCapacity ?? 7;
  const slug = (vehicle.slug || vehicle.name || "").toLowerCase();

  // Hourly Charter Service
  if (code === "hourly") {
    const hours = booking.durationHours || 3;
    if (hours === 8 && vehicle.prices?.hourly?.eightHourAmount) {
      return vehicle.prices.hourly.eightHourAmount;
    }
    if (hours === 3 && vehicle.prices?.hourly?.threeHourAmount) {
      return vehicle.prices.hourly.threeHourAmount;
    }
    if (vehicle.prices?.hourly?.amount) {
      return vehicle.prices.hourly.amount * hours;
    }
    // Fallback hourly packages
    const hourlyFallback = pax >= 23 ? 110 : pax >= 13 ? 75 : 60;
    if (hours === 3) return pax >= 23 ? 330 : pax >= 13 ? 225 : 180;
    if (hours === 8) return pax >= 23 ? 850 : pax >= 13 ? 550 : 480;
    return hourlyFallback * hours;
  }

  // Airport Arrival Service
  if (code === "arrival") {
    if (vehicle.prices?.arrival?.amount) {
      return vehicle.prices.arrival.amount;
    }
    if (slug.includes("40")) return 220;
    if (slug.includes("23")) return 150;
    if (slug.includes("vip") || slug.includes("s-class")) return 90;
    if (pax >= 13 || slug.includes("13")) return 85;
    if (slug.includes("wheelchair")) return 85;
    if (pax === 9 || slug.includes("9")) return 75;
    return 80; // 7-Seater / 6-Seater Alphard/Vellfire Arrival is $80 SGD
  }

  // Departure Transfer / City Transfer / Point-to-Point
  if (vehicle.prices?.departure_transfer?.amount) {
    return vehicle.prices.departure_transfer.amount;
  }
  if (slug.includes("40")) return 180;
  if (slug.includes("23")) return 130;
  if (slug.includes("vip") || slug.includes("s-class")) return 80;
  if (pax >= 13 || slug.includes("13")) return 80;
  if (slug.includes("wheelchair")) return 75;
  if (pax === 9 || slug.includes("9")) return 65;
  return 70; // 7-Seater / 6-Seater Alphard/Vellfire Transfer is $70 SGD
}
