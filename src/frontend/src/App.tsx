import { RouterProvider, createRouter, createRoute, createRootRoute, Navigate } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import AppShell from './components/layout/AppShell';
import ProviderHubPage from './pages/ProviderHubPage';
import OpenAIPage from './pages/providers/OpenAIPage';
import LTXPage from './pages/providers/LTXPage';
import ReplicatePage from './pages/providers/ReplicatePage';
import RunPodPage from './pages/providers/RunPodPage';
import SlackPage from './pages/providers/SlackPage';
import GenericProviderPage from './pages/providers/GenericProviderPage';
import CustomSlotProviderPage from './pages/providers/CustomSlotProviderPage';
import KeyVaultPage from './pages/KeyVaultPage';
import StudioToolsPage from './pages/StudioToolsPage';
import MemoryBrainPage from './pages/MemoryBrainPage';
import LinksDashboardPage from './pages/LinksDashboardPage';
import AdminPanelPage from './pages/AdminPanelPage';
import AuthGate from './components/auth/AuthGate';
import { Toaster } from '@/components/ui/sonner';

const rootRoute = createRootRoute({
  component: AppShell,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => (
    <AuthGate>
      <ProviderHubPage />
    </AuthGate>
  ),
});

const openaiRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/providers/openai',
  component: () => (
    <AuthGate>
      <OpenAIPage />
    </AuthGate>
  ),
});

const ltxRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/providers/ltx',
  component: () => (
    <AuthGate>
      <LTXPage />
    </AuthGate>
  ),
});

const replicateRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/providers/replicate',
  component: () => (
    <AuthGate>
      <ReplicatePage />
    </AuthGate>
  ),
});

const runpodRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/providers/runpod',
  component: () => (
    <AuthGate>
      <RunPodPage />
    </AuthGate>
  ),
});

const slackRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/providers/slack',
  component: () => (
    <AuthGate>
      <SlackPage />
    </AuthGate>
  ),
});

const customSlot1Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/providers/custom-slot-1',
  component: () => (
    <AuthGate>
      <CustomSlotProviderPage />
    </AuthGate>
  ),
});

const customSlot2Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/providers/custom-slot-2',
  component: () => (
    <AuthGate>
      <CustomSlotProviderPage />
    </AuthGate>
  ),
});

const falAiRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/providers/fal-ai',
  component: () => (
    <AuthGate>
      <GenericProviderPage providerId="fal-ai" />
    </AuthGate>
  ),
});

const falAliasRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/providers/fal',
  component: () => (
    <AuthGate>
      <GenericProviderPage providerId="fal-ai" />
    </AuthGate>
  ),
});

const genericProviderRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/providers/$providerId',
  component: () => (
    <AuthGate>
      <GenericProviderPage />
    </AuthGate>
  ),
});

const keyVaultRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/vault',
  component: () => (
    <AuthGate>
      <KeyVaultPage />
    </AuthGate>
  ),
});

const studioRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/studio',
  component: () => (
    <AuthGate>
      <StudioToolsPage />
    </AuthGate>
  ),
});

const memoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/memory',
  component: () => (
    <AuthGate>
      <MemoryBrainPage />
    </AuthGate>
  ),
});

const linksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/links',
  component: () => (
    <AuthGate>
      <LinksDashboardPage />
    </AuthGate>
  ),
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: () => (
    <AuthGate>
      <AdminPanelPage />
    </AuthGate>
  ),
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  openaiRoute,
  ltxRoute,
  replicateRoute,
  runpodRoute,
  slackRoute,
  customSlot1Route,
  customSlot2Route,
  falAiRoute,
  falAliasRoute,
  genericProviderRoute,
  keyVaultRoute,
  studioRoute,
  memoryRoute,
  linksRoute,
  adminRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}
