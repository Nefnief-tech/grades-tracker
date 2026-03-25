# Contributing

Thank you for your interest in contributing to Grade Tracker! This document outlines the process for reporting bugs, proposing features, and submitting code changes.

---

## Code of Conduct

Be respectful and constructive. All contributors are expected to follow the [Contributor Covenant](https://www.contributor-covenant.org/).

---

## Reporting Issues

1. Search [existing issues](https://github.com/Nefnief-tech/grades-tracker/issues) to avoid duplicates.
2. Open a new issue with:
   - A clear, descriptive title
   - Steps to reproduce (for bugs)
   - Expected vs. actual behaviour
   - Environment details (OS, Node.js version, browser)

---

## Development Setup

See [Getting Started](getting-started.md) for the full installation guide. For contributing specifically:

```bash
# Fork the repository, then:
git clone https://github.com/<your-username>/grades-tracker.git
cd grades-tracker
pnpm install
cp .env.example .env.local  # Fill in dev Appwrite credentials or leave empty
pnpm dev
```

---

## Branch Strategy

| Branch | Purpose |
|---|---|
| `main` | Stable production branch |
| `feature/<name>` | New features |
| `fix/<name>` | Bug fixes |
| `docs/<name>` | Documentation-only changes |
| `chore/<name>` | Maintenance, dependency updates |

Always branch off `main`:

```bash
git checkout main
git pull origin main
git checkout -b feature/my-new-feature
```

---

## Commit Conventions

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>

[optional body]
[optional footer]
```

**Types:**

| Type | When to use |
|---|---|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation changes only |
| `style` | Formatting, missing semicolons, etc. |
| `refactor` | Code change that is neither a fix nor a feature |
| `perf` | Performance improvement |
| `test` | Adding or updating tests |
| `chore` | Build process, dependency updates |

**Examples:**

```
feat(grades): add weighted average calculation
fix(auth): handle expired session gracefully
docs(readme): add documentation badge
chore(deps): upgrade next to 15.1.0
```

---

## Pull Request Process

1. **Push** your branch to your fork.
2. **Open a Pull Request** against `main`.
3. **Fill in the PR template**: describe what changed and why.
4. Ensure **`pnpm lint`** and **`pnpm build`** pass with no errors.
5. Request a review from a maintainer.
6. Address any review comments.
7. Once approved, the maintainer will merge the PR.

!!! tip
    Keep PRs focused. One feature or fix per PR makes reviews faster.

---

## Code Style

- **TypeScript**: strict mode enabled; avoid `any` where possible.
- **React**: functional components and hooks only; no class components.
- **Imports**: absolute imports via `@/` alias (configured in `tsconfig.json`).
- **Formatting**: the project uses ESLint (`next lint`). Match the surrounding code style.
- **Naming**:
  - Components: `PascalCase`
  - Hooks: `camelCase` prefixed with `use`
  - Utilities: `camelCase`
  - Types/Interfaces: `PascalCase`
  - Files: `kebab-case` for pages, `PascalCase` for component files

---

## Adding New Dependencies

Before adding a dependency:

1. Check if it is already provided by an existing package.
2. Prefer well-maintained packages with TypeScript support.
3. Use `pnpm add <package>` (not `npm install`).

---

## Documentation

If your change affects user-facing behaviour, update the relevant page(s) in `docs/`. Documentation uses [MkDocs Material](https://squidfunk.github.io/mkdocs-material/) and Markdown.
