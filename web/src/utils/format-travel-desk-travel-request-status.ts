import { isEmpty } from "lodash"

import {
  type TravelDeskTravelRequestAsIndex,
  TravelDeskTravelRequestStatuses,
} from "@/api/travel-desk-travel-requests-api"

export function formatTravelDeskTravelRequestStatus(
  request: Pick<TravelDeskTravelRequestAsIndex, "status" | "travelDeskOfficer">,
  translate: (key: string, fallback: string) => string
): string {
  if (
    request.status === TravelDeskTravelRequestStatuses.SUBMITTED &&
    isEmpty(request.travelDeskOfficer)
  ) {
    return "Not Started"
  }

  return translate(`travel_desk_travel_request.status.${request.status}`, request.status)
}

export default formatTravelDeskTravelRequestStatus
