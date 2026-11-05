/**
 * Time and Form Validation Utilities for Singapore Maxi Cabs
 */

/**
 * Checks if a selected pickup time falls within the late-night / early-morning
 * window of 10:00 PM (22:00) to 7:00 AM (07:00).
 *
 * Supported formats:
 * - HTML5 time input: "22:00", "06:45", "17:15"
 * - 12-hour strings: "10:00 PM", "11:30 PM", "6:15 AM", "7:00 AM"
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

  // Window: 10:00 PM (22:00) up to 7:00 AM (07:00)
  // 22:00 - 23:59: hours >= 22
  // 00:00 - 06:59: hours < 7
  return hours >= 22 || hours < 7;
}

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

