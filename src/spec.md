# Specification

## Summary
**Goal:** Prevent Fal.ai key save failures from surfacing raw replica rejection payloads by improving backend-readiness gating and showing clear, actionable English error messages when the backend canister is stopped/unavailable.

**Planned changes:**
- Add frontend error classification for backend call failures, with a dedicated “canister stopped/unavailable” path when error text includes `IC0508`, `Reject code: 5`, or `canister` + `stopped`.
- Update `ProviderKeyManager` save/update flow to (a) block mutations when the backend actor is not ready/connecting, (b) avoid stuck loading states, and (c) keep the entered key editable after failures with actionable retry guidance.
- Extend `BackendConnectionAlert` to recognize “canister stopped” errors and present tailored next steps (Retry Connection, Reload Page; plus login guidance when unauthenticated).
- Ensure provider flows that depend on the backend actor (at minimum: provider key save/update and provider chat send) are gated on existing `useBackendActor` readiness signals and show a “Still connecting to the backend…” message instead of triggering calls or displaying raw error payloads.

**User-visible outcome:** When saving/updating a provider API key (including Fal.ai) or sending provider chat requests, the app no longer shows raw replica rejection text; instead it shows clear English guidance (including specific messaging for stopped canisters), blocks actions while still connecting, and lets users retry without getting stuck.
