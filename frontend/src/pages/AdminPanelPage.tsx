import { useIsCallerAdmin } from '@/hooks/useQueries';
import NotIntegratedCallout from '@/components/common/NotIntegratedCallout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield, AlertCircle } from 'lucide-react';

export default function AdminPanelPage() {
  const { data: isAdmin, isLoading } = useIsCallerAdmin();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-sm text-muted-foreground">Checking permissions...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-6 sm:px-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You do not have administrator privileges to access this page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 px-4 py-6 sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 sm:h-16 sm:w-16">
          <Shield className="h-6 w-6 text-primary sm:h-8 sm:w-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Admin Panel</h1>
          <p className="text-sm text-muted-foreground sm:text-base">System administration and management tools</p>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Provider Management</CardTitle>
            <CardDescription className="text-sm">Initialize and configure AI providers</CardDescription>
          </CardHeader>
          <CardContent>
            <NotIntegratedCallout
              feature="Provider Management"
              description="Admin tools for provider initialization are planned for a future release."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">User Management</CardTitle>
            <CardDescription className="text-sm">View and manage user accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <NotIntegratedCallout
              feature="User Management"
              description="User administration tools are planned for a future release."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Discount Codes</CardTitle>
            <CardDescription className="text-sm">Create and manage promotional codes</CardDescription>
          </CardHeader>
          <CardContent>
            <NotIntegratedCallout
              feature="Discount Codes"
              description="Promotional code management is planned for a future release."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Memory Injection</CardTitle>
            <CardDescription className="text-sm">Manually inject memories into the Empire Brain</CardDescription>
          </CardHeader>
          <CardContent>
            <NotIntegratedCallout
              feature="Memory Injection"
              description="Manual memory management tools are planned for a future release."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
