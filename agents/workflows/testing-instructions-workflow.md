---
description: Write reviewer-facing TravelAuth checks with separate local developer setup
---

# Testing Instructions Workflow

Load the direct [shared Testing Instructions Workflow](skill://test-guide/workflow.md) first, then apply this TravelAuth overlay. Other clients resolve the [corresponding shared workflow](https://github.com/klondikemarlen/marlens-skills-rules-and-tools/blob/main/docs/workflows/testing-instructions-workflow.md) in their verified release under the [root source-availability contract](/AGENTS.md#shared-standards-and-local-authority).

## Audience and Setup

The [PR template](/.github/pull_request_template.md) owns section names and order. Audience separation, scenario feasibility, prerequisites, and evidence requirements belong to the shared workflow.

Use the [canonical wrapper](/bin/README.md#testing) for focused local checks, start the app with `./bin/dev up` when needed, and use the browser URL printed by Vite (honors `GATEWAY_HOSTNAME`). Only one API test container may run at a time.

## TravelAuth Formatting

- Use numbered **Test Case N: Description** headings when multiple scenarios need separation, nested under the template's QA section.
- Continue action numbering across QA test cases. Developer instructions form a separate sequence.
- Bold source-verified UI labels, use navigation arrows (`→`), and put exact URLs, values, and messages in backticks.

## Related Workflows

- [Pull request management](pull-request-management-workflow.md)
- [Shared browser QA](skill://browser-qa/workflow.md)
