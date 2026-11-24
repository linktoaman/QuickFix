# QuickFix Release Checklist

Collect the following evidence locally before a release candidate is accepted.
These checks do not require CI/CD and do not add CI/CD as a release requirement.
Run commands from `frontend/` unless another path is listed.

## Quality Gate Evidence

- Build: run `npm run build` and retain the terminal result.
- Typecheck: run `npm run typecheck` and retain the terminal result.
- Lint: run `npm run lint` and retain the terminal result.
- Unit and integration tests: run `npm test` and retain the terminal result.
- Usability smoke tests: run `npm run test:usability` and retain the terminal
  result.
- Release reviewer confirms no generated validation artifacts, local databases,
  dependency folders, build outputs, coverage output, or environment files are
  committed.

## Security Gate Evidence

- Dependency scan: run `npm run audit` and retain the terminal result.
- High or critical dependency vulnerabilities block release unless the Security
  Reviewer records an explicit risk acceptance with the package, version,
  vulnerability identifier, affected path, business justification, compensating
  controls, owner, and expiration date.
- Moderate dependency vulnerabilities require triage notes before release.
- Dependency inventory: run `npm run deps:inventory > deps-inventory.json` and
  retain the JSON output as release evidence.
- SBOM: run `npm run deps:sbom > sbom.json` and retain the JSON output when the
  local npm version supports `npm sbom`.
- Confirm the release preserves the browser-only architecture: no backend API,
  database, analytics, notification, payment, or real-authentication dependency
  is introduced.

## Performance Gate Evidence

- Build the app with `npm run build`.
- Serve the production build for Lighthouse, for example with
  `npx vite preview --host 127.0.0.1 --port 4173`.
- Lighthouse desktop: run
  `npx lighthouse http://127.0.0.1:4173 --preset=desktop --output=html --output-path=quickfix-lighthouse-desktop.html`
  and retain the report.
- Lighthouse mobile: run
  `npx lighthouse http://127.0.0.1:4173 --output=html --output-path=quickfix-lighthouse-mobile.html`
  and retain the report.
- Review Lighthouse accessibility, best-practices, SEO, and performance results
  for release-impacting regressions.

## Manual Acceptance Evidence

- Complete `docs/manual-acceptance-checklist.md` for Customer books a home
  service, Customer cancels an eligible booking, and Admin updates booking
  status.
- Attach browser evidence that booking data is stored only in
  `localStorage.quickfix.bookings.v1`.
- Attach Network-panel evidence that create, cancel, and status-update actions
  do not transmit customer booking data to backend or third-party services.
- Attach evidence that clearing `localStorage.quickfix.bookings.v1` removes
  customer-entered manual-test bookings and returns the app to its initial
  local-only state.

## Release Decision

- Release is approved only when all quality, security, performance, and manual
  acceptance evidence above is present.
- Release is blocked while any required command is failing, any required manual
  flow is unverified, or any high/critical dependency vulnerability lacks
  explicit Security Reviewer risk acceptance.
