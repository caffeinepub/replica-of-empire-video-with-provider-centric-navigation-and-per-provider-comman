import { Link, useRouterState } from '@tanstack/react-router';
import { PROVIDERS } from '@/providers/providers';
import { useResolvedProviderDisplayName } from '@/hooks/providers/useResolvedProviderDisplayName';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

function ProviderNavItem({ providerId, currentPath }: { providerId: string; currentPath: string }) {
  const provider = PROVIDERS.find((p) => p.id === providerId);
  const displayName = useResolvedProviderDisplayName(providerId);

  if (!provider) return null;

  const Icon = provider.icon;
  const isActive = currentPath === provider.route;

  return (
    <Button
      variant={isActive ? 'secondary' : 'ghost'}
      className="w-full justify-start"
      asChild
    >
      <Link to={provider.route}>
        <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
        <div className="flex flex-col items-start overflow-hidden">
          <span className="truncate font-medium">{displayName}</span>
        </div>
      </Link>
    </Button>
  );
}

export default function ProviderNav() {
  const router = useRouterState();
  const currentPath = router.location.pathname;

  return (
    <aside className="hidden w-64 border-r border-border bg-sidebar lg:block">
      <div className="flex h-16 items-center border-b border-sidebar-border px-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-sidebar-foreground/70">
          AI Providers
        </h2>
      </div>
      <ScrollArea className="h-[calc(100vh-4rem)]">
        <div className="space-y-1 p-3">
          {PROVIDERS.map((provider) => (
            <ProviderNavItem key={provider.id} providerId={provider.id} currentPath={currentPath} />
          ))}
        </div>
        <Separator className="my-4" />
        <div className="px-6 pb-4">
          <p className="text-xs text-muted-foreground">
            Select a provider to access its command center and tools.
          </p>
        </div>
      </ScrollArea>
    </aside>
  );
}
