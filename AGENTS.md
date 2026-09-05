# Repo conventions

## Commits

Use [Conventional Commits](https://www.conventionalcommits.org/): `<type>(<scope>): <description>`

Common types: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `style`, `perf`.
Scope is optional; use the app/package name when it helps (`frontend`, `backporch`).

Keep the subject line terse — no body unless the *why* isn't obvious from the diff.

## Pull requests

Title follows the same Conventional Commits format as commits. Body is short:
what changed, and how to verify it. Skip estimated effort/time — it's not
useful here and tends to just be wrong.

