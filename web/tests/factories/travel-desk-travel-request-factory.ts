import { Factory } from "fishery"

import {
  type TravelDeskTravelRequest,
  TravelDeskTravelRequestStatuses,
} from "@/api/travel-desk-travel-requests-api"

export const travelDeskTravelRequestFactory = Factory.define<TravelDeskTravelRequest>(
  ({ sequence }) => {
    const timestamp = "2026-01-01T00:00:00.000Z"

    return {
      id: sequence,
      travelAuthorizationId: sequence,
      travelAgencyId: null,
      invoiceNumber: null,
      legalFirstName: "Test",
      legalMiddleName: null,
      legalLastName: "Traveller",
      birthDate: "1990-01-01",
      strAddress: "123 Test Street",
      city: "Whitehorse (YT)",
      province: "YT",
      postalCode: "Y1A 1A1",
      passportCountry: null,
      passportNum: null,
      travelPurpose: "Conference",
      travelLocation: null,
      travelNotes: null,
      busPhone: "867-555-0100",
      busEmail: `traveller-${sequence}@example.test`,
      travelContact: false,
      travelPhone: null,
      travelEmail: null,
      additionalInformation: null,
      status: TravelDeskTravelRequestStatuses.DRAFT,
      travelDeskOfficer: null,
      isInternationalTravel: false,
      createdAt: timestamp,
      updatedAt: timestamp,

    }
  }
)

export default travelDeskTravelRequestFactory
