import { Factory } from "fishery"

import {
  type TravelDeskTravelRequestAsIndex,
  TravelDeskTravelRequestStatuses,
} from "@/api/travel-desk-travel-requests-api"

export const travelDeskTravelRequestFactory = Factory.define<TravelDeskTravelRequestAsIndex>(
  ({ sequence }) => {
    const timestamp = "2026-10-22T12:00:00.000Z"

    return {
      id: sequence,
      travelAuthorizationId: sequence,
      travelAgencyId: null,
      invoiceNumber: null,
      legalFirstName: "Fixture",
      legalMiddleName: null,
      legalLastName: "Traveler",
      strAddress: "123 Test Street",
      city: "Whitehorse",
      province: "YT",
      postalCode: "Y1A 0A1",
      passportCountry: null,
      passportNum: null,
      travelPurpose: "Conference",
      travelLocation: null,
      travelNotes: null,
      busPhone: "867-555-0100",
      busEmail: "traveler@example.com",
      travelContact: false,
      travelPhone: null,
      travelEmail: null,
      additionalInformation: null,
      status: TravelDeskTravelRequestStatuses.DRAFT,
      travelDeskOfficer: null,
      isInternationalTravel: false,
      createdAt: timestamp,
      updatedAt: timestamp,
      userDisplayName: `Fixture Traveler ${sequence}`,
      department: "Test Department",
      branch: "Test Branch",
      isAssignedToCurrentUser: false,
      isBooked: false,
      travelStartDate: "2026-11-10",
      travelEndDate: "2026-11-13",
      locationsTraveled: "Whitehorse (YT), Vancouver (BC)",
      requestedOptions: "flight, hotel",
      hasPassengerNameRecordDocument: false,
    }
  }
)

export default travelDeskTravelRequestFactory
