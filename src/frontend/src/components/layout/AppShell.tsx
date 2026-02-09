import { useState, useEffect } from 'react';
import { Outlet, useRouterState } from '@tanstack/react-router';
import TopNav from './TopNav';
import ProviderNav from '../providers/ProviderNav';
import MobileProviderNav from './MobileProviderNav';
import ProfileSetupModal from '../auth/ProfileSetupModal';
import AppFooter from './AppFooter';

export default function AppShell() {
  const [mobileProviderNavOpen, setMobileProviderNavOpen] = useState(false);
  const router = useRouterState();

  // Close mobile provider nav when route changes
  useEffect(() => {
    setMobileProviderNavOpen(false);
  }, [router.location.pathname]);

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
        <TopNav onMobileProviderNavToggle={() => setMobileProviderNavOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
        <AppFooter />
      </div>
      <ProfileSetupModal />
    </div>
  );
}
