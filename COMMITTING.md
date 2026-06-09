# Committing

## Quick Decision Flow

Before writing your commit message, answer this:

**Is this a multi-part or complex change?**

- Yes → Use bullet points (see "When to use bullet points" below)
- No → Use conversational prose (see "When NOT to use bullet points" below)

Then follow the sections below for format and details.

## Commit Message Checklist

Before committing, verify:

- [ ] Subject line describes outcome/why, not what was added
- [ ] Subject line ends with a period
- [ ] Used correct emoji (see Emoji guidance below)
- [ ] Chose correct structure: bullet points (multi-part) or conversational prose (single-purpose)
- [ ] Body focuses on "why" and user-visible effect, not implementation details
- [ ] Each sentence in body ends with a period
- [ ] No markers like "Why?", "What?", "NOTE:" in prose
- [ ] Message is concise and avoids redundancy

## Format

`:emoji: Verb phrase.` - imperative mood, subject line ends with a period.

**Subject line describes the outcome or "why", not what was added.** The diff already shows what changed; the subject should tell the reader why it matters or what the user-visible effect is.

- Bad: `:sparkles: Add travel authorization export button.` - describes what was built
- Good: `:sparkles: Let users export travel authorizations from the details page.` - describes the outcome

When the "what" needs to name the thing being added, pair it with the "why" in the same line: `Add [thing] to [outcome]`. For example, `:sparkles: Add status types to support finance reviewers flagging travel requests for revision.` The subject still ends with a period.

**Simple commits:** Single line when the change is self-explanatory.
**Complex commits:** Title line followed by one or two plain sentences explaining the non-obvious context: things the diff does not make immediately clear. Each sentence ends with a period.

**Less is more:** Keep commit messages concise. Avoid redundancy and unnecessary detail.

**Avoid markers in prose:** Do not use `Why?`, `What?`, `How?`, `NOTE:`, or similar markers in commit body prose. Write in plain conversational English instead.

## When to use bullet points

Use bullet points for:

- Multi-part changes where each item needs its own justification
- Complex changes needing detailed explanation

For minor secondary items bundled with a primary change, prefer a conversational "Also ..." sentence instead of bullet points. (See [Multi-concern commits](#multi-concern-commits).)

Example:

```text
:recycle: Rename and reorganize travel desk hotel components.

- Rename the edit dialog into a dedicated edit page
- Move shared form fields into one form card
- Update route references
```

## When NOT to use bullet points

For simple single-purpose changes, use a second line instead for "why" explanation. Keep it conversational, not a bullet list.

- Adding one migration file
- Straightforward single-file changes
- When the title is self-explanatory

Example:

```text
:butterfly: Backfill wizard step names for draft travel authorizations.

Prepares older draft requests to resume at the correct wizard step after the step routing change.
```

## Emoji guidance

- `:butterfly:` - database migrations and data backfills
- `:bug:` - bug fixes
- `:shield:` - guardrails, invariants, and edge-case prevention
- `:sparkles:` - new features
- `:recycle:` - structural cleanup or migration-safe refactors that preserve behavior
- `:art:` - theme, styling, or visual changes
- `:cherry_blossom:` - UI polish and cosmetic improvements
- `:wrench:` - config and settings changes
- `:memo:` - documentation and plan updates
- `:hammer:` - infrastructure and tooling changes, such as Docker or scripts
- `:arrow_up:` - dependency, runtime, and version bumps
- `:arrow_down:` - dependency downgrades
- `:gear:` - container, workflow, and tooling configuration changes
- `:construction:` - intentionally incomplete migration slices that may leave the app broken between commits
- `:fire:` - deletion or removal of code or features
- `:lock:` - security restrictions
- `:unlock:` - security relaxations
- `:ok_hand:` - fixes or adjustments
- `:truck:` - renames or moves
- `:white_check_mark:` / `:heavy_check_mark:` - tests
- `:heavy_plus_sign:` - additions
- `:heavy_minus_sign:` - removals, including removing dependencies from the package set
- `:label:` - TypeScript type fixes
- `:pencil:` - spelling and typo fixes
- `:beetle:` - fixes

Never use `:lipstick:`; use `:cherry_blossom:` for cosmetic UI polish.

## Multi-concern commits

When a commit addresses more than one concern, put the primary concern in the subject line and move secondary concerns into the body. Use a conversational "Also ..." sentence for secondary items rather than bullet points, unless each item genuinely needs its own justification.

Example with one secondary change:

```text
:bug: Fix primary thing.

Also fix secondary thing.
```

Example with two minor secondary changes:

```text
:sparkles: Add primary feature to support some outcome.

Also refactor the related constants to reduce redundancy, and fix some typos in the comments.
```

Each sentence in the body ends with a period.

## Commit body guidance

Write in plain English for the next developer reading `git log`. Use conversational style and focus on "why" and "what" rather than implementation mechanics.

Focus on:

- What changed, briefly, since the diff shows the how
- Why it was needed: the problem being solved
- What the observable effect is for users or callers
- Prefer active phrasing in the body when it clarifies the outcome, especially for infrastructure and tooling changes
- When a body mentions a failure or mismatch, name the concrete issue you actually observed when possible, such as a specific runtime version mismatch, instead of describing it only in generic terms

Avoid: in-progress reasoning, implementation mechanics, and code symbols in prose.

For secondary cleanup items bundled with a primary change, a brief "Also do some general cleanup and code clarity alignment" is preferable to enumerating specific fixes. The diff already shows the details; the body should explain why, not what.

### Renames and refactors (:truck:, :recycle:)

Renames and refactors are especially prone to "what" bodies that list every renamed file, symbol, or target. Resist this. The diff already shows what moved where. Instead, explain what confusion or ambiguity the old naming caused and what the new naming makes clearer. Ask yourself: "What would someone misunderstand if they saw the old name without context?"

Bad — lists mechanics instead of motivation:

```text
:truck: Rename ExpenseClaimService to SubmitExpenseClaimService.

Updates the service class, controller, policy, and route to use the new name.
The service now also accepts EXPENSE_CLAIM_TRAVELLER_CHANGES_REQUESTED as a source
state and sets wizardStepName on the transition.
```

Good — explains why the old name was confusing and what improves:

```text
:truck: Rename ExpenseClaimService to SubmitExpenseClaimService.

The old name did not describe the action, making it easy to confuse with other
expense-claim services that approve, deny, or request changes. The new name aligns
with the VerbExpenseClaim pattern and clarifies what the service does on sight.
```

Notice the good version says nothing about which files were renamed or what fields were added — the diff shows that. The body answers the question a future reader would actually have: "why was this renamed?"

## General rules

- One commit per logical change: do not bundle multiple fixes or changes into a single commit
- Never `git push --force` on main branch

## Related documentation

- **Git workflow operations (rewording, rebase):** See [`agents/workflows/git-workflow.md`](agents/workflows/git-workflow.md)
- **PR descriptions:** See [`agents/workflows/pull-request-management-workflow.md`](agents/workflows/pull-request-management-workflow.md)
- **Testing instructions:** See [`agents/workflows/testing-instructions-workflow.md`](agents/workflows/testing-instructions-workflow.md)
