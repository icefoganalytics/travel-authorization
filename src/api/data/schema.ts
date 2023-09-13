import * as knex from "knex";

exports.up = function (knex: knex.Knex, Promise: any) {
  knex.schema.createTable('knex_migrations', (table) => {
    table.increments('id').notNullable().primary()
    table.integer('batch')
    table.timestamp('migration_time', { useTz: true })
    table.string('name')
  });
  
  knex.schema.createTable('knex_migrations_lock', (table) => {
    table.increments('index').notNullable().primary()
    table.integer('is_locked')
  });
  
  knex.schema.createTable('departments', (table) => {
    table.increments('id').notNullable().primary()
    table.integer('ownedBy').notNullable()
    table.string('name').notNullable()
    table.string('type').notNullable()
  });
  
  knex.schema.createTable('destinations', (table) => {
    table.increments('id').notNullable().primary()
    table.string('province').notNullable()
    table.string('city').notNullable()
  });
  
  knex.schema.createTable('expenses', (table) => {
    table.date('date')
    table.binary('receiptImage')
    table.integer('fileSize')
    table.increments('id').notNullable().primary()
    table.float('cost').notNullable()
    table.integer('taid').notNullable()
    table.string('fileName')
    table.string('description').notNullable()
    table.string('currency').notNullable()
    table.string('type').notNullable()
  });
  
  knex.schema.createTable('stops', (table) => {
    table.increments('id').notNullable().primary()
    table.integer('taid').notNullable()
    table.integer('locationId')
    table.date('departureDate')
    table.time('departureTime')
    table.string('transport')
  });
  
  knex.schema.createTable('tripReports', (table) => {
    table.increments('id').notNullable().primary()
    table.integer('taid').notNullable()
    table.string('costDifferenceExplanation')
    table.string('skillsGained')
    table.string('applicationTimeframe')
    table.string('benefitsToUnit')
    table.string('benefitsToYG')
    table.string('futureRecommendations')
    table.string('reportStatus')
  });
  
  knex.schema.createTable('auditHistory', (table) => {
    table.increments('id').notNullable().primary()
    table.timestamp('timestamp', { useTz: true })
    table.string('userId')
    table.string('taid')
    table.string('action')
    table.string('note')
  });
  
  knex.schema.createTable('emailList', (table) => {
    table.increments('id').notNullable().primary()
    table.string('email').notNullable()
  });
  
  knex.schema.createTable('preapprovedTravelers', (table) => {
    table.increments('travelerID').notNullable().primary()
    table.integer('preTID').notNullable()
    table.string('fullName').notNullable()
    table.string('department').notNullable()
    table.string('branch')
  });
  
  knex.schema.createTable('travelPurpose', (table) => {
    table.increments('id').notNullable().primary()
    table.string('purpose').notNullable()
  });
  
  knex.schema.createTable('preapproved', (table) => {
    table.increments('preTID').notNullable().primary()
    table.date('startDate')
    table.date('endDate')
    table.integer('dateUnkInd').notNullable()
    table.integer('estimatedCost').notNullable()
    table.integer('travelerUnkInd').notNullable()
    table.integer('numberTravelers')
    table.integer('preTSubID')
    table.string('month')
    table.string('department')
    table.string('branch')
    table.string('purpose')
    table.string('reason')
    table.string('travelerNotes')
    table.string('location').notNullable()
    table.string('status')
  });
  
  knex.schema.createTable('preapprovedSubmissions', (table) => {
    table.date('submissionDate')
    table.increments('preTSubID').notNullable().primary()
    table.date('approvalDate')
    table.string('approvedBy')
    table.string('department')
    table.string('submitter').notNullable()
    table.string('status').notNullable()
  });
  
  knex.schema.createTable('transportMethod', (table) => {
    table.increments('id').notNullable().primary()
    table.string('method').notNullable()
  });
  
  knex.schema.createTable('preapprovedDocuments', (table) => {
    table.increments('preTDocID').notNullable().primary()
    table.integer('preTSubID')
    table.binary('approvalDoc')
  });
  
  knex.schema.createTable('user', (table) => {
    table.timestamp('create_date', { useTz: true }).notNullable()
    table.increments('id').notNullable().primary()
    table.string('email').notNullable()
    table.string('status').notNullable()
    table.string('first_name')
    table.string('last_name')
    table.string('roles')
    table.string('department')
    table.string('sub').notNullable()
  });
  
  knex.schema.createTable('roles', (table) => {
    table.increments('id').notNullable().primary()
    table.string('name').notNullable()
  });
  
  knex.schema.createTable('forms', (table) => {
    table.integer('createdBy')
    table.integer('userId').notNullable()
    table.integer('daysOffTravelStatus')
    table.date('dateBackToWork')
    table.integer('travelDuration')
    table.integer('travelAdvance')
    table.integer('preappId')
    table.boolean('oneWayTrip')
    table.boolean('multiStop')
    table.increments('id').notNullable().primary()
    table.string('supervisorEmail')
    table.string('denialReason')
    table.string('approved')
    table.string('purpose')
    table.string('requestChange')
    table.string('eventName')
    table.string('summary')
    table.string('benefits')
    table.string('status')
    table.string('formId').notNullable()
    table.string('firstName')
    table.string('lastName')
    table.string('department')
    table.string('division')
    table.string('branch')
    table.string('unit')
    table.string('email')
    table.string('mailcode')
  });
  
  knex.schema.createTable('travelDeskTravelRequest', (table) => {
    table.increments('requestID').notNullable().primary()
    table.integer('TAID').notNullable()
    table.boolean('travelContact')
    table.timestamp('submitDate', { useTz: true })
    table.integer('agencyID')
    table.string('birthDate')
    table.string('strAddress').notNullable()
    table.string('city').notNullable()
    table.string('province').notNullable()
    table.string('postalCode').notNullable()
    table.string('passportCountry')
    table.string('passportNum')
    table.string('travelPurpose').notNullable()
    table.string('travelLocation')
    table.string('travelNotes')
    table.string('busPhone').notNullable()
    table.string('busEmail').notNullable()
    table.string('travelDeskOfficer')
    table.string('travelPhone')
    table.string('travelEmail')
    table.string('additionalInformation')
    table.string('status').notNullable()
    table.string('legalFirstName').notNullable()
    table.string('legalMiddleName')
    table.string('legalLastName').notNullable()
  });
  
  knex.schema.createTable('travelDeskTravelAgent', (table) => {
    table.increments('agencyID').notNullable().primary()
    table.string('agencyName').notNullable()
    table.string('agencyInfo')
  });
  
  knex.schema.createTable('travelDeskFlightRequest', (table) => {
    table.date('date').notNullable()
    table.integer('requestID').notNullable()
    table.increments('flightRequestID').notNullable().primary()
    table.string('seatPreference').notNullable()
    table.string('arriveLocation').notNullable()
    table.string('departLocation').notNullable()
    table.string('timePreference').notNullable()
  });
  
  knex.schema.createTable('travelDeskRentalCar', (table) => {
    table.increments('rentalVehicleID').notNullable().primary()
    table.integer('requestID').notNullable()
    table.boolean('sameDropOffLocation').notNullable()
    table.boolean('matchFlightTimes').notNullable()
    table.timestamp('pickUpDate', { useTz: true }).notNullable()
    table.timestamp('dropOffDate', { useTz: true }).notNullable()
    table.string('dropOffLocation')
    table.string('dropOffLocOther')
    table.string('additionalNotes')
    table.string('status').notNullable()
    table.string('vehicleTypeChangeInd')
    table.string('vehicleType').notNullable()
    table.string('vehicleChangeRationale')
    table.string('reservedVehicleInfo')
    table.string('booking')
    table.string('pickUpCity').notNullable()
    table.string('pickUpLocation').notNullable()
    table.string('pickUpLocOther')
    table.string('dropOffCity')
  });
  
  knex.schema.createTable('travelDeskHotel', (table) => {
    table.increments('hotelID').notNullable().primary()
    table.integer('requestID').notNullable()
    table.boolean('rsvConferenceHotel')
    table.date('checkIn')
    table.date('checkOut')
    table.string('conferenceHotelName')
    table.string('reservedHotelInfo')
    table.string('booking')
    table.string('additionalInformation')
    table.string('city')
    table.string('status').notNullable()
    table.string('conferenceName')
  });
  
  knex.schema.createTable('travelDeskOtherTransportation', (table) => {
    table.increments('transportationID').notNullable().primary()
    table.integer('requestID').notNullable()
    table.date('date').notNullable()
    table.string('arrive').notNullable()
    table.string('transportationType')
    table.string('booking')
    table.string('additionalNotes')
    table.string('status').notNullable()
    table.string('reservedTranspInfo')
    table.string('depart').notNullable()
  });
  
  knex.schema.createTable('travelDeskQuestion', (table) => {
    table.increments('questionID').notNullable().primary()
    table.integer('requestID').notNullable()
    table.timestamp('creatingDate', { useTz: true }).notNullable()
    table.string('requestType').notNullable()
    table.string('question').notNullable()
    table.string('response')
  });
  
  knex.schema.createTable('travelDeskFlightOption', (table) => {
    table.increments('flightOptionID').notNullable().primary()
    table.integer('flightRequestID').notNullable()
    table.string('cost')
    table.string('flightPreference')
    table.string('leg')
    table.string('duration')
  });
  
  knex.schema.createTable('travelDeskFlightSegment', (table) => {
    table.increments('flightSegmentID').notNullable().primary()
    table.timestamp('departDate', { useTz: true })
    table.timestamp('arriveDate', { useTz: true })
    table.integer('sortOrder').notNullable()
    table.integer('flightOptionID').notNullable()
    table.string('arriveLocation')
    table.string('duration')
    table.string('flightNumber')
    table.string('status')
    table.string('departLocation')
    table.string('class')
  });
  
  knex.schema.createTable('travelDeskPnrDocuments', (table) => {
    table.increments('documentID').notNullable().primary()
    table.integer('requestID').notNullable()
    table.binary('pnrDocument')
    table.string('invoiceNumber')
  });
  
  knex.schema.createTable('flightReconciliation', (table) => {
    table.increments('reconcileID').notNullable().primary()
    table.integer('invoiceID').notNullable()
    table.integer('invoiceDetailID').notNullable()
    table.boolean('reconciled')
    table.integer('reconcilePeriod')
  });
  
  knex.schema.createTable('YgEmployees', (table) => {
    table.increments('id').notNullable().primary()
    table.timestamp('update_date', { useTz: true }).notNullable()
    table.string('full_name')
    table.string('first_name')
    table.string('last_name')
    table.string('organization')
    table.string('department')
    table.string('division')
    table.string('branch')
    table.string('unit')
    table.string('title')
    table.string('email')
    table.string('suite')
    table.string('phone_office')
    table.string('fax_office')
    table.string('mobile')
    table.string('office')
    table.string('address')
    table.string('po_box')
    table.string('community')
    table.string('postal_code')
    table.string('latitude')
    table.string('longitude')
    table.string('mailcode')
    table.string('manager')
    table.string('username')
  });
  
  knex.schema.createTable('YgDepartments', (table) => {
    table.timestamp('update_date', { useTz: true }).notNullable()
    table.increments('id').notNullable().primary()
    table.integer('order')
    table.string('unit')
    table.string('division')
    table.string('department')
    table.string('branch')
  });
  
  knex.schema.createTable('StatisticsRecord', (table) => {
    table.float('averageRoundTripFlightCost')
    table.float('roundTripCost')
    table.float('averageDurationDays')
    table.float('averageExpensesPerDay')
    table.increments('id').notNullable().primary()
    table.float('totalExpenses')
    table.float('totalFlightCost')
    table.integer('days')
    table.integer('totalTrips')
    table.integer('totalRoundTrips')
    table.string('dept')
    table.string('arrAirport')
    table.string('finalDestinationCity')
    table.string('finalDestinationProvince')
  });
  
  knex.schema.createTable('StatisticsProgress', (table) => {
    table.increments('id').notNullable().primary()
    table.timestamp('last_update', { useTz: true }).notNullable()
    table.integer('progress')
  });
  
  knex.schema.createTable('distanceMatrix', (table) => {
    table.increments('id').notNullable().primary()
    table.float('kilometers')
    table.string('origin')
    table.string('destination')
  });
  
  knex.schema.createTable('perDiems', (table) => {
    table.increments('id').notNullable().primary()
    table.float('amount')
    table.string('claim')
    table.string('location')
    table.string('currency')
  });
}

exports.down = function (knex: knex.Knex, Promise: any) {
  // TODO
};
