# Specification

## Summary
**Goal:** Replace “Not Integrated Yet” placeholder provider workflow tools with real, backend-executed runs once a user has uploaded provider credentials—starting with Fal.ai multi-model image generation—and make results downloadable/shareable with persisted history.

**Planned changes:**
- Frontend: Enable provider workflow primary actions when backend is ready and a provider key exists; remove placeholder “Not Integrated Yet” callout for Fal.ai image generation and wire the card to real execution.
- Backend: Add workflow execution APIs to create runs, query status, and fetch outputs/artifacts without ever returning stored provider secrets to the UI.
- Backend: Persist per-user workflow run history (per provider) with non-secret inputs, timestamps, status, sanitized errors, and references to stored artifacts.
- Backend: Store generated artifacts (images/videos) in canister-side blob storage and expose retrieval APIs for download/share.
- Fal.ai: Implement end-to-end image generation (prompt + multi-model selection), show preview on success, and support Download + Share actions.
- Frontend: Add a reusable “Generation Result” UI pattern for image/video workflows (status/progress, preview, download/share).
- Frontend/Backend: Add “Generation History” on image/video provider pages to list recent runs, re-download/share artifacts, and reapply a run’s parameters to inputs.
- Apply the same capability/workflowType-driven execution approach across all providers in the registry so “Generate/Execute/Build App” actions run when keys are configured, with clear English messaging and backend readiness gating.

**User-visible outcome:** After uploading a provider key, users can run provider workflows (starting with Fal.ai image generation), see live run status and results, preview generated media, download or share outputs, and revisit past runs via a persisted history list—even after reload—without exposing provider secrets in the UI.
