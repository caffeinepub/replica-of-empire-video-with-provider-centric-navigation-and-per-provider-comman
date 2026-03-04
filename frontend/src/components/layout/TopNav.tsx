import { Link } from '@tanstack/react-router';
import { Key, Wrench, Brain, Link as LinkIcon, Shield, Menu as MenuIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LoginButton from '../auth/LoginButton';
import MobileTopNavMenu from './MobileTopNavMenu';
import PwaInstallPrompt from '../pwa/PwaInstallPrompt';

interface TopNavProps {
  onMobileProviderNavToggle: () => void;
}

export default function TopNav({ onMobileProviderNavToggle }: TopNavProps) {
  return (
    <header className="border-b border-border bg-card">
      <div className="flex h-14 items-center justify-between gap-2 px-3 sm:h-16 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-6">
          {/* Mobile provider nav toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMobileProviderNavToggle}
          >
            <MenuIcon className="h-5 w-5" />
          </Button>

          <Link to="/" className="flex items-center gap-2 sm:gap-3">
            <img 
              src="/assets/generated/app-logo.dim_512x512.png" 
              alt="Empire C.C Logo" 
              className="h-8 w-8 sm:h-10 sm:w-10 object-contain" 
            />
            <span className="text-base font-bold tracking-tight sm:text-xl">Empire C.C</span>
          </Link>

          {/* Desktop navigation - hidden on mobile */}
          <nav className="hidden items-center gap-2 md:flex">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/vault">
                <Key className="mr-2 h-4 w-4" />
                Vault
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/studio">
                <Wrench className="mr-2 h-4 w-4" />
                Studio
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/memory">
                <Brain className="mr-2 h-4 w-4" />
                Memory
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/links">
                <LinkIcon className="mr-2 h-4 w-4" />
                Links
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin">
                <Shield className="mr-2 h-4 w-4" />
                Admin
              </Link>
            </Button>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {/* PWA Install Prompt */}
          <PwaInstallPrompt />
          
          {/* Mobile top nav menu */}
          <MobileTopNavMenu />
          <LoginButton />
        </div>
      </div>
    </header>
  );
}
