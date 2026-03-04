import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { WorkflowRun } from '@/backend';

interface ExecutionResultPanelProps {
  run: WorkflowRun;
  onReuse?: () => void;
}

export default function ExecutionResultPanel({ run, onReuse }: ExecutionResultPanelProps) {
  const isPending = run.status.__kind__ === 'pending';
  const isRunning = run.status.__kind__ === 'running';
  const isSuccess = run.status.__kind__ === 'success';
  const isFailed = run.status.__kind__ === 'failed';

  let inputs: Record<string, any> = {};
  try {
    inputs = JSON.parse(run.inputs);
  } catch (e) {
    // Ignore parse errors
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          {isPending && (
            <>
              <Clock className="h-5 w-5 text-muted-foreground" />
              <span>Pending</span>
            </>
          )}
          {isRunning && (
            <>
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span>Running...</span>
            </>
          )}
          {isSuccess && (
            <>
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Execution Complete</span>
            </>
          )}
          {isFailed && (
            <>
              <XCircle className="h-5 w-5 text-destructive" />
              <span>Execution Failed</span>
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status message */}
        {isRunning && (
          <Alert>
            <AlertDescription>
              Your workflow is being executed. This may take a moment...
            </AlertDescription>
          </Alert>
        )}

        {isFailed && (
          <Alert variant="destructive">
            <AlertDescription>
              {run.status.__kind__ === 'failed' ? run.status.failed : 'An error occurred during execution.'}
            </AlertDescription>
          </Alert>
        )}

        {isSuccess && (
          <Alert>
            <AlertDescription>
              Workflow executed successfully.
            </AlertDescription>
          </Alert>
        )}

        {/* Input summary */}
        {Object.keys(inputs).length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Inputs Used:</h4>
            <div className="rounded-lg border bg-muted p-3 text-sm space-y-1">
              {Object.entries(inputs).map(([key, value]) => (
                <div key={key} className="flex gap-2">
                  <span className="font-medium">{key}:</span>
                  <span className="text-muted-foreground truncate">
                    {typeof value === 'string' && value.length > 100
                      ? value.substring(0, 100) + '...'
                      : String(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="text-sm text-muted-foreground space-y-1">
          <p>Run ID: {run.id}</p>
          <p>Created: {new Date(Number(run.timestamp) / 1000000).toLocaleString()}</p>
          {run.durationNanos && (
            <p>Duration: {(Number(run.durationNanos) / 1000000000).toFixed(2)}s</p>
          )}
        </div>

        {/* Actions */}
        {onReuse && (
          <Button onClick={onReuse} variant="outline" size="sm">
            Reuse Parameters
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
