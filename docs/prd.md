# Product Requirements Document (PRD)

> Replace all `<PLACEHOLDER>` values. Keep requirement IDs stable after approval so downstream ARD and feature specifications retain traceability.

## Document Metadata

- **Product/Application:** QuickFix
- **Document ID:** PRD-QUICKFIX
- **Version:** 0.1
- **Status:** Draft
- **Owner:** TBD
- **Contributors:** TBD
- **Last Updated:** 2026-11-24

---

## 1. Executive Summary

QuickFix is a modern React-based home services booking website for a mid-market retail context. It enables users to browse basic home services, submit appointment bookings, view their bookings, cancel eligible bookings, and simulate admin management of booking statuses without a backend or database.

The product’s expected value is a working end-to-end MVP, not a static mockup. Customers can complete bookings with validation and confirmation, while admins can view operational booking totals and update statuses using browser localStorage persistence and a mock role-based experience.

## 2. Problem Statement

Retail customers who need common home services currently need a faster way to book appointments without calling support. QuickFix addresses this by providing a responsive self-service booking flow for homeowners or tenants, with a simulated admin workflow for managing requests.

## 3. Product Vision

QuickFix will provide a clean, minimalist, responsive home services booking experience where customers can discover services, book appointments, and track submitted bookings, while admins can monitor and update booking statuses in a lightweight browser-only MVP.

## 4. Goals and Success Measures

### 4.1 Goals

- Enable users to complete a home service booking end-to-end with clear validation and confirmation.
- Provide a responsive, modern interface using minimalist white backgrounds, blue accents, and clean typography.
- Simulate separate customer and admin experiences within one browser using role selection.
- Persist bookings locally using localStorage without requiring a backend, database, or real authentication.
- Provide reusable React functional components and hooks for maintainable implementation.

### 4.2 Success Measures

| ID | Measure | Baseline | Target | Measurement Method |
|---|---|---:|---:|---|
| KPI-001 | Customer booking task completion | Not currently measured | Pass acceptance testing | Manual acceptance testing of booking creation flow |
| KPI-002 | Mandatory field validation coverage | Not currently measured | Pass acceptance testing | Manual acceptance testing using missing and invalid form inputs |
| KPI-003 | Admin status update completion | Not currently measured | Pass acceptance testing | Manual acceptance testing of admin dashboard status changes |
| KPI-004 | Responsive usability across desktop and mobile layouts | Not currently measured | Pass acceptance testing | Manual viewport testing on desktop and mobile breakpoints |

## 5. Scope

### 5.1 In Scope

- Homepage navigation and service cards for Plumbing, Electrician, AC Repair, and Home Cleaning.
- Fixed service catalog with descriptions, prices, and icons.
- Booking form with service selection, name, phone, address, appointment date, appointment time, and optional problem description.
- Mandatory field validation, future appointment validation, basic phone format validation, and success/error messages.
- My Bookings view showing submitted bookings, customer details, appointment date/time, and status.
- Customer cancellation for Pending and Confirmed bookings only.
- Simple mock login that lets users choose Customer or Admin.
- Multi-user simulation where each mock customer has separate bookings and admin sees all bookings.
- Admin dashboard showing Total, Pending, Confirmed, Completed, and Cancelled booking counts.
- Admin view of bookings and status updates across Pending, Confirmed, Completed, and Cancelled.
- localStorage persistence, including a small set of seeded sample bookings if localStorage is empty.
- Responsive CSS and reusable React functional components using hooks.

### 5.2 Out of Scope

- Backend services, APIs, databases, and server-side persistence.
- Real authentication, authorization, or account management.
- Payments, invoicing, refunds, and pricing calculations beyond displaying service prices.
- Provider dispatch, technician assignment, route optimization, or service fulfillment.
- Notifications via SMS, email, push, or in-app messaging beyond local success/error messages.
- Real analytics instrumentation.
- Admin creation, editing, or deletion of service catalog entries.
- Custom services outside the four predefined service cards.

## 6. Personas and Users

### PERSONA-001 — Homeowner or Tenant

- **Description:** A retail customer booking common home services for their residence.
- **Primary Need:** Quickly browse services and book an appointment without calling support.
- **Key Pain Point:** Manual booking channels are slower and require support involvement.

### PERSONA-002 — Admin User

- **Description:** An operations/admin user reviewing and managing submitted service bookings in the simulated dashboard.
- **Primary Need:** View booking demand and update statuses from one place.
- **Key Pain Point:** Without a dashboard, booking status tracking is hard to verify in the MVP.

