# User Stories, Expense Claim Submission, 2025-07-10

> Source: https://github.com/icefoganalytics/travel-authorization/issues/308#issuecomment-3057997108

## Expense Claim Entry and Submission Workflow

### Business Rules

1. **Expense Entry Availability**: A traveler can begin entering expenses as soon as travel starts. They can continue to do this until they have submitted the expense claim.

2. **Expense Claim Submission Restriction**: An expense claim can only be submitted once travel has been completed.

3. **Travel Times Confirmation Requirement**: Prior to submission of an expense claim, a confirmation of travel times must be completed. A user must have both a date and time entered at this point. These dates/times need to be reflected in the perdiem amounts.

### User Stories

#### 1. Expense Entry During Travel

1. As a traveler I want to be able to enter my expenses as soon as my travel begins so that I can record expenses while they are fresh in my mind.

2. As a traveler I want to continue adding expenses throughout my travel period so that I can capture all expenses as they occur.

3. As a traveler I want to save my expense entries in draft form so that I can come back and complete them later.

#### 2. Travel Time Confirmation

1. As a traveler I want to confirm my actual travel departure and return times so that my perdiem amounts are calculated accurately.

2. As a traveler I must enter both the date and time for my travel times so that the system can properly calculate my perdiem entitlements.

3. As a traveler I want changes to my travel times to automatically update my perdiem amounts so that my expense claim reflects accurate calculations.

#### 3. Expense Claim Submission

1. As a traveler I want to be prevented from submitting my expense claim before my travel is complete so that I do not accidentally submit an incomplete claim.

2. As a traveler I want to see a clear indication of why I cannot submit my expense claim if my travel is not yet complete so that I understand what conditions need to be met.

3. As a traveler I want the submit button to become available once my travel end date has passed so that I can submit my completed expense claim.

### PreConditions

- Travel Authorization is approved
- Travel has started (for expense entry)
- Travel has completed (for expense submission)
- Travel times (date and time) are confirmed (for expense submission)

### PostConditions

- Expense claim is submitted for review
- Perdiem amounts reflect the confirmed travel times
