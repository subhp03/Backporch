# Repo conventions

## Writing

Do not use em dashes (—). Use a colon, comma, parentheses, or two sentences
instead. This applies to code comments, docs, commit messages, and PR text.

## Commits

Do not commit, stage, stash, push, or otherwise change git state unless the
user asks in that message. Finishing a task is not a cue to commit. When the
work is done, summarize it and stop; let the user decide when to commit.

When the user does ask for a commit:

Use [Conventional Commits](https://www.conventionalcommits.org/): `<type>(<scope>): <description>`

Common types: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `style`, `perf`.
Scope is optional; use the app/package name when it helps (`app`, `ingest`).

Keep the subject line terse. No body unless the *why* isn't obvious from the diff.

## Projects

- `app/` is the Next.js app (App Router): web UI, API routes, DB access, and
  LLM orchestration. It has its own `AGENTS.md`, auto-managed by Next.js.
  Don't hand-edit it.
- `ingest/` is the Python scraper/ingest pipeline for Kolkata property
  listings (MagicBricks): collect, normalize, embed, and load into Postgres.

## Code review

When reviewing a PR or branch diff (including via `/code-review`), on top of the
usual correctness and simplification checks:

- This Next.js version has breaking changes vs. common training data. Before
  flagging routing, `params`, caching, or server/client component issues, check
  the guides in `app/node_modules/next/dist/docs/`. Don't invent API rules
  from memory.
- Auth: watch for Supabase RLS assumptions vs. service-role usage, and user input
  reaching the DB or the model without `zod` validation.
- SQL: flag string-built queries (`postgres` supports tagged-template params).
- Data: `ingest/db/schema.sql` changes should match the code that reads them;
  watch embedding dimension mismatches.
- Enforce the Writing and Commits rules above (no em dashes, Conventional Commits).
- `app/AGENTS.md` is Next.js-managed; its agent-rules block being committed
  is fine, not a finding.

## Pull requests

Title follows the same Conventional Commits format as commits.

Description uses this format:

```
## Description
## Type of Change
## Changes Made
```

Keep each section short: what changed, and how to verify it. No estimated
effort/time, it's not useful here and tends to just be wrong. If it needs
more than a few bullet points per section, the PR is probably too big.
