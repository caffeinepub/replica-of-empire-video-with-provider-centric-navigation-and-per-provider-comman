import { Link } from '@tanstack/react-router';
import { PROVIDERS } from '@/providers/providers';
import { useResolvedProviderDisplayName } from '@/hooks/providers/useResolvedProviderDisplayName';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useRouterState } from '@tanstack/react-router';

interface MobileProviderNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function MobileProviderNavItem({ 
  providerId, 
  currentPath, 
  onClose 
}: { 
  providerId: string; 
  currentPath: string; 
  onClose: () => void;
}) {
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
      onClick={onClose}
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

export default function MobileProviderNav({ open, onOpenChange }: MobileProviderNavProps) {
  const router = useRouterState();
  const currentPath = router.location.pathname;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[280px] p-0">
        <SheetHeader className="border-b border-border px-6 py-4">
          <SheetTitle className="text-sm font-semibold uppercase tracking-wider">
            AI Providers
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-5rem)]">
          <div className="space-y-1 p-3">
            {PROVIDERS.map((provider) => (
              <MobileProviderNavItem 
                key={provider.id} 
                providerId={provider.id} 
                currentPath={currentPath}
                onClose={() => onOpenChange(false)}
              />
            ))}
          </div>
          <Separator className="my-4" />
          <div className="px-6 pb-4">
            <p className="text-xs text-muted-foreground">
              Select a provider to access its command center and tools.
            </p>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
