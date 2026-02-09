import { useState } from 'react';
import { getProviderById } from '@/providers/providers';
import ProviderKeyManager from '@/components/keys/ProviderKeyManager';
import ChatbotCommandCenter from '@/components/chat/ChatbotCommandCenter';
import ProviderActionGuard from '@/components/providers/ProviderActionGuard';
import RecommendedPrompts from '@/components/providers/RecommendedPrompts';
import ProviderToolsOptionsSection from '@/components/providers/ProviderToolsOptionsSection';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useParams, useNavigate } from '@tanstack/react-router';
import { AlertCircle } from 'lucide-react';

interface GenericProviderPageProps {
  providerId?: string;
}

export default function GenericProviderPage({ providerId: overrideProviderId }: GenericProviderPageProps) {
  const params = useParams({ strict: false }) as { providerId?: string };
  const navigate = useNavigate();
  const providerId = overrideProviderId || params.providerId;
  const provider = providerId ? getProviderById(providerId) : null;
  const [draftMessage, setDraftMessage] = useState('');

  if (!provider) {
    return (
      <div className="container mx-auto space-y-6 px-4 py-6 sm:px-6">
        <div className="flex flex-col items-center justify-center rounded-lg border border-destructive/50 bg-destructive/10 p-8 text-center">
          <AlertCircle className="mb-4 h-16 w-16 text-destructive" />
          <h1 className="mb-2 text-2xl font-bold">Provider Not Found</h1>
          <p className="mb-4 text-muted-foreground">
            The requested provider "{providerId || 'unknown'}" does not exist.
          </p>
          <Button onClick={() => navigate({ to: '/' })}>
            Return to Provider Hub
          </Button>
        </div>
      </div>
    );
  }

  const Icon = provider.icon;

  const handleSelectPrompt = (prompt: string) => {
    setDraftMessage(prompt);
  };

  return (
    <div className="container mx-auto space-y-6 px-4 py-6 sm:px-6">
      {/* Provider Header - Always visible */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 sm:h-16 sm:w-16">
          <Icon className="h-6 w-6 text-primary sm:h-8 sm:w-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">{provider.displayName}</h1>
          <p className="text-sm text-muted-foreground sm:text-base">{provider.description}</p>
        </div>
      </div>

      {/* Capabilities - Always visible */}
      <Card>
        <CardHeader>
          <CardTitle>Capabilities</CardTitle>
          <CardDescription>What this provider can do</CardDescription>
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

      {/* Key Manager - Always visible, handles its own connection state */}
      <ErrorBoundary>
        <ProviderKeyManager 
          providerId={provider.id} 
          providerName={provider.displayName}
          credentialLabel={provider.credentialLabel}
          credentialPlaceholder={provider.credentialPlaceholder}
        />
      </ErrorBoundary>

      {/* Provider Actions - Guarded by key existence and connection state */}
      <ProviderActionGuard providerId={provider.id} providerName={provider.displayName}>
        <div className="space-y-6">
          {provider.recommendedPrompts && provider.recommendedPrompts.length > 0 && (
            <ErrorBoundary>
              <RecommendedPrompts
                prompts={provider.recommendedPrompts}
                onSelectPrompt={handleSelectPrompt}
              />
            </ErrorBoundary>
          )}

          <ErrorBoundary>
            <ChatbotCommandCenter 
              providerId={provider.id} 
              providerName={provider.displayName}
              draftMessage={draftMessage}
              onDraftChange={setDraftMessage}
            />
          </ErrorBoundary>

          {provider.workflowType && provider.workflowType !== 'chat' && (
            <ErrorBoundary>
              <ProviderToolsOptionsSection
                providerName={provider.displayName}
                workflowType={provider.workflowType}
                optionFields={provider.optionFields}
              />
            </ErrorBoundary>
          )}
        </div>
      </ProviderActionGuard>
    </div>
  );
}
