# Specification

## Summary
**Goal:** Regenerate and provide a fresh downloadable ZIP export of the current deployed Empire C.C codebase, including an English README with setup, run, deploy, and key configuration instructions.

**Planned changes:**
- Generate a new single ZIP archive containing the current deployed codebase (frontend + backend) and all required root-level configuration files needed to build and deploy.
- Ensure recently-added files (including PWA assets and generated icons) are included in the ZIP.
- Add/refresh a top-level English README.md inside the ZIP with commands to install dependencies, run locally, deploy canister(s) via dfx, and instructions for configuring provider keys via the existing in-app Key Vault flow.
- Present a fresh download link/button to the user after ZIP generation.

**User-visible outcome:** The user receives a new download link/button in chat that downloads a ZIP of the current deployed Empire C.C codebase, including a README with clear local-run and deployment steps and guidance for adding provider keys via the app’s Key Vault UI.
