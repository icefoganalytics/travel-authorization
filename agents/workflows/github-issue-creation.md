---
description: Workflow for creating well-structured GitHub issues using the project's issue templates
auto_execution_mode: 1
---

# GitHub Issue Creation Workflow

## Intent

**WHY this workflow exists:** Creating effective GitHub issues requires consistent structure, clear problem descriptions, and actionable requirements. Poorly written issues lead to confusion, scope creep, and implementation delays.

**WHAT this workflow produces:** Well-structured GitHub issues that include:
- Clear problem descriptions or feature requests
- Specific reproduction steps or requirements
- Proper issue labeling and assignment
- Screenshots/mockups when relevant

**Decision Rules:**
- **Use Existing Templates:** Always use the project's `.github/ISSUE_TEMPLATE/` templates
- **Bug Reports:** Use `bug_report.md` template for defects and problems
- **Feature Requests:** Use `feature_request.md` template for new functionality
- **Labels:** Always include appropriate labels for type, priority, and component

## Reference Files

- `.github/ISSUE_TEMPLATE/bug_report.md` (Bug report template)
- `.github/ISSUE_TEMPLATE/feature_request.md` (Feature request template)

---

## Step 1: Choose Issue Type

**For Bugs/Defects:** Use "Bug report" template
**For New Features:** Use "Feature request" template
**For Improvements/Refactoring:** Use "Feature request" template

---

## Step 2: Fill Out Template Fields

**Bug Report Template Fields:**
- **Describe the bug:** Clear, concise description of the problem
- **To Reproduce:** Step-by-step reproduction instructions
- **Expected behavior:** What should have happened
- **Screenshots:** Include if applicable
- **Desktop/Smartphone info:** Browser, OS, version details
- **Additional context:** Any relevant extra information

**Feature Request Template Fields:**
- **Relates to:** Related issues or documentation
- **Context:** Problem description and user story
- **Solution you'd like:** Clear description of desired outcome
- **Alternatives considered:** Other approaches you've thought about
- **Additional context:** Screenshots, examples, or extra details

---

## Step 3: Write Effective Context

**For Bug Reports:**
- Include exact error messages
- Provide specific URLs or page names
- Include browser console errors if applicable
- Mention recent changes that might be related

**For Feature Requests:**
- Use user story format: "As a [role] I can [action] so that [benefit]"
- Explain the business value or user benefit
- Include mockups or examples if available

---

## Step 4: Add Labels and Assignment

**Actual Project Labels:**
- `bug` - Something isn't working
- `enhancement` - Adds or modifies features to improve functionality or user experience
- `refactor` - Improves code's internal structure without changing its behavior

**Specialty Labels:**
- `:cherry_blossom: ui/ux` - Improves user experience or beautifies the app
- `:hammer: Tooling` - Something that makes it easier to produce high quality code
- `:lock: security` - Issues or PRs related to security vulnerabilities or improvements
- `:scroll: epic` - High-level feature or requirement that can be broken down into smaller tasks

**GitHub Default Labels:**
- `documentation` - Improvements or additions to documentation
- `duplicate` - This issue or pull request already exists
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `invalid` - This doesn't seem right
- `question` - Further information is requested
- `wontfix` - This will not be worked on

**Note:** Use only these existing labels from the project. The project does NOT have `frontend`, `backend`, `authentication`, `travel-desk`, `ui/ux`, `performance`, or priority labels.

---

## Complete Examples

### Bug Report Example

**Title:** `Auth: Switch To Refresh Token Rotation To Avoid Iframe-Based Silent Authentication`

**Labels:** `bug`, `:lock: security`

**Body:**
```
**Describe the bug**
Current iframe-based silent authentication is causing issues with browser security policies and may become deprecated.

**To Reproduce**
Steps to reproduce the behavior:
1. Test current authentication flow
2. Monitor browser console for iframe-related warnings
3. Verify token refresh behavior

**Expected behavior**
Authentication should work without iframes and follow Auth0 best practices for refresh token rotation.

**Desktop (please complete your following information):**
- OS: [e.g. macOS 14.0]
- Browser: [e.g. Chrome 120.0.6099.129]
- Version: Latest

**Additional context**
Relates to Auth0 documentation on refresh token rotation. Current implementation may need security updates.

```

### Feature Request Example

**Title:** `Finance: Rework Expense Review to Full Form Review With Editing Capabilities`

**Labels:** `enhancement`, `:cherry_blossom: ui/ux`

