"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import BookingValueProps from "@/Components/Booking/BookingValueProps";
import PaymentSuccessCard from "@/Components/Booking/PaymentSuccessCard";

export default function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const nameParam = searchParams.get("name") || "";
  const bookingIdParam =
    searchParams.get("booking_id") ||
    searchParams.get("bookingId") ||
    searchParams.get("session_id") ||
    "";
  const amountParam = searchParams.get("amount") || "";
  const currencyParam = searchParams.get("currency") || "SGD";
  const paymentTypeParam =
    searchParams.get("payment_type") ||
    searchParams.get("payment") ||
    searchParams.get("type") ||
    "";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
      {/* Left Column (5 Cols): Value Props */}
      <div className="lg:col-span-5 order-2 lg:order-1">
        <BookingValueProps />
      </div>

      {/* Right Column (7 Cols): Payment Success Card */}
      <div className="lg:col-span-7 order-1 lg:order-2 flex justify-center lg:justify-start">
        <PaymentSuccessCard
          customerName={nameParam}
          bookingId={bookingIdParam}
          amount={amountParam}
          currency={currencyParam}
          paymentType={paymentTypeParam}
        />
      </div>
    </div>
  );
}
