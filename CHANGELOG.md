# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

Changes planned for the next release, since v2025.9.15.1.

### Added

- Selecting a city now fills in the province on Travel Desk traveller forms, while keeping it editable.
- Flight statistics reports show flight volumes and durations in tables and graphs, with printing and CSV export.
- Flight statistics synchronization shows progress and reports failures.
- Finance users can review and update flight reconciliations for their department without system-administrator access.
- A separate local TravelPort booking-feed simulator and read-only source lookup support booking integration development without production or VPN access. The shared integration entry point requires TravelPort database settings.

### Changed

- Frontend lint now checks standalone CSS and Vue style blocks for CSS errors alongside existing script and template checks.
- Booking-history refreshes remove only events missing from a successful source scan. Reappearing events create new local records while deleted records and saved invoices remain unchanged. Failed refreshes leave the previous local history intact.
- Travel approval confirmations include the meeting or conference description and show the request's final destination when available. Approval and denial failures identify which action failed. Both dialogs synchronize their open state with the URL without clearing other query parameters.
- Travel Desk request lists, PDF reports, and CSV exports show consistent services and statuses. Server-generated downloads apply the same filters and permissions as the request list and include every matching authorized request, including selections larger than twenty requests. Query filters are preserved within the supported limits; oversized queries are rejected instead of silently truncated. Unavailable selections return the same error response as failed downloads.
- Travel Desk reports and CSV exports include all matching requests by default, across list pages. Select requests to download only that subset. Downloads preserve the list's booking and officer-assignment ordering when sort values tie. Loading indicators appear only while preparing a file.
- Travel Desk PDF reports use available page space without shrinking text. Report and column headings repeat on each page.
- Report filters use autocomplete selections and show how many filters are active. Filter selections are saved in the URL for bookmarking and sharing.
- Reports have separate table, graph, and print views. Flight statistics tables load and sort one page at a time.
- User administration includes a mailcode field and updated user search and editing controls.
- Estimate, meal, and coding tables support server-side paging and sorting. Estimates load with the default ordering and can be sorted by expense type. Table and claim totals include all matching records, not just the displayed page. Meal dates and meal/coding amounts use the application's standard display formats.
- Developer improvements: rental-car schedule presentation can be maintained consistently across new and existing requests.
- Developer improvements: retired the legacy travel-authorization module in favor of typed components and pages without changing workflows.
- Developer improvements: isolated checkout service and database routes, explicit PostgreSQL data transfers between worktrees, correct-checkout editor access with gem-owned Docker defaults that survives readiness-based startup, and warning-free Ruby wrapper startup with explicitly bundled help dependencies. Updated test tooling and contributor guidance; removed unused components and dependencies. Web tests share plugin setup, HTTP and authentication mocks, and component cleanup following WRAP's conventions. Agent guidance now loads verified shared workflow sources before local overlays while preserving TravelAuth's contracts and development commands.
- Requested PR screenshots follow the shared agent-operated capture/upload workflow while preserving existing images, TravelAuth captions and app routes, and optional screenshot placeholders.
- Contributor guidance links the shared worktree workflow and documents TravelAuth's worktree naming and Docker commands.
- API and web lint run through non-fixing Docker commands usable by OMP Verifier, using the normal shared development gateway. API lint covers historical migrations without changing database operations; web lint no longer builds unused TypeScript programs. The API no longer installs unused OpenID Connect middleware.
- PR testing guidance separates reviewer-facing QA scenarios from local developer setup, following WRAP and the shared workflow.
- Development, test, and production containers use pinned Node 24 LTS, with aligned Sequelize dependencies for Factory Shark qualification and a matched Puppeteer/Chromium release family for PDF reports.
- API test factories use Factory Shark for Sequelize fixtures, lists, request attributes, parent relationships, and eager loading without local persistence or reload helpers. TravCom city fixtures preserve the external database's keyless schema.

### Fixed

- Rental-car requests match flight dates and times on both new and edit forms. Matched fields remain readable and show a lock icon. Turning matching off restores the previous manual schedule, or blank dates and noon times for a new request without manual entries. New requests default the pick-up city to the trip destination, while incomplete flight schedules leave fields editable with normal field-level validation.
- Read-only date fields no longer open the calendar picker when clicked, while preserving caller-supplied menu options.
- Expense prefill excludes airfare while preserving other eligible expenses; flight estimates remain unchanged.
- Travel Requests supports saved drafts, validated submissions, owner-only options review, and read-only itinerary viewing through the current forms. Its layout matches Travel Pre-Approvals and uses breadcrumbs for return navigation. Sortable columns, including traveller, purpose, dates, and Travel Desk status, order the full authorized result set before pagination, with sorting and pagination retained in bookmarks; Locations remains display-only. Double-click a row to open its request; rows without a request have no navigation or action. Administrators and supervisors retain question management. Non-system-admin users list only their own requests.
- Owners can complete Travel Desk options review for requests without flights once all review data has loaded.
- Travel Desk API responses use explicit fields without permission-check association data. Workflow actions return the same request details and passenger-document availability as request viewing.
- Travel Desk staff can follow **Review Traveller Rankings** from booking review to the existing flight requests, then use **View Options and Rankings** to see saved preferences and rejection explanations.
- Flight options are paginated separately for each leg, with five options per page by default. Page selections survive refresh, controls remain visible for single-page and empty results, and navigation fits phone-width screens.
- Starting a new travel request preserves entered trip details and estimated trip segments.
- Multi-city and one-way trip details appear correctly on initial load; one-way trips calculate days on non-travel status correctly.
- Refreshing the approvals card shows updated request data, and the **Submit to** supervisor email selection is saved correctly.
- User email and department selectors retain and display selections correctly.
- Flight statistics use corrected date and duration calculations. Graphs refresh when filters change, and removing the last sub-location filter no longer causes a rendering error.
- The date-range picker waits for a complete selection before applying it.
- TravCom date fields are read correctly after the database-library upgrade.

## [v2025.9.15.1] - 2025-09-15

### Note

- Initial upstream release tracked in this changelog.
  Earlier history is available in the upstream repository.
