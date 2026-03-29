import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useAllAdminAPIKeyProviders,
  useAllReferralLinks,
  useDeleteAdminAPIKey,
  useGitHubClientId,
  useSetAdminAPIKey,
  useSetGitHubClientId,
  useSetReferralLink,
} from "@/hooks/admin/useAdminKeys";
import {
  AlertCircle,
  Check,
  Github,
  Key,
  Link,
  Loader2,
  Lock,
  Shield,
  Trash2,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const ADMIN_PASSWORD = "Seale1993!";

// ─── Provider list ────────────────────────────────────────────────────────────
const ALL_PROVIDERS = [
  { id: "venice-ai", name: "Venice AI" },
  { id: "openai", name: "OpenAI" },
  { id: "replicate", name: "Replicate" },
  { id: "runpod", name: "RunPod" },
  { id: "gemini", name: "Gemini" },
  { id: "ltx", name: "LTX" },
  { id: "runway", name: "Runway" },
  { id: "pika", name: "Pika" },
  { id: "luma", name: "Luma" },
  { id: "kling", name: "Kling" },
  { id: "hailuo", name: "Hailuo" },
  { id: "stability-ai", name: "Stability AI" },
  { id: "fal-ai", name: "Fal.ai" },
  { id: "modelscope", name: "ModelScope" },
  { id: "leonardo-ai", name: "Leonardo AI" },
  { id: "synthesia", name: "Synthesia" },
  { id: "slack", name: "Slack" },
  { id: "tiktok", name: "TikTok" },
  { id: "shopify", name: "Shopify" },
  { id: "woocommerce", name: "WooCommerce" },
  { id: "custom-slot-1", name: "Custom Slot 1" },
  { id: "custom-slot-2", name: "Custom Slot 2" },
  { id: "custom-slot-3", name: "Custom Slot 3" },
];

// ─── Owner Key Row ────────────────────────────────────────────────────────────
function OwnerKeyRow({
  providerId,
  providerName,
  isConfigured,
}: {
  providerId: string;
  providerName: string;
  isConfigured: boolean;
}) {
  const [keyInput, setKeyInput] = useState("");
  const { mutate: setKey, isPending: isSetting } = useSetAdminAPIKey();
  const { mutate: deleteKey, isPending: isDeleting } = useDeleteAdminAPIKey();

  const handleSet = () => {
    if (keyInput.trim().length < 4) {
      toast.error("Key must be at least 4 characters");
      return;
    }
    setKey(
      { provider: providerId, key: keyInput.trim() },
      {
        onSuccess: () => {
          toast.success(`${providerName} owner key saved`);
          setKeyInput("");
        },
        onError: () => toast.error(`Failed to save ${providerName} key`),
      },
    );
  };

  const handleDelete = () => {
    deleteKey(providerId, {
      onSuccess: () => toast.success(`${providerName} owner key removed`),
      onError: () => toast.error(`Failed to remove ${providerName} key`),
    });
  };

  const isPending = isSetting || isDeleting;

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border p-3 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span className="min-w-[120px] text-sm font-medium">
          {providerName}
        </span>
        <Badge
          variant={isConfigured ? "default" : "secondary"}
          className={
            isConfigured
              ? "bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/20"
              : ""
          }
        >
          {isConfigured ? (
            <>
              <Check className="mr-1 h-3 w-3" />
              Configured
            </>
          ) : (
            "Not Set"
          )}
        </Badge>
      </div>
      <div className="flex flex-1 gap-2">
        <Input
          type="password"
          placeholder="Enter owner API key…"
          value={keyInput}
          onChange={(e) => setKeyInput(e.target.value)}
          disabled={isPending}
          className="flex-1 text-sm"
          data-ocid={`admin.owner_key_${providerId}.input`}
          onKeyDown={(e) => e.key === "Enter" && handleSet()}
        />
        <Button
          size="sm"
          onClick={handleSet}
          disabled={isPending || !keyInput.trim()}
          data-ocid={`admin.owner_key_${providerId}.save_button`}
        >
          {isSetting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Set"}
        </Button>
        {isConfigured && (
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDelete}
            disabled={isPending}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            data-ocid={`admin.owner_key_${providerId}.delete_button`}
          >
            {isDeleting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Referral Link Row ────────────────────────────────────────────────────────
function ReferralLinkRow({
  providerId,
  providerName,
  existingUrl,
}: {
  providerId: string;
  providerName: string;
  existingUrl: string;
}) {
  const [urlInput, setUrlInput] = useState(existingUrl);
  const { mutate: saveLink, isPending } = useSetReferralLink();

  const handleSave = () => {
    saveLink(
      { provider: providerId, url: urlInput.trim() },
      {
        onSuccess: () => toast.success(`${providerName} referral link saved`),
        onError: () => toast.error("Failed to save referral link"),
      },
    );
  };

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border p-3 sm:flex-row sm:items-center">
      <span className="min-w-[120px] text-sm font-medium">{providerName}</span>
      <div className="flex flex-1 gap-2">
        <Input
          type="url"
          placeholder="https://…"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          disabled={isPending}
          className="flex-1 text-sm"
          data-ocid={`admin.referral_${providerId}.input`}
        />
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isPending}
          data-ocid={`admin.referral_${providerId}.save_button`}
        >
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            "Save"
          )}
        </Button>
      </div>
    </div>
  );
}

// ─── Password Gate ────────────────────────────────────────────────────────────
function PasswordGate({ onUnlock }: { onUnlock: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem("adminUnlocked", "true");
      onUnlock();
    } else {
      setError("Incorrect password. Please try again.");
      setPassword("");
    }
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-xl">Admin Access</CardTitle>
          <CardDescription>
            Enter the admin password to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <Input
                id="admin-password"
                type="password"
                placeholder="Enter admin password…"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                autoFocus
                data-ocid="admin.password.input"
              />
              {error && (
                <p
                  className="flex items-center gap-1.5 text-xs text-destructive"
                  data-ocid="admin.password.error_state"
                >
                  <AlertCircle className="h-3.5 w-3.5" />
                  {error}
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={!password}
              data-ocid="admin.password.submit_button"
            >
              Unlock
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AdminPanelPage() {
  const [unlocked, setUnlocked] = useState(
    () => sessionStorage.getItem("adminUnlocked") === "true",
  );

  const { data: configuredProviders = [] } = useAllAdminAPIKeyProviders();
  const { data: githubClientId = "" } = useGitHubClientId();
  const { data: referralLinks = [] } = useAllReferralLinks();
  const { mutate: setGithubClientId, isPending: isSavingGhClientId } =
    useSetGitHubClientId();
  const { mutate: setGithubToken, isPending: isSavingGhToken } =
    useSetAdminAPIKey();

  const [ghClientIdInput, setGhClientIdInput] = useState("");
  const [ghTokenInput, setGhTokenInput] = useState("");

  const handleLock = () => {
    sessionStorage.removeItem("adminUnlocked");
    setUnlocked(false);
  };

  // Build referral map
  const referralMap = new Map(referralLinks);

  if (!unlocked) {
    return <PasswordGate onUnlock={() => setUnlocked(true)} />;
  }

  return (
    <div className="container mx-auto space-y-6 px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 sm:h-14 sm:w-14">
            <Shield className="h-6 w-6 text-primary sm:h-7 sm:w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">Admin Panel</h1>
            <p className="text-sm text-muted-foreground">
              System administration — owner keys, GitHub OAuth, referral links
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLock}
          className="self-start sm:self-auto"
          data-ocid="admin.lock.button"
        >
          <Lock className="mr-1.5 h-3.5 w-3.5" />
          Lock
        </Button>
      </div>

      <Tabs defaultValue="owner-keys" className="w-full">
        <TabsList className="mb-4 grid w-full grid-cols-4">
          <TabsTrigger value="owner-keys" data-ocid="admin.owner_keys.tab">
            <Key className="mr-1.5 h-3.5 w-3.5" />
            <span className="hidden sm:inline">Owner Keys</span>
            <span className="sm:hidden">Keys</span>
          </TabsTrigger>
          <TabsTrigger value="github" data-ocid="admin.github.tab">
            <Github className="mr-1.5 h-3.5 w-3.5" />
            GitHub
          </TabsTrigger>
          <TabsTrigger value="referrals" data-ocid="admin.referrals.tab">
            <Link className="mr-1.5 h-3.5 w-3.5" />
            <span className="hidden sm:inline">Referral Links</span>
            <span className="sm:hidden">Referrals</span>
          </TabsTrigger>
          <TabsTrigger value="users" data-ocid="admin.users.tab">
            <Users className="mr-1.5 h-3.5 w-3.5" />
            Users
          </TabsTrigger>
        </TabsList>

        {/* ── Owner API Keys ── */}
        <TabsContent value="owner-keys">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-primary" />
                Owner API Keys
              </CardTitle>
              <CardDescription>
                Set default API keys for all providers. These are used
                automatically when a user has not added their own key. Keys are
                never shown after saving — only their configured status is
                visible.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4 border-amber-500/30 bg-amber-500/10">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <AlertTitle className="text-amber-500">
                  Security Notice
                </AlertTitle>
                <AlertDescription className="text-amber-400/80">
                  Saved keys are encrypted and never displayed. Users will be
                  billed when they use your owner keys.
                </AlertDescription>
              </Alert>
              <ScrollArea className="h-[520px] pr-2">
                <div className="space-y-2">
                  {ALL_PROVIDERS.map((p) => (
                    <OwnerKeyRow
                      key={p.id}
                      providerId={p.id}
                      providerName={p.name}
                      isConfigured={configuredProviders.includes(p.id)}
                    />
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── GitHub OAuth ── */}
        <TabsContent value="github">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Github className="h-5 w-5" />
                GitHub OAuth &amp; Token
              </CardTitle>
              <CardDescription>
                Configure GitHub OAuth for users to connect their own accounts,
                and set your fallback owner GitHub token.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* GitHub Client ID */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-semibold">
                    GitHub OAuth Client ID
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    The Client ID from your GitHub OAuth App. This is
                    semi-public — it lets users connect their own GitHub
                    accounts.
                  </p>
                </div>
                {githubClientId && (
                  <div className="flex items-center gap-2 rounded-md bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
                    <Check className="h-4 w-4" />
                    Client ID currently set:{" "}
                    <code className="font-mono">{githubClientId}</code>
                  </div>
                )}
                <div className="flex gap-2">
                  <Input
                    placeholder="Ov23liXXXXXXXXXXXXXX"
                    value={ghClientIdInput}
                    onChange={(e) => setGhClientIdInput(e.target.value)}
                    data-ocid="admin.github_client_id.input"
                    className="flex-1"
                  />
                  <Button
                    onClick={() => {
                      if (!ghClientIdInput.trim()) return;
                      setGithubClientId(ghClientIdInput.trim(), {
                        onSuccess: () => {
                          toast.success("GitHub Client ID saved");
                          setGhClientIdInput("");
                        },
                        onError: () => toast.error("Failed to save Client ID"),
                      });
                    }}
                    disabled={isSavingGhClientId || !ghClientIdInput.trim()}
                    data-ocid="admin.github_client_id.save_button"
                  >
                    {isSavingGhClientId ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Save"
                    )}
                  </Button>
                </div>
              </div>

              <Separator />

              {/* GitHub Owner Token */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-semibold">
                    GitHub Owner Token (Fallback)
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Your personal GitHub token used as a fallback when users
                    have not connected their own account. Never shown after
                    saving.
                  </p>
                </div>
                <div className="flex items-center gap-2 rounded-md bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                  <Key className="h-4 w-4" />
                  {configuredProviders.includes("github") ? (
                    <span className="text-emerald-400">
                      Owner token is configured
                    </span>
                  ) : (
                    <span>No owner token set</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    type="password"
                    placeholder="ghp_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                    value={ghTokenInput}
                    onChange={(e) => setGhTokenInput(e.target.value)}
                    data-ocid="admin.github_token.input"
                    className="flex-1"
                  />
                  <Button
                    onClick={() => {
                      if (!ghTokenInput.trim()) return;
                      setGithubToken(
                        { provider: "github", key: ghTokenInput.trim() },
                        {
                          onSuccess: () => {
                            toast.success("GitHub owner token saved");
                            setGhTokenInput("");
                          },
                          onError: () => toast.error("Failed to save token"),
                        },
                      );
                    }}
                    disabled={isSavingGhToken || !ghTokenInput.trim()}
                    data-ocid="admin.github_token.save_button"
                  >
                    {isSavingGhToken ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Set Token"
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Referral Links ── */}
        <TabsContent value="referrals">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="h-5 w-5 text-primary" />
                Referral Links
              </CardTitle>
              <CardDescription>
                Set referral URLs for each provider. These appear on provider
                pages so users can sign up for their own keys through your
                affiliate link.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[520px] pr-2">
                <div className="space-y-2">
                  {ALL_PROVIDERS.map((p) => (
                    <ReferralLinkRow
                      key={p.id}
                      providerId={p.id}
                      providerName={p.name}
                      existingUrl={referralMap.get(p.id) ?? ""}
                    />
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Users ── */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                User Management
              </CardTitle>
              <CardDescription>View and manage user accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="mb-4 h-12 w-12 text-muted-foreground/30" />
                <p className="text-base font-medium text-muted-foreground">
                  User management tools coming soon
                </p>
                <p className="mt-1 text-sm text-muted-foreground/60">
                  Advanced user administration features are planned for a future
                  update.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
