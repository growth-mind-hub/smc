import { VehicleCard } from "@/types/api";
import { resolveServiceForBooking, getVehicleFareForBooking, BookingServiceContext } from "./serviceResolver";

export interface RecommendedFleetResult {
  vehicleId: number;
  selectedFleet: string;
  selectedFleetSlug: string;
  baseFare: number;
}

export interface VehicleCapacityFit {
  fits: boolean;
  reason?: string;
  badgeNote: string;
  maxPax: number;
  maxLuggage: number;
}

/**
 * Validates capacity according to specific fleet rules:
 * - Mercedes E-Class / S-Class: Max capacity 3 Pax only. 2 Pax with up to 3 Luggage (above that prompt for V-Class).
 * - Alphard / Vellfire: Max 6 Pax without luggage, 4 Pax with 4 Luggage.
 * - Mercedes V-Class: Up to 7 Pax & 7 Luggage.
 * - 13-Seater Minibus: 13 passengers with no bags, or 9 Pax with 8–9 Luggage.
 * - 19/23-Seater Coach: Up to 23 Pax (no luggage capacity).
 * - 40-Seater Coach: 40 Pax or 30 Pax with luggage.
 * - 7-Seater Wheelchair Maxi Cab: 3 Pax + 1 Wheelchair User.
 * - 9-Seater Wheelchair Maxi Cab: 5 Pax + 1 Wheelchair User.
 */
export function checkVehicleCapacityFit(
  slug: string,
  passengers: number,
  luggage: number,
  isWheelchair = false
): VehicleCapacityFit {
  const s = (slug || "").toLowerCase();

  // Wheelchair Maxi Cabs
  if (s.includes("wheelchair") || isWheelchair) {
    if (passengers <= 3) {
      return {
        fits: true,
        badgeNote: "3 Pax + 1 Wheelchair User",
        maxPax: 3,
        maxLuggage: 4,
      };
    }
    if (passengers <= 5) {
      return {
        fits: true,
        badgeNote: "5 Pax + 1 Wheelchair User",
        maxPax: 5,
        maxLuggage: 5,
      };
    }
    return {
      fits: false,
      reason: "Max 5 Pax with 1 Wheelchair user",
      badgeNote: "Max 5 Pax + 1 Wheelchair",
      maxPax: 5,
      maxLuggage: 5,
    };
  }

  // Mercedes E-Class & S-Class (Sedans)
  if (s.includes("mercedes-e-class") || s.includes("mercedes-s-class") || s.includes("e-class") || s.includes("s-class")) {
    if (passengers > 3) {
      return {
        fits: false,
        reason: "Max 3 Pax only (V-Class recommended)",
        badgeNote: "Max 3 Pax only",
        maxPax: 3,
        maxLuggage: 3,
      };
    }
    if (passengers === 2 && luggage > 3) {
      return {
        fits: false,
        reason: "Max 3 Luggage for 2 Pax (V-Class recommended)",
        badgeNote: "2 Pax + 3 Luggage max",
        maxPax: 3,
        maxLuggage: 3,
      };
    }
    if (passengers === 3 && luggage > 2) {
      return {
        fits: false,
        reason: "Max 2 Luggage for 3 Pax (V-Class recommended)",
        badgeNote: "3 Pax + 2 Luggage max",
        maxPax: 3,
        maxLuggage: 2,
      };
    }
    return {
      fits: true,
      badgeNote: "Max 3 Pax • 2 Pax + 3 Bags",
      maxPax: 3,
      maxLuggage: 3,
    };
  }

  // Alphard / Vellfire (6-Seater)
  if (s === "6-seater" || s.includes("alphard") || s.includes("vellfire")) {
    if (passengers > 6) {
      return {
        fits: false,
        reason: "Max 6 Pax without luggage",
        badgeNote: "Max 6 Pax (no bags)",
        maxPax: 6,
        maxLuggage: 4,
      };
    }
    if (passengers > 4 && luggage > 2) {
      return {
        fits: false,
        reason: "Max 4 Pax with 4 Luggage",
        badgeNote: "4 Pax + 4 Bags max",
        maxPax: 6,
        maxLuggage: 4,
      };
    }
    if (luggage > 4) {
      return {
        fits: false,
        reason: "Max 4 Luggage in Alphard",
        badgeNote: "4 Bags max",
        maxPax: 6,
        maxLuggage: 4,
      };
    }
    return {
      fits: true,
      badgeNote: "Max 6 Pax (no bags) • 4 Pax + 4 Bags",
      maxPax: 6,
      maxLuggage: 4,
    };
  }

  // Mercedes V-Class / VIP Lounge / 7-Seater
  if (s === "vip-lounge" || s === "7-seater" || s.includes("v-class") || s.includes("vito")) {
    if (passengers <= 7 && luggage <= 7) {
      return {
        fits: true,
        badgeNote: "Up to 7 Pax & 7 Bags (Recommended)",
        maxPax: 7,
        maxLuggage: 7,
      };
    }
    return {
      fits: false,
      reason: "Max 7 Pax & 7 Luggage (13-Seater recommended)",
      badgeNote: "Max 7 Pax & 7 Bags",
      maxPax: 7,
      maxLuggage: 7,
    };
  }

  // 13-Seater Minibus
  if (s === "13-seater" || s.includes("13-seater") || s.includes("minibus")) {
    if (passengers <= 9 && luggage <= 9) {
      return {
        fits: true,
        badgeNote: "13 Pax (no bags) • 9 Pax with 8–9 Bags",
        maxPax: 13,
        maxLuggage: 9,
      };
    }
    if (passengers <= 13 && luggage <= 4) {
      return {
        fits: true,
        badgeNote: "13 Pax (no bags) • 9 Pax with 8–9 Bags",
        maxPax: 13,
        maxLuggage: 9,
      };
    }
    if (passengers <= 13 && luggage <= 12) {
      return {
        fits: true,
        badgeNote: "13 Pax (no bags) • 9 Pax with 8–9 Bags",
        maxPax: 13,
        maxLuggage: 12,
      };
    }
    return {
      fits: false,
      reason: "Max 13 Passengers or 9 Pax with 9 Bags",
      badgeNote: "Max 13 Pax",
      maxPax: 13,
      maxLuggage: 12,
    };
  }

  // 19 / 23-Seater Coach
  if (s.includes("23-seater") || s.includes("19-seater")) {
    if (passengers <= 23 && luggage === 0) {
      return {
        fits: true,
        badgeNote: "Up to 23 Pax (No luggage capacity)",
        maxPax: 23,
        maxLuggage: 0,
      };
    }
    if (passengers <= 23 && luggage > 0) {
      return {
        fits: false,
        reason: "23-Seater Coach has no luggage capacity",
        badgeNote: "No luggage capacity",
        maxPax: 23,
        maxLuggage: 0,
      };
    }
    return {
      fits: false,
      reason: "Max 23 Passengers",
      badgeNote: "Max 23 Pax",
      maxPax: 23,
      maxLuggage: 0,
    };
  }

  // 40-Seater Coach
  if (s.includes("40-seater") || s.includes("coach")) {
    if (passengers <= 40 && luggage === 0) {
      return {
        fits: true,
        badgeNote: "Up to 40 Pax (30 Pax with luggage)",
        maxPax: 40,
        maxLuggage: 30,
      };
    }
    if (passengers <= 30 && luggage <= 30) {
      return {
        fits: true,
        badgeNote: "Up to 40 Pax (30 Pax with luggage)",
        maxPax: 40,
        maxLuggage: 30,
      };
    }
    if (passengers <= 40) {
      return {
        fits: false,
        reason: "Max 30 Pax when carrying luggage",
        badgeNote: "30 Pax with luggage max",
        maxPax: 40,
        maxLuggage: 30,
      };
    }
    return {
      fits: false,
      reason: "Max 40 Passengers",
      badgeNote: "Max 40 Pax",
      maxPax: 40,
      maxLuggage: 30,
    };
  }

  // Fallback
  return {
    fits: passengers <= 7 && luggage <= 5,
    badgeNote: "Standard Maxi Cab",
    maxPax: 7,
    maxLuggage: 5,
  };
}

