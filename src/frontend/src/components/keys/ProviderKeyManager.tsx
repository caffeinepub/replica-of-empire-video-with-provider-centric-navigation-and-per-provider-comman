import BackendConnectionAlert from "@/components/common/BackendConnectionAlert";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useHasEffectiveProviderKey } from "@/hooks/admin/useAdminKeys";
import {
  useProviderKey,
  useSaveProviderKey,
} from "@/hooks/keys/useProviderKey";
import { useBackendActor } from "@/hooks/useBackendActor";
import { Check, Info, Key, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ProviderKeyManagerProps {
  providerId: string;
  providerName: string;
  credentialLabel?: string;
  credentialPlaceholder?: string;
}

export default function ProviderKeyManager({
  providerId,
  providerName,
  credentialLabel = "API Key",
  credentialPlaceholder = "Enter your API key",
}: ProviderKeyManagerProps) {
  const { isConnecting, isReady, error, retry } = useBackendActor();
  const { data: keyExists, isLoading } = useProviderKey(providerId);
  const { data: hasEffectiveKey } = useHasEffectiveProviderKey(providerId);
  const { mutate: saveKey, isPending } = useSaveProviderKey();
  const [apiKey, setApiKey] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    await retry();
    setTimeout(() => setIsRetrying(false), 500);
  };

  const handleSave = () => {
    if (apiKey.trim().length < 10) {
      toast.error(`${credentialLabel} must be at least 10 characters long`);
      return;
    }

    if (!isReady) {
      toast.error("Still connecting to the backend. Please wait a moment.");
      return;
    }

    saveKey(
      { provider: providerId, key: apiKey.trim() },
      {
        onSuccess: () => {
          toast.success(`${credentialLabel} saved successfully`);
          setApiKey("");
          setIsEditing(false);
        },
        onError: (error: any) => {
          const errorMessage =
            error.message || `Failed to save ${credentialLabel}`;
          toast.error(errorMessage);
        },
      },
    );
  };

  if (error && !isConnecting) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            {credentialLabel}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <BackendConnectionAlert
            error={error}
            onRetry={handleRetry}
            isRetrying={isRetrying}
          />
        </CardContent>
      </Card>
    );
  }

  if (isConnecting || isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            {credentialLabel}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            {isConnecting ? "Connecting to backend..." : "Loading..."}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Owner key fallback banner — only when user has no own key but owner key exists
  const showOwnerKeyBanner = !keyExists && hasEffectiveKey;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          {providerName} {credentialLabel}
        </CardTitle>
        <CardDescription>
          {keyExists
            ? `Your ${credentialLabel.toLowerCase()} is securely stored. You can update it below.`
            : showOwnerKeyBanner
              ? `Using the app owner's key. Add your own ${credentialLabel.toLowerCase()} to avoid usage charges.`
              : `Add your ${credentialLabel.toLowerCase()} to enable this provider.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Owner key active banner */}
        {showOwnerKeyBanner && (
          <Alert className="border-amber-500/40 bg-amber-500/10">
            <Info className="h-4 w-4 text-amber-400" />
            <AlertDescription className="text-amber-300">
              <strong>Owner key active</strong> — your usage will be billed to
              your account. Add your own key to avoid charges.
            </AlertDescription>
          </Alert>
        )}

        {keyExists && !isEditing ? (
          <Alert>
            <Check className="h-4 w-4" />
            <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span>{credentialLabel} is configured</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="w-full sm:w-auto"
              >
                Update {credentialLabel}
              </Button>
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="apiKey">{credentialLabel}</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder={credentialPlaceholder}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                disabled={isPending || !isReady}
              />
            </div>
            {!isReady && (
              <Alert>
                <AlertDescription className="text-sm">
                  Still connecting to the backend. Please wait a moment before
                  saving.
                </AlertDescription>
              </Alert>
            )}
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                onClick={handleSave}
                disabled={isPending || !apiKey.trim() || !isReady}
                className="w-full sm:w-auto"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  `Save ${credentialLabel}`
                )}
              </Button>
              {isEditing && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setApiKey("");
                  }}
                  disabled={isPending}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
