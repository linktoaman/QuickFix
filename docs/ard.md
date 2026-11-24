# Architecture Requirements Document (ARD)

> Every material architecture decision or constraint has a stable ID that feature specifications can reference.

## Document Metadata

- **Product/Application:** QuickFix
- **Document ID:** ARD-QUICKFIX
- **Version:** 0.1
- **Status:** Draft
- **Architecture Owner:** TBD; owner assignment tracked in ARC-OQ-001
- **Contributors:** Product Owner TBD, Engineering Lead TBD, Security Reviewer TBD
- **Last Updated:** 2026-11-24
- **Reference PRD:** `PRD.md`

---

## 1. Architecture Summary

QuickFix is a browser-only React MVP delivered as a static web application. The architecture uses Vite, React, TypeScript, React Router, reusable functional components, custom React context/hooks, responsive plain CSS, and browser `localStorage` for persistence. There is no backend API, database, real authentication, payment integration, notification system, or analytics service in v1.

The application separates presentation, routing, role simulation, booking orchestration, validation, service catalog data, local persistence, and admin/customer views. Customers use mock role selection to access service discovery, booking, and customer-specific booking history. Admin users use the same browser app to view all locally persisted bookings, summary counts, and status update controls. Booking data remains in the browser until the user clears `localStorage`.

Key architecture drivers are functional interactivity, privacy-by-boundary, simple local persistence, responsive accessibility, maintainable React structure, and clear labeling that mock role selection is not real security.

## 2. Architecture Drivers

- PRD-FR-001 — Provide mock Customer/Admin role selection without real authentication.
- PRD-FR-002 — Render a responsive homepage service catalog for four fixed services.
- PRD-FR-003 — Support booking creation with required customer, service, and appointment fields.
- PRD-FR-004 — Validate required fields, future appointment date/time, and basic phone format.
- PRD-FR-005 — Show customer-specific booking history by mock customer identity.
- PRD-FR-006 — Allow customers to cancel only Pending or Confirmed bookings.
- PRD-FR-007 — Show admin booking status summary counts.
- PRD-FR-008 — Allow admins to view all bookings and update status.
- PRD-FR-009 — Persist bookings in `localStorage` and seed sample bookings when empty.
- PRD-FR-010 — Ensure all buttons, forms, booking operations, and dashboard interactions work.
- PRD-NFR-001 — Use React functional components, hooks, reusable components, and responsive CSS.
- PRD-NFR-002 — Meet the stated accessibility baseline for keyboard operation, labels, focus, headings, and readability.
- PRD-NFR-003 — Store booking information only in browser `localStorage` and do not transmit customer booking data to backend services.
- PRD-NFR-004 — Remain usable in a supported browser session without network access after assets have loaded.
- CON-001 — Build using React functional components and hooks.
- CON-002 — Use `localStorage` persistence only; no backend or database is allowed.
- CON-003 — Real authentication is not allowed in v1; role selection is a mock simulation.
- CON-004 — Use minimalist white background, blue accents, clean typography, and responsive desktop/mobile layout.
- CON-005 — Deliver working interactions, not static mockup screens.
- CON-006 — Design for a mid-market retail context.
- CON-007 — Treat release timing as TBD and build as a single MVP release.

## 3. Architecture Principles

1. Keep QuickFix frontend-only for v1; do not introduce backend, database, payment, notification, analytics, or real authentication infrastructure.
2. Treat browser-stored booking data as confidential customer data even though persistence is local to the device.
3. Reuse established repository and platform patterns where appropriate.
4. Keep presentation, orchestration, domain, integration, and persistence concerns separated.
5. Prefer explicit validation and predictable local state transitions over hidden side effects.
6. Make demo-only security boundaries visible to users and reviewers.

## 4. System Context

### 4.1 Actors

- Homeowner or Tenant — Selects Customer mode, browses services, creates bookings, views own bookings, and cancels eligible bookings.
- Admin User — Selects Admin mode, views all local bookings, reviews dashboard counts, and updates booking statuses.
- Supported Browser — Executes the static React application, stores QuickFix data in `localStorage`, and serves as the only persistence boundary.
- Static Hosting Provider — Hosts and serves built application assets over HTTPS.
- Product Owner — Provides final service catalog descriptions, prices, icons, release target, and mock customer identities.
- Engineering Lead — Owns implementation structure, dependency versions, quality checks, and release build evidence.
- Security Reviewer — Reviews privacy boundary, dependency scan results, SBOM/dependency inventory, and security control evidence.