### PERSONA-003 — Service Provider or Technician

- **Description:** A downstream service fulfiller who would perform the service in a real operation.
- **Primary Need:** TBD for future releases.
- **Key Pain Point:** Provider dispatch and fulfillment workflows are out of scope for v1.

## 7. Assumptions and Dependencies

### Assumptions

- ASM-001 — QuickFix v1 is a frontend-only MVP running in the browser.
- ASM-002 — localStorage persistence is sufficient for the initial no-backend simulation.
- ASM-003 — Mock role selection is acceptable because real authentication is out of scope.
- ASM-004 — A small seeded booking dataset may be loaded when localStorage is empty to support demos and admin visibility.
- ASM-005 — Service descriptions, icons, and price values are required but their exact content is TBD.

### Dependencies

- DEP-001 — React must support functional components and hooks.
- DEP-002 — The browser must support localStorage.
- DEP-003 — Responsive CSS must support desktop and mobile layouts.
- DEP-004 — Service catalog content, including final prices, descriptions, and icon choices, must be provided or approved.

## 8. Functional Requirements

### PRD-FR-001 — Mock Role Selection

- **Priority:** Must
- **Feature:** FEAT-001
- **Persona:** PERSONA-001, PERSONA-002

**Requirement**

The system shall provide a simple mock login that lets the user choose Customer or Admin mode within one browser.

**Business Rationale**

The product requires multi-user simulation without real authentication or a backend.

**Acceptance Criteria**

1. Given a user opens the app, when they select Customer mode, then customer navigation and booking features are available.
2. Given a user opens the app, when they select Admin mode, then the admin dashboard is available.
3. Given the user switches roles, when the new role is selected, then role-appropriate navigation and views are shown without requiring backend authentication.

---

### PRD-FR-002 — Homepage Service Discovery

- **Priority:** Must
- **Feature:** FEAT-002
- **Persona:** PERSONA-001

**Requirement**

The system shall display a homepage with navigation and service cards for Plumbing, Electrician, AC Repair, and Home Cleaning, including descriptions, prices, and icons.

**Business Rationale**

Customers need to understand available services before starting a booking.

**Acceptance Criteria**

1. Given the homepage loads, then cards for Plumbing, Electrician, AC Repair, and Home Cleaning are visible.
2. Each service card displays an icon, service name, description, and price.
3. Navigation allows the user to move to booking and My Bookings views from the customer experience.
4. The homepage remains usable on desktop and mobile viewport sizes.

---

### PRD-FR-003 — Booking Form Entry

- **Priority:** Must
- **Feature:** FEAT-003
- **Persona:** PERSONA-001

**Requirement**

The system shall allow a customer to create a booking by selecting a service, entering name, phone, address, appointment date, appointment time, and optionally entering a problem description.

**Business Rationale**

The core product outcome is customer self-service appointment booking.

**Acceptance Criteria**

1. Given a customer opens the booking form, then they can select one of the four predefined services.
2. Given all required fields are valid, when the customer submits the form, then a booking is created and persisted in localStorage.
3. Given the customer enters an optional problem description, when the booking is submitted, then the description is stored with the booking.
4. Given a booking is created, then its initial status is Pending.

---

### PRD-FR-004 — Booking Validation and Messaging

- **Priority:** Must
- **Feature:** FEAT-003
- **Persona:** PERSONA-001

**Requirement**

The system shall validate mandatory booking fields, future appointment date/time, and basic phone format, then show success or error messages.

**Business Rationale**

Validation reduces unusable bookings and confirms outcomes clearly to customers.

**Acceptance Criteria**

1. Given any required field is empty, when the customer submits the form, then the booking is not created and an error message identifies the missing field or fields.
2. Given the appointment date/time is not in the future, when the customer submits the form, then the booking is not created and a date/time error is shown.
3. Given the phone contains characters outside digits, spaces, plus signs, hyphens, or parentheses, when the customer submits the form, then the booking is not created and a phone error is shown.
4. Given all inputs are valid, when the customer submits the form, then a success message is shown.

---

### PRD-FR-005 — Customer-Specific My Bookings

- **Priority:** Must
- **Feature:** FEAT-004
- **Persona:** PERSONA-001

**Requirement**

The system shall display each mock customer’s submitted bookings with customer details, appointment date/time, selected service, and status.

