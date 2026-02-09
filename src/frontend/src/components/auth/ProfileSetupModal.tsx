import { useState, useEffect } from 'react';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '@/hooks/useQueries';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfileSetupModal() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Check if profile name is stored locally
  const localProfileKey = identity ? `profile_${identity.getPrincipal().toString()}` : null;
  const hasLocalProfile = localProfileKey ? !!localStorage.getItem(localProfileKey) : false;

  const showProfileSetup =
    isAuthenticated && !profileLoading && isFetched && userProfile === null && !hasLocalProfile;

  useEffect(() => {
    if (!showProfileSetup) {
      setName('');
    }
  }, [showProfileSetup]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && localProfileKey) {
      setIsSaving(true);
      try {
        // Store profile name locally until backend method is available
        localStorage.setItem(localProfileKey, name.trim());
        toast.success('Profile saved successfully');
        setName('');
        setIsSaving(false);
        // Force a re-render by triggering a state change
        window.location.reload();
      } catch (error) {
        toast.error('Failed to save profile');
        setIsSaving(false);
      }
    }
  };

  return (
    <Dialog open={showProfileSetup}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <User className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-center text-2xl">Welcome to Empire Command</DialogTitle>
          <DialogDescription className="text-center">
            Please enter your name to complete your profile setup.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSaving}
              autoFocus
            />
          </div>
          <Button type="submit" className="w-full" disabled={isSaving || !name.trim()}>
            {isSaving ? 'Saving...' : 'Continue'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