### 4.2 External Systems

| ID | System | Purpose | Interface | Owner |
|---|---|---|---|---|
| EXT-001 | Static Hosting Provider | Serve the built QuickFix static assets over HTTPS | File | Hosting owner TBD; tracked in ARC-OQ-002 |

## 5. Technology Stack

| Layer | Technology | Version/Constraint | Rationale |
|---|---|---|---|
| Frontend | React with TypeScript via Vite | Current stable versions at implementation; exact versions TBD by Engineering Lead in ARC-OQ-003 | Supports functional components, hooks, fast local development, typed models, and static build output |
| Routing | React Router | Current stable version at implementation; exact version TBD by Engineering Lead in ARC-OQ-003 | Enables client-side routes with mock role-based route guards |
| State Management | Custom React context and hooks | No Redux/Zustand for v1 | Keeps shared booking and role state simple while centralizing local persistence logic |
| Styling | Plain responsive CSS | White background, blue accents, clean typography, desktop/mobile layouts | Satisfies PRD visual requirements without adding styling framework complexity |
| Data | Browser `localStorage` | Browser-supported key/value persistence only; no backend/database | Meets browser-only persistence and privacy boundary requirements |
| Hosting | Static hosting such as Netlify or Vercel | HTTPS required; provider selection TBD in ARC-OQ-002 | Fits static React deployment with low operational overhead |
| Build Quality | TypeScript compiler, linter, unit/component/integration test runner, dependency scanner, SBOM/dependency inventory | Tool names TBD by Engineering Lead in ARC-OQ-003 | Provides release evidence and blocks known high/critical dependency risk |

## 6. Logical Architecture

### 6.1 Components

#### COMP-001 — App Shell and Router

- **Responsibility:** Initialize the app, provide layout, configure React Router routes, render role-aware navigation, and enforce UI-level route access based on mock role state.
- **Inputs:** Current mock role, current route, route guard configuration.
- **Outputs:** Rendered customer, admin, or role-selection view.
- **Dependencies:** COMP-002, COMP-003, COMP-004, COMP-005, COMP-006, COMP-007.
- **Repository Area:** `src/App.tsx`, `src/routes/`, `src/layout/`

#### COMP-002 — Mock Role Context

- **Responsibility:** Store selected role and selected mock customer identity for the current browser session/application state.
- **Inputs:** Role selection events, mock customer selection events.
- **Outputs:** Current role, current customer ID, role-switch actions.
- **Dependencies:** COMP-008.
- **Repository Area:** `src/state/RoleContext.tsx`, `src/hooks/useRole.ts`

#### COMP-003 — Service Catalog Module

- **Responsibility:** Provide fixed service definitions for Plumbing, Electrician, AC Repair, and Home Cleaning, including IDs, names, descriptions, prices, and icons.
- **Inputs:** Static service catalog configuration.
- **Outputs:** Service catalog list and service lookup by ID.
- **Dependencies:** Final catalog content from Product Owner, tracked in ARC-OQ-004.
- **Repository Area:** `src/data/services.ts`, `src/components/ServiceCard.tsx`

#### COMP-004 — Booking Domain and Validation Module

- **Responsibility:** Define booking types, status values, creation rules, cancellation rules, admin status transition behavior, required-field validation, future appointment validation, and phone validation.
- **Inputs:** Booking form payloads, existing booking records, requested status changes.
- **Outputs:** Validated booking records, validation errors, status transition results.
- **Dependencies:** COMP-003.
- **Repository Area:** `src/domain/booking.ts`, `src/domain/validation.ts`

#### COMP-005 — Booking Store Context and Hooks

- **Responsibility:** Centralize booking state, synchronize normalized booking records with `localStorage`, seed sample bookings when storage is empty, and expose read/write operations to UI components.
- **Inputs:** New booking commands, cancellation commands, admin status update commands, seeded booking data.
- **Outputs:** Booking collections, customer-filtered bookings, admin summary counts, persistence updates.
- **Dependencies:** COMP-004, COMP-008.
- **Repository Area:** `src/state/BookingContext.tsx`, `src/hooks/useBookings.ts`

#### COMP-006 — Customer Experience Components

- **Responsibility:** Render homepage, service cards, booking form, validation messages, success messages, My Bookings list, empty states, and customer cancellation controls.
- **Inputs:** Service catalog, current customer ID, booking form input, customer booking records.
- **Outputs:** Customer-visible views, booking creation commands, cancellation commands.
- **Dependencies:** COMP-002, COMP-003, COMP-004, COMP-005, COMP-009.
- **Repository Area:** `src/features/customer/`, `src/components/`

