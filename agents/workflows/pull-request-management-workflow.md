---
description: Create and edit TravelAuth pull requests using the repository template and shared delivery workflow
---

# Pull Request Management Workflow

Use the [shared PR workflow](https://github.com/klondikemarlen/marlens-skills-rules-and-tools/blob/main/docs/workflows/pull-request-management-workflow.md)
for publication, fixup draft state, review resolution, verification, and merge. Apply the TravelAuth
policies below instead of copying the shared workflow or another PR's description.

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
- **Testing Instructions:** Follow the [local testing workflow](testing-instructions-workflow.md).
  Retain TravelAuth's three setup steps, then describe reproducible user actions and expected
  outcomes with verified UI labels. Link the [canonical commands](../../bin/README.md#testing)
  instead of maintaining another command inventory.

Keep self-review, commands run, current-head verification, learner triage, and merge evidence in the
session or an existing designated record. Do not append routine report comments or replace genuine
review discussion. After a description update, read it back through GitHub and verify its issue
links, screenshots, and surrounding text.

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

Create PRs as drafts. Before fixup edits, verify the live draft state and apply the shared workflow's
ready-to-draft gate. After complete [self-review](code-review-workflow.md), targeted QA, and review
resolution, restore readiness only when authorized by the recorded prior state or maintainer request.
Do not treat a merge override as proof that an unrun check passed.
