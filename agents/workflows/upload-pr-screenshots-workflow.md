# Upload Pull Request Screenshots Workflow

Use this workflow when a pull request needs screenshots in its description or comments.

## References

- See [GitHub tooling reference](../references/github.md) for canonical `gh` commands.

## Preferred Approach: GitHub User Attachments

GitHub `user-attachments/assets/...` image links are the cleanest option because they do not
require keeping repository branches or files around.

GitHub does not expose a public Representational State Transfer (REST) or GraphQL Application
Programming Interface (API) for creating these attachments. They are created by the GitHub web user
interface (UI) through a logged-in browser session.

Use this approach when a logged-in browser automation session is available:

1. Capture screenshots locally in `/tmp/opencode` or another temporary location.
2. Open the target pull request in a logged-in browser session.
3. Edit the pull request description or create a temporary comment.
4. Use the GitHub editor attachment control, or drop the screenshots onto the editor.
5. Wait for GitHub to insert `https://github.com/user-attachments/assets/...` markdown.
6. Copy those generated links into the final pull request description or comment.
7. Save the pull request description or comment.
8. Verify the rendered pull request shows all screenshots.

Do not try to create `user-attachments/assets/...` links with `gh api` alone. Token-only API calls
cannot create those web UI attachments.

## Pull Request Screenshot Format

Match the existing pull request style in this repository:

```markdown
# Screenshots

Short screenshot caption
http://localhost:8080/path-being-shown
<img width="1845" height="986" alt="image" src="https://github.com/user-attachments/assets/..." />
```

Use one block per screenshot:

1. A short human-readable caption.
2. The local app Uniform Resource Locator (URL) shown in the screenshot, when applicable.
3. The GitHub-generated `<img>` tag.

For backend-only changes, use `N/A - backend changes only`. For UI changes that still need
screenshots, leave a clear `TODO` under `# Screenshots` until screenshots are available.

## Fallback Approach: Screenshot Branch

Use a dedicated screenshot branch only when user attachments are not practical.

1. Create a branch named for the pull request, for example
   `assets/pr-123-screenshots-YYYYMMDDHHMM`.
2. Upload screenshots under a path such as `docs/pr-123-screenshots/`.
3. Reference screenshots with raw Uniform Resource Locators (URLs):
   `https://raw.githubusercontent.com/OWNER/REPO/BRANCH/docs/pr-123-screenshots/file.png`.
4. Update the pull request description or comment with those links.
5. Verify the rendered screenshots load.

Do not delete the screenshot branch while raw links still point at it. Deleting the branch breaks the
raw URLs.

## Cleanup

If switching from branch-backed links to `user-attachments/assets/...` links:

1. Upload the screenshots through the GitHub web UI first.
2. Update the pull request so no markdown references the screenshot branch.
3. Verify the pull request renders the `user-attachments/assets/...` screenshots.
4. Delete the screenshot branch.
5. Verify the branch is gone with `gh api` or `gh pr view` as appropriate.

## Safety Notes

- Use `gh pr view` to confirm the pull request number before editing.
- Prefer `gh` for GitHub reads and pull request updates, as documented in the GitHub tooling
  reference.
- Avoid third-party upload tools unless the user explicitly approves them.
- Keep screenshots out of the feature branch unless the user wants them versioned with the code.
