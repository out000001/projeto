# Finding projects for tracking

`/tracking` now opens a searchable project catalogue. Direct links with `?id=...` still open a specific project. Search matches title, coordinator and stored project ID, ignoring accents and case. Filters use actual center, grant and status values. Results are alphabetized and paginated in groups of ten. URL parameters retain filters and page when opening a project or returning to the list. “Trocar projeto” opens the same search within tracking, with keyboard focus in the search field.

The API returns allowlisted project summaries, saved vigência dates and counts of pending deliveries/reports awaiting review. Students receive only linked projects and counts derived from reports visible to their own account, without other students’ report content. Managers receive all project summaries. Firestore reads use field projections and batches of 200 references. Saving an individual record updates the cached summary without rereading the full catalogue. Search and pagination currently run over the loaded summaries in the browser; this is not a server-side full-text index or cursor-paginated database search.

## Comparison with the original hypothetical example

| Before | After | Why |
| --- | --- | --- |
| One hard-coded project and months | Searchable catalogue, real metadata and saved vigência | Find a specific project as the catalogue grows |
| “Select all” in the demonstration frequency table | Select all saved eligible records, excluding inactive people, unsaved edits and hours outside approval limits | Preserve useful batch work with real server validation |
| Fixed pending counts and prefilled reports | Live pending delivery and review counts on project summaries | Find work requiring attention without opening every project |
| Student progress and monthly completion charts | Retained charts calculated from saved homologations | Keep the useful overview restored in the previous change |
| Demonstration milestones | Retained editable timeline with saved dates and written statuses | Preserve chronological context |
| Mock cobrança, financial dispatch and PDF declarations | No simulated external action; actual CSV/text exports retain honest labels | Avoid confirming an action that did not happen |

Design follows the existing Emil Kowalski interaction, Jakub Krehel accessibility/typography, MengTo surface and shadow guidance, and Addy Osmani frontend/API verification workflows. Native controls, named actions, visible focus, persistent error states and 320px layouts are retained.

## Validation

42 tracking tests cover filtering across pages, accent-insensitive search, combined filters, stale pagination, retry/focus, no automatic first-project selection, URL retention, stale-response suppression, cached count updates and bulk approval. Firestore emulator integration checks metadata privacy, actual dates/counts, empty unlinked student lists and denied anonymous access. Chromium exercises 23 emulator-only projects, pagination, searching for projects outside the first page, quick switching, returning to results and continued report/frequency workflows. Desktop and 320px screenshots are inspected. No fixture records are written to production.
