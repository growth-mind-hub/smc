"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  MapPin,
  Plane,
  Building,
  ShoppingBag,
  Sparkles,
  Loader2,
  X,
  Compass,
} from "lucide-react";
import { getPlacesAutocomplete } from "@/lib/api/services";
import { GooglePlaceSuggestion } from "@/types/api";

interface LocationAutocompleteInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSelect?: (value: string) => void;
  required?: boolean;
  theme?: "light" | "glassDark";
  className?: string;
}

export default function LocationAutocompleteInput({
  label,
  placeholder = "Enter pickup or dropoff location in Singapore",
  value,
  onChange,
  onSelect,
  required = false,
  theme = "light",
  className = "",
}: LocationAutocompleteInputProps) {
  const [inputValue, setInputValue] = useState(value || "");
  const [prevValue, setPrevValue] = useState(value);

  // Sync external value changes during render per React guidelines
  if (value !== prevValue) {
    setPrevValue(value);
    setInputValue(value || "");
  }

  const [suggestions, setSuggestions] = useState<GooglePlaceSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastFetchedQueryRef = useRef<string | null>(null);
  const isSelectingRef = useRef<boolean>(false);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch suggestions with cancellation & caching
  const fetchSuggestions = useCallback(async (query: string) => {
    const trimmed = (query || "").trim();

    // If query is just 1 character, don't spam network; wait for 2+ characters or 0 (default popular places)
    if (trimmed.length === 1) {
      return;
    }

    if (lastFetchedQueryRef.current === trimmed && suggestions.length > 0) {
      setIsOpen(true);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    try {
      const res = await getPlacesAutocomplete(trimmed, ["sg"], {
        signal: controller.signal,
      });
      if (res && res.suggestions) {
        setSuggestions(res.suggestions);
        lastFetchedQueryRef.current = trimmed;
        setIsOpen(true);
      } else {
        setSuggestions([]);
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setSuggestions([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [suggestions.length]);

  // 2000ms Debounced input watcher
  useEffect(() => {
    if (isSelectingRef.current) {
      isSelectingRef.current = false;
      return;
    }

    const timer = setTimeout(() => {
      if (document.activeElement === inputRef.current) {
        fetchSuggestions(inputValue);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [inputValue, fetchSuggestions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    onChange(val);
    setSelectedIndex(-1);
    if (!isOpen) setIsOpen(true);
  };

  const handleFocus = () => {
    setIsOpen(true);
    fetchSuggestions(inputValue);
  };

  const handleSelectSuggestion = (suggestion: GooglePlaceSuggestion) => {
    const pred = suggestion.placePrediction;
    if (!pred) return;
    const mainText = pred.structuredFormat?.mainText?.text || pred.text?.text || "";
    const secondaryText = pred.structuredFormat?.secondaryText?.text;
    const fullText = secondaryText ? `${mainText}, ${secondaryText}` : mainText;

    isSelectingRef.current = true;
    setInputValue(fullText);
    onChange(fullText);
    if (onSelect) onSelect(fullText);
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    isSelectingRef.current = true;
    setInputValue("");
    onChange("");
    setSuggestions([]);
    lastFetchedQueryRef.current = null;
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === "ArrowDown") {
        setIsOpen(true);
        fetchSuggestions(inputValue);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        handleSelectSuggestion(suggestions[selectedIndex]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const getPlaceIcon = (pred?: GooglePlaceSuggestion["placePrediction"]) => {
    const text = (pred?.text?.text || "").toLowerCase();
    const types = pred?.types || [];

    if (
      text.includes("airport") ||
      text.includes("terminal") ||
      text.includes("changi") ||
      types.includes("airport")
    ) {
      return <Plane className="w-4 h-4 text-[#C6A45A]" strokeWidth={1.5} />;
    }
    if (
      text.includes("hotel") ||
      text.includes("sands") ||
      text.includes("fullerton") ||
      text.includes("raffles hotel") ||
      types.includes("lodging")
    ) {
      return <Building className="w-4 h-4 text-[#C6A45A]" />;
    }
    if (
      text.includes("mall") ||
      text.includes("orchard") ||
      text.includes("shopping") ||
      text.includes("jewel")
    ) {
      return <ShoppingBag className="w-4 h-4 text-[#C6A45A]" />;
    }
    if (
      text.includes("sentosa") ||
      text.includes("gardens by the bay") ||
      text.includes("zoo") ||
      text.includes("universal")
    ) {
      return <Sparkles className="w-4 h-4 text-[#C6A45A]" />;
    }
    return <Compass className="w-4 h-4 text-[#C6A45A]" />;
  };

  const isDark = theme === "glassDark";

  return (
    <div ref={containerRef} className={`self-stretch relative flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          className={`text-xs sm:text-sm font-medium font-inter leading-5 ${
            isDark ? "text-white" : "text-[#071E3B]"
          }`}
        >
          {label}
          {required && <span className="text-rose-500 ml-1 font-semibold">*</span>}
        </label>
      )}

      {/* Input Box */}
      <div
        className={`self-stretch relative flex items-center transition-all ${
          isDark
            ? "p-3 sm:p-3.5 bg-white rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-[#C6A45A]"
            : "p-3.5 sm:p-4 bg-[#F8F7F4] rounded-lg sm:rounded-xl border border-slate-200/90 focus-within:border-[#C6A45A] focus-within:bg-white focus-within:ring-1 focus-within:ring-[#C6A45A]"
        }`}
      >
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          autoComplete="off"
          spellCheck={false}
          className={`w-full text-xs sm:text-sm font-normal font-manrope outline-none bg-transparent pr-14 ${
            isDark
              ? "text-slate-900 placeholder:text-[#667085]"
              : "text-[#071E3B] placeholder:text-[#667085]"
          }`}
        />

        {/* Right Action Icons: Spinner, Clear, and Pin */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-auto">
          {isLoading && (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C6A45A]" />
          )}

          {inputValue.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 active:scale-95 transition-all cursor-pointer"
              title="Clear input"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <MapPin className="w-4 h-4 text-[#C6A45A] shrink-0 pointer-events-none" />
        </div>
      </div>

      {/* Autocomplete Dropdown Menu */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-2xl border border-slate-200/90 z-50 max-h-72 overflow-y-auto py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-1 text-[10px] uppercase font-bold text-[#C6A45A] font-manrope tracking-wider border-b border-slate-100 flex items-center justify-between">
            <span>Singapore Places &amp; Landmarks</span>
            <span className="text-[9px] text-slate-400 font-normal">Google Verified</span>
          </div>

          <ul className="divide-y divide-slate-100">
            {suggestions.map((item, idx) => {
              const pred = item.placePrediction;
              if (!pred) return null;
              const mainText =
                pred.structuredFormat?.mainText?.text ||
                pred.text?.text ||
                "Location";
              const secondaryText = pred.structuredFormat?.secondaryText?.text;
              const isSelected = selectedIndex === idx;

              return (
                <li
                  key={pred.placeId || idx}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelectSuggestion(item);
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`px-3.5 py-2.5 flex items-start gap-3 cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-[#FFF8E7] text-[#071E3B]"
                      : "hover:bg-slate-50 text-slate-800"
                  }`}
                >
                  <div className="mt-0.5 p-1.5 rounded-lg bg-[#F8F7F4] shrink-0">
                    {getPlaceIcon(pred)}
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-xs sm:text-sm font-semibold font-manrope text-[#071E3B] truncate">
                      {mainText}
                    </span>
                    {secondaryText && (
                      <span className="text-[11px] sm:text-xs text-[#667085] font-normal font-manrope truncate">
                        {secondaryText}
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