#### COMP-007 — Admin Dashboard Components

- **Responsibility:** Render admin summary counts, all-booking list, customer details, problem descriptions when present, and status update controls.
- **Inputs:** All booking records, status update selections.
- **Outputs:** Admin-visible dashboard, status update commands, refreshed summary counts.
- **Dependencies:** COMP-004, COMP-005, COMP-009.
- **Repository Area:** `src/features/admin/`

#### COMP-008 — Browser Storage Adapter

- **Responsibility:** Encapsulate `localStorage` key names, serialization, parsing, empty-storage detection, schema version value, and storage error handling.
- **Inputs:** Normalized booking state, role/session state where needed, seed data.
- **Outputs:** Persisted and rehydrated browser-local data.
- **Dependencies:** Browser `localStorage`.
- **Repository Area:** `src/storage/localStorageAdapter.ts`

#### COMP-009 — UI Component Library

- **Responsibility:** Provide reusable buttons, inputs, selects, cards, status badges, messages, layout containers, and accessible form patterns.
- **Inputs:** Props from customer and admin features.
- **Outputs:** Consistent interactive UI elements with labels, focus states, and responsive behavior.
- **Dependencies:** Plain CSS.
- **Repository Area:** `src/components/`, `src/styles/`

### 6.2 Data Flow

1. Static Hosting Provider serves QuickFix static assets to the Supported Browser.
2. COMP-001 initializes the React application and routes the user to COMP-002 role selection when no mock role is selected.
3. A Customer selects a mock customer identity through COMP-002 and navigates to the homepage rendered by COMP-006.
4. COMP-006 reads fixed service data from COMP-003 and displays service cards.
5. The Customer submits booking form data to COMP-004 for validation.
6. COMP-004 returns validation errors to COMP-006 or a valid booking command to COMP-005.
7. COMP-005 creates a Pending booking, normalizes it by booking ID, associates it with the current customer ID, and persists it through COMP-008 to `localStorage`.
8. COMP-006 reads customer-filtered bookings from COMP-005 for My Bookings and sends eligible cancellation commands to COMP-005.
9. An Admin selects Admin mode through COMP-002 and opens COMP-007.
10. COMP-007 reads all bookings and computed status counts from COMP-005.
11. COMP-007 sends status update commands to COMP-005, which validates the update through COMP-004 and persists changes through COMP-008.
12. On browser refresh, COMP-005 rehydrates data from COMP-008; if the QuickFix booking key is empty, COMP-005 seeds sample bookings once.

## 7. Architecture Decisions

### ARD-DEC-001 — Use Vite React TypeScript Static Application

- **Status:** Accepted
- **Related Requirements:** PRD-NFR-001, PRD-FR-010

**Decision**

QuickFix v1 will be implemented as a Vite-powered React application using TypeScript and plain responsive CSS, built into static assets for static hosting.

**Rationale**

This approach satisfies the React functional component and hooks requirement while keeping the deployment model aligned to the no-backend constraint. TypeScript supports explicit domain models for bookings, services, users, and statuses.

**Consequences**

- Produces static assets that can be hosted without server runtime infrastructure.
- Requires typecheck and build steps before release.
- Exact dependency versions remain TBD until implementation setup.

**Alternatives Considered**

- Create React App with JavaScript — not selected because Vite is lighter for modern React static builds and TypeScript better protects domain contracts.
- Next.js static export — not selected because routing/server framework capabilities exceed v1 needs.

### ARD-DEC-002 — Use React Router with Mock Role-Based Route Guards

- **Status:** Accepted
- **Related Requirements:** PRD-FR-001, PRD-FR-005, PRD-FR-007, PRD-FR-008

**Decision**

QuickFix will use React Router for customer, admin, booking, and role-selection routes. Route guards will use mock role state to show role-appropriate views.

**Rationale**

Client-side routing keeps navigation explicit and testable while supporting customer/admin separation in one browser-only app.

**Consequences**

- Improves maintainability versus large conditional rendering blocks.
- Route guards are only UI-level controls and must not be represented as real authorization.
- Deep links may redirect to role selection if role state is unavailable.

**Alternatives Considered**

- Single-page conditional rendering without routing — not selected because customer/admin flows and acceptance tests are clearer with routes.
- Separate React entry points — not selected because v1 should remain one static app.

### ARD-DEC-003 — Centralize State in Custom React Context and Hooks

