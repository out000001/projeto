# Persistent portal workflows

Managers create and publish projects, manage participants, record hours, homologate frequency, plan milestones and review reports. Students enroll (or join the waitlist), view their own tracking and submit their own reports. Managers link existing student accounts using their registered email. Every mutation is checked by the server against the Firebase ID token and the trusted users profile. Revision conflicts return 409 and require reloading.

Private Firestore collections: submissions, _tracking (with audit events), _projectFiles, _enrollments, _partnerships and _partnershipLimits. The browser reads only public projects and its own users document. All private operations use Vercel API handlers and Firebase Admin. The new collections fall under the existing default-deny rules; no permissive client rules are needed. Files are validated, sealed after submission and downloaded through authorized APIs.

Enrollment and cancellation update seats transactionally. Republishing preserves occupied seats. Tracking starts from the actual submission, without fabricated hours, dates, people or beneficiaries. Managers set actual tracking values in the overview. Proposal audience and vacancies remain estimates and are labeled accordingly. Budget execution is not an accounting integration. Committee deadlines have no generated placeholder entries.

Account preferences persist in Firestore; density and idle logout affect the UI. Notices appear inside the portal; no automatic email service is configured. Password recovery uses Firebase Authentication. The tracking summary is a text export and explicitly does not replace a signed institutional declaration. Partnerships are persisted in the manager inbox.

## Verification

- Frontend: 193 tests across 18 files, lint and production build.
- Root API: 11 unit tests.
- Firestore emulator integration: role enforcement, concurrent seat updates, waitlist, privacy, hours persistence, revision conflicts, reapproval, report attachments and review, account settings, partnership idempotency and direct-access denial.
- Chromium plus actual API handlers and Firestore emulator: enrollment, linked account, saved hours after reload, homologation, private report upload/download/review, preferences, restricted student routes, partnership inbox and idle logout. Authentication identities are substituted only for the tests.
- Production read-only check: public catalogue returns 200; unauthenticated access to users and every private collection above returns 403. This does not certify all authenticated production flows; no production user credentials are used by the test runner.

## Installed skills and dependency review

25 Addy Osmani skills are installed at project scope in .agents. The source commit and license are recorded there. The folder is excluded from Vercel artifacts.

Dependency audit on 2026-11-05: production root Admin SDK dependencies have no high or critical findings (8 moderate). The existing frontend lockfile includes high/critical findings in Firebase Node transport, local Express tooling, build dependencies and test workers (grpc-js, body-parser, brace-expansion, source-map-js, tinypool, Vitest and Vite). The deployed frontend is static and does not run the local Express, Vite or Vitest servers; Firebase browser transport differs from Node gRPC. Avoid exposing development/test servers. Dependency upgrades are deferred to a separate reviewed compatibility update; review by 2026-11-12. No force upgrade was applied.
