# TypeScript Scaffold

A minimal bootstrap scaffold for TypeScript projects.

This repository is intentionally small. It provides the shared project hygiene that most
TypeScript repositories need before application code exists: package manager pinning, strict
TypeScript defaults, formatting, linting, staged-file checks, and editor/devcontainer hints.

## What Is Included

- PNPM workspace setup
- Strict `tsconfig.json` defaults
- Reusable ESLint flat config for TypeScript
- Prettier formatting config
- AutoCorrect text cleanup
- Husky pre-commit and pre-push hooks
- lint-staged checks that run local project binaries
- Basic `.env.example`, `.gitignore`, VS Code, and devcontainer files

## What Is Not Included

- No app framework
- No build tool
- No test runner
- No runtime entrypoint
- No generated source tree

Add those only when a real project needs them.

## Commands

Install dependencies:

```sh
pnpm install
```

Format files:

```sh
pnpm run format
```

Run lint checks:

```sh
pnpm run lint
```

Run lint fixes and formatting:

```sh
pnpm run lint:fix
```

## Usage

Start from this scaffold when you want a clean TypeScript repository foundation without
choosing an application framework up front. Keep the base small, add project-specific tools
deliberately, and prefer extending the existing config over replacing it.