**Business Rationale**

Customers need visibility into their own submitted service appointments.

**Acceptance Criteria**

1. Given a customer has submitted bookings, when they open My Bookings, then only that mock customer’s bookings are displayed.
2. Given another mock customer has bookings, when the current customer opens My Bookings, then the other customer’s bookings are not shown.
3. Each displayed booking includes customer name, phone, address, service, appointment date/time, and status.
4. Given the customer has no bookings, then an empty state is displayed.

---

### PRD-FR-006 — Customer Booking Cancellation

- **Priority:** Must
- **Feature:** FEAT-004
- **Persona:** PERSONA-001

**Requirement**

The system shall allow customers to cancel their own bookings only when the booking status is Pending or Confirmed.

**Business Rationale**

Customers need control over active bookings while preserving completed service history.

**Acceptance Criteria**

1. Given a customer views a Pending booking, then a cancellation action is available.
2. Given a customer views a Confirmed booking, then a cancellation action is available.
3. Given a customer views a Completed booking, then cancellation is not available.
4. Given a customer cancels an eligible booking, then its status changes to Cancelled and persists in localStorage.

---

### PRD-FR-007 — Admin Booking Summary

- **Priority:** Must
- **Feature:** FEAT-005
- **Persona:** PERSONA-002

**Requirement**

The system shall display an admin dashboard summary with Total, Pending, Confirmed, Completed, and Cancelled booking counts.

**Business Rationale**

Admins need immediate visibility into operational booking volume and status distribution.

**Acceptance Criteria**

1. Given the admin opens the dashboard, then summary cards or equivalent indicators show Total, Pending, Confirmed, Completed, and Cancelled counts.
2. Given bookings exist for multiple mock customers, then the Total count includes all bookings across customers.
3. Given a booking status changes, then the affected summary counts update accordingly.

---

### PRD-FR-008 — Admin Booking Management

- **Priority:** Must
- **Feature:** FEAT-005
- **Persona:** PERSONA-002

**Requirement**

The system shall allow admins to view all bookings and update booking status to Pending, Confirmed, Completed, or Cancelled.

**Business Rationale**

Admins need to manage booking lifecycle states in the simulated operations workflow.

**Acceptance Criteria**

1. Given the admin opens the bookings list, then bookings across all mock customers are displayed.
2. Each admin booking row or card displays customer details, service, appointment date/time, problem description when provided, and current status.
3. Given the admin changes a booking status to Pending, Confirmed, Completed, or Cancelled, then the new status persists in localStorage.
4. Given a customer later views the affected booking, then the updated status is visible.

---

### PRD-FR-009 — localStorage Persistence and Seed Data

- **Priority:** Must
- **Feature:** FEAT-006
- **Persona:** PERSONA-001, PERSONA-002

**Requirement**

The system shall persist bookings in localStorage and load a small set of seeded sample bookings when localStorage is empty.

**Business Rationale**

The app must remain functional without backend infrastructure while supporting demo visibility for admin workflows.

**Acceptance Criteria**

1. Given a booking is created, when the page is refreshed in the same browser, then the booking remains available.
2. Given a booking status is updated, when the page is refreshed in the same browser, then the updated status remains available.
3. Given localStorage contains no QuickFix booking data, when the app initializes, then seeded sample bookings are available.
4. Given localStorage already contains QuickFix booking data, when the app initializes, then existing data is not overwritten by seed data.

---

### PRD-FR-010 — Responsive Interactive UI

- **Priority:** Must
- **Feature:** FEAT-007
- **Persona:** PERSONA-001, PERSONA-002

**Requirement**

The system shall provide working buttons, forms, booking operations, and dashboard interactions using React functional components and hooks.

**Business Rationale**

The product must be a functional MVP rather than static mockup screens.

**Acceptance Criteria**

1. Every visible primary button performs an observable action or navigates to the intended view.
2. Form submissions create validation errors or successful booking records based on input validity.
3. Dashboard status controls update booking data and related counts.
4. The interface uses responsive layouts that remain readable and usable on desktop and mobile viewport sizes.

## 9. Non-Functional Requirements

### PRD-NFR-001 — Frontend Architecture

- **Category:** Scalability
- **Priority:** Must

**Requirement**

The system shall be implemented using React functional components, hooks, reusable components, and responsive CSS.

**Acceptance Criteria**

