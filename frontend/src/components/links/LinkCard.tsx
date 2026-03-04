import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MoreVertical, Copy, Share2, Edit, Trash2, ExternalLink } from 'lucide-react';
import { useDeleteLink } from '@/hooks/links/useLinks';
import LinkEditDialog from './LinkEditDialog';
import { shareArtifact } from '@/utils/share';
import { toast } from 'sonner';
import type { Link } from '@/backend';

interface LinkCardProps {
  link: Link;
  index: number;
}

export default function LinkCard({ link, index }: LinkCardProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const deleteLinkMutation = useDeleteLink();

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(link.url);
      toast.success('Link copied to clipboard');
    } catch (error) {
      console.error('Failed to copy link:', error);
      toast.error('Failed to copy link. Please try again.');
    }
  };

  const handleSendLink = async () => {
    const result = await shareArtifact(link.url, link.description);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  const handleDelete = async () => {
    await deleteLinkMutation.mutateAsync(index);
    setDeleteDialogOpen(false);
  };

  return (
    <>
      <Card className="flex flex-col">
        <CardHeader className="flex-row items-start justify-between space-y-0 pb-3">
          <div className="flex-1 space-y-1">
            <CardTitle className="text-lg">{link.description}</CardTitle>
            <CardDescription className="flex items-center gap-1 break-all text-xs">
              <ExternalLink className="h-3 w-3 flex-shrink-0" />
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {link.url}
              </a>
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="flex-1 pt-0">
          <div className="flex flex-wrap gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <MoreVertical className="h-4 w-4" />
                  Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={handleCopyLink}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Link
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSendLink}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Send Link
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditDialogOpen(true)}
              className="gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
              className="gap-2 text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>

      <LinkEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        link={link}
        index={index}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Link</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{link.description}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteLinkMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteLinkMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
