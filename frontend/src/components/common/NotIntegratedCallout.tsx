import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface NotIntegratedCalloutProps {
  feature: string;
  description?: string;
}

export default function NotIntegratedCallout({ feature, description }: NotIntegratedCalloutProps) {
  return (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{feature} - Not Integrated Yet</AlertTitle>
      <AlertDescription>
        {description || 'This feature is planned but not yet implemented. Check back soon!'}
      </AlertDescription>
    </Alert>
  );
}
