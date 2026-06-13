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

## Fallback Approach: Manual User Upload

Do not use a dedicated screenshot branch as the fallback. Branch-backed screenshot links are fragile:
they break when the branch is deleted, they leave orphaned remote branches behind, and they make pull
request descriptions depend on repository storage that is unrelated to the code review.

If browser automation cannot access a logged-in GitHub session, prepare everything the user needs to
upload manually:

1. Create a temporary folder with clearly named screenshots, for example
   `/tmp/opencode/pr-123-screenshots/`.
2. Name each image with a stable ordering and descriptive slug, for example
   `01-expense-processing-dashboard.png`.
3. Draft the exact pull request screenshot text in repository style, leaving placeholders where the
   user will paste GitHub-generated image tags.
4. Tell the user to drag the images into the GitHub pull request editor in order.
5. Tell the user to replace each placeholder with the generated `<img ...>` tag.
6. Provide the local screenshot folder path and the complete markdown block to paste into the pull
   request.

Example fallback text to give the user:

```markdown
# Screenshots

Expense Processing dashboard
http://localhost:8080/expense-processing
<!-- Drag 01-expense-processing-dashboard.png into GitHub and paste the generated <img ...> tag here. -->

Finance review Expenses tab
http://localhost:8080/expense-processing/11/expense
<!-- Drag 02-finance-review-expenses-tab.png into GitHub and paste the generated <img ...> tag here. -->
```

## Cleanup

If switching from any temporary or draft screenshot links to `user-attachments/assets/...` links:

1. Upload the screenshots through the GitHub web UI first.
2. Update the pull request so no markdown references temporary paths or placeholders.
3. Verify the pull request renders the `user-attachments/assets/...` screenshots.

## Safety Notes

- Use `gh pr view` to confirm the pull request number before editing.
- Prefer `gh` for GitHub reads and pull request updates, as documented in the GitHub tooling
  reference.
- Avoid third-party upload tools unless the user explicitly approves them.
- Keep screenshots out of the feature branch unless the user wants them versioned with the code.
