import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useAddLink } from '@/hooks/links/useLinks';

export default function LinkCreateForm() {
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [errors, setErrors] = useState<{ description?: string; url?: string }>({});

  const addLinkMutation = useAddLink();

  const validateForm = (): boolean => {
    const newErrors: { description?: string; url?: string } = {};

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!url.trim()) {
      newErrors.url = 'Link URL is required';
    } else {
      try {
        new URL(url);
      } catch {
        newErrors.url = 'Please enter a valid URL (e.g., https://example.com)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    await addLinkMutation.mutateAsync({
      description: description.trim(),
      url: url.trim(),
    });

    // Clear form after successful save
    setDescription('');
    setUrl('');
    setErrors({});
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Link</CardTitle>
        <CardDescription>Create a new link with a description and URL</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            placeholder="e.g., My Portfolio Website"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (errors.description) {
                setErrors({ ...errors, description: undefined });
              }
            }}
            className={errors.description ? 'border-destructive' : ''}
          />
          {errors.description && (
            <p className="text-sm text-destructive">{errors.description}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="url">Link URL</Label>
          <Input
            id="url"
            type="url"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (errors.url) {
                setErrors({ ...errors, url: undefined });
              }
            }}
            className={errors.url ? 'border-destructive' : ''}
          />
          {errors.url && (
            <p className="text-sm text-destructive">{errors.url}</p>
          )}
        </div>

        <Button
          onClick={handleSave}
          disabled={addLinkMutation.isPending}
          className="w-full"
        >
          {addLinkMutation.isPending ? (
            <>Saving...</>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Save Link
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
