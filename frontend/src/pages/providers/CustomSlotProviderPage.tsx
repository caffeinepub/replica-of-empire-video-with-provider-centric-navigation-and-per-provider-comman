import { useState } from 'react';
import { getProviderById } from '@/providers/providers';
import ProviderKeyManager from '@/components/keys/ProviderKeyManager';
import ProviderActionGuard from '@/components/providers/ProviderActionGuard';
import { ProviderToolsOptionsSection } from '@/components/providers/ProviderToolsOptionsSection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useSaveCustomProviderMetadata } from '@/hooks/providers/useCustomProviderMetadata';
import { useResolvedProviderDisplayName } from '@/hooks/providers/useResolvedProviderDisplayName';
import { Settings } from 'lucide-react';

interface CustomSlotProviderPageProps {
  providerId: string;
}

export default function CustomSlotProviderPage({ providerId }: CustomSlotProviderPageProps) {
  const provider = getProviderById(providerId)!;
  const Icon = provider.icon;
  
  const resolvedDisplayName = useResolvedProviderDisplayName(provider.id);
  const saveMetadata = useSaveCustomProviderMetadata();
  
  const [editingName, setEditingName] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState(resolvedDisplayName);

  const handleSaveDisplayName = async () => {
    if (newDisplayName.trim()) {
      await saveMetadata.mutateAsync({
        providerKey: provider.id,
        displayName: newDisplayName.trim(),
      });
      setEditingName(false);
    }
  };

  return (
    <div className="container mx-auto space-y-6 px-4 py-6 sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 sm:h-16 sm:w-16">
          <Icon className="h-6 w-6 text-primary sm:h-8 sm:w-8" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold sm:text-3xl">{resolvedDisplayName}</h1>
          <p className="text-sm text-muted-foreground sm:text-base">{provider.description}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Settings className="h-5 w-5" />
            Custom Provider Settings
          </CardTitle>
          <CardDescription className="text-sm">Configure your custom provider integration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            {editingName ? (
              <div className="flex gap-2">
                <Input
                  id="displayName"
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                  placeholder="Enter provider name"
                />
                <Button onClick={handleSaveDisplayName} disabled={saveMetadata.isPending}>
                  {saveMetadata.isPending ? 'Saving...' : 'Save'}
                </Button>
                <Button variant="outline" onClick={() => setEditingName(false)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Input value={resolvedDisplayName} disabled />
                <Button variant="outline" onClick={() => setEditingName(true)}>
                  Edit
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <ProviderKeyManager providerId={provider.id} providerName={resolvedDisplayName} />

      <ProviderActionGuard providerId={provider.id} providerName={resolvedDisplayName}>
        <ProviderToolsOptionsSection
          provider={provider.name}
          workflowType={provider.workflowType}
          optionFields={provider.optionFields}
        />
      </ProviderActionGuard>
    </div>
  );
}
