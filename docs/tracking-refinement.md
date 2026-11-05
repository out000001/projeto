# Tracking: interface and delivery corrections

| Before | After | Why |
| --- | --- | --- |
| Sparse project header | Actual edital, vigência, coordinator, center and ODS | Restore project context without demonstration values |
| Overview dominated by inputs | Approved-hours progress per participant and monthly homologation, with collapsible configuration | Prioritize monitoring over configuration |
| Current month could be outside project dates | Clamp selection to vigência and reset selection per project | Avoid empty invalid months and rejected saves |
| Planned reports invisible to students | Members see only shared pending delivery metadata and their own submitted reports | Enable linked submissions while keeping others’ reports private |
| Student submission created an unrelated record | Selected delivery is updated atomically with revision checking | Resolve the original pending delivery without duplication |
| Empty configuration looked like zero activity | Explicit setup guidance and unavailable metrics | Distinguish missing setup from actual zero values |
| Chronology was a plain list | Dated timeline with written statuses | Make sequencing visible without relying on color alone |

Project deliveries are shared by the team: one submission resolves one planned delivery. A second student cannot overwrite the first student’s report or read its private contents. Inactive members retain historical read access but cannot submit reports. Progress measures approved hours for active participants; registered hours remain separately visible. Historical monthly summaries use current membership, not a dated membership ledger.

## Design skills applied

- Emil Kowalski: [design engineering](https://github.com/emilkowalski/skills/blob/main/skills/emil-design-eng/SKILL.md) and [animation decisions](https://github.com/emilkowalski/skills/blob/main/skills/animate/SKILL.md). Stable data displays; no decorative motion or new dependency.
- Jakub Krehel: [accessibility](https://github.com/jakubkrehel/skills/blob/main/skills/better-accessibility/SKILL.md) and [typography](https://github.com/jakubkrehel/skills/blob/main/skills/better-typography/SKILL.md). Native controls, keyboard activation, text with status colors, named progress bars and tabular figures.
- MengTo: [warm minimal surfaces](https://github.com/MengTo/Skills/blob/main/agent-skills/web-design/clean-minimal-beige-light-mode/SKILL.md), [neutral shadows](https://github.com/MengTo/Skills/blob/main/agent-skills/web-design/beautiful-shadows/SKILL.md) and [design quality gate](https://github.com/MengTo/Skills/blob/main/agent-skills/ui/no-ai-design-slop/SKILL.md). Reuse existing Card and Button styles, keep institutional wine accent, inspect rendered desktop/mobile layouts.
- Addy Osmani: installed [frontend UI engineering](../.agents/skills/frontend-ui-engineering/SKILL.md), with the established API integration and browser verification workflow.

## Verification

30 targeted tracking tests, lint and production build. Firestore emulator verifies the pending delivery is visible, its submission preserves the delivery ID without duplicates, other students cannot overwrite or download its contents, and manager review updates the pending count. Chromium exercises actual handlers with emulated Firestore, submission through the delivery selector, persistence after reload, review and attachment download. Rendered desktop and 320px layouts are inspected; screenshots use emulator fixtures only. No production user data or Firebase rules are modified by this refinement. Physical screen-reader and Safari/iPhone checks are not included.