- **Status:** Accepted
- **Related Requirements:** PRD-FR-003, PRD-FR-005, PRD-FR-006, PRD-FR-007, PRD-FR-008, PRD-FR-009, PRD-NFR-001

**Decision**

QuickFix will use custom React context providers and hooks to manage role state, booking state, customer filtering, admin summary derivation, and persistence operations.

**Rationale**

The v1 scope is small enough that Redux Toolkit or Zustand would add avoidable complexity. Context/hooks satisfy PRD requirements and keep local persistence behavior in one testable area.

**Consequences**

- Keeps app dependencies minimal.
- Requires careful provider design to avoid scattered `localStorage` calls.
- Future backend integration would likely replace or adapt the booking store hook boundary.

**Alternatives Considered**

- Redux Toolkit — not selected because global state needs are limited.
- Component-level prop drilling — not selected because booking data is shared across customer and admin features.

### ARD-DEC-004 — Persist Normalized Booking State in localStorage

- **Status:** Accepted
- **Related Requirements:** PRD-FR-005, PRD-FR-007, PRD-FR-008, PRD-FR-009, PRD-NFR-003, PRD-NFR-004

**Decision**

Booking state will be stored in `localStorage` as normalized data keyed by booking ID, with customer ID references and fixed service IDs.

**Rationale**

Normalized storage supports customer-specific filtering, admin all-booking views, status updates, and future schema evolution more cleanly than duplicating display fields in every view.

**Consequences**

- Requires service lookup when rendering service labels, icons, and prices.
- Reduces inconsistencies between customer and admin views.
- Does not provide cross-device persistence.

**Alternatives Considered**

- Simple array of booking objects with duplicated display fields — not selected because status updates and service changes become less consistent.
- One key per customer — not selected because admin all-booking summary would require more storage coordination.

### ARD-DEC-005 — Treat Browser-Stored Booking Data as Confidential

- **Status:** Accepted
- **Related Requirements:** PRD-NFR-003

**Decision**

Booking records containing name, phone, address, appointment details, and optional problem description will be classified as Confidential data even though it is stored only in the browser.

**Rationale**

The data includes customer personal information and home-service context. The architecture must minimize transmission and avoid unnecessary logging or exposure.

**Consequences**

- No backend transmission of booking data is allowed in v1.
- Sensitive data must not be logged to console or embedded in URLs.
- Users on shared browsers remain responsible for clearing localStorage when needed.

**Alternatives Considered**

- Internal classification — not selected because address and phone details warrant stronger handling.
- Restricted classification — not selected because no higher classification requirement was provided.

### ARD-DEC-006 — Use Static Hosting with HTTPS and Provider Rollback if Available

- **Status:** Accepted
- **Related Requirements:** PRD-NFR-004

**Decision**

QuickFix will be hosted on static hosting such as Netlify or Vercel, served over HTTPS, and rolled back using the provider’s version rollback capability if available.

**Rationale**

Static hosting matches the browser-only architecture and avoids backend operations. HTTPS protects asset delivery in transit.

**Consequences**

- Infrastructure as code is not required for v1.
- CI/CD is not required for v1, but release evidence must still be produced before deployment.
- Rollback capability depends on the selected provider.

**Alternatives Considered**

- Local demo only — not selected because the architecture decision includes hosted static delivery.
- Full infrastructure as code — not selected because v1 has no backend infrastructure and no CI/CD requirement.

### ARD-DEC-007 — Use Manual Acceptance Evidence and Local Client Observability

- **Status:** Accepted
- **Related Requirements:** PRD-FR-010, PRD-NFR-002, PRD-NFR-003, PRD-NFR-004

**Decision**

Operational observability for v1 will consist of user-visible success/error messages, safe client-side error handling, manual acceptance evidence, test results, and optional non-sensitive local operation logs only if needed for debugging.

**Rationale**

The PRD excludes real analytics, notifications, and backend systems. Client-only evidence is appropriate for a frontend-only MVP.

**Consequences**

- No production telemetry dashboards are required.
- Customer personal data must not be logged to console or third-party systems.
- Manual evidence is required to prove journey completion and responsiveness.

**Alternatives Considered**

- Third-party analytics/error monitoring — not selected because real analytics is out of scope.
- Full local audit trail in localStorage — not selected because it increases privacy exposure without backend governance.

## 8. API and Integration Architecture

### ARD-API-001 — Static Asset Delivery

- **Type:** File
- **Operation/Topic:** `GET /` and `GET /assets/*`
- **Provider:** EXT-001 Static Hosting Provider
- **Consumers:** Supported Browser
- **Authentication:** None for public static assets; HTTPS required
- **Versioning:** Static build artifact version or host deployment version

