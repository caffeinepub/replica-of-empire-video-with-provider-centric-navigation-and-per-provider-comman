import NotIntegratedCallout from '@/components/common/NotIntegratedCallout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link as LinkIcon } from 'lucide-react';

export default function LinksDashboardPage() {
  return (
    <div className="container mx-auto space-y-6 px-4 py-6 sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 sm:h-16 sm:w-16">
          <LinkIcon className="h-6 w-6 text-primary sm:h-8 sm:w-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Links Dashboard</h1>
          <p className="text-sm text-muted-foreground sm:text-base">Manage your external links and integrations</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Link Management</CardTitle>
          <CardDescription className="text-sm">Create, read, update, and delete external links</CardDescription>
        </CardHeader>
        <CardContent>
          <NotIntegratedCallout
            feature="Links Dashboard"
            description="CRUD operations for link management are planned for a future release."
          />
        </CardContent>
      </Card>
    </div>
  );
}
