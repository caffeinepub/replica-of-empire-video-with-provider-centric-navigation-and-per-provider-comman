import { type ReactNode } from 'react';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppFooter from '../layout/AppFooter';

interface AuthGateProps {
  children: ReactNode;
}

export default function AuthGate({ children }: AuthGateProps) {
  const { identity, login, isLoggingIn, isInitializing } = useInternetIdentity();

  if (isInitializing) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Initializing...</p>
          </div>
        </div>
        <AppFooter />
      </div>
    );
  }

  if (!identity) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="flex flex-1 items-center justify-center bg-background p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center">
                <img 
                  src="/assets/generated/app-logo.dim_512x512.png" 
                  alt="Empire C.C Logo" 
                  className="h-full w-full object-contain"
                />
              </div>
              <CardTitle className="text-2xl">Authentication Required</CardTitle>
              <CardDescription>
                Please log in to access Empire C.C and manage your AI providers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={login} disabled={isLoggingIn} className="w-full" size="lg">
                {isLoggingIn ? 'Logging in...' : 'Login with Internet Identity'}
              </Button>
            </CardContent>
          </Card>
        </div>
        <AppFooter />
      </div>
    );
  }

  return <>{children}</>;
}
