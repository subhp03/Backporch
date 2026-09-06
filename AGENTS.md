# Repo conventions

## Writing

Do not use em dashes (—). Use a colon, comma, parentheses, or two sentences
instead. This applies to code comments, docs, commit messages, and PR text.

## Commits

Use [Conventional Commits](https://www.conventionalcommits.org/): `<type>(<scope>): <description>`

Common types: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `style`, `perf`.
Scope is optional; use the app/package name when it helps (`frontend`, `backend`).

Keep the subject line terse. No body unless the *why* isn't obvious from the diff.

## Projects

- `frontend/` is the Next.js app (App Router). It has its own `AGENTS.md`,
  auto-managed by Next.js. Don't hand-edit it.
- `backend/` is the Python scraper for Kolkata property listings (MagicBricks).

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