**Request/Input Contract**

Browser requests the application HTML, JavaScript, CSS, image/icon assets, and other static files from the selected static hosting provider.

**Response/Output Contract**

The host returns cacheable static assets required to run the QuickFix React application. The build artifact must not contain embedded customer booking data.

**Error Handling**

If assets fail to load, the browser displays normal network/browser errors or hosting error pages. Rollback uses the static host’s deployment rollback feature if available.

### ARD-API-002 — Browser localStorage Booking Store

- **Type:** File
- **Operation/Topic:** `localStorage.quickfix.bookings.v1`
- **Provider:** COMP-008 Browser Storage Adapter
- **Consumers:** COMP-005 Booking Store Context and Hooks
- **Authentication:** Browser profile access only; no real authentication
- **Versioning:** Storage key suffix `v1` and schema version field in stored payload

**Request/Input Contract**

Stored payload contains normalized booking data keyed by booking ID, fixed service IDs, customer ID references, customer details, appointment date/time, optional problem description, status, and schema version. Exact TypeScript interfaces are owned by Engineering Lead and tracked in ARC-OQ-003.

**Response/Output Contract**

COMP-008 returns parsed booking state to COMP-005. If no QuickFix booking data exists, COMP-005 loads seeded sample bookings once. If parsing fails, the app must show a safe error state and avoid overwriting existing data without an explicit user action.

**Error Handling**

Storage read/write failures must be caught and reported through user-visible error messages where they affect an operation. Booking create, cancel, and update operations must be idempotent by booking ID and must not duplicate records on refresh.

### ARD-API-003 — Browser localStorage Mock Role Store

- **Type:** File
- **Operation/Topic:** `localStorage.quickfix.role.v1` or equivalent session key
- **Provider:** COMP-008 Browser Storage Adapter
- **Consumers:** COMP-002 Mock Role Context and COMP-001 App Shell and Router
- **Authentication:** Browser profile access only; not a security control
- **Versioning:** Storage key suffix `v1` if persisted beyond in-memory state

**Request/Input Contract**

Role payload contains selected role and selected mock customer ID when applicable. Exact persistence choice for role state is owned by Engineering Lead and tracked in ARC-OQ-003.

**Response/Output Contract**

COMP-002 exposes current role and customer identity to route guards and feature components. Invalid or missing role data routes the user to mock role selection.

**Error Handling**

Invalid role values are ignored and reset to no selected role. Admin/customer route access errors redirect to role selection or the appropriate default route.

## 9. Data Architecture

### DATA-001 — Service

- **Purpose:** Represent the fixed QuickFix service catalog shown on homepage and booking form.
- **System of Record:** Static frontend catalog module in COMP-003.
- **Classification:** Public
- **Retention:** Retained in source/build artifacts until changed by a future release.
- **Key Relationships:** Referenced by DATA-002 Booking through fixed service ID.

### DATA-002 — Booking

- **Purpose:** Represent a customer’s home service appointment request and lifecycle status.
- **System of Record:** Browser `localStorage` through COMP-008 for v1.
- **Classification:** Confidential
- **Retention:** Retain until the user clears `localStorage`; no automatic expiry in v1.
- **Key Relationships:** References DATA-001 Service by service ID and DATA-003 Mock Customer by customer ID.

### DATA-003 — Mock Customer

- **Purpose:** Simulate separate customer identities within one browser so each customer sees only their own bookings.
- **System of Record:** Static frontend seed/configuration module; exact identities TBD in ARC-OQ-005.
- **Classification:** Internal for mock identity metadata; Confidential when associated with booking details.
- **Retention:** Static identities retained in source/build artifacts; selected identity may remain in browser state depending on implementation.
- **Key Relationships:** Referenced by DATA-002 Booking through customer ID.

### DATA-004 — Mock Role Session

- **Purpose:** Track whether the current browser user selected Customer or Admin mode.
- **System of Record:** React state and optional browser storage through COMP-002/COMP-008.
- **Classification:** Internal
- **Retention:** Retained for the current browser session or until role switch/reset; exact persistence TBD in ARC-OQ-003.
- **Key Relationships:** Controls UI-level route access to customer or admin components.

### Data Migration

- **Required:** No
- **Approach:** No migration is required for v1. If the `localStorage` schema changes in a future release, Engineering Lead must define a migration or reset strategy before changing the schema version.

## 10. Security Architecture

