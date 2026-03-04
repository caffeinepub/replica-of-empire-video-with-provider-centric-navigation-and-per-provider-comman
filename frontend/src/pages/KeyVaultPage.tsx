import { PROVIDERS } from '@/providers/providers';
import { useProviderKey } from '@/hooks/keys/useProviderKey';
import { useResolvedProviderDisplayName } from '@/hooks/providers/useResolvedProviderDisplayName';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Key, Check, X } from 'lucide-react';
import { Link } from '@tanstack/react-router';

function ProviderKeyStatus({ providerId }: { providerId: string }) {
  const { data: keyExists, isLoading } = useProviderKey(providerId);

  if (isLoading) {
    return <Badge variant="secondary">Checking...</Badge>;
  }

  return keyExists ? (
    <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
      <Check className="mr-1 h-3 w-3" />
      Configured
    </Badge>
  ) : (
    <Badge variant="destructive">
      <X className="mr-1 h-3 w-3" />
      Not Set
    </Badge>
  );
}

function ProviderKeyCard({ providerId }: { providerId: string }) {
  const provider = PROVIDERS.find((p) => p.id === providerId);
  const displayName = useResolvedProviderDisplayName(providerId);

  if (!provider) return null;

  const Icon = provider.icon;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base sm:text-lg">{displayName}</CardTitle>
              <CardDescription className="text-xs sm:text-sm">{provider.description}</CardDescription>
            </div>
          </div>
          <div className="flex-shrink-0">
            <ProviderKeyStatus providerId={provider.id} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Button asChild variant="outline" className="w-full">
          <Link to={provider.route}>Manage Key</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default function KeyVaultPage() {
  return (
    <div className="container mx-auto space-y-6 px-4 py-6 sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 sm:h-16 sm:w-16">
          <Key className="h-6 w-6 text-primary sm:h-8 sm:w-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Empire Vault</h1>
          <p className="text-sm text-muted-foreground sm:text-base">Manage your API keys securely across all providers</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {PROVIDERS.map((provider) => (
          <ProviderKeyCard key={provider.id} providerId={provider.id} />
        ))}
      </div>
    </div>
  );
}
