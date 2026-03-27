# api/src/integrations/README.md

Integrations are api integrations with external services.
They might package a bunch wrapped api calls, or just one.

Prefer keeping integration-specific concerns isolated here rather than scattering them through
controllers or services. Services can orchestrate integrations, but the integration code itself
should live near the external-system boundary.