1. Code review confirms page-level UI is composed from reusable React components rather than duplicated static screens.
2. Code review confirms stateful behavior uses React hooks.
3. Code review confirms styling supports desktop and mobile layouts without requiring separate codebases.

### PRD-NFR-002 — Accessibility Baseline

- **Category:** Accessibility
- **Priority:** Must

**Requirement**

The system shall support keyboard-operable forms and buttons, visible focus states, labels, semantic headings, and responsive readability.

**Acceptance Criteria**

1. A keyboard-only user can navigate role selection, booking submission, cancellation, and admin status update controls.
2. Form fields have visible labels or accessible labels.
3. Focus state is visible on interactive controls.
4. Page structure uses semantic headings in a logical order.

### PRD-NFR-003 — Browser-Only Privacy Boundary

- **Category:** Privacy
- **Priority:** Must

**Requirement**

The system shall store booking information only in browser localStorage and shall not transmit customer booking data to backend services.

**Acceptance Criteria**

1. Network inspection during booking creation shows no backend request carrying customer booking data.
2. Created bookings are retrievable from localStorage in the same browser.
3. Clearing browser localStorage removes QuickFix booking records from the app.

### PRD-NFR-004 — Availability in Supported Browser Session

- **Category:** Availability
- **Priority:** Should

**Requirement**

The system shall remain usable in a supported browser session without network access after the application assets have loaded.

**Acceptance Criteria**

1. Given the app assets are loaded, when the user creates or updates bookings, then local booking operations continue without backend connectivity.
2. Given localStorage is available, then booking creation, viewing, cancellation, and admin updates work in the same browser session.

## 10. User Journeys

### JOURNEY-001 — Customer Books a Home Service

1. The user selects Customer mode from the mock login.
2. The user browses the homepage service cards.
3. The user opens the booking form and selects a service.
4. The user enters name, phone, address, appointment date, appointment time, and optional problem description.
5. The user submits the form and receives a success message.
6. The booking appears in My Bookings with Pending status.

**Related Requirements:** PRD-FR-001, PRD-FR-002, PRD-FR-003, PRD-FR-004, PRD-FR-005, PRD-FR-009, PRD-NFR-001, PRD-NFR-002

### JOURNEY-002 — Customer Cancels an Eligible Booking

1. The user selects Customer mode from the mock login.
2. The user opens My Bookings.
3. The user identifies a Pending or Confirmed booking.
4. The user selects Cancel.
5. The booking status changes to Cancelled and remains visible after refresh.

**Related Requirements:** PRD-FR-001, PRD-FR-005, PRD-FR-006, PRD-FR-009, PRD-NFR-003

### JOURNEY-003 — Admin Updates Booking Status

1. The user selects Admin mode from the mock login.
2. The admin dashboard displays status counts across all bookings.
3. The admin reviews the bookings list.
4. The admin changes a booking status to Confirmed, Completed, Pending, or Cancelled.
5. The dashboard counts update and the change persists after refresh.

**Related Requirements:** PRD-FR-001, PRD-FR-007, PRD-FR-008, PRD-FR-009, PRD-NFR-001

## 11. Feature Breakdown

### FEAT-001 — Mock Role Selection

- **Summary:** Simple mock login that lets users choose Customer or Admin mode without real authentication.
- **Priority:** Must
- **Related Requirements:** PRD-FR-001
- **Expected Spec File:** `specs/FEAT-001-mock-role-selection.spec.md`

### FEAT-002 — Homepage Service Catalog

- **Summary:** Responsive homepage with navigation and four fixed service cards showing icons, descriptions, and prices.
- **Priority:** Must
- **Related Requirements:** PRD-FR-002, PRD-NFR-001, PRD-NFR-002
- **Expected Spec File:** `specs/FEAT-002-homepage-service-catalog.spec.md`

### FEAT-003 — Service Booking Form

- **Summary:** Booking form with service selection, customer details, appointment scheduling, optional description, validation, and messages.
- **Priority:** Must
- **Related Requirements:** PRD-FR-003, PRD-FR-004, PRD-FR-009, PRD-NFR-002, PRD-NFR-003
- **Expected Spec File:** `specs/FEAT-003-service-booking-form.spec.md`

### FEAT-004 — My Bookings

- **Summary:** Customer-specific booking list with details, status, empty state, and cancellation for eligible bookings.
- **Priority:** Must
- **Related Requirements:** PRD-FR-005, PRD-FR-006, PRD-FR-009, PRD-NFR-002
- **Expected Spec File:** `specs/FEAT-004-my-bookings.spec.md`

