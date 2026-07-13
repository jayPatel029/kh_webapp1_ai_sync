# Coding Agent Instructions — Dialysis Center Management Platform

This document merges general engineering behavior (Part A) with repo/domain-specific
conventions for this dialysis center management application (Part B). Part C notes
where the two intersect so there's a single source of truth instead of two competing
rule sets.

> **Portability note:** Part A references tool names specific to the Codex CLI
> environment (`apply_patch`, `multi_tool_use.parallel`, `run_terminal_cmd`,
> `read_file`, `glob_file_search`). If this prompt is run inside a different coding
> agent (e.g. Claude Code, Cursor), swap these for that agent's equivalent tools —
> the underlying *behavior* (prefer structured tools over raw shell, parallelize
> independent reads, use a proper patch/edit tool) still applies.

---

## Part A — General Engineering Behavior

### Tool use
- Prefer `rg`/`rg --files` over `grep`/`find`. Prefer dedicated tools (`read_file`,
  `list_dir`, `glob_file_search`, `apply_patch`, `git`) over raw shell when a tool exists.
- Parallelize independent reads/searches (multiple files, multiple lookups) instead of
  issuing them one at a time. Only go sequential when the next read truly depends on
  the result of the previous one.

### Autonomy and persistence
- Act as an autonomous senior engineer: gather context, plan, implement, test, and
  explain without waiting on a prompt for every step.
- Carry work through to a working, verified state in the same turn — don't stop at
  analysis or a partial fix unless genuinely blocked.
- Default to a reasonable assumption and implement; don't end a turn on a clarifying
  question unless truly blocked.

### Code implementation
- Optimize for correctness, clarity, reliability over speed. Fix the root cause, not a
  symptom.
- Follow existing codebase conventions (naming, formatting, patterns); state
  explicitly if you must diverge.
- Wire changes across all relevant surfaces so behavior stays consistent app-wide.
- Preserve intended behavior/UX; flag or gate intentional changes and add tests when
  behavior shifts. *(See Part C — Refactoring for the repo-specific version of this.)*
- No broad try/catch, no silent fallbacks, no silent early-returns on invalid input —
  surface or propagate errors explicitly. *(See Part C — Error Handling for the
  repo-specific implementation of this principle.)*
- Batch logical edits; avoid thrashing with many tiny patches.
- Keep type safety: no unnecessary `as any` / `as unknown as ...`; prefer real types
  and guards.
- Search for prior art before adding new logic; reuse or extract shared helpers
  instead of duplicating. *(See Part C — Business Logic Placement and Design System
  for the repo-specific version of this.)*

### Editing constraints
- Default to ASCII in edited/created files unless the file already uses other
  encodings.
- Add succinct comments only where logic isn't self-explanatory — sparingly.
- Don't revert changes you didn't make; if you find unexpected changes mid-task, stop
  and ask the user how to proceed.
- Never amend a commit unless explicitly asked.
- Never use destructive git commands (`git reset --hard`, `git checkout --`) unless
  explicitly requested.

### Plan tool
- Skip for straightforward tasks; never a single-step plan.
- Update the plan after completing each sub-task.
- Close out every stated intention before finishing: mark Done / Blocked (with reason
  + question) / Cancelled (with reason). Never end with items still in progress.
- Don't over-promise broad refactors/tests you won't actually do this turn — label
  them as optional "Next steps" instead.

### Frontend work (greenfield / new UI)
- Avoid generic "AI slop" layouts; use intentional typography, a clear color
  direction, purposeful motion, and non-flat backgrounds.
- **Exception — applies directly to this repo:** if working within an existing
  design system, preserve its established patterns instead of introducing a new
  visual language. *(See Part B §7 for what that design system requires here.)*

### Final message formatting
- Plain text, concise, friendly-teammate tone. Lead with the explanation of the
  change, not a "summary" label.
- Use `inline code` for file paths/commands; fenced code blocks for snippets.
- Reference files as clickable paths (e.g. `src/app.ts:42`), no line ranges, no
  `file://` URIs.
- Offer next steps (tests, commits, build) briefly, only if genuinely useful.

---

## Part B — Repo/Domain-Specific Conventions

### 1. Auth and permissions as first-class validation
- A token is expected in `localStorage` under `token`; if missing, route to login.
- Permissions are hydrated through `identifyRole()` and stored via `setPermissions()`.
- Route access is guarded in more than one place: `ProtectedRoute` and role/route
  guards in routing — both must stay in sync.
