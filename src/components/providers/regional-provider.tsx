"use client";

import { createContext, useContext } from "react";
import type { RegionalConfig } from "@/lib/config/regional";

const RegionalContext = createContext<RegionalConfig>({
  locale: "es-CO",
  currencyCode: "COP",
  timezone: "America/Bogota",
});

/** Wraps the app at layout level with the org's regional config read from DB. */
export function RegionalProvider({
  config,
  children,
}: {
  config: RegionalConfig;
  children: React.ReactNode;
}) {
  return <RegionalContext.Provider value={config}>{children}</RegionalContext.Provider>;
}

/** Returns the org's regional config: locale, currencyCode, timezone. */
export function useRegional(): RegionalConfig {
  return useContext(RegionalContext);
}

/**
 * Returns a formatter function bound to the org's locale and currency.
 *
 * @example
 * const fmt = useCurrency();
 * fmt(12000) // "$12.000" in Colombia
 */
export function useCurrency(): (value: number) => string {
  const { locale, currencyCode } = useRegional();
  return (value: number) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 0,
    }).format(value);
}
