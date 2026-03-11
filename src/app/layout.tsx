import type { Metadata } from "next";
import { IBM_Plex_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { getRegionalConfig } from "@/lib/config/regional";
import { RegionalProvider } from "@/components/providers/regional-provider";

const bodyFont = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"]
});

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"]
});

export const metadata: Metadata = {
  title: "ZiiiPos",
  description: "POS profesional y backoffice para restaurantes con Next.js y Supabase"
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const regionalConfig = await getRegionalConfig();
  return (
    <html lang="es">
      <body className={`${bodyFont.variable} ${displayFont.variable} font-[family-name:var(--font-body)]`}>
        <RegionalProvider config={regionalConfig}>
          {children}
        </RegionalProvider>
      </body>
    </html>
  );
}