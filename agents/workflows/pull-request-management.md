---
description: Create and edit well-structured pull requests following TravelAuth project patterns and conventions
auto_execution_mode: 1
---

# Pull Request Management Workflow

## Intent

**WHY this workflow exists:** Pull requests communicate intent to reviewers and future maintainers. A well-structured PR explains the problem, the solution approach, and how to verify correctness. This reduces review friction and creates valuable documentation.

**WHAT this workflow produces:** A draft PR with:
- Clear title following naming conventions
- Context explaining WHY the change is needed
- Implementation summarizing WHAT was changed (purpose, not files)
- Testing instructions that verify correctness

**Decision Rules:**
- **Title format:** Use `Issue-<number>: Description` for GitHub issues, `TICKET-ID: Description` for Jira tickets, `Fix: Description` for bug fixes, or `Action Verb + Noun` for features. Always use AP style title case.
- **Implementation section:** Focus on purpose and intent, not specific files. A reviewer can see file changes in the diff - the Implementation section explains the reasoning behind those changes.
- **Screenshots:** Required for UI changes, "N/A - backend changes only" for non-UI
- **Draft mode:** Always create PRs as drafts first

This workflow covers the process of creating and editing well-structured pull requests that follow the established patterns in the TravelAuth project.

## Quick Reference

```bash
# Create draft PR via gh api (preferred)
cat <<'EOF' | gh api repos/{owner}/{repo}/pulls -X POST \
  -F title="Title here" \
  -F head="branch-name" \
  -F base="main" \
  -F draft=true \
  -F body=@-
Fixes <url>

Relates to:

- <related-pr-or-issue-url>

# Context

<context>

# Implementation

1. <change>

# Screenshots

N/A

# Testing Instructions

1. Run the test suite via `dev test_api`.
2. Boot the app via `dev up`.
3. Log in to the app at http://localhost:8080.
4. <specific step>
EOF
)"
```

## Process Steps

### 1. Gather Context

Before creating a PR, gather all the information you need:

```bash
# Check current branch status
git status

# View commits on this branch
git log main..HEAD --oneline

# View full diff from main
git diff main...HEAD

# Check if branch is pushed
git branch -vv
```

### 2. Determine PR Title

Use one of these patterns:

| Pattern | When to Use | Example |
|---------|-------------|---------|
| `Issue-<number>: Description` | Linked to GitHub issue | `Issue-314: Normalize Travel Desk Other Transportations Components to Modern Patterns` |
| `TICKET-ID: Description` | Linked to Jira ticket | `TA-123: Add Travel Authorization Export Feature` |
| `Fix: Description` | Bug fixes without ticket | `Fix: Email Notifications Not Sending` |
| `Action Verb + Noun` | Features/improvements | `Add Expense Report Validation` |

