# Committing

## Format

`:emoji: Verb phrase.` - imperative mood, subject line ends with a period.

**Subject line describes the outcome or "why", not what was added.** The diff already shows what changed; the subject should tell the reader why it matters or what the user-visible effect is.

- Bad: `:sparkles: Add travel authorization export button.` - describes what was built
- Good: `:sparkles: Let users export travel authorizations from the details page.` - describes the outcome

**Simple commits:** Single line when the change is self-explanatory.
**Complex commits:** Title line followed by one or two plain sentences explaining the non-obvious context: things the diff does not make immediately clear. Each sentence ends with a period.

**Less is more:** Keep commit messages concise. Avoid redundancy and unnecessary detail.

**Avoid markers in prose:** Do not use `Why?`, `What?`, `How?`, `NOTE:`, or similar markers in commit body prose. Write in plain conversational English instead.

## When to use bullet points

Use bullet points for:

- Multi-part changes with distinct items
- Complex changes needing detailed explanation
- When multiple files or concepts are affected

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
- `:label:` - typing fixes
- `:beetle:` - fixes

Never use `:lipstick:`; use `:cherry_blossom:` for cosmetic UI polish.

## Multi-concern commits

When a commit addresses more than one concern, put the primary concern in the subject line and move secondary concerns into the body. Each sentence in the body ends with a period.

Example:

```text
:bug: Fix primary thing.

Also fix secondary thing.
```

## Commit body guidance

Write in plain English for the next developer reading `git log`. Use conversational style and focus on "why" and "what" rather than implementation mechanics.

Focus on:

- What changed, briefly, since the diff shows the how
- Why it was needed: the problem being solved
- What the observable effect is for users or callers
- Prefer active phrasing in the body when it clarifies the outcome, especially for infrastructure and tooling changes
- When a body mentions a failure or mismatch, name the concrete issue you actually observed when possible, such as a specific runtime version mismatch, instead of describing it only in generic terms

Avoid: in-progress reasoning, implementation mechanics, and code symbols in prose.

## Rewording past commits

The global git editor may hang when invoked non-interactively. Use these patterns instead.

**Reword HEAD:**

```bash
git commit --amend -m "new message"
```

**Reword an older commit:**

```bash
# 1. Detach HEAD at the target commit
git checkout <hash>
# 2. Amend directly (-m bypasses the editor)
git commit --amend -m "new message"
# 3. Rebase the branch tip back on top
git rebase --onto HEAD <branch-tip>~ <branch-tip>
# 4. Move the branch pointer back
git branch -f <branch> HEAD && git checkout <branch>
```

**Interactive rebase without editor hang:**

```bash
GIT_EDITOR="true" git rebase -i <base>
```

`GIT_EDITOR="true"` makes git use the `true` no-op command for commit message editing, so the sequence editor step works normally but individual message editing is skipped. Combine with `--amend -m` for rewording specific commits mid-rebase.

NOTE: Multi-line `--exec` strings in `git rebase --onto` are not supported.

## General rules

- One commit per logical change: do not bundle multiple fixes or changes into a single commit
- Never `git push --force` on main branch
- Use `Part of <issue-url>` in PR bodies for multi-PR work. Reserve `Fixes <issue-url>` for the PR that should actually close the issue.

## PR description guidelines

See also: [`agents/workflows/pull-request-management-workflow.md`](agents/workflows/pull-request-management-workflow.md) for the full PR creation workflow.

- **Concise language:** use direct, active voice. Avoid redundant words like "entire", "proper", and "fully".
- **Context section:** focus on the problem and solution. Use present tense, such as "implements" instead of "will implement".
- **Implementation section:** short, focused bullet points. Combine related items. Avoid qualifiers and unnecessary detail.
- **Example:** "Add travel estimate validation" instead of "Add broad travel estimate validation utilities".

## Testing instructions format

See also: [`agents/workflows/testing-instructions-workflow.md`](agents/workflows/testing-instructions-workflow.md) for comprehensive guidance.

Standard setup, always include:

1. Run the relevant test suite using the canonical commands in [`bin/README.md`](bin/README.md#testing).
2. Boot the app via `dev up`.
3. Log in to the app at http://localhost:8080.

Navigation and verification steps:

- Use exact UI element names: **Add User**, **Activate Position**
- Reference menu locations: "top right dropdown nav", "left sidebar nav"
- Use navigation arrows: **Administration** -> **Positions** -> **Users** tab
- Explicit verification: "Verify success message: `X created!`"
- Format: bold for **UI elements**, inline code for `exact values`, URLs, and errors
- Always verify UI element names against the actual Vue component source before writing instructions; do not guess button labels or field names

For complex scenarios, use `## Test Case N: Description` subheadings.
