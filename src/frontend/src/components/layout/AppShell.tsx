import { Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import ProfileSetupModal from "../auth/ProfileSetupModal";
import ProviderNav from "../providers/ProviderNav";
import AppFooter from "./AppFooter";
import MobileProviderNav from "./MobileProviderNav";
import TopNav from "./TopNav";

export default function AppShell() {
  const [mobileProviderNavOpen, setMobileProviderNavOpen] = useState(false);
  const { location } = useRouterState();

  // Close mobile provider nav when route changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: location.pathname is the reactive value here
  useEffect(() => {
    setMobileProviderNavOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop provider navigation - hidden on mobile */}
      <ProviderNav />

      {/* Mobile provider navigation drawer */}
      <MobileProviderNav
        open={mobileProviderNavOpen}
        onOpenChange={setMobileProviderNavOpen}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav
          onMobileProviderNavToggle={() => setMobileProviderNavOpen(true)}
        />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
        <AppFooter />
      </div>
      <ProfileSetupModal />
    </div>
  );
}
