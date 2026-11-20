# Report Downloads

How report queries become authenticated, server-generated downloads, including streamed CSV reports and Travel Desk PDF and CSV reports.

## Browser and API Responsibilities

Report controls express what to download through the report API’s URL builder: `where` narrows records (including selected IDs), `filters` applies report scopes, and `order` specifies the requested sort. [DownloadFileForm](/web/src/components/common/DownloadFileForm.vue) submits that URL as a native POST with the access token in the form body, not the URL. The browser handles CSV attachments and inline Travel Desk PDFs using the disposition and filename supplied by the API.

The API applies the caller’s policy scope before generating the report. It owns report formatting, CSV formula protection, and filenames. List pagination does not limit an export: it includes all authorized records matching the download query.

Flight reconciliation purchase dates use fixed UTC−07:00 year-round, independent of the browser and server time zones.

## Streaming CSV Reports

Flight reconciliation, flight statistics, and travel pre-approval CSV reports stream rows as they are generated.

Controllers dispatch supported formats and set attachment headers before handing the response stream to the report service. Services own policy-scoped data loading and serialization; the shared [CSV streaming client](/api/src/lib/csv-streaming-client.ts) owns CSV encoding, backpressure, and stream cleanup. It wraps `fast-csv` and writes the UTF-8 byte-order mark and headers before generating report rows, allowing a download to begin without buffering the complete report.

Pass the model returned by the report’s policy scope to the service. The service calls `findEach` on that model so every batch uses the caller’s visibility rules.

The services use batched iteration and await each row write to bound memory use. Stable ordering and a read-only repeatable-read transaction keep those batches consistent; the tradeoff is a database connection held until generation finishes. The streaming client allows up to one hour per transfer so large downloads can finish without letting a stalled reader hold a connection indefinitely. Generation failures and client disconnects also abort the transfer rather than appending JSON to a partial CSV.

Reports inherit the database’s statement timeout. On disconnect or deadline, the abort signal closes the report’s PostgreSQL connection. PostgreSQL 14 checks for client loss during query execution (`SET LOCAL client_connection_check_interval = '1s'`) and rolls back the disconnected transaction. Healthy downloads retain their connection; an aborted connection is discarded, not returned to another request.

## Travel Desk Download Contract

For Travel Desk PDF and CSV requests, the [download controller](/api/src/controllers/downloads/travel-desk-travel-requests-controller.ts) uses the standard controller query builders and applies the same policy scope as the request list. Unlike streamed CSV reports, these exports are generated before the controller sets download headers. No visible matches or a generation failure produces a `422` JSON response rather than a partial attachment.

With no rows selected, both download controls omit the `where[id]` filter and include every authorized match across list pages. Selecting rows restricts the download to those IDs. Both controls use the list's requested sort order, followed by unbooked-first and current-user-assignment-first tie-breakers, then a stable ID tie-breaker. They omit `page` and `perPage`; clearing the selection restores the all-results default.

Both formats use `Export, Travel Desk Requests, YYYY-MM-DD` filenames with the appropriate `.csv` or `.pdf` extension.

The [shared query decoder](/api/src/utils/enhanced-qs-decoder.ts) preserves indexed arrays of up to 1,000 values alongside other query options, with a limit of 1,500 parameters overall. Queries exceeding either limit are rejected instead of silently truncating values or changing an array into an object. Boolean and null decoding is unchanged.

## Data Loading and Generation

Controllers pass policy-scoped models and query options to the export services. The download namespace's unpaginated [IndexService](/api/src/services/downloads/travel-desk-travel-requests/index-service.ts) owns the required associations and serialization; exports do not run the list's total-count query.

The request index serializer determines requested services as `Flight`, `Hotel`, `Rental Car`, and `Transportation`; the table and report serializer share these labels. The table's status component owns translated labels and status indicators: a red flag for submitted requests, a yellow flag for ranked options, and a green checkmark for booked requests. Only submitted requests without an assigned officer display `Not Started`; other statuses remain unchanged.

The [template client](/api/src/templates/template-client.ts) uses the configured template root and WRAP's `{{ ... }}` interpolation. Its `htmlToPdf` method delegates to the reusable [PDF client](/api/src/lib/pdf-client.ts) through `pdfClient.htmlToPdf(htmlDocument, options)`. `PdfClient` owns Puppeteer configuration, rendering, and browser cleanup without Travel Desk dependencies. The [PDF service](/api/src/services/downloads/travel-desk-travel-requests/create-pdf-service.ts) owns report layout and PDF options, escaped local templates, and the embedded logo. The [CSV service](/api/src/services/downloads/travel-desk-travel-requests/create-csv-service.ts) uses `fast-csv`, a UTF-8 byte-order mark, and spreadsheet-formula neutralization.

Letter-landscape PDFs paginate one continuous table according to rendered row heights. Branding and column headings repeat on every page; rows stay together when they fit on a page. Column widths and text size remain fixed, with the print timestamp and page numbering in the footer.

## Runtime Packaging

Both [development](/api/development.Dockerfile) and [production](/Dockerfile) images use Node 24.22.2 LTS and pin Alpine Chromium **149.0.7827.53-r0**, exposed through `PUPPETEER_EXECUTABLE_PATH`. Puppeteer's bundled browser download is disabled. Puppeteer **25.1.0** targets Chrome for Testing **149.0.7827.22** according to its [supported-browser table](https://pptr.dev/supported-browsers); Alpine supplies a different patch in the same release family, not that exact tested binary.

The API compiles to CommonJS with TypeScript's `node16` module mode. That mode rejects a static import of Puppeteer 25's ESM API with `TS1479`, even though Node 24 can load this package with `require()`. `PdfClient` therefore uses native `import()` inside `htmlToPdf`, preserving Puppeteer's types without changing the application's module format.

The production build copies `src/templates` into `dist/templates`. When changing Node, Puppeteer, Chromium, or either image, rebuild both images and render the report template through `PdfClient` in each. Check installed versions, PDF content, repeated headings, pagination, and browser cleanup; a successful HTTP startup or mocked Puppeteer test does not establish browser compatibility.
