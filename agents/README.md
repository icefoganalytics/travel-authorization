# AI Agents & Workflows

TravelAuth keeps project-specific workflows, templates, references, and plans here. Reusable standards belong to [Marlens Skills, Rules, and Tools](https://github.com/klondikemarlen/marlens-skills-rules-and-tools); these directories are overlays, not an alternative shared-skills implementation.

## Start From the Task

Start at [AGENTS.md's shared-base declaration](../AGENTS.md#shared-standards-and-local-authority). Load the task-relevant direct shared workflow before the local workflow or subsystem README's deltas; do not re-enter a selecting skill from its overlay. Use the root source-availability and conflict rules. Directory READMEs are discovery aids, not replacement standards.

| Task                                | Shared owner                                                                                                                                                                                                                                                   | TravelAuth authority                                                                                                                                |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Delivery, review, and pull requests | [Feature delivery](https://github.com/klondikemarlen/marlens-skills-rules-and-tools/blob/main/docs/workflows/feature-workflow.md), [review](https://github.com/klondikemarlen/marlens-skills-rules-and-tools/blob/main/docs/workflows/code-review-workflow.md) | [COMMITTING.md](../COMMITTING.md), [PR overlay](workflows/pull-request-management-workflow.md), [review overlay](workflows/code-review-workflow.md) |
| Backend features                    | [Backend rails](https://github.com/klondikemarlen/marlens-skills-rules-and-tools/blob/main/docs/workflows/express-light-rail-backend-workflow.md)                                                                                                              | [API overview](../api/README.md), source-adjacent controller/policy/service/serializer READMEs, [local examples](templates/README.md)               |
| Tests                               | [Scenario-oriented verification](https://github.com/klondikemarlen/marlens-skills-rules-and-tools/blob/main/docs/references/code-organization-reference.md#scenario-oriented-verification)                                                                     | [API tests](../api/tests/README.md), [UI tests](../web/tests/README.md), [wrapper commands](../bin/README.md#testing)                               |
| Documentation and plans             | [Knowledge-base workflow](https://github.com/klondikemarlen/marlens-skills-rules-and-tools/blob/main/docs/workflows/project-knowledge-base-workflow.md)                                                                                                        | Nearest subsystem README; [plans](plans/README.md) for accepted rollout/design decisions                                                            |

The [shared precedence reference](https://github.com/klondikemarlen/marlens-skills-rules-and-tools/blob/main/docs/references/guidance-precedence-reference.md) defines the base/overlay relationship. Existing local import/type/test conventions and runtime bases remain in force; following shared conceptual rails does not adopt the `express-light-rail` package.

## Discover Local Material

- [Workflows](workflows/README.md): project procedures and thin shared entrypoints. PR descriptions, testing instructions, and screenshots continue through the existing [PR overlay](workflows/pull-request-management-workflow.md); the [screenshot overlay](workflows/upload-pr-screenshots-workflow.md) retains local formatting and optionality over the shared upload procedure.
- [Templates](templates/README.md): concrete local output shapes, including API, serializer, factory, and dialog contracts. Keep an example when it answers a TravelAuth question that shared concepts do not.
- [References](references/README.md): project facts and constraints. Retain durable knowledge while it explains a current decision; do not delete it merely because it is old.
- [Plans](plans/README.md): exploratory designs and staged implementation decisions, not active runtime or QA proof.

Discover files in the relevant directory rather than maintaining another complete static catalog. Keep command authority in [bin/README.md](../bin/README.md) and architectural responsibilities beside their subsystem.

## Corrections and Learner Routing

Reusable style, workflow, template, and verification improvements go to the [shared owner](https://github.com/klondikemarlen/marlens-skills-rules-and-tools/issues). TravelAuth domain behavior, authorization, integrations, local commands, and project-specific corrections stay in [this repository](https://github.com/icefoganalytics/travel-authorization/issues).

Use the shared [learner-coverage procedure](https://github.com/klondikemarlen/marlens-skills-rules-and-tools/blob/main/docs/workflows/feature-workflow.md#learner-coverage-during-issue-triage) for evidence-backed coverage decisions. A proposal or prose rule is not an installed verifier, and a plan or historical review is not current runtime QA.
