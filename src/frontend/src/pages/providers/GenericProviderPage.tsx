import { useParams } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { getProviderById } from '@/providers/providers';
import ProviderKeyManager from '@/components/keys/ProviderKeyManager';
import ChatbotCommandCenter from '@/components/chat/ChatbotCommandCenter';
import RecommendedPrompts from '@/components/providers/RecommendedPrompts';
import ProviderToolsOptionsSection from '@/components/providers/ProviderToolsOptionsSection';
import ProviderActionGuard from '@/components/providers/ProviderActionGuard';
import { useResolvedProviderDisplayName } from '@/hooks/providers/useResolvedProviderDisplayName';
import { useState } from 'react';

interface GenericProviderPageProps {
  providerId?: string;
}

export default function GenericProviderPage({ providerId: propProviderId }: GenericProviderPageProps) {
  const params = useParams({ strict: false });
  const providerId = propProviderId || (params as any).providerId;

  const provider = getProviderById(providerId);
  const displayName = useResolvedProviderDisplayName(providerId);
  const [draftMessage, setDraftMessage] = useState('');

  const handleSelectPrompt = (prompt: string) => {
    setDraftMessage(prompt);
  };

  if (!provider) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Provider Not Found</CardTitle>
            <CardDescription>
              The provider "{providerId}" could not be found.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const Icon = provider.icon;
  const hasChat = provider.workflowType === 'chat';
  const hasWorkflow = provider.workflowType && provider.workflowType !== 'chat';

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <Icon className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{displayName}</h1>
            <p className="text-muted-foreground">{provider.description}</p>
          </div>
        </div>

        {/* Capabilities */}
        <div className="flex flex-wrap gap-2">
          {provider.capabilities.map((capability) => (
            <Badge key={capability} variant="secondary">
              {capability}
            </Badge>
          ))}
        </div>
      </div>

      {/* Key Management */}
      <ProviderKeyManager
        providerId={provider.id}
        providerName={provider.name}
        credentialLabel={provider.credentialLabel}
        credentialPlaceholder={provider.credentialPlaceholder}
      />

      {/* Main Content */}
      <Tabs defaultValue={hasChat ? 'chat' : 'tools'} className="space-y-6">
        <TabsList>
          {hasChat && <TabsTrigger value="chat">Chat</TabsTrigger>}
          {hasWorkflow && <TabsTrigger value="tools">Tools & Options</TabsTrigger>}
        </TabsList>

        {hasChat && (
          <TabsContent value="chat" className="space-y-6">
            {/* Recommended Prompts */}
            {provider.recommendedPrompts && provider.recommendedPrompts.length > 0 && (
              <RecommendedPrompts
                prompts={provider.recommendedPrompts}
                onSelectPrompt={handleSelectPrompt}
              />
            )}

            {/* Chat Interface */}
            <ProviderActionGuard providerId={provider.id} providerName={displayName}>
              <ChatbotCommandCenter
                providerId={provider.id}
                providerName={displayName}
                draftMessage={draftMessage}
                onDraftChange={setDraftMessage}
              />
            </ProviderActionGuard>
          </TabsContent>
        )}

        {hasWorkflow && (
          <TabsContent value="tools" className="space-y-6">
            {/* Recommended Prompts */}
            {provider.recommendedPrompts && provider.recommendedPrompts.length > 0 && (
              <RecommendedPrompts
                prompts={provider.recommendedPrompts}
                onSelectPrompt={handleSelectPrompt}
              />
            )}

            {/* Tools & Options */}
            <ProviderActionGuard providerId={provider.id} providerName={displayName}>
              <ProviderToolsOptionsSection
                providerId={provider.id}
                providerName={displayName}
                workflowType={provider.workflowType!}
                optionFields={provider.optionFields}
              />
            </ProviderActionGuard>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
