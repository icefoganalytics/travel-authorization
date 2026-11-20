# Project Knowledge Base

This folder holds durable product requirements and architecture knowledge for Travel Authorization. Use it to understand what the application should do and the system boundaries that support that behavior. For application setup and development commands, start with the [repository README](/README.md) and [command reference](/bin/README.md).

## Find Knowledge

### Product Requirements

Feature specifications describe user goals, roles, permissions, and observable behavior.

- [Final Destination](/docs/product/final-destination.md) — choosing a city on Purpose and reusing it throughout the request.

### Architecture

Architecture documents explain data ownership, integration contracts, and design constraints.

- [Final Destination](/docs/architecture/final-destination.md) — the saved location, itinerary independence, serialization, and legacy-data compatibility.
- [Travel Desk Report Downloads](/docs/architecture/report-downloads.md) — request selection, authorization, PDF and CSV generation, and runtime packaging.

## Enrich the Knowledge Base

Start with the document that owns the reader's question. Update it when an accepted requirement or system boundary changes; link related subjects rather than repeating their rules. Add a focused document when a new subject needs its own discoverable home, then link it above. Keep this README as the directory's navigation and usage guide.

Use `product/` for feature specifications and `architecture/` for technical contracts. Add other sections only when there is material to maintain: `domain/` for shared business concepts, `decisions/` for lasting design rationale, and `qa-scenarios/` for reusable regression pathways. Source-directory READMEs remain guides to their own layers. The shared [knowledge-base reference](https://github.com/klondikemarlen/marlens-skills-rules-and-tools/blob/main/docs/references/project-knowledge-base-reference.md) explains these placement boundaries.

Product documentation describes intended behavior; code describes its implementation; tests and QA provide evidence. Preserve links to those sources and record disagreements instead of silently changing the requirement to match the code. Keep task progress, review discussions, and verification results in their issue or pull request, not in the durable specification.

Documentation here is repository content, not a separately published site. Do not add credentials or private user data. Any future documentation site needs an explicit publication scope.
