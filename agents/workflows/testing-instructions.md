---
description: Generate comprehensive testing instructions for pull requests
---

# Testing Instructions Workflow

This workflow guides you through creating comprehensive, accurate testing instructions for a pull
request.

## Intent

**WHY this workflow exists:** Pull requests need clear, actionable testing instructions that
reviewers can follow to validate changes. Without proper testing instructions, PR validation
becomes inconsistent and error-prone.

**WHAT this workflow produces:**

- Comprehensive testing instructions with exact UI element names
- Sequential test cases covering happy paths, edge cases, and error conditions
- Proper formatting following TravelAuth project standards
- Navigation paths and verification steps for each test scenario

**Decision Rules:**

- **Always verify UI element names:** Never guess button names, tab names, or labels. Search the
  Vue code.
- **Use exact formatting:** Follow the established bold formatting and sequential numbering
  patterns.
- **Cover the real user workflow:** Include creation, editing, saving, return paths, and refresh
  validation where relevant.
- **Be specific:** Include exact navigation paths, field labels, route expectations, and expected
  outcomes.
- **Start with the TravelAuth standard setup:** Begin every Testing Instructions section with the
  standard three setup steps from `AGENTS.md`.

## Process

### Step 1: Understand the PR changes

Read the PR description and diff to understand:

- what feature or bug is being addressed
- what specific functionality changed
- what edge cases need testing
- any concerns or reviewer questions already raised

Identify the main test scenarios that need coverage.

### Step 2: Find actual UI element names from Vue code

**CRITICAL:** Always verify exact button names, tab names, and UI element labels from the actual
Vue components. Never guess or assume names.

#### Finding button text and labels

```bash
rg -n "v-btn|label=|title=" web/src -g "*.vue"
rg -n ">Save|>Back|>Return|>Submit|>Edit" web/src -g "*.vue"
rg -n "v-tab|tabs =" web/src -g "*.vue"
```

#### Finding navigation structure

```bash
rg -n "name: \".*Page|to: \\{|router" web/src/router.ts web/src -g "*.vue" -g "*.ts"
rg -n "breadcrumb|breadcrumbs|v-list-item" web/src -g "*.vue"
```

### Step 3: Verify routes and return paths

Read the relevant route definitions and page components to understand:

- exact route names and URLs
- which tab or page a Back or Return button should target
- whether direct URLs, refreshes, and nested edit pages should keep the user in the same flow

### Step 4: Structure test cases

Break testing into logical scenarios:

- **Test Case 1:** Main happy path
- **Test Case 2:** Important edit/save variations
- **Test Case 3:** Navigation and return-path behavior
- **Test Case 4:** Error handling or edge cases, if relevant

Each test case should:

- have a clear descriptive heading
- test one specific aspect of the functionality
- include explicit verification steps with expected outcomes

### Step 5: Write testing instructions using the standard format

Use this structure:

```markdown
# Testing Instructions

1. Run the relevant test suite via `./bin/dev test api -- --run` or a narrower command such as `./bin/dev test api -- --run tests/services/example.test.ts`.
2. Boot the app via `./bin/dev up`.
3. Log in to the app at http://localhost:8080.

## Test Case 1: [Descriptive scenario name]

4. From the main app Dashboard, [first action].
5. Click **[Exact Button Name]**.
6. Fill in [form details]:
   - **[Field Label]**: [Instructions or example value]
7. Click **[Submit Button Name]**.
8. Verify [expected outcome].
```

### Step 6: Follow formatting guidelines

1. **Bold all UI elements:** `**Travel Desk**`, `**Edit**`, `**Traveler Details** tab`
2. **Use exact button text:** Search the code to find the actual text
3. **Sequential numbering:** Continue numbering across all test cases
4. **Navigation arrows:** Use `→` for navigation paths
5. **Specific locations:** Say where the user starts, such as "from the main app Dashboard" or
   "via the left sidebar nav"
6. **Clear verification steps:** Use "Verify that..." or "Verify success message: `...`"
7. **Inline code for exact values:** Use backticks for URLs, IDs, field values, and exact messages

### Step 7: Include all meaningful scenarios

Ensure coverage of:

- main happy path functionality
- edit/save behavior
- return/back navigation
- refresh/direct URL behavior when relevant
- edge cases or blocked states called out by the PR

### Step 8: Review and validate

Before finalizing:

- [ ] All UI element names match actual code
- [ ] Navigation paths are accurate
- [ ] All test cases have clear expected outcomes
- [ ] Sequential numbering is correct
- [ ] Bold formatting is applied to UI elements
- [ ] Each test case covers a distinct scenario

## Related Workflows

- [`./pull-request-management.md`](./pull-request-management.md) - Create and update pull requests
- [`./github-issue-creation.md`](./github-issue-creation.md) - Create and enhance GitHub issues

## Tips

- When in doubt about UI element names, check the code first
- Prefer route names and labels from the current branch, not older screenshots
- For tabbed flows, always test direct URL entry, tab switching, and nested edit return paths
