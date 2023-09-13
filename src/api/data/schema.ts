import * as knex from "knex";

exports.up = function (knex: knex.Knex, Promise: any) {
  knex.schema.createTable('knex_migrations', (table) => {
    table.integer('id').notNullable().primary()
    table.integer('batch')
    table.text('migration_time')
    table.text('name')
  });
  
  knex.schema.createTable('knex_migrations_lock', (table) => {
    table.integer('index').notNullable().primary()
    table.integer('is_locked')
  });
  
  knex.schema.createTable('departments', (table) => {
    table.integer('id').notNullable().primary()
    table.integer('ownedBy').notNullable()
    table.text('name').notNullable()
    table.text('type').notNullable()
  });
  
  knex.schema.createTable('destinations', (table) => {
    table.integer('id').notNullable().primary()
    table.text('province').notNullable()
    table.text('city').notNullable()
  });
  
  knex.schema.createTable('expenses', (table) => {
    table.text('date')
    table.text('receiptImage')
    table.integer('fileSize')
    table.integer('id').notNullable().primary()
    table.text('cost').notNullable()
    table.integer('taid').notNullable()
    table.text('fileName')
    table.text('description').notNullable()
    table.text('currency').notNullable()
    table.text('type').notNullable()
  });
  
  knex.schema.createTable('stops', (table) => {
    table.integer('id').notNullable().primary()
    table.integer('taid').notNullable()
    table.integer('locationId')
    table.text('departureDate')
    table.text('departureTime')
    table.text('transport')
  });
  
  knex.schema.createTable('tripReports', (table) => {
    table.integer('id').notNullable().primary()
    table.integer('taid').notNullable()
    table.text('costDifferenceExplanation')
    table.text('skillsGained')
    table.text('applicationTimeframe')
    table.text('benefitsToUnit')
    table.text('benefitsToYG')
    table.text('futureRecommendations')
    table.text('reportStatus')
  });
  
  knex.schema.createTable('auditHistory', (table) => {
    table.integer('id').notNullable().primary()
    table.text('timestamp')
    table.text('userId')
    table.text('taid')
    table.text('action')
    table.text('note')
  });
  
  knex.schema.createTable('emailList', (table) => {
    table.integer('id').notNullable().primary()
    table.text('email').notNullable()
  });
  
  knex.schema.createTable('preapprovedTravelers', (table) => {
    table.integer('travelerID').notNullable().primary()
    table.integer('preTID').notNullable()
    table.text('fullName').notNullable()
    table.text('department').notNullable()
    table.text('branch')
  });
  
  knex.schema.createTable('travelPurpose', (table) => {
    table.integer('id').notNullable().primary()
    table.text('purpose').notNullable()
  });
  
  knex.schema.createTable('preapproved', (table) => {
    table.integer('preTID').notNullable().primary()
    table.text('startDate')
    table.text('endDate')
    table.integer('dateUnkInd').notNullable()
    table.integer('estimatedCost').notNullable()
    table.integer('travelerUnkInd').notNullable()
    table.integer('numberTravelers')
    table.integer('preTSubID')
    table.text('month')
    table.text('department')
    table.text('branch')
    table.text('purpose')
    table.text('reason')
    table.text('travelerNotes')
    table.text('location').notNullable()
    table.text('status')
  });
  
  knex.schema.createTable('preapprovedSubmissions', (table) => {
    table.text('submissionDate')
    table.integer('preTSubID').notNullable().primary()
    table.text('approvalDate')
    table.text('approvedBy')
    table.text('department')
    table.text('submitter').notNullable()
    table.text('status').notNullable()
  });
  
  knex.schema.createTable('transportMethod', (table) => {
    table.integer('id').notNullable().primary()
    table.text('method').notNullable()
  });
  
  knex.schema.createTable('preapprovedDocuments', (table) => {
    table.integer('preTDocID').notNullable().primary()
    table.integer('preTSubID')
    table.text('approvalDoc')
  });
  
  knex.schema.createTable('user', (table) => {
    table.text('create_date').notNullable()
    table.integer('id').notNullable().primary()
    table.text('email').notNullable()
    table.text('status').notNullable()
    table.text('first_name')
    table.text('last_name')
    table.text('roles')
    table.text('department')
    table.text('sub').notNullable()
  });
  
  knex.schema.createTable('roles', (table) => {
    table.integer('id').notNullable().primary()
    table.text('name').notNullable()
  });
  
  knex.schema.createTable('forms', (table) => {
    table.integer('createdBy')
    table.integer('userId').notNullable()
    table.integer('daysOffTravelStatus')
    table.text('dateBackToWork')
    table.integer('travelDuration')
    table.integer('travelAdvance')
    table.integer('preappId')
    table.text('oneWayTrip')
    table.text('multiStop')
    table.integer('id').notNullable().primary()
    table.text('supervisorEmail')
    table.text('denialReason')
    table.text('approved')
    table.text('purpose')
    table.text('requestChange')
    table.text('eventName')
    table.text('summary')
    table.text('benefits')
    table.text('status')
    table.text('formId').notNullable()
    table.text('firstName')
    table.text('lastName')
    table.text('department')
    table.text('division')
    table.text('branch')
    table.text('unit')
    table.text('email')
    table.text('mailcode')
  });
  
  knex.schema.createTable('travelDeskTravelRequest', (table) => {
    table.integer('requestID').notNullable().primary()
    table.integer('TAID').notNullable()
    table.text('travelContact')
    table.text('submitDate')
    table.integer('agencyID')
    table.text('birthDate')
    table.text('strAddress').notNullable()
    table.text('city').notNullable()
    table.text('province').notNullable()
    table.text('postalCode').notNullable()
    table.text('passportCountry')
    table.text('passportNum')
    table.text('travelPurpose').notNullable()
    table.text('travelLocation')
    table.text('travelNotes')
    table.text('busPhone').notNullable()
    table.text('busEmail').notNullable()
    table.text('travelDeskOfficer')
    table.text('travelPhone')
    table.text('travelEmail')
    table.text('additionalInformation')
    table.text('status').notNullable()
    table.text('legalFirstName').notNullable()
    table.text('legalMiddleName')
    table.text('legalLastName').notNullable()
  });
  
  knex.schema.createTable('travelDeskTravelAgent', (table) => {
    table.integer('agencyID').notNullable().primary()
    table.text('agencyName').notNullable()
    table.text('agencyInfo')
  });
  
  knex.schema.createTable('travelDeskFlightRequest', (table) => {
    table.text('date').notNullable()
    table.integer('requestID').notNullable()
    table.integer('flightRequestID').notNullable().primary()
    table.text('seatPreference').notNullable()
    table.text('arriveLocation').notNullable()
    table.text('departLocation').notNullable()
    table.text('timePreference').notNullable()
  });
  
  knex.schema.createTable('travelDeskRentalCar', (table) => {
    table.integer('rentalVehicleID').notNullable().primary()
    table.integer('requestID').notNullable()
    table.text('sameDropOffLocation').notNullable()
    table.text('matchFlightTimes').notNullable()
    table.text('pickUpDate').notNullable()
    table.text('dropOffDate').notNullable()
    table.text('dropOffLocation')
    table.text('dropOffLocOther')
    table.text('additionalNotes')
    table.text('status').notNullable()
    table.text('vehicleTypeChangeInd')
    table.text('vehicleType').notNullable()
    table.text('vehicleChangeRationale')
    table.text('reservedVehicleInfo')
    table.text('booking')
    table.text('pickUpCity').notNullable()
    table.text('pickUpLocation').notNullable()
    table.text('pickUpLocOther')
    table.text('dropOffCity')
  });
  
  knex.schema.createTable('travelDeskHotel', (table) => {
    table.integer('hotelID').notNullable().primary()
    table.integer('requestID').notNullable()
    table.text('rsvConferenceHotel')
    table.text('checkIn')
    table.text('checkOut')
    table.text('conferenceHotelName')
    table.text('reservedHotelInfo')
    table.text('booking')
    table.text('additionalInformation')
    table.text('city')
    table.text('status').notNullable()
    table.text('conferenceName')
  });
  
  knex.schema.createTable('travelDeskOtherTransportation', (table) => {
    table.integer('transportationID').notNullable().primary()
    table.integer('requestID').notNullable()
    table.text('date').notNullable()
    table.text('arrive').notNullable()
    table.text('transportationType')
    table.text('booking')
    table.text('additionalNotes')
    table.text('status').notNullable()
    table.text('reservedTranspInfo')
    table.text('depart').notNullable()
  });
  
  knex.schema.createTable('travelDeskQuestion', (table) => {
    table.integer('questionID').notNullable().primary()
    table.integer('requestID').notNullable()
    table.text('creatingDate').notNullable()
    table.text('requestType').notNullable()
    table.text('question').notNullable()
    table.text('response')
  });
  
  knex.schema.createTable('travelDeskFlightOption', (table) => {
    table.integer('flightOptionID').notNullable().primary()
    table.integer('flightRequestID').notNullable()
    table.text('cost')
    table.text('flightPreference')
    table.text('leg')
    table.text('duration')
  });
  
  knex.schema.createTable('travelDeskFlightSegment', (table) => {
    table.integer('flightSegmentID').notNullable().primary()
    table.text('departDate')
    table.text('arriveDate')
    table.integer('sortOrder').notNullable()
    table.integer('flightOptionID').notNullable()
    table.text('arriveLocation')
    table.text('duration')
    table.text('flightNumber')
    table.text('status')
    table.text('departLocation')
    table.text('class')
  });
  
  knex.schema.createTable('travelDeskPnrDocuments', (table) => {
    table.integer('documentID').notNullable().primary()
    table.integer('requestID').notNullable()
    table.text('pnrDocument')
    table.text('invoiceNumber')
  });
  
  knex.schema.createTable('flightReconciliation', (table) => {
    table.integer('reconcileID').notNullable().primary()
    table.integer('invoiceID').notNullable()
    table.integer('invoiceDetailID').notNullable()
    table.text('reconciled')
    table.integer('reconcilePeriod')
  });
  
  knex.schema.createTable('YgEmployees', (table) => {
    table.integer('id').notNullable().primary()
    table.text('update_date').notNullable()
    table.text('full_name')
    table.text('first_name')
    table.text('last_name')
    table.text('organization')
    table.text('department')
    table.text('division')
    table.text('branch')
    table.text('unit')
    table.text('title')
    table.text('email')
    table.text('suite')
    table.text('phone_office')
    table.text('fax_office')
    table.text('mobile')
    table.text('office')
    table.text('address')
    table.text('po_box')
    table.text('community')
    table.text('postal_code')
    table.text('latitude')
    table.text('longitude')
    table.text('mailcode')
    table.text('manager')
    table.text('username')
  });
  
  knex.schema.createTable('YgDepartments', (table) => {
    table.text('update_date').notNullable()
    table.integer('id').notNullable().primary()
    table.integer('order')
    table.text('unit')
    table.text('division')
    table.text('department')
    table.text('branch')
  });
  
  knex.schema.createTable('StatisticsRecord', (table) => {
    table.text('averageRoundTripFlightCost')
    table.text('roundTripCost')
    table.text('averageDurationDays')
    table.text('averageExpensesPerDay')
    table.integer('id').notNullable().primary()
    table.text('totalExpenses')
    table.text('totalFlightCost')
    table.integer('days')
    table.integer('totalTrips')
    table.integer('totalRoundTrips')
    table.text('dept')
    table.text('arrAirport')
    table.text('finalDestinationCity')
    table.text('finalDestinationProvince')
  });
  
  knex.schema.createTable('StatisticsProgress', (table) => {
    table.integer('id').notNullable().primary()
    table.text('last_update').notNullable()
    table.integer('progress')
  });
  
  knex.schema.createTable('distanceMatrix', (table) => {
    table.integer('id').notNullable().primary()
    table.text('kilometers')
    table.text('origin')
    table.text('destination')
  });
  
  knex.schema.createTable('perDiems', (table) => {
    table.integer('id').notNullable().primary()
    table.text('amount')
    table.text('claim')
    table.text('location')
    table.text('currency')
  });
  
  
}

exports.down = function (knex: knex.Knex, Promise: any) {
  // TODO
};
