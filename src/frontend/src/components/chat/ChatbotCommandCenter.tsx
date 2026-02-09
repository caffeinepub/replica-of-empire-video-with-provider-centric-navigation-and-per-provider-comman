import { useState, useRef, useEffect } from 'react';
import { useProviderChat } from '@/hooks/chat/useProviderChat';
import { useBackendActor } from '@/hooks/useBackendActor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MessageSquare, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ChatbotCommandCenterProps {
  providerId: string;
  providerName: string;
  draftMessage?: string;
  onDraftChange?: (draft: string) => void;
}

export default function ChatbotCommandCenter({ 
  providerId, 
  providerName,
  draftMessage,
  onDraftChange,
}: ChatbotCommandCenterProps) {
  const { isReady: backendReady } = useBackendActor();
  const { messages, isLoading, isReady, sendMessage, isSending } = useProviderChat(providerId);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sync external draft with internal state
  useEffect(() => {
    if (draftMessage !== undefined) {
      setInput(draftMessage);
    }
  }, [draftMessage]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleInputChange = (value: string) => {
    setInput(value);
    if (onDraftChange) {
      onDraftChange(value);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    
    if (!backendReady || !isReady) {
      toast.error('Still connecting to the backend. Please wait a moment.');
      return;
    }
    
    sendMessage(input.trim(), {
      onSuccess: () => {
        setInput('');
        if (onDraftChange) {
          onDraftChange('');
        }
      },
      onError: (error: any) => {
        // Error is already user-friendly from the hook
        toast.error(error.message || 'Failed to send message');
      },
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = backendReady && isReady && !isSending && input.trim().length > 0;

  return (
    <Card className="flex flex-col h-[calc(100vh-20rem)] sm:h-[600px]">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <MessageSquare className="h-5 w-5" />
          {providerName} Command Center
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4 overflow-hidden p-0">
        <ScrollArea className="flex-1 px-4 sm:px-6" ref={scrollRef}>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading messages...
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageSquare className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                No messages yet. Start a conversation with {providerName}!
              </p>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.fromSystem ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg px-4 py-2 text-sm sm:max-w-[75%] ${
                      msg.fromSystem
                        ? 'bg-muted text-foreground'
                        : 'bg-primary text-primary-foreground'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="flex-shrink-0 space-y-2 border-t px-4 pt-4 pb-4 sm:px-6">
          {!backendReady && (
            <Alert>
              <AlertDescription className="text-sm">
                Still connecting to the backend. Please wait a moment before sending messages.
              </AlertDescription>
            </Alert>
          )}
          <div className="flex gap-2">
            <Textarea
              placeholder={`Message ${providerName}...`}
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSending || !backendReady || !isReady}
              className="min-h-[60px] resize-none"
            />
            <Button
              onClick={handleSend}
              disabled={!canSend}
              size="icon"
              className="h-[60px] w-[60px] flex-shrink-0"
            >
              {isSending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
