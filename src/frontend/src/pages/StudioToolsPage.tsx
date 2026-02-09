import NotIntegratedCallout from '@/components/common/NotIntegratedCallout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wrench, Paintbrush, Wand2, History } from 'lucide-react';

export default function StudioToolsPage() {
  return (
    <div className="container mx-auto space-y-6 px-4 py-6 sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 sm:h-16 sm:w-16">
          <Wrench className="h-6 w-6 text-primary sm:h-8 sm:w-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Studio Tools</h1>
          <p className="text-sm text-muted-foreground sm:text-base">Advanced tools for content creation and management</p>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Paintbrush className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
              <CardTitle className="text-lg sm:text-xl">Motion Brush</CardTitle>
            </div>
            <CardDescription className="text-sm">Paint motion paths on images for video generation</CardDescription>
          </CardHeader>
          <CardContent>
            <NotIntegratedCallout
              feature="Motion Brush"
              description="Interactive motion brush tool for video generation is planned for a future release."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Wand2 className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
              <CardTitle className="text-lg sm:text-xl">Magic Script</CardTitle>
            </div>
            <CardDescription className="text-sm">Transform simple prompts into detailed generation scripts</CardDescription>
          </CardHeader>
          <CardContent>
            <NotIntegratedCallout
              feature="Magic Script"
              description="AI-powered script enhancement tool is planned for a future release."
            />
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <History className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
              <CardTitle className="text-lg sm:text-xl">Generation History</CardTitle>
            </div>
            <CardDescription className="text-sm">View and manage your generated assets</CardDescription>
          </CardHeader>
          <CardContent>
            <NotIntegratedCallout
              feature="Generation History"
              description="Asset history gallery with filtering is planned for a future release."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