**Body:**
```
Relates to:
- Issue 310: Supervisor Approval Re-assignment To Finance for Expense Processing
- https://travel-auth-dev.ynet.gov.yk.ca/manage-travel-requests/344/expense

# Context

**Is your feature request related to a problem? Please describe.**
Current expense review process is limited and doesn't allow finance users to edit expense details during review.

**Describe the solution you'd like**
Implement full form review with editing capabilities for finance users to modify expense details during the approval process.

**Describe alternatives you've considered**
- Keep current limited review process
- Add separate editing step after review
- Use inline editing within review interface

**Additional context**
This would improve the finance review workflow and reduce back-and-forth between review and editing phases.
```

### Refactoring Example

**Title:** `Standardize Money and Percent Storage to DECIMAL Types + Use Big.js for Calculations`

**Labels:** `refactor`

**Body:**
```
Relates to:
- ELCC-9: Switch Database Columns to DECIMAL Types for Money and Percent Values

# Context

**Is your feature request related to a problem? Please describe.**
Current money and percent storage uses inconsistent types that can lead to calculation errors.

**Describe the solution you'd like**
- Switch all money and percent database columns to DECIMAL types
- Use Big.js for all calculations to ensure precision
- Update API serialization to handle new types properly

**Describe alternatives you've considered**
- Keep current types with manual precision handling
- Use JavaScript Number type with manual validation
- Use string-based storage with parsing

**Additional context**
This aligns with ELCC data management standards and improves financial calculation accuracy.
```

---

## Step 5: Create the Issue

### Option 1: Create via GitHub Web UI
1. Go to https://github.com/icefoganalytics/travel-authorization/issues/new/choose
2. Select appropriate template (Bug report or Feature request)
3. Fill in fields following the examples above
4. Add labels and assign if needed
5. Click "Submit new issue"

### Option 2: Create via GitHub CLI API

**For Bug Reports:**
```bash
gh api repos/icefoganalytics/travel-authorization/issues --method POST \
  --field 'title=Bug: [Brief Description]' \
  --field 'body=**Describe the bug**
[Clear description]

**To Reproduce**
Steps to reproduce the behavior:
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected behavior**
[What should happen]

**Desktop (please complete your following information):**
- OS: [e.g. macOS 14.0]
- Browser: [e.g. Chrome 120.0.6099.129]
- Version: Latest

**Additional context**
[Any relevant extra information]' \
  --field 'labels[]=bug' --field 'labels[]=:lock: security'
```

**For Feature Requests:**
```bash
gh api repos/icefoganalytics/travel-authorization/issues --method POST \
  --field 'title=Feature: [Brief Description]' \
  --field 'body=Relates to:
- [Related issues or documentation]

# Context

**Is your feature request related to a problem? Please describe.**
[Problem description]

**Describe the solution you'"'"'d like**
[Clear solution description]

**Describe alternatives you'"'"'ve considered**
[Alternative approaches]

**Additional context**
[Extra details, examples, or context]' \
  --field 'labels[]=enhancement' --field 'labels[]=:cherry_blossom: ui/ux'
```

**For Refactoring:**
```bash
gh api repos/icefoganalytics/travel-authorization/issues --method POST \
  --field 'title=Refactor: [Brief Description]' \
  --field 'body=Relates to:
- [Related issues or documentation]

# Context

**Is your feature request related to a problem? Please describe.**
[Problem description]

**Describe the solution you'"'"'d like**
[Clear solution description]

**Describe alternatives you'"'"'ve considered**
[Alternative approaches]

**Additional context**
[Extra details, examples, or context]' \
  --field 'labels[]=refactor'
```

**Important Notes for CLI:**
- Use `--field 'labels[]=label1' --field 'labels[]=label2'` for multiple labels
- Escape single quotes in body with `'"'"'` (e.g., `you'"'"'d`)
- Use line breaks with `\n` for multi-line content
- Issue URL will be returned in the response

---

## Quality Checklist

**For Bug Reports:**
- [ ] Bug description is clear and concise
- [ ] Reproduction steps are numbered and specific
- [ ] Expected vs actual behavior is clearly stated
- [ ] Screenshots included when applicable
- [ ] Browser/OS version information provided
- [ ] Error messages included verbatim
- [ ] Recent changes mentioned if relevant

**For Feature Requests:**
- [ ] User story follows "As a [role] I can [action] so that [benefit]" format
- [ ] Problem context is clearly explained
- [ ] Solution description is specific and actionable
- [ ] Alternative approaches have been considered
- [ ] Business value or user benefit is clear
- [ ] Mockups or examples included when relevant

**General:**
- [ ] Appropriate labels assigned (type, priority, component)
- [ ] Related issues or documentation linked
- [ ] Title is descriptive and follows project conventions
- [ ] Issue is assigned to appropriate team member
- [ ] Milestone or project tagged if applicable

---

**Workflow Version:** 1.0
**Last Updated:** 2026-01-16
**Reference Files:** `.github/ISSUE_TEMPLATE/bug_report.md`, `.github/ISSUE_TEMPLATE/feature_request.md`
