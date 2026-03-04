import NotIntegratedCallout from '@/components/common/NotIntegratedCallout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain } from 'lucide-react';

export default function MemoryBrainPage() {
  return (
    <div className="container mx-auto space-y-6 px-4 py-6 sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 sm:h-16 sm:w-16">
          <Brain className="h-6 w-6 text-primary sm:h-8 sm:w-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Empire Brain</h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Retrieval-augmented generation system for brand consistency
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Memory & RAG System</CardTitle>
          <CardDescription className="text-sm">
            Store and recall brand guidelines, generation patterns, and context across sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NotIntegratedCallout
            feature="Empire Brain"
            description="The RAG system with embeddings and memory storage is planned for a future release."
          />
        </CardContent>
      </Card>
    </div>
  );
}