### ARD-SEC-001 — Browser-Only Privacy Boundary

- **Related Requirements:** PRD-NFR-003

The implementation must:

- Store booking data only in browser `localStorage` for v1.
- Treat booking records as Confidential because they include name, phone, address, appointment details, and problem description.
- Avoid transmitting customer booking data to backend services, analytics systems, error monitoring systems, or third-party APIs.
- Provide user-visible success/error messages without exposing unnecessary customer details.
- Allow browser users to remove records by clearing `localStorage`.

The implementation must not:

- Send booking data to a backend, database, analytics service, payment provider, notification service, or logging service.
- Place customer personal data in URLs, static build artifacts, console logs, or nonessential local operation logs.
- Claim that `localStorage` persistence provides secure multi-user isolation on shared devices.

### ARD-SEC-002 — Mock Role Access Is Not Real Authentication

- **Related Requirements:** PRD-FR-001, PRD-NFR-003

The implementation must:

- Use mock role selection only to control UI navigation and customer/admin view separation.
- Label or document the role system as simulated and not a security boundary.
- Filter My Bookings by selected mock customer ID in customer views.
- Allow admin mode to view all locally persisted bookings as required by the PRD.

The implementation must not:

- Store real passwords, tokens, or credentials in `localStorage`.
- Represent mock route guards as real authorization.
- Depend on mock role selection for protecting confidential data on a shared browser profile.

### ARD-SEC-003 — Frontend Supply Chain Controls

- **Related Requirements:** PRD-NFR-001

The implementation must:

- Run lint, typecheck, tests, and dependency vulnerability scanning before release.
- Block release on lint failures, typecheck failures, test failures, or high/critical dependency vulnerabilities.
- Generate or retain an SBOM/dependency inventory for the release artifact.
- Use supported package versions and remove unused dependencies where practical.

The implementation must not:

- Ship with known high or critical dependency vulnerabilities unless a Security Reviewer explicitly accepts the risk under ARC-RISK-005.
- Add dependencies for backend, analytics, notifications, payments, or real authentication in v1.

### Security Controls

- **Authentication:** Mock role selection only; not real authentication and not a security control.
- **Authorization:** UI-level route guards and customer ID filtering only; not real authorization.
- **Secrets Management:** No application secrets in v1; no passwords, API keys, or tokens stored in source or `localStorage`.
- **Encryption:** HTTPS required for static asset delivery in transit; no backend data at rest; no `localStorage` encryption because hardcoded browser keys would not provide meaningful protection.
- **Audit Logging:** No backend audit logging. Optional local non-sensitive operation logs may be used only for debugging and must not include customer personal data.
- **Dependency/CVE Scanning:** Required before release; high and critical vulnerabilities block release unless explicitly accepted by Security Reviewer.
- **SBOM:** Required as an SBOM or dependency inventory retained with release evidence.

## 11. Reliability, Performance, and Scalability

### ARD-OPS-001 — Browser Session Availability

- **Target:** After application assets have loaded, booking creation, viewing, cancellation, admin status updates, and local persistence work without backend connectivity in the same supported browser session.
- **Validation Method:** Manual acceptance test with network disabled after initial asset load, covering PRD journey flows and refresh behavior where assets remain available.

### ARD-OPS-002 — Responsive UI Performance

- **Target:** Lighthouse Performance score of at least 90 on desktop and mobile for the MVP application.
- **Validation Method:** Run Lighthouse against the built static app on desktop and mobile profiles and retain the report with release evidence.

### ARD-OPS-003 — localStorage Persistence Reliability

- **Target:** Booking create, cancellation, and admin status update operations persist after browser refresh in the same browser profile.
- **Validation Method:** Manual and integration tests covering `localStorage` write/read/refresh behavior for PRD-FR-009.

### ARD-OPS-004 — Functional Acceptance Reliability

- **Target:** All Must-priority PRD acceptance criteria pass before release.
- **Validation Method:** Manual acceptance checklist and automated tests where applicable for PRD-FR-001 through PRD-FR-010 and PRD-NFR-001 through PRD-NFR-003.

### ARD-OPS-005 — Scale Boundary

- **Target:** Support demo-scale bookings stored in a single browser `localStorage` profile; no multi-device, multi-browser, or concurrent-user scale target exists for v1.
- **Validation Method:** Code review confirms no backend/database dependencies; manual demo validates seeded and user-created bookings in one browser.

## 12. Observability

