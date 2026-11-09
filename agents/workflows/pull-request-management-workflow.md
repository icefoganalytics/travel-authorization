---
description: Create and edit TravelAuth pull requests using the repository template and shared delivery workflow
---

# Pull Request Management Workflow

Load the direct [shared PR workflow](skill://pr/workflow.md) first, then apply the TravelAuth policies below. Other clients resolve the [corresponding shared workflow](https://github.com/klondikemarlen/marlens-skills-rules-and-tools/blob/main/docs/workflows/pull-request-management-workflow.md) in their verified release under the [root source-availability contract](/AGENTS.md#shared-standards-and-local-authority). Generic publication, draft/fixup handling, evidence placement, review resolution, verification, and merge belong to that shared workflow.

## Description Contract

The [repository PR template](../../.github/pull_request_template.md) owns section names and order.
Do not add report sections unless the maintainer requests them.

- **Issue links:** Use `Fixes <issue-url>` only when the PR closes the issue; use `Part of <issue-url>`
  for one slice of a larger effort. Keep applicable related links and remove unused placeholders.
- **Context:** Explain the user problem and reference the relevant issue steps. Keep prerequisites
  and material limitations; omit execution history and routine learner or verification reports.
- **Implementation:** Use a concise numbered list of user-visible outcomes, with the primary fix
  first. Exclude internal file inventories and refactors without a user-visible effect.
- **Screenshots:** Preserve existing images, generated attachment URLs, captions, and their placement
  when refreshing text. Keep historical captures labeled honestly. Follow the
  [screenshot overlay](upload-pr-screenshots-workflow.md) and its direct shared workflow for requested
  or required agent capture/upload, helper and session discovery, caption + route + image format,
  and separate saved/rendered verification. Optional captioned placeholders do not alone block merge;
  report genuine missing prerequisites without handing routine upload back to the human.
- **Testing Instructions:** Load the direct [shared Testing Instructions Workflow](skill://test-guide/workflow.md), then apply the [TravelAuth testing overrides](testing-instructions-workflow.md).

## Repository Metadata

Follow the shared workflow's
[metadata procedure](https://github.com/klondikemarlen/marlens-skills-rules-and-tools/blob/main/docs/workflows/pull-request-management-workflow.md#repository-metadata)
after creation or updates, with these local policies:

- **Title:** Use `Issue-<number>: Description` for linked work, `Fix: Description` for an unticketed
  bug, or an action verb and noun for a feature. Use AP style title case and validate the final title
  with `check-title-case`; preserve exact identifiers when needed.
- **Assignee:** Assign the authenticated GitHub user who generated the PR with AI. Resolve that
  login through GitHub rather than hard-coding an account.
- **Labels:** TravelAuth owns the complete PR label set. Query the current taxonomy and replace
  labels with every existing label that accurately describes the scope, using the shared procedure's
  full-set `PUT` path.
- **Review requests:** Do not request reviewers; the authenticated user manages those manually.
