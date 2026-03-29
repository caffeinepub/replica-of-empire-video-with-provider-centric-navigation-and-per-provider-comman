import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronDown,
  ChevronUp,
  Download,
  Eye,
  EyeOff,
  Github,
  Globe,
  Loader2,
  Settings,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// ─── ZIP helper ──────────────────────────────────────────────────────────────
function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createZip(files: { name: string; content: string }[]): Uint8Array {
  const encoder = new TextEncoder();
  const localHeaders: Uint8Array[] = [];
  const centralDirs: Uint8Array[] = [];
  let offset = 0;

  for (const file of files) {
    const nameBytes = encoder.encode(file.name);
    const dataBytes = encoder.encode(file.content);
    const crc = crc32(dataBytes);
    const local = new Uint8Array(30 + nameBytes.length + dataBytes.length);
    const dv = new DataView(local.buffer);
    dv.setUint32(0, 0x504b0304, true);
    dv.setUint16(4, 20, true);
    dv.setUint16(6, 0, true);
    dv.setUint16(8, 0, true);
    dv.setUint16(10, 0, true);
    dv.setUint16(12, 0, true);
    dv.setUint32(14, crc, true);
    dv.setUint32(18, dataBytes.length, true);
    dv.setUint32(22, dataBytes.length, true);
    dv.setUint16(26, nameBytes.length, true);
    dv.setUint16(28, 0, true);
    local.set(nameBytes, 30);
    local.set(dataBytes, 30 + nameBytes.length);
    localHeaders.push(local);

    const central = new Uint8Array(46 + nameBytes.length);
    const cdv = new DataView(central.buffer);
    cdv.setUint32(0, 0x504b0102, true);
    cdv.setUint16(4, 20, true);
    cdv.setUint16(6, 20, true);
    cdv.setUint16(8, 0, true);
    cdv.setUint16(10, 0, true);
    cdv.setUint16(12, 0, true);
    cdv.setUint16(14, 0, true);
    cdv.setUint32(16, crc, true);
    cdv.setUint32(20, dataBytes.length, true);
    cdv.setUint32(24, dataBytes.length, true);
    cdv.setUint16(28, nameBytes.length, true);
    cdv.setUint16(30, 0, true);
    cdv.setUint16(32, 0, true);
    cdv.setUint16(34, 0, true);
    cdv.setUint16(36, 0, true);
    cdv.setUint32(38, 0, true);
    cdv.setUint32(42, offset, true);
    central.set(nameBytes, 46);
    centralDirs.push(central);
    offset += local.length;
  }

  const centralDirSize = centralDirs.reduce((s, c) => s + c.length, 0);
  const eocd = new Uint8Array(22);
  const edv = new DataView(eocd.buffer);
  edv.setUint32(0, 0x504b0506, true);
  edv.setUint16(4, 0, true);
  edv.setUint16(6, 0, true);
  edv.setUint16(8, files.length, true);
  edv.setUint16(10, files.length, true);
  edv.setUint32(12, centralDirSize, true);
  edv.setUint32(16, offset, true);
  edv.setUint16(20, 0, true);

  const all = [...localHeaders, ...centralDirs, eocd];
  const total = all.reduce((s, a) => s + a.length, 0);
  const result = new Uint8Array(total);
  let pos = 0;
  for (const arr of all) {
    result.set(arr, pos);
    pos += arr.length;
  }
  return result;
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface CrawledDoc {
  id: string;
  url: string;
  title: string;
  content: string;
  editing: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function FireCrawlPage() {
  // Settings
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [fcKey, setFcKey] = useState(
    () => localStorage.getItem("firecrawl_api_key") ?? "",
  );
  const [oaiKey, setOaiKey] = useState(
    () => localStorage.getItem("firecrawl_openai_key") ?? "",
  );
  const [ghToken, setGhToken] = useState(
    () => localStorage.getItem("github_token") ?? "",
  );
  const [showFcKey, setShowFcKey] = useState(false);
  const [showOaiKey, setShowOaiKey] = useState(false);
  const [showGhToken, setShowGhToken] = useState(false);

  // Crawl
  const [url, setUrl] = useState("");
  const [batchCrawl, setBatchCrawl] = useState(false);
  const [crawling, setCrawling] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  // Docs
  const [docs, setDocs] = useState<CrawledDoc[]>([]);

  // AI Edit dialog
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiTargetId, setAiTargetId] = useState<string | null>(null);
  const [aiInstruction, setAiInstruction] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // GitHub dialog
  const [ghDialogOpen, setGhDialogOpen] = useState(false);
  const [ghOwner, setGhOwner] = useState("");
  const [ghRepo, setGhRepo] = useState("");
  const [ghBranch, setGhBranch] = useState("main");
  const [ghCommit, setGhCommit] = useState("Add crawled pages");
  const [ghBasePath, setGhBasePath] = useState("crawled/");
  const [ghPushing, setGhPushing] = useState(false);

  function saveSettings() {
    localStorage.setItem("firecrawl_api_key", fcKey);
    localStorage.setItem("firecrawl_openai_key", oaiKey);
    localStorage.setItem("github_token", ghToken);
    toast.success("Settings saved");
  }

  function extractTitle(markdown: string, fallbackUrl: string): string {
    const match = markdown.match(/^#\s+(.+)$/m);
    return match ? match[1].trim() : fallbackUrl;
  }

  function slugify(s: string): string {
    return s
      .replace(/https?:\/\//, "")
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase()
      .slice(0, 60);
  }

  async function handleCrawl() {
    if (!url.trim()) {
      toast.error("Please enter a URL");
      return;
    }
    if (!fcKey) {
      toast.error("FireCrawl API key is required. Open Settings above.");
      return;
    }
    setCrawling(true);
    setStatusMsg("Starting crawl…");
    try {
      if (!batchCrawl) {
        // Single page scrape
        setStatusMsg("Scraping page…");
        const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${fcKey}`,
          },
          body: JSON.stringify({ url: url.trim(), formats: ["markdown"] }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Scrape failed");
        const md: string = json.data?.markdown ?? json.markdown ?? "";
        const doc: CrawledDoc = {
          id: crypto.randomUUID(),
          url: url.trim(),
          title: extractTitle(md, url.trim()),
          content: md,
          editing: false,
        };
        setDocs((prev) => [doc, ...prev]);
        setStatusMsg("Done!");
        toast.success("Page scraped successfully");
      } else {
        // Batch crawl
        setStatusMsg("Initiating batch crawl…");
        const startRes = await fetch("https://api.firecrawl.dev/v1/crawl", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${fcKey}`,
          },
          body: JSON.stringify({ url: url.trim(), limit: 20 }),
        });
        const startJson = await startRes.json();
        if (!startRes.ok)
          throw new Error(startJson.error ?? "Crawl start failed");
        const crawlId: string = startJson.id;
        // Poll
        let completed = false;
        let pages: {
          markdown?: string;
          content?: string;
          metadata?: { sourceURL?: string; url?: string };
        }[] = [];
        let attempts = 0;
        while (!completed && attempts < 100) {
          await new Promise((r) => setTimeout(r, 3000));
          attempts++;
          setStatusMsg(`Polling… (${attempts * 3}s elapsed)`);
          const pollRes = await fetch(
            `https://api.firecrawl.dev/v1/crawl/${crawlId}`,
            {
              headers: { Authorization: `Bearer ${fcKey}` },
            },
          );
          const pollJson = await pollRes.json();
          if (pollJson.status === "completed") {
            completed = true;
            pages = pollJson.data ?? [];
          } else if (pollJson.status === "failed") {
            throw new Error("Crawl job failed");
          }
        }
        if (!completed) throw new Error("Crawl timed out");
        const newDocs: CrawledDoc[] = pages.map((p) => {
          const md = p.markdown ?? p.content ?? "";
          const srcUrl = p.metadata?.sourceURL ?? p.metadata?.url ?? url.trim();
          return {
            id: crypto.randomUUID(),
            url: srcUrl,
            title: extractTitle(md, srcUrl),
            content: md,
            editing: false,
          };
        });
        setDocs((prev) => [...newDocs, ...prev]);
        setStatusMsg(`Done! ${newDocs.length} pages collected.`);
        toast.success(`Batch crawl complete: ${newDocs.length} pages`);
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Crawl failed");
      setStatusMsg("");
    } finally {
      setCrawling(false);
    }
  }

  function updateDoc(id: string, content: string) {
    setDocs((prev) => prev.map((d) => (d.id === id ? { ...d, content } : d)));
  }

  function toggleEdit(id: string) {
    setDocs((prev) =>
      prev.map((d) => (d.id === id ? { ...d, editing: !d.editing } : d)),
    );
  }

  function deleteDoc(id: string) {
    setDocs((prev) => prev.filter((d) => d.id !== id));
  }

  function openAiDialog(id: string) {
    setAiTargetId(id);
    setAiInstruction("");
    setAiDialogOpen(true);
  }

  async function runAiEdit() {
    if (!oaiKey) {
      toast.error("OpenAI API key required. Open Settings above.");
      return;
    }
    if (!aiTargetId || !aiInstruction.trim()) return;
    const doc = docs.find((d) => d.id === aiTargetId);
    if (!doc) return;
    setAiLoading(true);
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${oaiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "You are a helpful assistant that edits markdown documents. Return only the updated markdown content.",
            },
            {
              role: "user",
              content: `Instruction: ${aiInstruction}\n\nDocument:\n${doc.content}`,
            },
          ],
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? "AI edit failed");
      const newContent: string = json.choices?.[0]?.message?.content ?? "";
      updateDoc(aiTargetId, newContent);
      toast.success("Document updated by AI");
      setAiDialogOpen(false);
    } catch (err: any) {
      toast.error(err?.message ?? "AI edit failed");
    } finally {
      setAiLoading(false);
    }
  }

  function downloadZip() {
    if (docs.length === 0) {
      toast.error("No documents to download");
      return;
    }
    const files = docs.map((d, i) => ({
      name: `${slugify(d.url) || `page_${i + 1}`}.md`,
      content: `# ${d.title}\n\nSource: ${d.url}\n\n${d.content}`,
    }));
    const zip = createZip(files);
    const blob = new Blob([zip.buffer as ArrayBuffer], {
      type: "application/zip",
    });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = "firecrawl_export.zip";
    a.click();
    URL.revokeObjectURL(blobUrl);
    toast.success("ZIP downloaded");
  }

  async function pushToGitHub() {
    if (!ghToken) {
      toast.error("GitHub token required. Open Settings above.");
      return;
    }
    if (!ghOwner || !ghRepo) {
      toast.error("Repository owner and name are required");
      return;
    }
    setGhPushing(true);
    const results = await Promise.allSettled(
      docs.map(async (doc, i) => {
        const filename = `${slugify(doc.url) || `page_${i + 1}`}.md`;
        const path = `${ghBasePath}${filename}`;
        const content = btoa(
          unescape(
            encodeURIComponent(
              `# ${doc.title}\n\nSource: ${doc.url}\n\n${doc.content}`,
            ),
          ),
        );
        const res = await fetch(
          `https://api.github.com/repos/${ghOwner}/${ghRepo}/contents/${path}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${ghToken}`,
            },
            body: JSON.stringify({
              message: ghCommit,
              content,
              branch: ghBranch,
            }),
          },
        );
        if (!res.ok) {
          const err = await res.json();
          throw new Error(`${filename}: ${err.message ?? "failed"}`);
        }
        return filename;
      }),
    );
    let successes = 0;
    for (const r of results) {
      if (r.status === "fulfilled") {
        successes++;
        toast.success(`Pushed ${r.value}`);
      } else {
        toast.error(r.reason?.message ?? "Push failed");
      }
    }
    if (successes > 0) toast.success(`${successes} file(s) pushed to GitHub`);
    setGhPushing(false);
    setGhDialogOpen(false);
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/20">
              <Globe className="h-5 w-5 text-orange-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">FireCrawl</h1>
              <p className="text-sm text-muted-foreground">
                Scrape URLs, edit with AI assistance, export as ZIP or push to
                GitHub
              </p>
            </div>
          </div>
        </div>

        {/* Settings */}
        <Collapsible
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          className="mb-6"
        >
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer select-none hover:bg-muted/30 transition-colors rounded-t-lg">
                <CardTitle className="flex items-center justify-between text-base">
                  <span className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    API Keys &amp; Settings
                  </span>
                  {settingsOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="grid gap-4 sm:grid-cols-3">
                {/* FireCrawl Key */}
                <div className="space-y-1.5">
                  <Label htmlFor="fc-key">FireCrawl API Key</Label>
                  <div className="relative">
                    <Input
                      id="fc-key"
                      data-ocid="firecrawl.fc_key.input"
                      type={showFcKey ? "text" : "password"}
                      placeholder="fc-…"
                      value={fcKey}
                      onChange={(e) => setFcKey(e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowFcKey((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showFcKey ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                {/* OpenAI Key */}
                <div className="space-y-1.5">
                  <Label htmlFor="oai-key">OpenAI API Key</Label>
                  <div className="relative">
                    <Input
                      id="oai-key"
                      data-ocid="firecrawl.oai_key.input"
                      type={showOaiKey ? "text" : "password"}
                      placeholder="sk-…"
                      value={oaiKey}
                      onChange={(e) => setOaiKey(e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOaiKey((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showOaiKey ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                {/* GitHub Token */}
                <div className="space-y-1.5">
                  <Label htmlFor="gh-token">GitHub Personal Access Token</Label>
                  <div className="relative">
                    <Input
                      id="gh-token"
                      data-ocid="firecrawl.gh_token.input"
                      type={showGhToken ? "text" : "password"}
                      placeholder="ghp_…"
                      value={ghToken}
                      onChange={(e) => setGhToken(e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowGhToken((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showGhToken ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="sm:col-span-3">
                  <Button
                    data-ocid="firecrawl.settings.save_button"
                    onClick={saveSettings}
                    size="sm"
                  >
                    Save Settings
                  </Button>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* URL Input */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Upload className="h-4 w-4 text-orange-400" />
              Crawl a URL
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                data-ocid="firecrawl.url.input"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && !crawling && handleCrawl()
                }
                className="flex-1"
              />
              <Button
                data-ocid="firecrawl.crawl.primary_button"
                onClick={handleCrawl}
                disabled={crawling}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                {crawling ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Globe className="mr-2 h-4 w-4" />
                )}
                {crawling ? "Crawling…" : "Crawl Page"}
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="batch-crawl"
                data-ocid="firecrawl.batch_crawl.checkbox"
                checked={batchCrawl}
                onCheckedChange={(v) => setBatchCrawl(!!v)}
              />
              <Label htmlFor="batch-crawl" className="cursor-pointer text-sm">
                Batch Crawl — follow all linked pages (up to 20)
              </Label>
            </div>
            {crawling && statusMsg && (
              <div
                data-ocid="firecrawl.crawl.loading_state"
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <Loader2 className="h-4 w-4 animate-spin text-orange-400" />
                {statusMsg}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results header */}
        {docs.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">Crawled Documents</h2>
              <Badge variant="secondary">{docs.length}</Badge>
            </div>
            <div className="flex gap-2">
              <Button
                data-ocid="firecrawl.download.primary_button"
                variant="outline"
                size="sm"
                onClick={downloadZip}
              >
                <Download className="mr-2 h-4 w-4" />
                Download ZIP
              </Button>
              <Button
                data-ocid="firecrawl.github.open_modal_button"
                variant="outline"
                size="sm"
                onClick={() => setGhDialogOpen(true)}
              >
                <Github className="mr-2 h-4 w-4" />
                Push to GitHub
              </Button>
            </div>
          </div>
        )}

        {/* Document cards */}
        {docs.length === 0 ? (
          <Card
            data-ocid="firecrawl.docs.empty_state"
            className="border-dashed"
          >
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Globe className="mb-4 h-12 w-12 text-muted-foreground/40" />
              <p className="text-lg font-medium text-muted-foreground">
                No documents yet
              </p>
              <p className="mt-1 text-sm text-muted-foreground/60">
                Enter a URL above and click &ldquo;Crawl Page&rdquo; to get
                started
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {docs.map((doc, idx) => (
              <Card
                key={doc.id}
                data-ocid={`firecrawl.docs.item.${idx + 1}`}
                className="flex flex-col"
              >
                <CardHeader className="pb-2">
                  <CardTitle className="line-clamp-1 text-sm font-semibold">
                    {doc.title}
                  </CardTitle>
                  <p className="line-clamp-1 text-xs text-muted-foreground">
                    {doc.url}
                  </p>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-3">
                  <Textarea
                    value={doc.content}
                    readOnly={!doc.editing}
                    onChange={(e) => updateDoc(doc.id, e.target.value)}
                    className="min-h-[160px] flex-1 resize-y font-mono text-xs"
                    data-ocid="firecrawl.docs.textarea"
                  />
                  <Separator />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      data-ocid={`firecrawl.docs.edit_button.${idx + 1}`}
                      variant="outline"
                      size="sm"
                      onClick={() => toggleEdit(doc.id)}
                    >
                      {doc.editing ? "Save" : "Edit"}
                    </Button>
                    <Button
                      data-ocid={`firecrawl.docs.ai_edit_button.${idx + 1}`}
                      variant="outline"
                      size="sm"
                      onClick={() => openAiDialog(doc.id)}
                      className="border-purple-500/40 text-purple-400 hover:bg-purple-500/10"
                    >
                      <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                      AI Edit
                    </Button>
                    <Button
                      data-ocid={`firecrawl.docs.delete_button.${idx + 1}`}
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteDoc(doc.id)}
                      className="ml-auto text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* AI Edit Dialog */}
      <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
        <DialogContent data-ocid="firecrawl.ai_edit.dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-400" />
              AI Edit Document
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label htmlFor="ai-instruction">Instruction</Label>
            <Textarea
              id="ai-instruction"
              data-ocid="firecrawl.ai_instruction.textarea"
              placeholder="e.g. Summarize this document into bullet points"
              value={aiInstruction}
              onChange={(e) => setAiInstruction(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
          <DialogFooter>
            <Button
              data-ocid="firecrawl.ai_edit.cancel_button"
              variant="ghost"
              onClick={() => setAiDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="firecrawl.ai_edit.confirm_button"
              disabled={aiLoading || !aiInstruction.trim()}
              onClick={runAiEdit}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {aiLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              {aiLoading ? "Processing…" : "Apply"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* GitHub Push Dialog */}
      <Dialog open={ghDialogOpen} onOpenChange={setGhDialogOpen}>
        <DialogContent data-ocid="firecrawl.github.dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Github className="h-4 w-4" />
              Push to GitHub
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="gh-owner">Repository Owner</Label>
              <Input
                id="gh-owner"
                data-ocid="firecrawl.github_owner.input"
                placeholder="your-username"
                value={ghOwner}
                onChange={(e) => setGhOwner(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="gh-repo">Repository Name</Label>
              <Input
                id="gh-repo"
                data-ocid="firecrawl.github_repo.input"
                placeholder="my-repo"
                value={ghRepo}
                onChange={(e) => setGhRepo(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="gh-branch">Branch</Label>
              <Input
                id="gh-branch"
                data-ocid="firecrawl.github_branch.input"
                placeholder="main"
                value={ghBranch}
                onChange={(e) => setGhBranch(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="gh-base">Base Path</Label>
              <Input
                id="gh-base"
                data-ocid="firecrawl.github_base_path.input"
                placeholder="crawled/"
                value={ghBasePath}
                onChange={(e) => setGhBasePath(e.target.value)}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="gh-commit">Commit Message</Label>
              <Input
                id="gh-commit"
                data-ocid="firecrawl.github_commit.input"
                value={ghCommit}
                onChange={(e) => setGhCommit(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              data-ocid="firecrawl.github.cancel_button"
              variant="ghost"
              onClick={() => setGhDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="firecrawl.github.confirm_button"
              disabled={ghPushing}
              onClick={pushToGitHub}
            >
              {ghPushing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Github className="mr-2 h-4 w-4" />
              )}
              {ghPushing
                ? `Pushing ${docs.length} file(s)…`
                : `Push ${docs.length} file(s)`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
