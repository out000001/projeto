# Responsive layout review — 2026-11-05

Skill: [Jakub Krehel better-layout](https://github.com/jakubkrehel/skills/blob/main/skills/better-layout/SKILL.md), including spacing-and-adaptivity recipes. Scope: authentication, public catalogue/details, manager dashboard, project discovery, five tracking sections, settings, six submission steps and account dialogs.

## Hold structure until it breaks

Paths below are relative to `stitch_portal_de_extens_o_unicap/portal_de_extens_o_unicap/src`.

| Severity | Location | Before | After | Why |
| --- | --- | --- | --- | --- |
| HIGH | `components/layout/AppLayout.jsx:66` | Navigation links exceeded the available width with enlarged text; narrow navigation hid links off a scroll edge | Wrapping navigation, with the full-width secondary row below the desktop threshold | Keep every navigation action reachable |
| HIGH | `modules/manager-dashboard/ManagerDashboard.jsx` pagination; `components/KpiCards.jsx` | Pagination escaped at 320px; icon-font fallback text widened KPI cards | Wrap pagination and use bounded local SVG icons | Prevent off-screen actions and overflow when external fonts fail |
| HIGH | `modules/project-submission/ProjectSubmission.jsx:169`; `components/Stepper.jsx:6` | Continue button overflowed at 320/390px; six-step row overflowed with enlarged text | Wrap action groups and adapt steps to one, three or six columns | Keep all form actions inside the content area |
| HIGH | `modules/public/PublicLanding.jsx` | Hero actions were clipped by its outer container with 200% text; results heading was squeezed by sorting controls | Stack controls until sufficient width, allow wrapping and shrink the search field | Hidden overflow is not a responsive fix |

## Hint at hidden content and plan for growth

| Severity | Location | Before | After | Why |
| --- | --- | --- | --- | --- |
| HIGH | `modules/public/components/ProjectDetailModal.jsx:72` | Inscrever-se was visibly cut off at 320px even though the document had no horizontal overflow | Wrap the availability text and action group | A primary action must remain fully visible |
| MEDIUM | `components/ui/Modal.jsx:55`; `index.css` | Modal used a fixed viewport-height cap and hidden overflow | Use a dynamic viewport cap and scrollable panel; prevent children from shrinking into clipped content | Adapt dialogs to growing content and reduced viewport height |
| MEDIUM | `components/layout/AppLayout.jsx:38`; `index.css` | Sticky header had no matching scroll inset | Measure header height and set scroll-padding-block-start | Keep focused/scrolled content clear of sticky chrome |
| MEDIUM | Login, submission and dashboard icon locations | Unavailable external icon font displayed long words inside small icon boxes | Reuse local SVG icons | Stabilize icon geometry without hiding fallback text |

## Registration follow-up

Password and confirmation fields have independent show/hide controls, accessible names and pressed states. Both start masked, retain entered values when toggled and use type=button so checking a password does not submit registration. Input reserves space for the controls. Tested with keyboard activation and in the narrow/enlarged-text registration layout.

## Verification and limits

- 211 frontend tests passed; relevant authentication, submission and routing tests rerun after the final icon changes (42 tests). Lint and production build pass.
- 125 browser layout cases across 20 views/states: core views at 320, 390, 768, 1024 and 1440 CSS pixels; all submission steps and dialogs at selected narrow/medium/wide widths; 200% root text sizing at 720px; and a 320px RTL reflow check.
- Checks cover document overflow, controls clipped by ancestors, squeezed headings and elements outside the viewport except intentionally scrollable tables. Representative desktop/mobile/modal screenshots were visually inspected. Legitimate horizontal scrolling remains inside wide data tables.
- Chromium exercises actual API handlers and emulated Firestore, with test identities. No production data is created or modified by the review.
- Reproduce with the Vite dev server running: `PORTAL_LAYOUT_AUDIT=1 ... firebase emulators:exec ... 'node server/workflows.browser.mjs'`; run `server/layout-public.browser.mjs` for anonymous authentication views. Reports and screenshots go to `/tmp/portal-layout-audit`.
- Not verified: physical iPhone/Android keyboard and safe areas, Safari, screen-reader behavior, native browser-menu zoom, full German/pseudo-localization and semantic RTL translation. The 200% case is text enlargement, not a claim of native browser zoom testing.

Approve for the inspected layout states. No HIGH findings remain in that coverage.
