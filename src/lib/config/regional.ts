import "server-only";

import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";

export type RegionalConfig = {
  /** BCP 47 locale tag, e.g. "es-CO" */
  locale: string;
  /** ISO 4217 currency code, e.g. "COP" */
  currencyCode: string;
  /** IANA timezone, e.g. "America/Bogota" */
  timezone: string;
};

/** Maps ISO 4217 currency codes to the most appropriate BCP 47 locale. */
const CURRENCY_LOCALE: Record<string, string> = {
  COP: "es-CO",
  MXN: "es-MX",
  USD: "en-US",
  EUR: "de-DE",
  PEN: "es-PE",
  CLP: "es-CL",
  ARS: "es-AR",
  BRL: "pt-BR",
  GTQ: "es-GT",
  HNL: "es-HN",
  CRC: "es-CR",
  DOP: "es-DO",
  BOB: "es-BO",
  PYG: "es-PY",
  UYU: "es-UY",
  VES: "es-VE",
};

const FALLBACK: RegionalConfig = {
  locale: "es-CO",
  currencyCode: "COP",
  timezone: "America/Bogota",
};

/**
 * Reads the organization's regional settings from the database.
 * Cached once per request via React's `cache()`.
 */
export const getRegionalConfig = cache(async (): Promise<RegionalConfig> => {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("organizations")
      .select("currency_code, timezone")
      .limit(1)
      .single();

    if (!data) return FALLBACK;

    const currencyCode = String(data.currency_code);
    return {
      locale: CURRENCY_LOCALE[currencyCode] ?? "es-CO",
      currencyCode,
      timezone: String(data.timezone),
    };
  } catch {
    return FALLBACK;
  }
});

/**
 * Pure money formatter for server components and API routes.
 * For client components, use `useCurrency()` from regional-provider.
 */
export function formatMoney(value: number, config: RegionalConfig): string {
  return new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency: config.currencyCode,
    maximumFractionDigits: 0,
  }).format(value);
}
