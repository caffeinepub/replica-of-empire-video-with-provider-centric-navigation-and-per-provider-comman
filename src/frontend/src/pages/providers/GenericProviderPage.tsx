import { useState } from 'react';
import { getProviderById } from '@/providers/providers';
import ProviderKeyManager from '@/components/keys/ProviderKeyManager';
import ChatbotCommandCenter from '@/components/chat/ChatbotCommandCenter';
import ProviderActionGuard from '@/components/providers/ProviderActionGuard';
import RecommendedPrompts from '@/components/providers/RecommendedPrompts';
import { ProviderToolsOptionsSection } from '@/components/providers/ProviderToolsOptionsSection';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface GenericProviderPageProps {
  providerId: string;
}

export default function GenericProviderPage({ providerId }: GenericProviderPageProps) {
  const provider = getProviderById(providerId)!;
  const Icon = provider.icon;
  const [draftMessage, setDraftMessage] = useState('');

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
          <h1 className="text-2xl font-bold sm:text-3xl">{provider.displayName}</h1>
          <p className="text-sm text-muted-foreground sm:text-base">{provider.description}</p>
        </div>
      </div>

      <ProviderKeyManager providerId={provider.id} providerName={provider.displayName} />

      <ProviderActionGuard providerId={provider.id} providerName={provider.displayName}>
        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chat" className="text-xs sm:text-sm">Chat</TabsTrigger>
            <TabsTrigger value="tools" className="text-xs sm:text-sm">Tools</TabsTrigger>
          </TabsList>
          <TabsContent value="chat" className="space-y-4">
            {provider.recommendedPrompts && provider.recommendedPrompts.length > 0 && (
              <RecommendedPrompts
                prompts={provider.recommendedPrompts}
                onSelectPrompt={handleSelectPrompt}
              />
            )}
            <ChatbotCommandCenter 
              providerId={provider.id} 
              providerName={provider.displayName}
              draftMessage={draftMessage}
              onDraftChange={setDraftMessage}
            />
          </TabsContent>
          <TabsContent value="tools" className="space-y-4">
            <ProviderToolsOptionsSection
              provider={provider.id}
              workflowType={provider.workflowType}
              optionFields={provider.optionFields}
            />
          </TabsContent>
        </Tabs>
      </ProviderActionGuard>
    </div>
  );
}
