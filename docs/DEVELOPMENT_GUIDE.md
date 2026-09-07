# Development Guide

## Local commands

The repository uses the scripts in `package.json`:

```bash
npm start       # development server
npm test        # test runner
npm run build   # production build
```

For a non-watch test run, use `npm test -- --watchAll=false`. A production
build writes static assets to `build/`; this checkout has no production server
configuration, so the deployment environment must serve those assets with SPA
fallback routing to `index.html`.

Use the repository's existing Node/package-manager setup and environment files.
Do not put credentials, bearer tokens, or real patient data in source, tests,
or documentation.

## Change workflow

1. Start from `CODEBASE_DEEP_DIVE.md` and identify the owning route, page,
   component, hook, and API module.
2. Read the relevant feature contract in `ARCHITECTURE_AND_FEATURES.md`,
   `API_AND_DATA_CONTRACTS.md`, or `DIALYSIS_WORKFLOW.md`.
3. Search all callers before changing a shared function, route name, permission,
   API envelope, or component prop.
4. Add a focused behavioral test before production code for a new behavior or
   bug fix. Test the observable result, not only mock calls.
5. Keep loading, empty, error, unauthorized, and malformed-input paths explicit.
6. Run the full applicable test suite and build. For UI changes, verify the
   running application in a browser as well.

## Design-system rules

Use the tokens and primitives in `src/design-system/`, `src/Styles/`, and
`src/component-library/` for new shared UI. The design-system documentation
describes semantic colors, typography, spacing, radii, shadows, CSS variables,
and migration from hard-coded styles.

Prefer:

- semantic token names over hard-coded colors;
- component-library primitives over duplicate modal/table markup;
- layout utilities for layout and tokens for visual meaning;
- accessible labels, keyboard handling, focus management, and responsive states.

The design system is an incremental migration. Verify an export and its current
props in source before using a documented example.

## Error handling

Use `src/helpers/errors/` and the shared notification helpers. The application
has global error listeners in `src/index.js`, an app error boundary, Axios error
normalization, and a shared toaster. Feature code should add user-facing
context without swallowing the underlying failure or converting failed writes
into success.

## Testing matrix

| Change | Minimum verification |
| --- | --- |
| Pure helper or reducer | focused unit tests plus full test run |
| API wrapper | mocked error/success tests and caller verification |
| Route/permission | route guard behavior for allowed and denied roles |
| Data-backed screen | loading, success, empty, validation, error, and retry states |
| UI/layout/style | browser verification at relevant viewport sizes |
| Dialysis/clinical rule | independent expected values, boundary tests, audit/alert side effects, and transition verification |
| Build/config/dependency | test suite plus `npm run build` |

## Deployment and operational notes

This is a frontend-only checkout. Keep runtime configuration outside committed
source. Confirm the API base URL, authentication behavior, cache invalidation,
SPA fallback routing, and generated build output in the target environment
before release. Do not assume the illustrative Docker/Nginx material in older
project notes is a runnable deployment configuration.

## Documentation maintenance

Update the relevant canonical document in the same change when a reader-facing
route, API, configuration field, workflow rule, or directory ownership changes.
Update detailed source specifications only when the source contract itself has
changed. Avoid adding another one-off summary document when the information
belongs in one of the five canonical files.

## Existing source references

Historical implementation reports, design-to-code notes, mobile migration
notes, audit-log documentation, appointment notes, and generated endpoint
inventories remain under `docs/`. They are useful evidence for specific work but
are not alternate starting points.
