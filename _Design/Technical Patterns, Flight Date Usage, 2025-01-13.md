# Flight Date Values Usage Pattern

## Overview

This document clarifies the different date values used across travel desk components and their specific purposes.

## Date Value Types

### minDate/maxDate
- **Source**: Travel authorization `dateBackToWorkEstimate`/`dateBackToWorkActual` dates
- **Purpose**: Date picker validation boundaries
- **Usage**: Applied to date input fields as `:min` and `:max` attributes
- **Components**: Flight requests, other transportation, rental cars
- **Pattern**: Use return-to-work dates as logical travel period boundaries

### flightStart/flightEnd
- **Source**: Flight segments (first departure, last arrival)
- **Purpose**: Auto-population when "match flights" is selected
- **Usage**: Used in `matchWithFlight()` to set rental car pickup/drop-off dates
- **Components**: Rental cars only
- **Pattern**: Computed by sorting flight segments by `departAt`/`arriveAt`

## Key Differences

- **minDate/maxDate** are validation boundaries (could be broader than actual flight times)
- **flightStart/flightEnd** are exact flight times for auto-population
- Rental car components need both sets for different purposes

## Implementation Patterns

### For Validation Boundaries (min/max dates)
- **Source**: Travel authorization return-to-work dates
- **Usage**: Date picker constraints across all travel desk components
- **Pattern**: Use `dateBackToWorkEstimate`/`dateBackToWorkActual` as travel period boundaries
- **Components**: Flight requests, other transportation, rental cars

### For Flight Matching (flight start/end dates)
- **Source**: Travel segment departure and arrival dates/times
- **Usage**: Auto-population when users select "match flights" option
- **Pattern**: Find earliest departure and latest arrival from travel segments
- **Components**: Rental cars only

## Component Usage Patterns

### Flight Requests
- Uses `minDate/maxDate` from travel authorization return-to-work dates
- Does not use `flightStart/flightEnd`

### Other Transportation
- Uses `minDate/maxDate` from travel authorization return-to-work dates
- Does not use `flightStart/flightEnd`

### Rental Cars
- Should use `minDate/maxDate` from travel authorization return-to-work dates for validation
- Uses `flightStart/flightEnd` from travel segments for auto-population
- Currently has inconsistent implementation that needs fixing

## Future Improvements

1. **Standardize rental car components** to compute dates internally like other components
2. **Consider denormalization** of flight dates onto travel desk travel requests for performance
3. **Remove prop drilling** of flight dates in rental car components
