import * as knex from "knex";

// Last updated: 2023-09-13T20:50:49.298Z
exports.up = function (knex: knex.Knex, Promise: any) {
  knex.schema.createTable('knex_migrations', (t) => {
    t.increments('id').notNullable().primary()
    t.integer('batch')
    t.datetime('migration_time')
    t.string('name')
  });
  
  knex.schema.createTable('knex_migrations_lock', (t) => {
    t.increments('index').notNullable().primary()
    t.integer('is_locked')
  });
  
  knex.schema.createTable('departments', (t) => {
    t.increments('id').notNullable().primary()
    t.integer('ownedBy').notNullable()
    t.string('name').notNullable()
    t.string('type').notNullable()
  });
  
  knex.schema.createTable('destinations', (t) => {
    t.increments('id').notNullable().primary()
    t.string('province').notNullable()
    t.string('city').notNullable()
  });
  
  knex.schema.createTable('expenses', (t) => {
    t.date('date')
    t.binary('receiptImage')
    t.integer('fileSize')
    t.increments('id').notNullable().primary()
    t.float('cost').notNullable()
    t.integer('taid').notNullable()
    t.string('fileName')
    t.string('description').notNullable()
    t.string('currency').notNullable()
    t.string('type').notNullable()
  });
  
  knex.schema.createTable('stops', (t) => {
    t.increments('id').notNullable().primary()
    t.integer('taid').notNullable()
    t.integer('locationId')
    t.date('departureDate')
    t.time('departureTime')
    t.string('transport')
  });
  
  knex.schema.createTable('tripReports', (t) => {
    t.increments('id').notNullable().primary()
    t.integer('taid').notNullable()
    t.string('costDifferenceExplanation')
    t.string('skillsGained')
    t.string('applicationTimeframe')
    t.string('benefitsToUnit')
    t.string('benefitsToYG')
    t.string('futureRecommendations')
    t.string('reportStatus')
  });
  
  knex.schema.createTable('auditHistory', (t) => {
    t.increments('id').notNullable().primary()
    t.datetime('timestamp')
    t.string('userId')
    t.string('taid')
    t.string('action')
    t.string('note')
  });
  
  knex.schema.createTable('emailList', (t) => {
    t.increments('id').notNullable().primary()
    t.string('email').notNullable()
  });
  
  knex.schema.createTable('preapprovedTravelers', (t) => {
    t.increments('travelerID').notNullable().primary()
    t.integer('preTID').notNullable()
    t.string('fullName').notNullable()
    t.string('department').notNullable()
    t.string('branch')
  });
  
  knex.schema.createTable('travelPurpose', (t) => {
    t.increments('id').notNullable().primary()
    t.string('purpose').notNullable()
  });
  
  knex.schema.createTable('preapproved', (t) => {
    t.increments('preTID').notNullable().primary()
    t.date('startDate')
    t.date('endDate')
    t.integer('dateUnkInd').notNullable()
    t.integer('estimatedCost').notNullable()
    t.integer('travelerUnkInd').notNullable()
    t.integer('numberTravelers')
    t.integer('preTSubID')
    t.string('month')
    t.string('department')
    t.string('branch')
    t.string('purpose')
    t.string('reason')
    t.string('travelerNotes')
    t.string('location').notNullable()
    t.string('status')
  });
  
  knex.schema.createTable('preapprovedSubmissions', (t) => {
    t.date('submissionDate')
    t.increments('preTSubID').notNullable().primary()
    t.date('approvalDate')
    t.string('approvedBy')
    t.string('department')
    t.string('submitter').notNullable()
    t.string('status').notNullable()
  });
  
  knex.schema.createTable('transportMethod', (t) => {
    t.increments('id').notNullable().primary()
    t.string('method').notNullable()
  });
  
  knex.schema.createTable('preapprovedDocuments', (t) => {
    t.increments('preTDocID').notNullable().primary()
    t.integer('preTSubID')
    t.binary('approvalDoc')
  });
  
  knex.schema.createTable('user', (t) => {
    t.datetime('create_date').notNullable()
    t.increments('id').notNullable().primary()
    t.string('email').notNullable()
    t.string('status').notNullable()
    t.string('first_name')
    t.string('last_name')
    t.string('roles')
    t.string('department')
    t.string('sub').notNullable()
  });
  
  knex.schema.createTable('roles', (t) => {
    t.increments('id').notNullable().primary()
    t.string('name').notNullable()
  });
  
  knex.schema.createTable('forms', (t) => {
    t.integer('createdBy')
    t.integer('userId').notNullable()
    t.integer('daysOffTravelStatus')
    t.date('dateBackToWork')
    t.integer('travelDuration')
    t.integer('travelAdvance')
    t.integer('preappId')
    t.boolean('oneWayTrip')
    t.boolean('multiStop')
    t.increments('id').notNullable().primary()
    t.string('supervisorEmail')
    t.string('denialReason')
    t.string('approved')
    t.string('purpose')
    t.string('requestChange')
    t.string('eventName')
    t.string('summary')
    t.string('benefits')
    t.string('status')
    t.string('formId').notNullable()
    t.string('firstName')
    t.string('lastName')
    t.string('department')
    t.string('division')
    t.string('branch')
    t.string('unit')
    t.string('email')
    t.string('mailcode')
  });
  
  knex.schema.createTable('travelDeskTravelRequest', (t) => {
    t.increments('requestID').notNullable().primary()
    t.integer('TAID').notNullable()
    t.boolean('travelContact')
    t.datetime('submitDate')
    t.integer('agencyID')
    t.string('birthDate')
    t.string('strAddress').notNullable()
    t.string('city').notNullable()
    t.string('province').notNullable()
    t.string('postalCode').notNullable()
    t.string('passportCountry')
    t.string('passportNum')
    t.string('travelPurpose').notNullable()
    t.string('travelLocation')
    t.string('travelNotes')
    t.string('busPhone').notNullable()
    t.string('busEmail').notNullable()
    t.string('travelDeskOfficer')
    t.string('travelPhone')
    t.string('travelEmail')
    t.string('additionalInformation')
    t.string('status').notNullable()
    t.string('legalFirstName').notNullable()
    t.string('legalMiddleName')
    t.string('legalLastName').notNullable()
  });
  
  knex.schema.createTable('travelDeskTravelAgent', (t) => {
    t.increments('agencyID').notNullable().primary()
    t.string('agencyName').notNullable()
    t.string('agencyInfo')
  });
  
  knex.schema.createTable('travelDeskFlightRequest', (t) => {
    t.date('date').notNullable()
    t.integer('requestID').notNullable()
    t.increments('flightRequestID').notNullable().primary()
    t.string('seatPreference').notNullable()
    t.string('arriveLocation').notNullable()
    t.string('departLocation').notNullable()
    t.string('timePreference').notNullable()
  });
  
  knex.schema.createTable('travelDeskRentalCar', (t) => {
    t.increments('rentalVehicleID').notNullable().primary()
    t.integer('requestID').notNullable()
    t.boolean('sameDropOffLocation').notNullable()
    t.boolean('matchFlightTimes').notNullable()
    t.datetime('pickUpDate').notNullable()
    t.datetime('dropOffDate').notNullable()
    t.string('dropOffLocation')
    t.string('dropOffLocOther')
    t.string('additionalNotes')
    t.string('status').notNullable()
    t.string('vehicleTypeChangeInd')
    t.string('vehicleType').notNullable()
    t.string('vehicleChangeRationale')
    t.string('reservedVehicleInfo')
    t.string('booking')
    t.string('pickUpCity').notNullable()
    t.string('pickUpLocation').notNullable()
    t.string('pickUpLocOther')
    t.string('dropOffCity')
  });
  
  knex.schema.createTable('travelDeskHotel', (t) => {
    t.increments('hotelID').notNullable().primary()
    t.integer('requestID').notNullable()
    t.boolean('rsvConferenceHotel')
    t.date('checkIn')
    t.date('checkOut')
    t.string('conferenceHotelName')
    t.string('reservedHotelInfo')
    t.string('booking')
    t.string('additionalInformation')
    t.string('city')
    t.string('status').notNullable()
    t.string('conferenceName')
  });
  
  knex.schema.createTable('travelDeskOtherTransportation', (t) => {
    t.increments('transportationID').notNullable().primary()
    t.integer('requestID').notNullable()
    t.date('date').notNullable()
    t.string('arrive').notNullable()
    t.string('transportationType')
    t.string('booking')
    t.string('additionalNotes')
    t.string('status').notNullable()
    t.string('reservedTranspInfo')
    t.string('depart').notNullable()
  });
  
  knex.schema.createTable('travelDeskQuestion', (t) => {
    t.increments('questionID').notNullable().primary()
    t.integer('requestID').notNullable()
    t.datetime('creatingDate').notNullable()
    t.string('requestType').notNullable()
    t.string('question').notNullable()
    t.string('response')
  });
  
  knex.schema.createTable('travelDeskFlightOption', (t) => {
    t.increments('flightOptionID').notNullable().primary()
    t.integer('flightRequestID').notNullable()
    t.string('cost')
    t.string('flightPreference')
    t.string('leg')
    t.string('duration')
  });
  
  knex.schema.createTable('travelDeskFlightSegment', (t) => {
    t.increments('flightSegmentID').notNullable().primary()
    t.datetime('departDate')
    t.datetime('arriveDate')
    t.integer('sortOrder').notNullable()
    t.integer('flightOptionID').notNullable()
    t.string('arriveLocation')
    t.string('duration')
    t.string('flightNumber')
    t.string('status')
    t.string('departLocation')
    t.string('class')
  });
  
  knex.schema.createTable('travelDeskPnrDocuments', (t) => {
    t.increments('documentID').notNullable().primary()
    t.integer('requestID').notNullable()
    t.binary('pnrDocument')
    t.string('invoiceNumber')
  });
  
  knex.schema.createTable('flightReconciliation', (t) => {
    t.increments('reconcileID').notNullable().primary()
    t.integer('invoiceID').notNullable()
    t.integer('invoiceDetailID').notNullable()
    t.boolean('reconciled')
    t.integer('reconcilePeriod')
  });
  
  knex.schema.createTable('YgEmployees', (t) => {
    t.increments('id').notNullable().primary()
    t.datetime('update_date').notNullable()
    t.string('full_name')
    t.string('first_name')
    t.string('last_name')
    t.string('organization')
    t.string('department')
    t.string('division')
    t.string('branch')
    t.string('unit')
    t.string('title')
    t.string('email')
    t.string('suite')
    t.string('phone_office')
    t.string('fax_office')
    t.string('mobile')
    t.string('office')
    t.string('address')
    t.string('po_box')
    t.string('community')
    t.string('postal_code')
    t.string('latitude')
    t.string('longitude')
    t.string('mailcode')
    t.string('manager')
    t.string('username')
  });
  
  knex.schema.createTable('YgDepartments', (t) => {
    t.datetime('update_date').notNullable()
    t.increments('id').notNullable().primary()
    t.integer('order')
    t.string('unit')
    t.string('division')
    t.string('department')
    t.string('branch')
  });
  
  knex.schema.createTable('StatisticsRecord', (t) => {
    t.float('averageRoundTripFlightCost')
    t.float('roundTripCost')
    t.float('averageDurationDays')
    t.float('averageExpensesPerDay')
    t.increments('id').notNullable().primary()
    t.float('totalExpenses')
    t.float('totalFlightCost')
    t.integer('days')
    t.integer('totalTrips')
    t.integer('totalRoundTrips')
    t.string('dept')
    t.string('arrAirport')
    t.string('finalDestinationCity')
    t.string('finalDestinationProvince')
  });
  
  knex.schema.createTable('StatisticsProgress', (t) => {
    t.increments('id').notNullable().primary()
    t.datetime('last_update').notNullable()
    t.integer('progress')
  });
  
  knex.schema.createTable('distanceMatrix', (t) => {
    t.increments('id').notNullable().primary()
    t.float('kilometers')
    t.string('origin')
    t.string('destination')
  });
  
  knex.schema.createTable('perDiems', (t) => {
    t.increments('id').notNullable().primary()
    t.float('amount')
    t.string('claim')
    t.string('location')
    t.string('currency')
  });
}

exports.down = function (knex: knex.Knex, Promise: any) {
  // TODO
};
