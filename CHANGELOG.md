# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

Changes since v2025.9.15.1 that will be included in the next release.

### Added

- Flight statistics reporting feature that introduces a new flight statistics data model and synchronization process, including a background job with progress and failure tracking.
  Why? To give administrators and finance staff a reliable, self-service view of flight volumes, durations, and patterns for reconciliation and planning.

- New flight statistics reports experience, including graphs, tables, print-friendly views, and comma-separated values export, all backed by new front-end application programming interfaces.
  Why? To make flight reporting usable day-to-day, not just as a low-level data dump.

- Finance user role and access improvements, including a dedicated finance user type, better user search and editing tools, a mailcode field on the user edit page, and department-scoped permissions for finance users to view and update flight reconciliations.
  Why? To give finance teams the access they need to review and reconcile travel data without granting full system administrator privileges.

### Changed

- Standardized the reports page into a clearer layout with separate sections and tabs for tables, graphs, and print views, including a dedicated flight statistics table with server-side pagination and ordering.
  Why? To keep reports responsive as data grows and to make the structure of reports easier to understand.

- Improved reports filtering and navigation by switching to autocomplete-based filters, storing filter state in the browser uniform resource locator query string, showing the number of active filters, and persisting filter panel state.
  Why? To make it easier for users to apply, understand, and share complex filter combinations.

- Refined the flight statistics user interface by simplifying graphs card logic and styling, standardizing components to script setup with TypeScript, cleaning up print dialog behavior, and polishing details such as breadcrumbs and tab switch animations.
  Why? To make the new feature feel consistent with the rest of the application and reduce cognitive load.

- Improved user administration and mailcode handling by reworking the user edit page in script setup with TypeScript, adding explicit warnings about the department field acting as mailcode, and aligning related user tools with current patterns.
  Why? To improve data quality and make it clearer how department and mailcode values are used.

- TravCom integration and test data improvements, with more clearly separated test and development databases, dedicated cleanup helpers, and updated seed data.
  Why? To keep the integration stable while making it easier to iterate in development and testing.

- Developer and tooling improvements, including upgrades to key Vue components, the application shell, the router, and composables to TypeScript patterns, updates to the pull request helper script, and expanded `AGENTS.md` guidance.
  Why? To align the codebase with current patterns and make contributor workflows more consistent.

### Fixed

- Travel request and approvals behavior:

  - Fixed multi-city and one-way trip attributes not bubbling correctly on initial load.
  - Corrected the calculation of days on non-travel status for one-way trips.
  - Fixed refresh behavior on the approvals card so updated data is shown.
  - Ensured the "Submit to" supervisor email field saves correctly.
    Why? To ensure supervisors and approvers see accurate travel details and email routing.

- User and lookup components:

  - Fixed issues in the user email searchable combobox and user chip components so they behave correctly with TypeScript imports.
  - Corrected department autocomplete behavior so changes bubble up reliably.
    Why? To make it more reliable to select and edit users and departments throughout the application.

- Flight statistics and reporting reliability:

  - Fixed several flight statistics date handling issues, including duration calculations and aggregate date handling.
  - Corrected chart refresh behavior so graphs update when filters change.
  - Resolved edge cases in location filters and sub-location chip removal.
  - Ensured the flight statistics job failure state is tracked and displayed, and that failed jobs no longer crash the application.
    Why? To make flight reporting trustworthy and robust under real-world data conditions.

- Dialogs and supporting views:

  - Fixed a bug in the date range picker dialog where it emitted input before the range was fully selected.
  - Resolved type errors in the flight statistics jobs modal and expense edit and delete dialogs.
  - Cleaned up report print components and related templates to reduce runtime errors and layout issues.
    Why? To reduce confusing user interface errors and provide a smoother editing and reporting experience.

- Data and integration reliability:
  - Corrected Microsoft SQL Server datetime type handling so it works properly with the current Object-Relational Mapper version.
  - Fixed TravCom model definitions and factories now that primary keys are required.
  - Added documentation notes about current TravCom integration limitations and expected data formats.
    Why? To keep integrations healthy after upgrades and make their constraints more explicit.

### Removed

- Legacy statistics and reporting infrastructure:

  - Removed the legacy statistics record table and related statistics progress table after migrating data into the new flight statistics and flight statistics jobs schema.
  - Removed legacy TravCom statistics endpoints and the legacy reports store now that the new flight statistics reporting flow is in place.
    Why? To reduce duplication and keep statistics logic centered on the new reporting model.

- Unused front-end components and dependencies:
  - Removed unused mapping and notification components.
  - Removed the now-unused mapping library dependency.
  - Cleaned up obsolete report alert messaging.
    Why? To simplify the front-end bundle and reduce maintenance for components that are no longer used.

## [v2025.9.15.1] - 2025-09-15

### Note

- Initial upstream release tracked in this changelog.
  Earlier history is available in the upstream repository.