- **Logging:** Use safe client-side error handling; do not log customer name, phone, address, appointment details, or problem descriptions to console.
- **Metrics:** No real analytics instrumentation in v1; use manual acceptance evidence and Lighthouse reports for success measurement.
- **Tracing:** No distributed tracing because v1 has no backend or service-to-service calls.
- **Alerting:** No production alerting requirement for v1; hosting-provider availability alerting is TBD with selected host in ARC-OQ-002.
- **Sensitive Data Restrictions:** Customer booking data must remain in browser `localStorage` and must not be sent to telemetry, logs, third-party services, or backend endpoints.

## 13. Deployment Architecture

- **Environments:** Local development and static hosted MVP environment; additional test/stage/prod separation is TBD in ARC-OQ-006.
- **Deployment Model:** Static site deployment of Vite build output to a provider such as Netlify or Vercel.
- **CI/CD:** No CI/CD requirement for v1; release must still include local or manual evidence for build, lint, typecheck, tests, dependency scan, SBOM/dependency inventory, Lighthouse, and acceptance testing.
- **Configuration Management:** Build-time/static configuration only; no application secrets; service catalog and mock customer identities stored in frontend configuration modules.
- **Rollback:** Use static host version rollback if available; otherwise redeploy the previous known-good static build artifact if retained.
- **Infrastructure as Code:** Not required for v1.

## 14. Testing Architecture

Required test levels:

- Unit tests
- Integration tests
- Contract tests
- End-to-end tests
- Security tests
- Performance tests, where applicable

Minimum quality expectations:

- **Coverage Threshold:** 80% minimum coverage for validation logic, storage hooks/adapters, and core components.
- **Blocking Security Severity:** High and critical dependency vulnerabilities block release unless accepted by Security Reviewer.
- **Required Build/Lint Checks:** Static build, TypeScript typecheck, lint, unit/component tests, integration tests for booking flows, accessibility checks, dependency scan, SBOM/dependency inventory generation or retention, Lighthouse desktop/mobile performance report, and manual acceptance for PRD journeys.

Test focus by area:

- COMP-004 validation tests must cover required fields, future appointment date/time, phone format, initial Pending status, cancellation eligibility, and admin status values.
- COMP-005 and COMP-008 tests must cover seed-on-empty behavior, no overwrite when data exists, persistence after refresh, storage parse failure handling, customer filtering, and admin all-booking summary derivation.
- COMP-006 tests must cover service display, booking submission, success/error messages, My Bookings empty state, and customer cancellation controls.
- COMP-007 tests must cover dashboard counts, all-booking visibility, and status update persistence.
- Accessibility tests must cover keyboard operation, visible labels, focus states, semantic headings, and responsive readability per PRD-NFR-002.

## 15. Architecture Constraints

- ARC-CON-001 — QuickFix v1 must remain frontend-only and browser-only.
- ARC-CON-002 — The application must use React functional components and hooks as required by CON-001 and PRD-NFR-001.
- ARC-CON-003 — `localStorage` is the only persistence mechanism; backend services, APIs, databases, and server-side persistence are prohibited by CON-002.
- ARC-CON-004 — Real authentication, authorization, account management, passwords, and identity provider integration are prohibited by CON-003.
- ARC-CON-005 — Payments, provider dispatch, notifications, and real analytics are out of scope for v1.
- ARC-CON-006 — The visual system must use minimalist white background, blue accents, clean typography, and responsive desktop/mobile layout per CON-004.
- ARC-CON-007 — All visible primary buttons, forms, booking operations, and dashboard interactions must perform working behavior per CON-005 and PRD-FR-010.
- ARC-CON-008 — Browser-stored booking data must be classified as Confidential and must not be transmitted to backend or third-party services.
- ARC-CON-009 — The company context is mid-market retail per CON-006; no additional retail-specific compliance obligations were provided.
- ARC-CON-010 — Target release date is TBD and v1 is a single MVP release per CON-007.
- ARC-CON-011 — Static hosting must serve assets over HTTPS.
- ARC-CON-012 — CI/CD is not required for v1, but release quality evidence is still required before deployment.
- ARC-CON-013 — Infrastructure as code is not required for v1.

## 16. Risks and Trade-offs

