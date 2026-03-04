import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useUpdateLink } from '@/hooks/links/useLinks';
import type { Link } from '@/backend';

interface LinkEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  link: Link;
  index: number;
}

export default function LinkEditDialog({ open, onOpenChange, link, index }: LinkEditDialogProps) {
  const [description, setDescription] = useState(link.description);
  const [url, setUrl] = useState(link.url);
  const [errors, setErrors] = useState<{ description?: string; url?: string }>({});

  const updateLinkMutation = useUpdateLink();

  useEffect(() => {
    if (open) {
      setDescription(link.description);
      setUrl(link.url);
      setErrors({});
    }
  }, [open, link]);

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

    await updateLinkMutation.mutateAsync({
      index,
      link: {
        description: description.trim(),
        url: url.trim(),
      },
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Link</DialogTitle>
          <DialogDescription>Update the description and URL for this link</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Input
              id="edit-description"
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
            <Label htmlFor="edit-url">Link URL</Label>
            <Input
              id="edit-url"
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={updateLinkMutation.isPending}>
            {updateLinkMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
