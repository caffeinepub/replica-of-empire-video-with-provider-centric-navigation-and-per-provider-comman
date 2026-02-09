import { useState } from 'react';
import { getProviderById } from '@/providers/providers';
import ProviderKeyManager from '@/components/keys/ProviderKeyManager';
import ProviderActionGuard from '@/components/providers/ProviderActionGuard';
import RecommendedPrompts from '@/components/providers/RecommendedPrompts';
import { ProviderToolsOptionsSection } from '@/components/providers/ProviderToolsOptionsSection';
import { useResolvedProviderDisplayName } from '@/hooks/providers/useResolvedProviderDisplayName';
import { useSaveCustomProviderMetadata } from '@/hooks/providers/useCustomProviderMetadata';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil, Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface CustomSlotProviderPageProps {
  providerId: string;
}

export default function CustomSlotProviderPage({ providerId }: CustomSlotProviderPageProps) {
  const provider = getProviderById(providerId)!;
  const Icon = provider.icon;
  const displayName = useResolvedProviderDisplayName(providerId);
  const saveMetadata = useSaveCustomProviderMetadata();
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [draftMessage, setDraftMessage] = useState('');

  const handleStartEdit = () => {
    setEditedName(displayName);
    setIsEditingName(true);
  };

  const handleSaveName = async () => {
    if (!editedName.trim()) {
      toast.error('Display name cannot be empty');
      return;
    }

    try {
      await saveMetadata.mutateAsync({
        providerKey: providerId,
        displayName: editedName.trim(),
      });
      toast.success('Display name updated');
      setIsEditingName(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update display name');
    }
  };

  const handleCancelEdit = () => {
    setIsEditingName(false);
    setEditedName('');
  };

  const handleSelectPrompt = (prompt: string) => {
    setDraftMessage(prompt);
  };

  return (
    <div className="container mx-auto space-y-6 px-4 py-6 sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 sm:h-16 sm:w-16">
          <Icon className="h-6 w-6 text-primary sm:h-8 sm:w-8" />
        </div>
        <div className="flex-1">
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <Input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                placeholder="Enter display name"
                className="max-w-xs"
              />
              <Button size="sm" onClick={handleSaveName} disabled={saveMetadata.isPending}>
                <Check className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold sm:text-3xl">{displayName}</h1>
              <Button size="sm" variant="ghost" onClick={handleStartEdit}>
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          )}
          <p className="text-sm text-muted-foreground sm:text-base">{provider.description}</p>
        </div>
      </div>

      <ProviderKeyManager providerId={provider.id} providerName={displayName} />

      <ProviderActionGuard providerId={provider.id} providerName={displayName}>
        {provider.recommendedPrompts && provider.recommendedPrompts.length > 0 && (
          <RecommendedPrompts
            prompts={provider.recommendedPrompts}
            onSelectPrompt={handleSelectPrompt}
          />
        )}
        <ProviderToolsOptionsSection
          provider={provider.id}
          workflowType={provider.workflowType}
          optionFields={provider.optionFields}
        />
      </ProviderActionGuard>
    </div>
  );
}
