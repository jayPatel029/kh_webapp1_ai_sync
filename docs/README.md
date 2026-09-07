# Kifayti WebApp documentation

The five files below are the canonical documentation set for this repository.
They consolidate the previous project summaries, API notes, design-system guides,
bed-management notes, and dialysis specifications by topic.

## Start here

1. [CODEBASE_DEEP_DIVE.md](./CODEBASE_DEEP_DIVE.md) — repository map, runtime flow, and safe navigation path.
2. [ARCHITECTURE_AND_FEATURES.md](./ARCHITECTURE_AND_FEATURES.md) — routing, state, feature ownership, and UI architecture.
3. [API_AND_DATA_CONTRACTS.md](./API_AND_DATA_CONTRACTS.md) — transport conventions, API families, response/error rules, and operations contracts.
4. [DIALYSIS_WORKFLOW.md](./DIALYSIS_WORKFLOW.md) — pre-, during-, and post-dialysis workflow, roles, transitions, and clinical rules.
5. [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) — local development, testing, design-system usage, and change checklists.

The older files remain as source references for detailed screen specifications,
historical implementation reports, and generated API inventories. Use the
canonical files for orientation; use the linked source documents when an exact
payload, screen field, or historical decision is required.

Redundant historical summaries and superseded implementation notes are in
[`archive/legacy/`](./archive/legacy/). They are retained for provenance, not
as current project guidance.

> Security note: credentials, bearer tokens, and other secrets must never be
> stored in documentation. Configure local access through environment variables
> or the repository's approved secret-management process.
