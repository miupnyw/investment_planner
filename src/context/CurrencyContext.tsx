"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Currency = "USD" | "THB";

interface CurrencyContextValue {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  symbol: string;
  rate: number;
  rateLoading: boolean;
  fmt: (thbAmount: number) => string;
  toTHB: (amount: number) => number;
  toDisplay: (thbAmount: number) => number;
}

// Fallback rate used until API responds
const DEFAULT_RATE = 36;

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

const SYMBOLS: Record<Currency, string> = { USD: "$", THB: "฿" };

const FORMATTERS: Record<Currency, Intl.NumberFormat> = {
  USD: new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }),
  THB: new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }),
};

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<Currency>("THB");
  const [rate, setRate] = useState(DEFAULT_RATE); // THB per 1 USD
  const [rateLoading, setRateLoading] = useState(true);

  useEffect(() => {
    fetch("https://open.er-api.com/v6/latest/USD")
      .then((res) => res.json())
      .then((data) => {
        const thbRate = data?.rates?.THB;
        if (thbRate) setRate(thbRate);
      })
      .catch(() => {}) // keep DEFAULT_RATE on network error
      .finally(() => setRateLoading(false));
  }, []);

  // All monetary values are stored in THB internally
  function toDisplay(thbAmount: number): number {
    return currency === "USD" ? thbAmount / rate : thbAmount;
  }

  function toTHB(amount: number): number {
    return currency === "USD" ? amount * rate : amount;
  }

  function fmt(thbAmount: number): string {
    return FORMATTERS[currency].format(toDisplay(thbAmount));
  }

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        symbol: SYMBOLS[currency],
        rate,
        rateLoading,
        fmt,
        toTHB,
        toDisplay,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}
