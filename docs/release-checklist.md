# QuickFix Release Checklist

Collect this evidence locally before a release candidate is accepted. These checks do
not require CI/CD and do not add CI/CD as a release requirement.

## Automated Evidence

- Build: run `npm run build` from `frontend/` and keep the terminal result.
- Typecheck: run `npm run typecheck` from `frontend/` and keep the terminal result.
- Lint: run `npm run lint` from `frontend/` and keep the terminal result.
- Tests: run `npm test` from `frontend/` and keep the terminal result.
- Dependency scan: run `npm run audit` from `frontend/` and record any findings.
- Dependency inventory: run `npm run deps:inventory` from `frontend/` and retain the JSON output.
- SBOM: run `npm run deps:sbom` from `frontend/` and retain the JSON output when the local npm version supports it.

## Browser Evidence

- Lighthouse desktop: capture a desktop Lighthouse report for the production build.
- Lighthouse mobile: capture a mobile Lighthouse report for the production build.
- Manual acceptance: confirm the root route loads, navigation works, role/customer
  selectors behave as expected, booking flows show success and error states, and
  persisted booking data remains browser-local.
