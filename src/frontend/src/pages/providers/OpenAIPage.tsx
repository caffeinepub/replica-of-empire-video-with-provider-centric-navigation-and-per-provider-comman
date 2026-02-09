import { useState } from 'react';
import { getProviderById } from '@/providers/providers';
import ProviderKeyManager from '@/components/keys/ProviderKeyManager';
import ChatbotCommandCenter from '@/components/chat/ChatbotCommandCenter';
import ProviderActionGuard from '@/components/providers/ProviderActionGuard';
import RecommendedPrompts from '@/components/providers/RecommendedPrompts';
import { ProviderToolsOptionsSection } from '@/components/providers/ProviderToolsOptionsSection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function OpenAIPage() {
  const provider = getProviderById('openai')!;
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chat" className="text-xs sm:text-sm">Chat</TabsTrigger>
            <TabsTrigger value="generation" className="text-xs sm:text-sm">Image Gen</TabsTrigger>
            <TabsTrigger value="analysis" className="text-xs sm:text-sm">Analysis</TabsTrigger>
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
          <TabsContent value="generation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">DALL-E 3 Image Generation</CardTitle>
                <CardDescription className="text-sm">Generate images from text prompts using DALL-E 3</CardDescription>
              </CardHeader>
              <CardContent>
                <ProviderToolsOptionsSection
                  provider={provider.id}
                  workflowType="image-generation"
                  optionFields={[
                    { id: 'prompt', label: 'Image Prompt', type: 'textarea', placeholder: 'Describe the image you want to generate...' },
                  ]}
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="analysis" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Text Analysis</CardTitle>
                <CardDescription className="text-sm">Analyze text with GPT-4 models</CardDescription>
              </CardHeader>
              <CardContent>
                <ProviderToolsOptionsSection
                  provider={provider.id}
                  workflowType="custom"
                  optionFields={[]}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </ProviderActionGuard>
    </div>
  );
}
