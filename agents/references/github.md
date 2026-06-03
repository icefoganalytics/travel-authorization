# GitHub Tooling Reference

This project uses GitHub for issue tracking and pull requests. Use the `gh` CLI for all GitHub
operations — it is more reliable than inferring from git history.

## Finding an Issue by Topic

When you need an issue number but only have a topic description, search directly:

```bash
gh issue list --search "Vue 3 migration" --json number,title --limit 10
```

Filter results with the built-in `--jq` flag:

```bash
gh issue list --search "Vue 3 migration" --json number,title --limit 5 \
  --jq '.[] | select(.title | test("tracking"; "i")) | .number'
```

**Don't guess from git log.** Branch names and commit messages often omit the issue number.
`gh` queries the actual tracker.

## Viewing an Issue

```bash
gh issue view 123     # view in terminal
gh issue view 123 --web   # open in browser
```

## Working with Pull Requests

```bash
gh pr list --json number,title,headRefName  # list open PRs
gh pr view 456     # view PR details
gh pr view 456 --web   # open in browser
gh pr checkout 456     # checkout PR branch locally
gh pr status      # status of current branch's PR
```

## Authentication

```bash
gh auth status     # check if authenticated
gh auth login      # authenticate
```
