# Empire C.C

## Current State
Multi-provider AI command center with pages for 20+ AI providers, a Links Dashboard, Key Vault, Studio Tools, Memory Brain, and Admin Panel. Navigation is in TopNav (desktop) and MobileTopNavMenu (mobile). Routes are defined in App.tsx.

## Requested Changes (Diff)

### Add
- New page: `FireCrawlPage.tsx` at route `/firecrawl`
- Nav link "FireCrawl" in TopNav (desktop) and MobileTopNavMenu (mobile)
- Route entry in App.tsx
- FireCrawl API key input stored in localStorage under `firecrawl_api_key`
- GitHub token input stored in localStorage under `github_token`
- OpenAI/Gemini API key selector for AI assistance (reuse existing stored keys from backend or localStorage)

### Modify
- `App.tsx` — add firecrawl route
- `TopNav.tsx` — add FireCrawl nav link with Globe icon
- `MobileTopNavMenu.tsx` — add FireCrawl nav link

### Remove
- Nothing

## Implementation Plan

### FireCrawl Page Features
1. **URL Input & Crawl**: Text input for URL + "Crawl" button. Calls FireCrawl API (`https://api.firecrawl.dev/v1/scrape`) using `fetch` directly from frontend with the user's FireCrawl API key. Returns markdown content of the page.
2. **Batch Mode**: Checkbox to enable crawl of all linked pages from the root URL (uses `/v1/crawl` endpoint, polls status). Each crawled page becomes a separate "document" card.
3. **Document Cards**: Grid/list of returned documents. Each card shows URL, title, and a snippet of the markdown content. Cards are editable (textarea).
4. **AI Assistance Panel**: Each document card has an "AI Edit" button that opens a side panel or dialog. User types an instruction (e.g. "summarize", "fix grammar"). App calls OpenAI API (using stored OpenAI key from localStorage or backend) and replaces the document content with the AI-transformed version.
5. **ZIP Export**: "Download ZIP" button packages all document cards as individual `.md` files inside a ZIP archive (use `jszip` from npm or inline with Blob API if not available — use native approach with a self-contained ZIP builder). Actually use the existing `jszip` library if in package.json, otherwise implement a simpler approach using `fflate` or raw Blob concatenation. On button click, create and download a `.zip` file.
6. **GitHub Push**: "Push to GitHub" button — opens a dialog asking for repo owner, repo name, branch, and commit message. Uses GitHub REST API (`https://api.github.com/repos/{owner}/{repo}/contents/{path}`) to create/update each file. Requires GitHub Personal Access Token stored in localStorage.
7. **Settings Section**: Collapsible section at top of page for FireCrawl API key, OpenAI key override, and GitHub token — all stored in localStorage.

### Technical Notes
- FireCrawl scrape endpoint: `POST https://api.firecrawl.dev/v1/scrape` with `{ url, formats: ['markdown'] }` and `Authorization: Bearer {key}`
- FireCrawl crawl endpoint: `POST https://api.firecrawl.dev/v1/crawl` then poll `GET https://api.firecrawl.dev/v1/crawl/{id}` until status=completed
- ZIP generation: use JSZip (check if in package.json) or use the `fflate` library. If neither available, generate individual file downloads as fallback.
- GitHub file creation: Base64-encode content, PUT to GitHub Contents API
- All API calls are client-side fetch (no backend needed)
- AI editing: call OpenAI Chat Completions API directly from frontend with user's key
