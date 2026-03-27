# Web Service

The web service is the frontend for Travel Authorization.

If you are new to the project, read the root [README.md](../README.md) first, then come back here
for frontend-specific details.

It is responsible for:

- rendering the Vue and Vuetify application
- handling browser-side authentication flow
- routing and page-level UI state
- calling the backend API
- hosting Travel Authorization, Travel Desk, and administration interfaces

## How It Is Used

In normal development, the web service is usually run through the `dev` wrapper.

To run only the web service:

```bash
dev up web
```

To run the full app stack instead:

```bash
dev up
```

The web app is then available at `http://localhost:8080`.

## Common Commands

Run web commands from the `web/` directory or through the repo-level `dev` wrapper:

```bash
dev up web
dev test_web
npm run start
npm run build
npm run lint
npm run check-types
```

What these are for:

- `dev up web`: boot the frontend service in Docker
- `dev test_web`: run the web test suite
- `npm run start`: run the local Vite dev server
- `npm run build`: build the production frontend bundle
- `npm run lint`: run frontend linting
- `npm run check-types`: run frontend type checking

## TypeScript And Editor Support

For Vue type support in editors, use:

- [VS Code](https://code.visualstudio.com/)
- [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar)
- [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin)

If you use VS Code, disable Vetur.

## Related Docs

- [../README.md](../README.md) - repo-level overview and quick start
- [../AGENTS.md](../AGENTS.md) - frontend conventions and component patterns
- [tests/README.md](./tests/README.md) - web testing directory guide
- [src/components/README.md](./src/components/README.md) - component-level guidance
- [src/api/README.md](./src/api/README.md) - frontend API layer guidance
- [src/pages/README.md](./src/pages/README.md) - page-level frontend guidance
- [src/layouts/README.md](./src/layouts/README.md) - layout guidance
