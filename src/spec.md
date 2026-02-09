# Specification

## Summary
**Goal:** Enable image generation for all providers already available in the app’s provider registry.

**Planned changes:**
- Extend the existing image-generation flow so it can be used with each supported provider (not limited to a subset).
- Update backend provider routing/dispatch so image generation requests are handled consistently across providers while keeping provider credentials stored only in the backend.
- Adjust frontend provider selection and UI wiring (without modifying immutable frontend paths) so users can generate images using any configured provider.

**User-visible outcome:** Users can select any supported provider and generate images through it (assuming the provider is configured), with consistent behavior across providers.
