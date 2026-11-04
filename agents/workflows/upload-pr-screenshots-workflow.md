# Upload Pull Request Screenshots Workflow

Load the direct shared [screenshot upload workflow](https://github.com/klondikemarlen/marlens-skills-rules-and-tools/blob/main/docs/workflows/upload-pr-screenshots-workflow.md) first, then apply these TravelAuth deltas. Resolve that document in the installed or otherwise verified shared release. Follow [root source-availability and precedence guidance](../../AGENTS.md#shared-standards-and-local-authority); do not invoke the selecting PR skill from this overlay.

The shared owner supplies capture preflight, installed uploader discovery through `github_pr_screenshot_upload_path`, engine-appropriate isolated login, exact PR-body placeholders, saved-body recovery, rendered-image verification, and owned-session cleanup. Discover that supported route before considering manual upload; `github-headless-session` is its Chromium-only adapter, not the Firefox path. Do not copy the generic procedure here.

## TravelAuth Evidence and Format

Use the running application and the required role/data for requested captures. Follow the [development wrapper](../../bin/README.md) and the relevant [local QA workflow](README.md). Application authentication, browser control/capture, GitHub authentication, file transfer, saved-body verification, and rendered placement are separate outcomes. Label fixture/component captures separately; they do not prove authenticated application behavior.

Preserve the repository's caption, app route, and GitHub-generated image order:

```markdown
# Screenshots

Short screenshot caption
http://<gateway-hostname>/path-being-shown
<img width="1845" height="986" alt="image" src="https://github.com/user-attachments/assets/..." />
```

Use the checkout-derived hostname printed by Vite, or the explicit `GATEWAY_HOSTNAME` override. Keep existing images, original attachment URLs, captions, and unrelated Markdown intact. Upload into the existing PR body, not a temporary comment or screenshot branch; apply the shared exact-placeholder and saved/rendered checks.

## Optionality and Blockers

Screenshots are optional unless the maintainer requests them or an applicable task requires them. For UI changes awaiting optional captures, keep a captioned placeholder; it does not alone block readiness or merge. Requested or required captures remain a deliverable until completed or truthfully reported blocked, independently of behavioral QA and review gates.

For backend-only changes, use `N/A - backend changes only`. For other changes without a product UI, use `N/A — <reason>.`

When a real prerequisite is missing, retain the intended caption and app route with a neutral visible explanation of the blocked stage. Keep local paths and browser/session details out of GitHub. Manual upload is a last resort after discovering the installed helper and authorized session route, not the default signed-out path. The user performs any agreed interactive sign-in; the agent performs supported upload and saved/rendered verification.
