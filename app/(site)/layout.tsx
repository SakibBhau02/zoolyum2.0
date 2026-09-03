import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { TerrainScrollIndicator } from "@/components/layout/TerrainScrollIndicator";
import { ReadingPause } from "@/components/layout/ReadingPause";
import { ThreadCursor } from "@/components/ui/ThreadCursor";
import { AmbientParticles } from "@/components/ui/AmbientParticles";
import { SignalFlash } from "@/components/ui/SignalFlash";
import { SoundProvider } from "@/components/layout/SoundProvider";
import { AuditTab } from "@/components/leadgen/AuditTab";
import { ExitIntentModal } from "@/components/leadgen/ExitIntentModal";

/**
 * Site chrome for every public page. Admin routes intentionally live
 * outside this group so the fixed header, cursor, and leadgen widgets
 * never cover the CMS.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <SoundProvider>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-md focus:bg-sienna-bright focus:px-4 focus:py-2 focus:font-display focus:font-semibold focus:text-espresso"
      >
        Skip to content
      </a>
      <ReadingPause />
      <AmbientParticles />
      <ThreadCursor />
      <TerrainScrollIndicator />
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <AuditTab />
      <ExitIntentModal />
      <SignalFlash />
    </SoundProvider>
  );
}