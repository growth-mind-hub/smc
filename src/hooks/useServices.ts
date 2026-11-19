"use client";

import { useState, useEffect } from "react";
import { NormalizedService, getLocalServices } from "@/lib/prismic/services";

let cachedServices: NormalizedService[] | null = null;

export function useServices() {
  const [services, setServices] = useState<NormalizedService[]>(() => {
    return cachedServices || getLocalServices();
  });
  const [isLoading, setIsLoading] = useState(!cachedServices);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const res = await fetch("/api/services", {
          credentials: "same-origin",
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.success && Array.isArray(data.services) && data.services.length > 0) {
            cachedServices = data.services;
            if (isMounted) {
              setServices(data.services);
            }
          }
        }
      } catch (err) {
        console.warn("Failed to load /api/services, using default cached services:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  return { services, isLoading };
}