**Title Guidelines:**
- Use **AP style title case** (validate at https://titlecaseconverter.com/?style=AP)
- Be specific but concise
- Start with action verb when no ticket ID

### 3. Write PR Body

Follow this template structure:

```markdown
Fixes <issue-tracker-url>

Relates to:

- <related-pr-or-issue-url>

# Context

<Problem explanation, user reports, motivation>

# Implementation

1. <Implementation detail>
2. <Additional change>

# Screenshots

<Screenshots or "N/A">

# Testing Instructions

1. Run the test suite via `dev test_api`.
2. Boot the app via `dev up`.
3. Log in to the app at http://localhost:8080.
4. <Specific testing step>
```

**PR Template Usage:**

The GitHub PR template provides the basic structure. Fill in each section following these guidelines:

- **Fixes:** Add issue URL or "N/A" if no specific issue
- **Relates to:** Add related PRs/issues or remove this section entirely
- **Context:** Explain the problem, user reports, or motivation for the change
- **Implementation:** List all changes made in numbered format
- **Screenshots:** Add screenshots for UI changes or "N/A - backend changes only"
- **Testing Instructions:** Always start with the standard 3 steps, then add specific steps

### 4. Section Guidelines

#### Context Section

- Explain **why** the change is needed
- Include user reports using blockquotes (`>`)
- For bugs, describe root cause if known
- Include "Steps to Reproduce" for bugs

**Example:**
```markdown
# Context

User Report
> Travel authorization requests are not showing the correct approval status in the dashboard.

Investigation revealed that the status calculation was not considering conditional approvals.
```

#### Implementation Section

- Use numbered list
- Focus on **purpose and intent**, not specific file changes
- Extract meaning from commits - what was the goal of each change?
- A reviewer can see file diffs - tell them WHY, not WHERE
- Keep it concise: 5-10 items maximum

**Good Example (purpose-focused):**
```markdown
# Implementation

1. Replace dialog-based editing with dedicated page routes
2. Convert JavaScript API and composables to TypeScript
3. Split monolithic table into modular Card and DataTable components
4. Standardize component naming to match Vuetify patterns
```

**Bad Example (file-focused - avoid this):**
```markdown
# Implementation

1. Delete TravelDeskHotelCreateDialog.vue
2. Delete TravelDeskHotelEditDialog.vue
3. Add TravelDeskHotelNewPage.vue
4. Add TravelDeskHotelEditPage.vue
5. Update TravelDeskHotelsEditCard.vue
6. Update router.ts
```

#### Screenshots Section

- Required for UI changes
- Use `<img>` tags with width/height
- Include before/after comparisons
- Write "N/A - backend changes only" for non-UI changes

**Example:**
```markdown
# Screenshots

<img width="726" height="604" alt="Updated dashboard with correct status" src="https://github.com/user-attachments/assets/..." />
```

#### Testing Instructions Section

**Always start with these three steps:**
```markdown
1. Run the test suite via `dev test_api`.
2. Boot the app via `dev up`.
3. Log in to the app at http://localhost:8080.
```

**Then add specific steps:**
- Use **bold** for UI elements: **Create Request**, **Save**
- Use arrows for navigation: **Travel Authorizations** → **Create New**
- Include verification: "Verify that..." or "Check that..."
- Number steps sequentially

**QA Testing Principles:**

Write testing instructions for someone with zero project knowledge:

- **User-focused**: Focus on UI interactions ("Click on", "Verify", "Fill out")
- **Sequential steps**: Clear, numbered steps with specific verification points
- **Complete workflows**: Test creation, editing, saving, and navigation
- **Browser behavior**: Include back button, refresh, and direct URL testing
- **Simple language**: Avoid technical jargon, minimal bolding

**Example:**
```markdown
4. Navigate to **Travel Authorizations** → **Create New**.
5. Fill out the travel authorization form with test data.
6. Submit the request.
7. Verify the request appears in the dashboard with correct status.
```

### 5. Create the PR

**All PRs should be created in draft mode** to allow for review and iteration before marking ready.

```bash
# Ensure branch is pushed
git push -u origin HEAD

# Create draft PR via gh api
cat <<'EOF' | gh api repos/{owner}/{repo}/pulls -X POST \
  -F title="Title" \
  -F head="$(git branch --show-current)" \
  -F base="main" \
  -F draft=true \
  -F body=@-
[Body content]
EOF
```

To mark a draft PR as ready for review:
```bash
gh api repos/{owner}/{repo}/pulls/NUMBER -X PATCH -F draft=false
```

### 5. Edit Existing Pull Requests

When you need to update an existing PR (add context, fix title, update testing instructions):

```bash
# View current PR details
gh pr view NUMBER

# Edit PR title
gh pr edit NUMBER --title "New Title"

# Edit PR body
gh pr edit NUMBER --body "$(cat <<'EOF'
Updated PR body content
EOF
)"

# Or edit interactively
gh pr edit NUMBER
```

**Common Scenarios for Editing:**

| Scenario | What to Update |
|----------|----------------|
| **Missing context** | Add detailed problem explanation to Context section |
| **Unclear implementation** | Expand Implementation section with numbered list |
| **Missing screenshots** | Add Screenshots section with images or "N/A - backend changes only" |
| **Incomplete testing** | Add specific testing steps after the standard 3 steps |
| **Wrong title format** | Update title to follow naming patterns |
| **Add related issues** | Add "Relates to:" section with links |

**Editing Workflow:**

1. **Assess what's missing** - Compare current PR against the quality checklist
2. **Gather missing information** - Get screenshots, testing steps, or context
3. **Update systematically** - Edit one section at a time if needed
4. **Verify completeness** - Run through the quality checklist again

**Example Edit:**
```bash
# Add missing testing instructions to PR #123
gh pr edit 123 --body "$(cat <<'EOF'
Fixes https://github.com/icefoganalytics/travel-authorization/issues/123

# Context

User Report
> Travel authorization requests are not showing the correct approval status in the dashboard.

Investigation revealed that the status calculation was not considering conditional approvals from secondary approvers.

# Implementation

1. Update status calculation logic in TravelAuthorization model.
2. Add conditional approval handling to dashboard serializer.
3. Fix approval status display in dashboard component.

# Screenshots

<img width="1024" height="768" alt="Dashboard with correct status" src="https://github.com/user-attachments/assets/..." />

# Testing Instructions

1. Run the test suite via `dev test_api`.
2. Boot the app via `dev up`.
3. Log in to the app at http://localhost:8080.
4. Navigate to **Travel Authorizations**.
5. Create a new travel authorization requiring conditional approval.
6. Submit the request and verify correct status display.
EOF
)"
```

### 7. Quality Checklist

Before submitting:

- [ ] PR created as draft
- [ ] Title follows naming pattern
- [ ] Context explains the "why"
- [ ] Implementation lists all changes
- [ ] Screenshots included for UI changes
- [ ] Testing instructions start with standard steps
- [ ] All tests pass locally
- [ ] Type checking passes: `dev api npm run check-types` and `dev web npm run check-types`
- [ ] Linting passes: `npm run lint` from `/api` and `/web`
- [ ] No `@ts-ignore`, `@ts-expect-error`, or `any` types

## TravelAuth-Specific Patterns

### Testing Commands

Always use these exact commands in testing instructions:

- **API tests:** `dev test_api`
- **Web tests:** `dev test_web` (if applicable)
- **Type checking:** `dev api npm run check-types` and `dev web npm run check-types`
- **App startup:** `dev up`
- **Login URL:** http://localhost:8080

### Code Quality Standards

- TypeScript only - no `any`, `@ts-expect-error`, `@ts-ignore`, or `!`
- Use full descriptive names (no abbreviations)
- Follow expanded code style with guard clauses
- Use `@/` import alias for src directory

### Common UI Navigation Patterns

- **Travel Authorizations** → **Create New**
- **Administration** → **Users** → **Add User**
- **Reports** → **Expense Reports** → **Generate Report**

## Pattern Examples from TravelAuth

### Bug Fix Example

```markdown
# Fix: Travel Authorization Status Calculation

Fixes https://github.com/icefoganalytics/travel-authorization/issues/123

# Context

User Report
> Travel authorization requests are not showing the correct approval status in the dashboard.

Investigation revealed that the status calculation was not considering conditional approvals from secondary approvers.

# Implementation

1. Handle conditional approvals in status calculation logic
2. Propagate calculated status to dashboard view
3. Add test coverage for conditional approval scenarios

# Screenshots

<img width="1024" height="768" alt="Dashboard with correct status" src="https://github.com/user-attachments/assets/..." />

# Testing Instructions

1. Run the test suite via `dev test_api`.
2. Boot the app via `dev up`.
3. Log in to the app at http://localhost:8080.
4. Navigate to **Travel Authorizations**.
5. Create a new travel authorization requiring conditional approval.
6. Submit the request and verify correct status display.
```

### Feature Example

```markdown
# TA-456: Add Travel Authorization Export to PDF

Fixes https://yukon-government.atlassian.net/browse/TA-456

# Context

Business Requirement
> Users need the ability to export travel authorizations to PDF for record keeping and external sharing.

The current system only supports screen viewing and printing, making it difficult to share official travel authorization documents.

# Implementation

1. Implement PDF generation service for travel authorizations
2. Add export action to travel authorization detail view
3. Restrict PDF export to authorized users

# Screenshots

<img width="726" height="604" alt="Export button in authorization detail" src="https://github.com/user-attachments/assets/..." />
<img width="726" height="604" alt="Generated PDF preview" src="https://github.com/user-attachments/assets/..." />

# Testing Instructions

1. Run the test suite via `dev test_api`.
2. Boot the app via `dev up`.
3. Log in to the app at http://localhost:8080.
4. Navigate to an existing travel authorization.
5. Click the **Export to PDF** button.
6. Verify the PDF downloads correctly with all authorization details.
```

## Common Pitfalls

| Pitfall | Solution |
|---------|----------|
| PR not in draft mode | Always create PRs as drafts using `draft=true` |
| Vague context | Be specific about the problem and user impact |
| Missing testing steps | Start with standard 3 steps for TravelAuth |
| No screenshots for UI | Always include for visual changes |
| Unclear scope | Separate core changes from side fixes |
| Missing links | Include Fixes/Relates to URLs |
| Wrong test commands | Use `dev test_api` not generic test commands |
| Type checking ignored | Always run `dev api npm run check-types` and `dev web npm run check-types` |

## Related Workflows

- `convert-js-api-to-typescript.md` - Converting JavaScript APIs to TypeScript
- `convert-js-plural-composable-to-typescript.md` - Converting composables to TypeScript
- `convert-dialog-table-to-page-pattern.md` - Converting dialogs to pages

---

---

**Last Updated:** 2026-01-15

*Update this workflow when you discover better patterns or TravelAuth project conventions evolve.*
