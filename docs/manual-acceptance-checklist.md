# QuickFix Manual Acceptance Checklist

Use this checklist for browser evidence before accepting a release candidate.
Run the app locally in a desktop browser with DevTools available, and capture
screenshots or notes for every completed item.

## Setup

- Start from a clean browser profile or open DevTools, go to Application >
  Local Storage, and remove `localStorage.quickfix.bookings.v1`.
- Load `/` and confirm the QuickFix app renders without a backend service,
  login provider, payment provider, analytics tag, or notification service.
- Open DevTools Network before exercising the flows. Preserve the log so the
  no-network booking-data checks can be reviewed.

## Customer Books a Home Service

- Select the Customer role and a mock customer.
- Navigate to `/book` from the customer experience or select a service card
  from `/` and confirm the matching service is preselected.
- Submit the booking form empty and confirm required-field errors are shown.
- Complete the form with a service, customer name, phone, address, appointment
  date, appointment time, and optional problem description.
- Submit the form and confirm the success message says the booking was created
  with Pending status.
- Navigate to `/my-bookings` and confirm the new booking appears with the
  expected service, customer details, appointment details, description, and
  Pending status.
- In DevTools Application > Local Storage, confirm
  `localStorage.quickfix.bookings.v1` contains the new booking data.
- In DevTools Network, confirm the create-booking action did not send customer
  booking data over Fetch/XHR, WebSocket, beacon, analytics, or API requests.
  Loading local static app assets is acceptable.

## Customer Cancels an Eligible Booking

- Use a customer booking with Pending or Confirmed status.
- Navigate to `/my-bookings` as the same mock customer.
- Select Cancel booking on the eligible booking.
- Confirm the success message identifies the cancelled service booking.
- Confirm the booking card now shows Cancelled status and no longer presents a
  cancel action for that booking.
- Refresh the page and confirm the Cancelled status persists from
  `localStorage.quickfix.bookings.v1`.
- In DevTools Network, confirm the cancellation did not send customer booking
  data over Fetch/XHR, WebSocket, beacon, analytics, or API requests.

## Admin Updates Booking Status

- Switch to the Admin role and navigate to `/admin`.
- Confirm the admin dashboard shows local booking stats and the booking
  operations table.
- Locate a booking created during manual testing or from seeded local data.
- Use the status selector to change the booking to Confirmed, Completed, or
  another valid lifecycle status.
- Confirm the inline success message states the service booking was set to the
  selected status.
- Refresh `/admin` and confirm the updated status persists.
- Switch back to the matching Customer role and mock customer, open
  `/my-bookings`, and confirm the customer-facing booking card shows the same
  updated status.
- In DevTools Network, confirm the status update did not send booking data over
  Fetch/XHR, WebSocket, beacon, analytics, or API requests.

## Browser-Only Persistence Checks

- Confirm all booking create, cancel, and status-update evidence is stored under
  `localStorage.quickfix.bookings.v1`.
- Confirm booking data is not present in cookies, session storage, IndexedDB, or
  any backend database.
- Confirm the app remains usable after a browser refresh and restores bookings
  from localStorage only.
- Remove `localStorage.quickfix.bookings.v1`, refresh the app, and confirm
  previously created manual-test bookings are gone. Seed/demo bookings may be
  recreated by the app when the key is absent, but customer-entered manual data
  must not remain.
- Clear all localStorage for the origin, refresh, and confirm the app returns to
  its initial local-only state without requiring a network API.

## Evidence to Attach

- Screenshot of the successful booking creation message.
- Screenshot of the created booking in My bookings.
- Screenshot of the cancellation result and Cancelled status.
- Screenshot of the admin status update result.
- Screenshot or copied value showing `localStorage.quickfix.bookings.v1` after
  booking changes.
- Screenshot of the Network panel showing no booking-data API, analytics,
  beacon, WebSocket, or third-party requests during booking mutations.
