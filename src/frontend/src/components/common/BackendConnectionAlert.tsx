import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, LogIn } from 'lucide-react';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { classifyBackendError } from '@/utils/backendErrorMessages';

interface BackendConnectionAlertProps {
  error: Error | null;
  onRetry: () => void;
  isRetrying?: boolean;
}

export default function BackendConnectionAlert({ 
  error, 
  onRetry,
  isRetrying = false 
}: BackendConnectionAlertProps) {
  const { identity, login } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const errorInfo = classifyBackendError(error, isAuthenticated);

  const getActionSteps = (): string[] => {
    if (!isAuthenticated && errorInfo.isAuthError) {
      return ['Log in to access the application'];
    }
    
    return errorInfo.actionSteps;
  };

  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Connection Error</AlertTitle>
      <AlertDescription className="space-y-3">
        <p>{errorInfo.userMessage}</p>
        
        <div className="space-y-1 text-sm">
          <p className="font-medium">What you can do:</p>
          <ul className="list-inside list-disc space-y-1">
            {getActionSteps().map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ul>
        </div>

        <div className="flex flex-wrap gap-2">
          {isAuthenticated ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              disabled={isRetrying}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
              {isRetrying ? 'Retrying...' : 'Retry Connection'}
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => login()}
            >
              <LogIn className="mr-2 h-4 w-4" />
              Log In
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
