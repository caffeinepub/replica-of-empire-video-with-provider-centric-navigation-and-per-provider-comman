# Empire C.C

## Current State
- Backend has per-user API key storage (`addOrUpdateAPIKey`, `getProviderKey`, `providerKeyExists`)
- Admin panel exists but shows only placeholder `NotIntegratedCallout` cards
- FireCrawl page stores GitHub token in localStorage only
- No owner/default key system exists — users must have their own keys to use providers
- No GitHub OAuth Client ID management

## Requested Changes (Diff)

### Add
- Backend: `setAdminAPIKey(provider, key)` — admin only, sets owner's fallback key for any provider
- Backend: `adminAPIKeyExists(provider)` — admin only, returns bool
- Backend: `deleteAdminAPIKey(provider)` — admin only
- Backend: `getAllAdminAPIKeyProviders()` — admin only, returns list of providers that have owner keys set
- Backend: `setGitHubClientId(clientId)` — admin only, stores GitHub OAuth Client ID
- Backend: `getGitHubClientId()` — public query, returns client ID so users can initiate OAuth
- Backend: `resolveEffectiveProviderKey(provider)` — returns user key if exists, else owner key (used internally during workflow execution; key value never returned to frontend)
- Backend: `hasEffectiveProviderKey(provider)` — returns bool: true if user has own key OR admin key exists
- Admin Panel: "Owner API Keys" section with a text input for every provider (20+ providers listed)
- Admin Panel: GitHub section with Client ID field and GitHub Token field
- Admin Panel: All owner key inputs masked (password type); show configured/not configured status
- ProviderKeyManager: When user has no key but `hasEffectiveProviderKey` is true, show an info banner "Owner key active — usage will be billed to your account"
- FireCrawl: GitHub OAuth connect button using owner's Client ID from backend; users authenticate their own GitHub account

### Modify
- Admin Panel: Replace all `NotIntegratedCallout` placeholders with real working sections
- Backend `executeWorkflow`: use `resolveEffectiveProviderKey` internally (key never sent to frontend)
- `providerKeyExists` hook / ProviderActionGuard: use `hasEffectiveProviderKey` so users can run workflows when owner key is set

### Remove
- FireCrawl localStorage-only GitHub token approach (replace with backend-stored approach + OAuth option)

## Implementation Plan
1. Add admin key functions to `backend/main.mo`
2. Update `backend.d.ts` with new function signatures
3. Build Admin Panel owner-key section (all providers listed with masked inputs)
4. Update `ProviderKeyManager` to show owner-key fallback banner
5. Update `ProviderActionGuard` / key-exists check to use `hasEffectiveProviderKey`
6. Add GitHub Client ID storage and OAuth connect flow to FireCrawl page