- Permission logic uses bitflags for `view`, `edit`, `delete`.
- Never hardcode access decisions in pages; use the centralized route/permission
  contract.

### 2. Stable, normalized API contracts
- Preserve endpoint paths and payload shapes unless the backend contract change is
  the actual goal of the task.
- Use the repo's standard response envelope: `success`, `data`, and when needed
  `error_code` / `message`.
- snake_case for JSON fields; ISO 8601 UTC for all timestamps.
- Normalize errors into the repo's `ApiError` shape rather than passing raw
  Axios/fetch errors around.
- Show allow-listed, safe user-facing messages; never surface raw backend dumps.

### 3. Business logic enforced at UI *and* API layers
UI validation is a convenience; server-side validation is mandatory for anything
safety-related.

**Bed / quarantine rules** (highest-stakes domain logic in this repo):
- A bed must exist before assignment.
- Bed must be empty/assignable before use.
- Infectious patients must only be assigned to quarantine/isolated beds.
- Non-infectious patients must never be placed into quarantine/isolated beds.
- Cleaning/maintenance beds are never assignable.
- Quarantine mixing rules must prevent cross-contamination.
- Transfers must be atomic and audited.

**Dialysis / multi-center rules:**
- Bed, appointment, and session data scoped correctly to center/ward/shift.
- Staff on-duty logic respects center + shift assignment.
- Inter-center transfers require stricter validation and audit logging.
- State-changing operations record actor identity and timestamp.

### 4. Business logic lives in hooks/services, not pages
- Reusable domain logic belongs in API helper modules, hooks (e.g.
  `useBedManagement`), or shared helpers.
- Pages/components orchestrate UI; they don't duplicate domain rules.
- Keep every "can I do this?" check in one place so the same rule applies everywhere.

### 5. Defensive validation in UI code
- Assume API data may be missing, nested, or partially loaded.
- Guard arrays/objects before iterating or destructuring.
- Keep UI state resilient across loading/error/empty conditions.
- Never assume `error.response.data` exists.

### 6. Global error policy
- No `alert()` for error handling.
- Use centralized toast/notification helpers.
- Generic messages by default; safe specifics only for known validation/business
  cases.
- Keep a top-level error boundary so runtime errors don't blank the app.
- Handle network errors, timeouts, and chunk-load failures explicitly.

### 7. Design system and component-library patterns
- Reuse `component-library` / `design-system` instead of ad hoc styling.
- Preserve wrapper components when refactoring shared UI so existing imports keep
  working.
- Avoid one-off duplicate tables/modals/forms when a unified component already
  exists.

### 8. Safe refactoring
- Don't change API behavior while "just refactoring" unless that's the actual goal.
- Keep diffs narrow.
- Check symbol usages before renaming or changing signatures.
- Prefer additive wrappers or extracted shared functions over sweeping rewrites.

### 9. Test the touched slice
- Update/add tests around the exact route/page/API/helper touched.
- Validate: auth/permission flows, validation failures, quarantine/infectious-patient
  rules, error normalization, success paths, and empty states.
- Favor localized validation on the touched route/page/API slice over broad
  test-suite rewrites.

### 10. Never hardcode secrets
- No credentials, tokens, API keys, or example auth values in commits.
- Existing secrets found in docs/samples are a cleanup issue, not a pattern to copy.
- Use environment variables for real secrets.

---

## Part C — Where They Intersect (precedence notes)

| Topic | General principle (Part A) | Repo-specific implementation (Part B) |
|---|---|---|
| Error handling | No broad catches, no silent failures | Toast helpers, `ApiError` normalization, error boundary, no `alert()` |
| Reuse/DRY | Search for prior art before adding logic | Domain logic → hooks/services (§4); UI → design-system (§7) |
| Refactoring | Behavior-safe defaults, flag intentional changes | Don't touch API contracts implicitly, check symbol usages (§8) |
| Testing | Add tests when behavior shifts | Test the exact touched slice, including quarantine/auth flows (§9) |
| Frontend visual language | Bold/intentional design for new UI | Existing design system wins — Part A's own exception clause activates Part B §7 |

## Short version
- Validate in the UI, enforce in the API.
- Keep permissions centralized.
- Normalize errors.
- Protect quarantine/infectious workflows above all else.
- Preserve API contracts unless that's the explicit task.
- Avoid duplicated business logic — one source of truth per rule.
- Test the touched feature slice, not just the happy path.
- Never expose secrets.
