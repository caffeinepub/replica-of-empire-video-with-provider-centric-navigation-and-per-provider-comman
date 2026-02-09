import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import NotIntegratedCallout from '@/components/common/NotIntegratedCallout';
import { Video, Image, Wrench, Download, Share2, Play } from 'lucide-react';
import type { WorkflowType, OptionField } from '@/providers/providers';

interface ProviderToolsOptionsSectionProps {
  providerName: string;
  workflowType: WorkflowType;
  optionFields?: OptionField[];
}

export default function ProviderToolsOptionsSection({
  providerName,
  workflowType,
  optionFields = [],
}: ProviderToolsOptionsSectionProps) {
  const [formValues, setFormValues] = useState<Record<string, string | number>>(() => {
    const initial: Record<string, string | number> = {};
    optionFields.forEach((field) => {
      if (field.defaultValue !== undefined) {
        initial[field.id] = field.defaultValue;
      }
    });
    return initial;
  });

  const handleFieldChange = (fieldId: string, value: string | number) => {
    setFormValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  const renderField = (field: OptionField) => {
    const value = formValues[field.id] || '';

    switch (field.type) {
      case 'textarea':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>{field.label}</Label>
            <Textarea
              id={field.id}
              placeholder={field.placeholder}
              value={value as string}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        );
      case 'select':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>{field.label}</Label>
            <Select
              value={value as string}
              onValueChange={(val) => handleFieldChange(field.id, val)}
            >
              <SelectTrigger id={field.id}>
                <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      case 'number':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>{field.label}</Label>
            <Input
              id={field.id}
              type="number"
              placeholder={field.placeholder}
              value={value as number}
              onChange={(e) => handleFieldChange(field.id, parseFloat(e.target.value) || 0)}
            />
          </div>
        );
      default:
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>{field.label}</Label>
            <Input
              id={field.id}
              type="text"
              placeholder={field.placeholder}
              value={value as string}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
            />
          </div>
        );
    }
  };

  const renderToolCard = () => {
    switch (workflowType) {
      case 'video-generation':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Video className="h-5 w-5" />
                Video Generation
              </CardTitle>
              <CardDescription className="text-sm">
                Configure and generate videos with {providerName}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {optionFields.map((field) => renderField(field))}
              <div className="flex flex-col gap-2 pt-2 sm:flex-row">
                <Button disabled className="w-full sm:w-auto">
                  <Play className="mr-2 h-4 w-4" />
                  Generate Video
                </Button>
                <Button disabled variant="outline" className="w-full sm:w-auto">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button disabled variant="outline" className="w-full sm:w-auto">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>
              <NotIntegratedCallout
                feature="Video Generation"
                description="Video generation, download, and sharing features require client-side API integration which will be implemented in a future release."
              />
            </CardContent>
          </Card>
        );

      case 'image-generation':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Image className="h-5 w-5" />
                Image Generation
              </CardTitle>
              <CardDescription className="text-sm">
                Create images with {providerName}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {optionFields.map((field) => renderField(field))}
              <div className="flex flex-col gap-2 pt-2 sm:flex-row">
                <Button disabled className="w-full sm:w-auto">
                  <Play className="mr-2 h-4 w-4" />
                  Generate Image
                </Button>
                <Button disabled variant="outline" className="w-full sm:w-auto">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button disabled variant="outline" className="w-full sm:w-auto">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>
              <NotIntegratedCallout
                feature="Image Generation"
                description="Image generation, download, and sharing features require client-side API integration which will be implemented in a future release."
              />
            </CardContent>
          </Card>
        );

      case 'integration':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Wrench className="h-5 w-5" />
                Integration Tools
              </CardTitle>
              <CardDescription className="text-sm">
                Connect and automate with {providerName}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {optionFields.map((field) => renderField(field))}
              <div className="flex flex-col gap-2 pt-2 sm:flex-row">
                <Button disabled className="w-full sm:w-auto">
                  <Play className="mr-2 h-4 w-4" />
                  Execute
                </Button>
              </div>
              <NotIntegratedCallout
                feature={`${providerName} Integration`}
                description="Integration features require client-side API calls which will be implemented in a future release."
              />
            </CardContent>
          </Card>
        );

      case 'app-builder':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Wrench className="h-5 w-5" />
                App Builder
              </CardTitle>
              <CardDescription className="text-sm">
                Build applications with {providerName}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {optionFields.map((field) => renderField(field))}
              <div className="flex flex-col gap-2 pt-2 sm:flex-row">
                <Button disabled className="w-full sm:w-auto">
                  <Play className="mr-2 h-4 w-4" />
                  Build App
                </Button>
              </div>
              <NotIntegratedCallout
                feature="App Builder"
                description="App building features require client-side API integration which will be implemented in a future release."
              />
            </CardContent>
          </Card>
        );

      case 'custom':
        if (optionFields.length > 0) {
          return (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Wrench className="h-5 w-5" />
                  Custom Tools
                </CardTitle>
                <CardDescription className="text-sm">
                  Configure and execute custom workflows
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {optionFields.map((field) => renderField(field))}
                <div className="flex flex-col gap-2 pt-2 sm:flex-row">
                  <Button disabled className="w-full sm:w-auto">
                    <Play className="mr-2 h-4 w-4" />
                    Execute
                  </Button>
                </div>
                <NotIntegratedCallout
                  feature="Custom Workflow"
                  description="Custom workflow execution requires client-side API integration which will be implemented in a future release."
                />
              </CardContent>
            </Card>
          );
        }
        return null;

      default:
        return null;
    }
  };

  return renderToolCard();
}
