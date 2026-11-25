import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Inter, Instrument_Serif } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { getSetting, getSocials, getContactInfo } from "@/lib/content";
import { SITE_URL } from "@/lib/data";
import { indexableRobots, jsonLdHtml } from "@/lib/seo";

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
  // Accent face, used below the fold on most routes. Not preloading it keeps
  // two font files off the critical path.
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
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
    url: SITE_URL,
    images: [{ url: `${SITE_URL}/opengraph-image`, width: 1200, height: 630, alt: "Zoolyum" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zoolyum — Consultancy. Strategy. Solution.",
    description:
      "Every market has a pattern. Most brands react to it. We help you read it first — and act while others are still guessing.",
    images: [`${SITE_URL}/opengraph-image`],
  },
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": `${SITE_URL}/feed.xml` },
  },
  applicationName: "Zoolyum",
  category: "business",
  manifest: "/manifest.webmanifest",
  robots: indexableRobots,
};

export const viewport: Viewport = {
  themeColor: "#241F1B",
  colorScheme: "dark",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Social URLs power sameAs (Organization schema) + GSC token powers the
  // verification meta tag. Placeholder roots (e.g. https://facebook.com)
  // are filtered out so only real profiles are claimed.
  const [socials, contact, googleVerification, pinterestVerification, consentMode] = await Promise.all([
    getSocials(),
    getContactInfo(),
    getSetting("seo.google_verification", ""),
    getSetting("seo.pinterest_verification", ""),
    getSetting("analytics.consent_mode", "off"),
  ]);
  // When tags wait for consent, preconnecting on first paint only burns four
  // DNS/TLS handshakes for visitors who may never accept.
  const preconnectAnalytics = consentMode.trim().toLowerCase() !== "on";
  const sameAs = Object.values(socials)
    .map((u) => {
      const v = (u ?? "").trim();
      if (!v) return null;
      try {
        return new URL(v).pathname.replace(/\/+$/, "") === "" ? null : v;
      } catch {
        return null;
      }
    })
    .filter((u): u is string => u !== null);
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${generalSans.variable} ${inter.variable} ${instrumentSerif.variable}`}
    >
      {googleVerification.trim() !== "" && (
        <meta name="google-site-verification" content={googleVerification.trim()} />
      )}
      {pinterestVerification.trim() !== "" && (
        <meta name="p:domain_verify" content={pinterestVerification.trim()} />
      )}
      <body className="min-h-screen bg-espresso font-body text-ivory antialiased">
        {/* Connect tag origins up front only when tags load unconditionally. */}
        {preconnectAnalytics && (
          <>
            <link rel="preconnect" href="https://www.googletagmanager.com" />
            <link rel="preconnect" href="https://www.google-analytics.com" />
            <link rel="preconnect" href="https://www.clarity.ms" />
            <link rel="preconnect" href="https://connect.facebook.net" crossOrigin="" />
          </>
        )}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add("js")`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLdHtml({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": ["Organization", "ProfessionalService"],
                  "@id": `${SITE_URL}/#organization`,
                  name: "Zoolyum",
                  alternateName: "Zoolyum Consultancy",
                  url: SITE_URL,
                  logo: {
                    "@type": "ImageObject",
                    url: `${SITE_URL}/icon.png`,
                    width: 512,
                    height: 512,
                  },
                  image: `${SITE_URL}/opengraph-image`,
                  slogan: "Consultancy. Strategy. Solution.",
                  description:
                    "Strategy-first brand and digital consultancy in Dhaka, Bangladesh. We read the market's pattern, then build the position that holds.",
                  email: contact.email,
                  telephone: contact.phone,
                  address: {
                    "@type": "PostalAddress",
                    streetAddress: contact.address,
                    addressLocality: "Dhaka",
                    postalCode: "1216",
                    addressCountry: "BD",
                  },
                  areaServed: [
                    { "@type": "City", name: "Dhaka" },
                    { "@type": "Country", name: "Bangladesh" },
                  ],
                  priceRange: "$$",
                  currenciesAccepted: "BDT",
                  foundingDate: "2017",
                  knowsAbout: [
                    "brand strategy",
                    "market positioning",
                    "brand messaging",
                    "digital design",
                    "UI/UX design",
                    "growth marketing",
                    "content strategy",
                    "video production",
                  ],
                  contactPoint: [
                    {
                      "@type": "ContactPoint",
                      contactType: "sales",
                      email: contact.email,
                      telephone: contact.phone,
                      areaServed: "BD",
                      availableLanguage: ["en", "bn"],
                    },
                  ],
                  sameAs,
                },
                {
                  "@type": "WebSite",
                  "@id": `${SITE_URL}/#website`,
                  name: "Zoolyum",
                  url: SITE_URL,
                  inLanguage: "en",
                  publisher: { "@id": `${SITE_URL}/#organization` },
                },
              ],
            }),
          }}
        />
        {children}
        {/* The Vercel script only exists on Vercel. Loading it elsewhere
            produced a 404 and a console error on every page. */}
        {process.env.VERCEL === "1" && <Analytics />}
      </body>
    </html>
  );
}