| ID | Risk/Trade-off | Impact | Mitigation |
|---|---|---|---|
| ARC-RISK-001 | `localStorage` is browser-specific and does not support cross-device access. | Users may expect bookings to appear across devices or browsers. | Document browser-only scope and keep backend persistence out of v1. |
| ARC-RISK-002 | Mock role selection may be mistaken for real authentication or authorization. | Users or reviewers may overestimate security of customer/admin separation. | Label role behavior as simulated and document that it is not a security boundary. |
| ARC-RISK-003 | Confidential booking data is stored in plain browser `localStorage`. | Shared-device users may expose personal data to other browser users. | Avoid network transmission and sensitive logging; document clearing `localStorage` removes records. |
| ARC-RISK-004 | Service descriptions, prices, icons, and mock customer identities are not finalized. | Implementation may need content changes before acceptance. | Track content decisions in ARC-OQ-004 and ARC-OQ-005 before final acceptance. |
| ARC-RISK-005 | High or critical dependency vulnerabilities may block release. | Release may be delayed if packages are vulnerable. | Run dependency scan before release and require Security Reviewer acceptance for any exception. |
| ARC-RISK-006 | No CI/CD requirement increases reliance on manual release discipline. | Build, test, or scan steps may be skipped accidentally. | Maintain a required release checklist with evidence for build, lint, typecheck, tests, scan, SBOM, Lighthouse, and acceptance testing. |
| ARC-RISK-007 | Static host rollback depends on provider capability. | Recovery from a bad deployment may be slower if provider rollback is unavailable. | Retain previous known-good build artifact and document manual redeploy procedure if needed. |

## 17. Open Architecture Questions

| ID | Question | Owner | Status | Decision/Due Date |
|---|---|---|---|---|
| ARC-OQ-001 | Who is the named Architecture Owner, Product Owner, Engineering Lead, Security Reviewer, and approval participants? | Product Owner | Open | TBD |
| ARC-OQ-002 | Which specific static hosting provider will be used, and who owns hosting configuration and rollback? | Engineering Lead | Open | TBD |
| ARC-OQ-003 | What exact dependency versions, test tools, lint tools, dependency scan tool, SBOM/dependency inventory format, TypeScript interfaces, and role-state persistence choice will implementation use? | Engineering Lead | Open | TBD |
| ARC-OQ-004 | What are the final descriptions, prices, and icon choices for Plumbing, Electrician, AC Repair, and Home Cleaning? | Product Owner | Open | TBD |
| ARC-OQ-005 | What exact mock customer identities should be available in the role simulation? | Product Owner | Open | TBD |
| ARC-OQ-006 | Will the static hosted MVP use separate test/stage/prod environments or a single hosted demo environment? | Engineering Lead | Open | TBD |
| ARC-OQ-007 | What is the target release date for the single MVP release? | Product Owner | Open | TBD |
| ARC-OQ-008 | What hosting-provider availability alerting, if any, should be enabled for v1? | Engineering Lead | Open | TBD |

## 18. Feature Mapping

| Feature | Relevant Components | Decision IDs | Interface IDs | Security IDs |
|---|---|---|---|---|
| FEAT-001 | COMP-001, COMP-002, COMP-009 | ARD-DEC-002, ARD-DEC-003 | ARD-API-003 | ARD-SEC-002 |
| FEAT-002 | COMP-001, COMP-003, COMP-006, COMP-009 | ARD-DEC-001, ARD-DEC-002 | ARD-API-001 | ARD-SEC-001 |
| FEAT-003 | COMP-004, COMP-005, COMP-006, COMP-008, COMP-009 | ARD-DEC-003, ARD-DEC-004, ARD-DEC-005 | ARD-API-002 | ARD-SEC-001 |
| FEAT-004 | COMP-002, COMP-004, COMP-005, COMP-006, COMP-008, COMP-009 | ARD-DEC-003, ARD-DEC-004, ARD-DEC-005 | ARD-API-002, ARD-API-003 | ARD-SEC-001, ARD-SEC-002 |
| FEAT-005 | COMP-004, COMP-005, COMP-007, COMP-008, COMP-009 | ARD-DEC-003, ARD-DEC-004, ARD-DEC-005 | ARD-API-002 | ARD-SEC-001, ARD-SEC-002 |
| FEAT-006 | COMP-005, COMP-008 | ARD-DEC-004, ARD-DEC-005 | ARD-API-002 | ARD-SEC-001 |
| FEAT-007 | COMP-001, COMP-006, COMP-007, COMP-009 | ARD-DEC-001, ARD-DEC-007 | ARD-API-001 | ARD-SEC-001, ARD-SEC-003 |

## 19. Approval

| Role | Name | Decision | Date |
|---|---|---|---|
| Solution Architect | TBD | Pending | TBD |
| Security Reviewer | TBD | Pending | TBD |
| Engineering Lead | TBD | Pending | TBD |