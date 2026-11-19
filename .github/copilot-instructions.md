# Web Application Constitution

## Core Principles

### I. User-First

Design decisions must prioritize user value, accessibility, and clear success criteria. Every feature should state the user problem it solves and acceptance criteria.

### II. Test-First (MUST)

Tests are mandatory: write unit and integration tests that verify behavior before implementation. Automated tests must run in CI on every change.

### III. Secure by Default

Protect user data and prevent common web vulnerabilities (e.g., XSS, CSRF, injection). Sensitive secrets must never be committed.

### IV. Observable and Deployable

Applications must expose logs and basic metrics and be continuously deployable to a reproducible environment. Rollbacks must be possible for production releases.

### V. Simplicity and Maintainability

Prefer simple, well-documented solutions. Avoid unnecessary dependencies and complexity; every added dependency must have a clear justification.

## Development Standards

### Build & Tooling

- Use a modern build tool (Vite or equivalent) with distinct development and production modes.
- Provide an npm/pnpm script to run the app locally and to build for production.

### Testing

- Unit tests for core logic and component tests for UI.
- Integration tests for critical user flows (e.g., auth, data persistence).
- Add a basic smoke test that validates the production build serves the main page.

### Code Quality

- Enforce linting and formatting (ESLint + Prettier or equivalent) in CI.
- Write clear README with setup and run instructions.

### Security & Secrets

- Use environment variables or secret manager for secrets in CI/deploy.
- Run a dependency vulnerability scan as part of CI.

## Technical Requirements

### Frontend

- Use a multi-page architecture
- SSG where applicable (Astro or equivalent)
- Responsive design for mobile and desktop
- Use HTML, CSS and JavaScript/TypeScript **no tailwind!**
- Use Svelte v5 as needed for interactive components
- Should communicate with backend via RESTful API

### Backend

- Use Node.js with Express or equivalent framework
- RESTful API design principles
- Use a database (NoSQL) for data persistence

## Project Quality Gates

- All automated tests must pass in CI before merge.
- Lint and format checks must pass.
- A deployment must be reproducible from the repository and build artifacts.
