import { useState } from 'react';
import { getProviderById } from '@/providers/providers';
import ProviderKeyManager from '@/components/keys/ProviderKeyManager';
import ChatbotCommandCenter from '@/components/chat/ChatbotCommandCenter';
import ProviderActionGuard from '@/components/providers/ProviderActionGuard';
import RecommendedPrompts from '@/components/providers/RecommendedPrompts';
import ProviderToolsOptionsSection from '@/components/providers/ProviderToolsOptionsSection';
import { useCustomProviderMetadata, useSaveCustomProviderMetadata } from '@/hooks/providers/useCustomProviderMetadata';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useParams } from '@tanstack/react-router';
import { toast } from 'sonner';
import { Settings, Check } from 'lucide-react';

export default function CustomSlotProviderPage() {
  const { providerId } = useParams({ strict: false }) as { providerId: string };
  const provider = getProviderById(providerId);
  const { data: metadata, isLoading } = useCustomProviderMetadata(providerId);
  const { mutate: saveMetadata, isPending } = useSaveCustomProviderMetadata();
  const [displayName, setDisplayName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [draftMessage, setDraftMessage] = useState('');

  if (!provider) {
    return (
      <div className="container mx-auto space-y-6 px-4 py-6 sm:px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Provider Not Found</h1>
          <p className="text-muted-foreground">The requested provider does not exist.</p>
        </div>
      </div>
    );
  }

  const Icon = provider.icon;
  const currentDisplayName = metadata?.displayName || provider.displayName;

  const handleSaveDisplayName = () => {
    if (displayName.trim().length < 2) {
      toast.error('Display name must be at least 2 characters long');
      return;
    }
    saveMetadata(
      { providerKey: providerId, displayName: displayName.trim() },
      {
        onSuccess: () => {
          toast.success('Display name saved successfully');
          setDisplayName('');
          setIsEditing(false);
        },
        onError: (error: any) => {
          toast.error(error.message || 'Failed to save display name');
        },
      }
    );
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
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">{currentDisplayName}</h1>
          <p className="text-sm text-muted-foreground sm:text-base">{provider.description}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Display Name
          </CardTitle>
          <CardDescription>
            {metadata?.displayName
              ? 'Your custom display name is set. You can update it below.'
              : 'Set a custom display name for this provider slot.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {metadata?.displayName && !isEditing ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 p-3">
                <Check className="h-4 w-4 text-green-600" />
                <span className="font-medium">{metadata.displayName}</span>
              </div>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="w-full sm:w-auto">
                Update Display Name
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="Enter a custom name for this provider"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={isPending || isLoading}
                />
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button 
                  onClick={handleSaveDisplayName} 
                  disabled={isPending || !displayName.trim() || isLoading} 
                  className="w-full sm:w-auto"
                >
                  {isPending ? 'Saving...' : 'Save Display Name'}
                </Button>
                {isEditing && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setDisplayName('');
                    }}
                    disabled={isPending}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Capabilities</CardTitle>
          <CardDescription>What this provider slot can do</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {provider.capabilities.map((cap) => (
              <Badge key={cap} variant="secondary">
                {cap}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <ProviderKeyManager 
        providerId={provider.id} 
        providerName={currentDisplayName}
      />

      <ProviderActionGuard providerId={provider.id} providerName={currentDisplayName}>
        <div className="space-y-6">
          {provider.recommendedPrompts && provider.recommendedPrompts.length > 0 && (
            <RecommendedPrompts
              prompts={provider.recommendedPrompts}
              onSelectPrompt={handleSelectPrompt}
            />
          )}

          <ChatbotCommandCenter 
            providerId={provider.id} 
            providerName={currentDisplayName}
            draftMessage={draftMessage}
            onDraftChange={setDraftMessage}
          />

          {provider.workflowType && provider.workflowType !== 'chat' && (
            <ProviderToolsOptionsSection
              providerId={provider.id}
              providerName={currentDisplayName}
              workflowType={provider.workflowType}
              optionFields={provider.optionFields}
            />
          )}
        </div>
      </ProviderActionGuard>
    </div>
  );
}
