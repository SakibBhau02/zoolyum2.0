import type { Metadata } from "next";
import localFont from "next/font/local";
import { Inter, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { FirstLoadSplash } from "@/components/layout/FirstLoadSplash";
import { SITE_URL } from "@/lib/data";

const generalSans = localFont({
  src: [
    { path: "../app/fonts/generalsans-500.woff2", weight: "500", style: "normal" },
    { path: "../app/fonts/generalsans-600.woff2", weight: "600", style: "normal" },
    { path: "../app/fonts/generalsans-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-general-sans",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-instrument-serif",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://zoolyum.com"),
  title: {
    default: "Zoolyum — Consultancy. Strategy. Solution.",
    template: "%s — Zoolyum",
  },
  description:
    "The strategic partner that turns market noise into a clear competitive advantage. Brand strategy & digital innovation in Dhaka, Bangladesh.",
  keywords: [
    "brand strategy",
    "digital agency",
    "Bangladesh",
    "Dhaka",
    "growth marketing",
    "UI UX design",
    "branding agency",
  ],
  openGraph: {
    title: "Zoolyum — Consultancy. Strategy. Solution.",
    description:
      "Every market has a pattern. Most brands react to it. We help you read it first — and act while others are still guessing.",
    type: "website",
    locale: "en_US",
    siteName: "Zoolyum",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${generalSans.variable} ${inter.variable} ${instrumentSerif.variable}`}
    >
      <body className="min-h-screen bg-espresso font-body text-ivory antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add("js")`,
          }}
        />
        <FirstLoadSplash />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  name: "Zoolyum",
                  url: SITE_URL,
                  slogan: "Consultancy. Strategy. Solution.",
                  description:
                    "Strategy-first brand and digital consultancy in Dhaka, Bangladesh. We read the market's pattern, then build the position that holds.",
                  email: "hello@zoolyum.com",
                  address: {
                    "@type": "PostalAddress",
                    addressLocality: "Dhaka",
                    addressCountry: "BD",
                  },
                  sameAs: [],
                },
                {
                  "@type": "WebSite",
                  name: "Zoolyum",
                  url: SITE_URL,
                  inLanguage: "en",
                  publisher: { "@type": "Organization", name: "Zoolyum" },
                },
              ],
            }),
          }}
        />
        {children}
      </body>
    </html>
  );
}
