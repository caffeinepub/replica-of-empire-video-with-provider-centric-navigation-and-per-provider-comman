import { type ReactNode, useState } from 'react';
import { useProviderKey } from '@/hooks/keys/useProviderKey';
import { useBackendActor } from '@/hooks/useBackendActor';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import BackendConnectionAlert from '@/components/common/BackendConnectionAlert';

interface ProviderActionGuardProps {
  providerId: string;
  providerName: string;
  children: ReactNode;
}

export default function ProviderActionGuard({
  providerId,
  providerName,
  children,
}: ProviderActionGuardProps) {
  const { isConnecting, isReady, error, retry } = useBackendActor();
  const { data: keyExists, isLoading } = useProviderKey(providerId);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    await retry();
    setTimeout(() => setIsRetrying(false), 500);
  };

  // Show connection error if backend is not available
  if (error && !isConnecting) {
    return <BackendConnectionAlert error={error} onRetry={handleRetry} isRetrying={isRetrying} />;
  }

  // Show connecting state
  if (isConnecting) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Connecting to backend...
        </div>
      </div>
    );
  }

  // Show loading state while checking key
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Checking API key...
        </div>
      </div>
    );
  }

  // Show key required message
  if (!keyExists) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>API Key Required</AlertTitle>
        <AlertDescription>
          Please add your {providerName} API key in the section above to use this feature.
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
}
