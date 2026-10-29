import { Factory } from "fishery"
import { omit } from "lodash"

import { type TravelDeskTravelRequestAsIndex } from "@/api/travel-desk-travel-requests-api"

import travelDeskTravelRequestFactory from "@/tests/factories/travel-desk-travel-request-factory"

export const travelDeskTravelRequestAsIndexFactory = Factory.define<TravelDeskTravelRequestAsIndex>(
  ({ sequence }) => {
    const request = travelDeskTravelRequestFactory.build({
      id: sequence,
      travelAuthorizationId: sequence,
    })

    return {
      ...omit(request, "birthDate"),
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

export default travelDeskTravelRequestAsIndexFactory
