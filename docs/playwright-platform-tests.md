# Playwright platform suite

Run from the repository root with the app dependencies and Playwright Chromium installed:

```sh
XDG_CONFIG_HOME=/tmp/portal-firebase-config CI=true PLAYWRIGHT_BROWSERS_PATH=/workspace/.browser-cache \
  stitch_portal_de_extens_o_unicap/portal_de_extens_o_unicap/node_modules/.bin/firebase emulators:exec \
  --config stitch_portal_de_extens_o_unicap/portal_de_extens_o_unicap/firebase.json \
  --only auth,firestore --project demo-portal-unicap \
  'node stitch_portal_de_extens_o_unicap/portal_de_extens_o_unicap/node_modules/@playwright/test/cli.js test --config server/playwright.config.cjs'
python3 server/generate-playwright-report.py
```

The config starts/reuses local Vite on 5173. Authenticated cases run serially with actual Firebase SDK authentication, emulator users/tokens, Admin SDK APIs on 3003 and enforced Firestore rules. Browser interception changes only Firebase connection config and API host; authentication/session/database functions remain actual SDK code. The suite refuses to run write flows without both emulators. It clears demo collections and emulator users before/after the run. Never point it at a shared emulator with data you want to keep.

Production cases are read-only: public page/registration visibility, anonymous route guards and unauthorized API responses. The layout scenario calls the separate regression harness with substituted test identities, 125 layout cases and idle logout. Independent production checks run even if the local serial story fails. Dependent local steps are skipped on a preceding failure, rather than reporting them as passed. No automatic retries are enabled.

Outputs: `reports/playwright/results.json`, `html/`, screenshots, `layout-results.json` and generated PDF. Reports contain fictional test identities, not real production credentials or user data. The manager registration key in the fixture is emulator-only.

A real regression found while preparing this suite: the tracking configuration details panel collapsed as its unsaved values became valid. `TrackingOverview` now determines completed setup from saved state, allowing all remaining fields to be filled and submitted. Scenario 12 and a targeted component test guard this behavior.

Chromium only; native mobile/Safari/Firefox, load testing and production authenticated writes are outside this suite. Refer to the generated PDF for the exact executed outcomes.
