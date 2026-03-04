import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link as LinkIcon, Loader2, FileText, ExternalLink } from 'lucide-react';
import { useGetAllLinks } from '@/hooks/links/useLinks';
import LinkCreateForm from '@/components/links/LinkCreateForm';
import LinkCard from '@/components/links/LinkCard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LinksDashboardPage() {
  const { data: links, isLoading, error, refetch } = useGetAllLinks();

  return (
    <div className="container mx-auto space-y-6 px-4 py-6 sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 sm:h-16 sm:w-16">
          <LinkIcon className="h-6 w-6 text-primary sm:h-8 sm:w-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Links Dashboard</h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Manage your external links and integrations
          </p>
        </div>
      </div>

      {/* Export Documentation Card */}
      <Card className="border-amber-500/20 bg-amber-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-5 w-5 text-amber-500" />
            Export Documentation
          </CardTitle>
          <CardDescription>
            Learn how to deploy and configure this application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <a href="/export/README.md" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              View Setup Guide
            </a>
          </Button>
        </CardContent>
      </Card>

      <LinkCreateForm />

      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Saved Links</h2>
          <p className="text-sm text-muted-foreground">Your collection of saved links</p>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load links. Please try again.
              <button
                onClick={() => refetch()}
                className="ml-2 underline hover:no-underline"
              >
                Retry
              </button>
            </AlertDescription>
          </Alert>
        )}

        {!isLoading && !error && links && links.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>No Links Yet</CardTitle>
              <CardDescription>
                Create your first link using the form above to get started.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {!isLoading && !error && links && links.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {links.map((link, index) => (
              <LinkCard key={index} link={link} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