### FEAT-005 — Admin Dashboard

- **Summary:** Admin dashboard with all-booking visibility, status counts, and status update controls.
- **Priority:** Must
- **Related Requirements:** PRD-FR-007, PRD-FR-008, PRD-FR-009, PRD-NFR-001, PRD-NFR-002
- **Expected Spec File:** `specs/FEAT-005-admin-dashboard.spec.md`

### FEAT-006 — Local Persistence and Seed Data

- **Summary:** localStorage-based booking persistence with seeded sample bookings when no data exists.
- **Priority:** Must
- **Related Requirements:** PRD-FR-009, PRD-NFR-003, PRD-NFR-004
- **Expected Spec File:** `specs/FEAT-006-local-persistence-and-seed-data.spec.md`

### FEAT-007 — Responsive UI System

- **Summary:** Minimalist white-and-blue visual design, clean typography, reusable components, and responsive interaction patterns.
- **Priority:** Must
- **Related Requirements:** PRD-FR-010, PRD-NFR-001, PRD-NFR-002
- **Expected Spec File:** `specs/FEAT-007-responsive-ui-system.spec.md`

## 12. Constraints

- CON-001 — The application must be built using React functional components and hooks.
- CON-002 — The application must use localStorage persistence only; no backend or database is allowed.
- CON-003 — Real authentication is not allowed in v1; role selection is a mock simulation.
- CON-004 — The visual design must use a minimalist white background, blue accents, clean typography, and responsive desktop/mobile layout.
- CON-005 — All buttons, forms, booking operations, and dashboard interactions must work; static mockup screens are not acceptable.
- CON-006 — The company context is mid-market retail.
- CON-007 — Target release timing is TBD and the product is intended as a single MVP release.

## 13. Risks

| ID | Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|---|
| RISK-001 | localStorage is browser-specific, so users may expect cross-device persistence that v1 cannot provide. | Medium | Medium | Make v1 scope clear as a browser-only simulation and keep backend persistence out of scope. |
| RISK-002 | Mock role selection may be mistaken for real authentication or authorization. | Medium | Medium | Label the role experience as simulated and do not position it as secure access control. |
| RISK-003 | Customer personal information stored in localStorage may create privacy concerns in shared browsers. | High | Medium | Store data only locally, avoid network transmission, and document that clearing localStorage removes records. |
| RISK-004 | Service prices, descriptions, and icons are required but not finalized. | Medium | Medium | Track final catalog content as an open question before implementation acceptance. |
| RISK-005 | Seeded sample bookings may confuse users if not distinguished from user-created data. | Low | Medium | Use a small seed dataset only when localStorage is empty and ensure records behave like normal demo bookings. |

## 14. Open Questions

| ID | Question | Owner | Status | Decision/Due Date |
|---|---|---|---|---|
| OQ-001 | What are the final descriptions, prices, and icon choices for Plumbing, Electrician, AC Repair, and Home Cleaning? | Product Owner | Open | TBD |
| OQ-002 | What is the target release date for the single MVP release? | Product Owner | Open | TBD |
| OQ-003 | Who is the named Product Owner and Business Sponsor for approval? | Product Owner | Open | TBD |
| OQ-004 | What exact mock customer identities should be available in the role simulation? | Product Owner | Open | TBD |

## 15. Release and Rollout Considerations

- **Target Release:** TBD; single MVP release.
- **Rollout Approach:** Full MVP release for stakeholder review and acceptance testing.
- **Migration Considerations:** No backend or database migration is required; localStorage data may be cleared by browser users as needed.
- **Training/Support Considerations:** Users need minimal guidance on mock role selection, browser-only persistence, and the meaning of booking statuses.

## 16. Definition of Product Success

The product is successful when:

- Customers can complete a valid booking end-to-end with clear validation and confirmation.
- Customers can view their own bookings and cancel Pending or Confirmed bookings.
- Admins can view all bookings, see accurate status totals, and update statuses.
- The app persists booking data in localStorage and remains functional after browser refresh.
- The UI is responsive, accessible at the stated baseline, and visually aligned to the minimalist white-and-blue design direction.
- All Must-priority requirements are accepted.
- Required quality, security, and compliance outcomes are evidenced.

## 17. Approval

| Role | Name | Decision | Date |
|---|---|---|---|
| Product Owner | TBD | Pending | TBD |
| Business Sponsor | TBD | Pending | TBD |