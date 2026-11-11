/**
 * Time and Form Validation Utilities for Singapore Maxi Cabs
 *
 * Late-night operations window: 10:00 PM (22:00) to 6:00 AM (06:00) UAE timezone (Asia/Dubai).
 */

export interface UAETimeInfo {
  hours: number;
  minutes: number;
  timeString: string;
  isLateNight: boolean;
}

/**
 * Returns the current time converted to UAE timezone (Asia/Dubai, UTC+4).
 * Asia/Dubai does not observe Daylight Saving Time.
 * Late-night window: 10:00 PM (22:00) to 6:00 AM (06:00) UAE time.
 */
export function getUAETime(date: Date = new Date()): UAETimeInfo {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Dubai",
    hour: "numeric",
    minute: "numeric",
    hourCycle: "h23",
  });

  const parts = formatter.formatToParts(date);
  const hourPart = parts.find((p) => p.type === "hour");
  const minutePart = parts.find((p) => p.type === "minute");

  const hours = hourPart ? parseInt(hourPart.value, 10) % 24 : 0;
  const minutes = minutePart ? parseInt(minutePart.value, 10) : 0;

  // Window: 10:00 PM (22:00) to 6:00 AM (06:00) UAE
  // 22:00 - 23:59: hours >= 22
  // 00:00 - 05:59: hours < 6
  const isLateNight = hours >= 22 || hours < 6;

  const displayTime = date.toLocaleTimeString("en-US", {
    timeZone: "Asia/Dubai",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return {
    hours,
    minutes,
    timeString: `${displayTime} (UAE)`,
    isLateNight,
  };
}

/**
 * Helper to check if current moment in UAE timezone is late night (10 PM to 6 AM).
 */
export function isCurrentTimeUAENight(date: Date = new Date()): boolean {
  return getUAETime(date).isLateNight;
}

/**
 * Checks if a selected pickup time falls within the late-night window
 * of 10:00 PM (22:00) to 6:00 AM (06:00).
 *
 * Supported formats:
 * - HTML5 time input: "22:00", "05:45", "17:15"
 * - 12-hour strings: "10:00 PM", "11:30 PM", "5:15 AM", "6:00 AM"
 */
export function isNightOrEarlyMorningTime(timeStr?: string): boolean {
  if (!timeStr) return false;
  const clean = timeStr.trim().toLowerCase();

  const isPM = clean.includes("pm");
  const isAM = clean.includes("am");

  const match = clean.match(/(\d{1,2})[:.](\d{2})/);
  if (!match) return false;

  let hours = parseInt(match[1], 10);
  if (isNaN(hours)) return false;

  if (isPM && hours < 12) hours += 12;
  if (isAM && hours === 12) hours = 0;

  // Window: 10:00 PM (22:00) up to 6:00 AM (06:00)
  // 22:00 - 23:59: hours >= 22
  // 00:00 - 05:59: hours < 6
  return hours >= 22 || hours < 6;
}

export const isLateNightPickupTime = isNightOrEarlyMorningTime;

/**
 * Validates passenger contact and journey details
 */
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateBookingDetails(data: {
  name?: string;
  phone?: string;
  email?: string;
  pickupDate?: string;
  pickupTime?: string;
}): ValidationResult {
  const errors: Record<string, string> = {};

  // Name validation
  if (!data.name || data.name.trim().length < 2) {
    errors.name = "Please enter passenger full name (minimum 2 characters)";
  }

  // Phone validation (digits only >= 7)
  const phoneDigits = (data.phone || "").replace(/\D/g, "");
  if (!phoneDigits || phoneDigits.length < 7 || phoneDigits.length > 15) {
    errors.phone = "Please enter a valid mobile number (7–15 digits)";
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !emailRegex.test(data.email.trim())) {
    errors.email = "Please enter a valid email address for confirmation";
  }

  // Date validation
  if (!data.pickupDate) {
    errors.pickupDate = "Please select a pickup date";
  }

  // Time validation
  if (!data.pickupTime) {
    errors.pickupTime = "Please select a pickup time";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Formats a YYYY-MM-DD date string into a luxury readable string, e.g. "Wed, 25 Nov 2026"
 */
export function formatDateDisplay(dateStr?: string): string {
  if (!dateStr) return "—";
  try {
    const parts = dateStr.split("-").map(Number);
    if (parts.length !== 3) return dateStr;
    const [year, month, day] = parts;
    if (!year || !month || !day) return dateStr;
    const date = new Date(year, month - 1, day);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

/**
 * Formats a 24-hour "HH:mm" time string into 12-hour "hh:mm AM/PM"
 */
export function formatTimeDisplay(timeStr?: string): string {
  if (!timeStr) return "—";
  try {
    const parts = timeStr.split(":").map(Number);
    if (parts.length < 2) return timeStr;
    const [h, m] = parts;
    if (isNaN(h) || isNaN(m)) return timeStr;
    const period = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    const minuteStr = m.toString().padStart(2, "0");
    return `${hour12}:${minuteStr} ${period}`;
  } catch {
    return timeStr;
  }
}
