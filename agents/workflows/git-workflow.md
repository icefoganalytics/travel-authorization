# Git Workflow

This document covers git operations and workflows beyond commit message writing (see COMMITTING.md for commit message guidance).

## Rewording Past Commits

The global git editor may hang when invoked non-interactively. Use these patterns instead.

### Reword HEAD (most recent commit)

```bash
git commit --amend -m "new message"
```

### Reword an older commit

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

### Interactive rebase without editor hang

```bash
GIT_EDITOR="true" git rebase -i <base>
```

`GIT_EDITOR="true"` makes git use the `true` no-op command for commit message editing, so the sequence editor step works normally but individual message editing is skipped. Combine with `--amend -m` for rewording specific commits mid-rebase.

**Note:** Multi-line `--exec` strings in `git rebase --onto` are not supported.

## General Rules

- Never `git push --force` on main branch

# Git Workflow

This document covers git operations and workflows beyond commit message writing (see COMMITTING.md for commit message guidance).

These patterns are designed to avoid interactive editor hangs when running as an agent, since agents cannot interact with editors.

## Rewording Past Commits

### Reword HEAD (most recent commit)

```bash
git commit --amend -m "new message"
```

### Interactive rebase without editor hang

```bash
GIT_EDITOR="true" git rebase -i <base>
```

`GIT_EDITOR="true"` makes git use the `true` no-op command for commit message editing, so the sequence editor step works normally but individual message editing is skipped. Combine with `--amend -m` for rewording specific commits mid-rebase.

**Note:** Multi-line `--exec` strings in `git rebase --onto` are not supported.

## General Rules

- Never `git push --force` on main branch
