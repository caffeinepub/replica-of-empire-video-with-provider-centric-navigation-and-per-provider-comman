import { Link } from '@tanstack/react-router';
import { PROVIDERS } from '@/providers/providers';
import { useResolvedProviderDisplayName } from '@/hooks/providers/useResolvedProviderDisplayName';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';

function ProviderCard({ providerId }: { providerId: string }) {
  const provider = PROVIDERS.find((p) => p.id === providerId);
  const displayName = useResolvedProviderDisplayName(providerId);

  if (!provider) return null;

  const Icon = provider.icon;

  return (
    <Card className="transition-all hover:shadow-lg">
      <CardHeader>
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-lg sm:text-xl">{displayName}</CardTitle>
        <CardDescription className="text-sm">{provider.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {provider.capabilities.map((cap) => (
            <Badge key={cap} variant="secondary" className="text-xs">
              {cap}
            </Badge>
          ))}
        </div>
        <Button asChild className="w-full">
          <Link to={provider.route}>
            Open Command Center
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default function ProviderHubPage() {
  return (
    <div className="relative min-h-full">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-5"
        style={{ backgroundImage: 'url(/assets/generated/hero-bg.dim_1600x900.png)' }}
      />
      <div className="relative">
        <div className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-8 sm:px-6 sm:py-12">
            <h1 className="mb-3 text-2xl font-bold tracking-tight sm:mb-4 sm:text-4xl">AI Provider Command Center</h1>
            <p className="text-base text-muted-foreground sm:text-lg">
              Select a provider to access its dedicated command center, manage API keys, and interact with
              AI models.
            </p>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8 sm:px-6 sm:py-12">
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {PROVIDERS.map((provider) => (
              <ProviderCard key={provider.id} providerId={provider.id} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