function toFleetSlug(name: string, fallback: string): string {
  if (!name) return fallback;
  const s = name.toLowerCase().trim().replace(/[/\\+]/g, "-").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return s || fallback;
}

export function getRecommendedFleet(
  passengers: number,
  luggage: number,
  serviceContext: string | BookingServiceContext = "Airport Transfer",
  liveVehicles?: VehicleCard[],
  options?: { isWheelchair?: boolean }
): RecommendedFleetResult {
  const bookingCtx: BookingServiceContext =
    typeof serviceContext === "string" ? { serviceType: serviceContext } : serviceContext;
  const { code } = resolveServiceForBooking(bookingCtx);
  const isAirport = code === "arrival";
  const isHourly = code === "hourly";

  const isWheelchair = Boolean(
    options?.isWheelchair ||
    bookingCtx.wheelchairAccessible ||
    (bookingCtx.wheelchairCount && bookingCtx.wheelchairCount > 0)
  );

  // 1. Wheelchair logic
  if (isWheelchair) {
    if (passengers <= 3) {
      const match = liveVehicles?.find(
        (v) => (v.id === 8 || v.id === 11 || v.name.toLowerCase().includes("wheelchair")) && (v.passengerCapacity ?? 7) <= 7
      );
      if (match) {
        return {
          vehicleId: match.id,
          selectedFleet: match.name,
          selectedFleetSlug: toFleetSlug(match.name, "7-seater-maxi-cab-wheelchair"),
          baseFare: getVehicleFareForBooking(match, bookingCtx),
        };
      }
      return {
        vehicleId: 8,
        selectedFleet: "7 Seater Maxi Cab Wheelchair",
        selectedFleetSlug: "7-seater-maxi-cab-wheelchair",
        baseFare: isAirport ? 85 : isHourly ? 65 : 75,
      };
    } else {
      // 4 to 5 pax with wheelchair
      const match = liveVehicles?.find(
        (v) => (v.id === 8 || v.id === 11 || v.name.toLowerCase().includes("wheelchair")) && (v.passengerCapacity ?? 7) >= 9
      ) || liveVehicles?.find((v) => v.name.toLowerCase().includes("wheelchair"));
      if (match) {
        return {
          vehicleId: match.id,
          selectedFleet: match.name,
          selectedFleetSlug: toFleetSlug(match.name, "9-seater-maxi-cab-wheelchair"),
          baseFare: getVehicleFareForBooking(match, bookingCtx),
        };
      }
      return {
        vehicleId: 11,
        selectedFleet: "9 Seater Maxi Cab Wheelchair",
        selectedFleetSlug: "9-seater-maxi-cab-wheelchair",
        baseFare: isAirport ? 90 : isHourly ? 70 : 85,
      };
    }
  }

  // 2. High capacity buses: > 23 pax -> 40-seater coach
  if (passengers > 23) {
    const match = liveVehicles?.find((v) => v.id === 10 || (v.passengerCapacity ?? 0) >= 40);
    if (match) {
      return {
        vehicleId: match.id,
        selectedFleet: match.name,
        selectedFleetSlug: toFleetSlug(match.name, "40-seater-coaches"),
        baseFare: getVehicleFareForBooking(match, bookingCtx),
      };
    }
    return {
      vehicleId: 10,
      selectedFleet: "40 Seater Coaches",
      selectedFleetSlug: "40-seater-coaches",
      baseFare: isAirport ? 200 : isHourly ? 150 : 180,
    };
  }

  // 3. Medium capacity buses: 14 to 23 pax -> 23-seater coach
  if (passengers > 13) {
    const match = liveVehicles?.find((v) => v.id === 9 || (v.passengerCapacity ?? 0) >= 23);
    if (match) {
      return {
        vehicleId: match.id,
        selectedFleet: match.name,
        selectedFleetSlug: toFleetSlug(match.name, "23-seater-coaches"),
        baseFare: getVehicleFareForBooking(match, bookingCtx),
      };
    }
    return {
      vehicleId: 9,
      selectedFleet: "23 Seater Coaches",
      selectedFleetSlug: "23-seater-coaches",
      baseFare: isAirport ? 150 : isHourly ? 110 : 130,
    };
  }

  // 4. Above 7 Pax OR Above 7 Luggage -> 13-Seater Minibus
  if (passengers > 7 || luggage > 7) {
    const match = liveVehicles?.find(
      (v) => (v.id === 6 || v.passengerCapacity === 13) && !v.name.toLowerCase().includes("vip")
    );
    if (match) {
      return {
        vehicleId: match.id,
        selectedFleet: match.name,
        selectedFleetSlug: toFleetSlug(match.name, "toyota-hiace-13-seater-minibus"),
        baseFare: getVehicleFareForBooking(match, bookingCtx),
      };
    }
    return {
      vehicleId: 6,
      selectedFleet: "Toyota Hiace 13 seater Minibus",
      selectedFleetSlug: "toyota-hiace-13-seater-minibus",
      baseFare: isAirport ? 85 : isHourly ? 75 : 80,
    };
  }

  // 5. More than 3 Pax OR More than 3 Luggage -> Mercedes V-Class!
  if (passengers > 3 || luggage > 3) {
    const match =
      liveVehicles?.find(
        (v) => v.id === 5 || v.name.toLowerCase().includes("v-class") || v.name.toLowerCase().includes("v class")
      ) ||
      liveVehicles?.find(
        (v) => (v.passengerCapacity === 7 && v.id === 4) || v.name.toLowerCase().includes("vito")
      ) ||
      liveVehicles?.find((v) => (v.passengerCapacity ?? 7) >= 7);

    if (match) {
      return {
        vehicleId: match.id,
        selectedFleet: match.name,
        selectedFleetSlug: toFleetSlug(match.name, "mercedes-v-class"),
        baseFare: getVehicleFareForBooking(match, bookingCtx),
      };
    }

    return {
      vehicleId: 5,
      selectedFleet: "Mercedes V-Class",
      selectedFleetSlug: "mercedes-v-class",
      baseFare: isAirport ? 90 : isHourly ? 85 : 90,
    };
  }

  // 6. Up to 3 Pax and Up to 3 Luggage -> Mercedes E-Class Sedan
  const sedanMatch = liveVehicles?.find(
    (v) => v.id === 1 || v.name.toLowerCase().includes("e-class") || v.name.toLowerCase().includes("e class")
  );

  if (sedanMatch) {
    return {
      vehicleId: sedanMatch.id,
      selectedFleet: sedanMatch.name,
      selectedFleetSlug: toFleetSlug(sedanMatch.name, "mercedes-e-class"),
      baseFare: getVehicleFareForBooking(sedanMatch, bookingCtx),
    };
  }

  return {
    vehicleId: 1,
    selectedFleet: "Mercedes E Class",
    selectedFleetSlug: "mercedes-e-class",
    baseFare: isAirport ? 85 : isHourly ? 70 : 85,
  };
}
}
