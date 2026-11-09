---
description: Write reviewer-facing TravelAuth checks with separate local developer setup
---

# Testing Instructions Workflow

Load the direct [shared Testing Instructions Workflow](skill://test-guide/workflow.md) first, then apply this TravelAuth overlay. Other clients resolve the [corresponding shared workflow](https://github.com/klondikemarlen/marlens-skills-rules-and-tools/blob/main/docs/workflows/testing-instructions-workflow.md) in their verified release under the [root source-availability contract](/AGENTS.md#shared-standards-and-local-authority).

## Audience and Setup

The [PR template](/.github/pull_request_template.md) owns section names and order. Follow WRAP's audience separation: **Quality Assurance Team Checks** first, then **Developer Setup (Local Only)** when needed.

Before QA actions, identify the target environment containing the change, required role, and suitable existing records. A PR branch or local smoke does not establish deployment. Explain how to find records by observable properties through the UI; do not require shared-environment reviewers to seed databases, know local fixture IDs, or manufacture a large dataset. If the deployment, access, or records are unavailable, name the missing prerequisite and the owner who can supply it, mark that scenario **BLOCKED**, and continue independent checks.

Keep TravelAuth's local preparation in the developer section: run the relevant focused checks through the [canonical wrapper](/bin/README.md#testing), start the app with `./bin/dev up` when needed, and use the browser URL printed by Vite (honors `GATEWAY_HOSTNAME`). Only one API test container may run at a time. Keep isolated fixture preparation and exact boundary checks here, separate from QA actions; do not discard required checks when separating audiences.

## TravelAuth Formatting

- Use numbered **Test Case N: Description** headings when multiple scenarios need separation, nested under the template's QA section.
- Continue action numbering across QA test cases. Developer instructions form a separate sequence.
- Bold source-verified UI labels, use navigation arrows (`→`), and put exact URLs, values, and messages in backticks.
- Give each step one main action with its visible expected result nearby. Preserve the scenario's intended transitions and unchanged behavior; verify return paths and refresh persistence where relevant.
- Verify labels, routes, permissions, and available actions against the PR's checkout, not an older or unrelated checkout.

## Evidence Placement

Keep commands already run, pass counts, generated-artifact inspections, self-review, and release status in the session or existing designated evidence record, not as execution reports in the PR description or routine comments. The description contains reviewer actions, expected outcomes, material prerequisites, and useful evidence links. Never present renderer smoke coverage as authenticated browser acceptance.

Validate a guidance-only change by applying it to a representative PR instruction rewrite and checking prerequisites, labels, action order, numbering, and preserved coverage. This checks the instructions, not unexercised application behavior. For application QA, report only checks actually exercised and name any unavailable prerequisites.

## Related Workflows

- [Pull request management](pull-request-management-workflow.md)
- [Shared browser QA](skill://browser-qa/workflow.md)
