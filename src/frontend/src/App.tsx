import { Toaster } from "@/components/ui/sonner";
import {
  Navigate,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  useParams,
} from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";
import AuthGate from "./components/auth/AuthGate";
import AppShell from "./components/layout/AppShell";
import AdminPanelPage from "./pages/AdminPanelPage";
import FireCrawlPage from "./pages/FireCrawlPage";
import KeyVaultPage from "./pages/KeyVaultPage";
import LinksDashboardPage from "./pages/LinksDashboardPage";
import MemoryBrainPage from "./pages/MemoryBrainPage";
import ProviderHubPage from "./pages/ProviderHubPage";
import StudioToolsPage from "./pages/StudioToolsPage";
import TermsPage from "./pages/TermsPage";
import CustomSlotProviderPage from "./pages/providers/CustomSlotProviderPage";
import GenericProviderPage from "./pages/providers/GenericProviderPage";
import LTXPage from "./pages/providers/LTXPage";
import OpenAIPage from "./pages/providers/OpenAIPage";
import ReplicatePage from "./pages/providers/ReplicatePage";
import RunPodPage from "./pages/providers/RunPodPage";
import SlackPage from "./pages/providers/SlackPage";
import VeniceAIPage from "./pages/providers/VeniceAIPage";

const rootRoute = createRootRoute({
  component: AppShell,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => (
    <AuthGate>
      <ProviderHubPage />
    </AuthGate>
  ),
});

const openaiRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/providers/openai",
  component: () => (
    <AuthGate>
      <OpenAIPage />
    </AuthGate>
  ),
});

const ltxRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/providers/ltx",
  component: () => (
    <AuthGate>
      <LTXPage />
    </AuthGate>
  ),
});

const replicateRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/providers/replicate",
  component: () => (
    <AuthGate>
      <ReplicatePage />
    </AuthGate>
  ),
});

const runpodRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/providers/runpod",
  component: () => (
    <AuthGate>
      <RunPodPage />
    </AuthGate>
  ),
});

const slackRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/providers/slack",
  component: () => (
    <AuthGate>
      <SlackPage />
    </AuthGate>
  ),
});

const customSlot1Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/providers/custom-slot-1",
  component: () => (
    <AuthGate>
      <CustomSlotProviderPage providerId="custom-slot-1" />
    </AuthGate>
  ),
});

const customSlot2Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/providers/custom-slot-2",
  component: () => (
    <AuthGate>
      <CustomSlotProviderPage providerId="custom-slot-2" />
    </AuthGate>
  ),
});

const veniceAiRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/providers/venice-ai",
  component: () => (
    <AuthGate>
      <VeniceAIPage />
    </AuthGate>
  ),
});

const falAiRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/providers/fal-ai",
  component: () => (
    <AuthGate>
      <GenericProviderPage providerId="fal-ai" />
    </AuthGate>
  ),
});

const falAliasRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/providers/fal",
  component: () => (
    <AuthGate>
      <GenericProviderPage providerId="fal-ai" />
    </AuthGate>
  ),
});

function GenericProviderRouteComponent() {
  const { providerId } = useParams({ from: "/providers/$providerId" });
  return (
    <AuthGate>
      <GenericProviderPage providerId={providerId} />
    </AuthGate>
  );
}

const genericProviderRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/providers/$providerId",
  component: GenericProviderRouteComponent,
});

const keyVaultRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/vault",
  component: () => (
    <AuthGate>
      <KeyVaultPage />
    </AuthGate>
  ),
});

const studioRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/studio",
  component: () => (
    <AuthGate>
      <StudioToolsPage />
    </AuthGate>
  ),
});

const memoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/memory",
  component: () => (
    <AuthGate>
      <MemoryBrainPage />
    </AuthGate>
  ),
});

const linksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/links",
  component: () => (
    <AuthGate>
      <LinksDashboardPage />
    </AuthGate>
  ),
});

const firecrawlRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/firecrawl",
  component: () => (
    <AuthGate>
      <FireCrawlPage />
    </AuthGate>
  ),
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: () => (
    <AuthGate>
      <AdminPanelPage />
    </AuthGate>
  ),
});

const termsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/terms",
  component: TermsPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  veniceAiRoute,
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
  firecrawlRoute,
  adminRoute,
  termsRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
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
