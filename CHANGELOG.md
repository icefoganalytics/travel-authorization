# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

Changes planned for the next release, since v2025.9.15.1.

### Added

- Flight statistics reports show flight volumes and durations in tables and graphs, with printing and CSV export.
- Flight statistics synchronization shows progress and reports failures.
- Finance users can review and update flight reconciliations for their department without system-administrator access.

### Changed

- Report filters use autocomplete selections and show how many filters are active. Filter selections are saved in the URL for bookmarking and sharing.
- Reports have separate table, graph, and print views. Flight statistics tables load and sort one page at a time.
- User administration includes a mailcode field and updated user search and editing controls.
- Developer improvements: isolated checkout service and database routes, correct-checkout editor access with gem-owned Docker defaults that survives readiness-based startup, and quieter RubyGems startup. Updated test tooling and contributor guidance; removed unused components and dependencies.

### Fixed

- Travel Desk request lists, printed reports, and CSV exports show consistent services and statuses. Printing and exporting include every selected request rather than only the first page.
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
