import { Download, Check, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePwaInstallPrompt } from '@/hooks/usePwaInstallPrompt';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export default function PwaInstallPrompt() {
  const { isInstallable, isInstalled, isIOS, promptInstall } = usePwaInstallPrompt();

  // Don't show anything if already installed
  if (isInstalled) {
    return null;
  }

  // Show install button for browsers that support beforeinstallprompt
  if (isInstallable) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={promptInstall}
        className="hidden sm:flex"
      >
        <Download className="mr-2 h-4 w-4" />
        Install App
      </Button>
    );
  }

  // Show iOS instructions in a popover
  if (isIOS) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <Download className="mr-2 h-4 w-4" />
            Install App
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Share className="h-5 w-5 text-primary mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Install Empire Command</p>
                <p className="text-xs text-muted-foreground">
                  To install on iPhone/iPad:
                </p>
                <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Tap the Share button</li>
                  <li>Scroll down and tap "Add to Home Screen"</li>
                  <li>Tap "Add" to confirm</li>
                </ol>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  // Don't show anything if not installable and not iOS
  return null;
}
