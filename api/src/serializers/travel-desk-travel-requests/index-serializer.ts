import { first, isEmpty, isNil, isUndefined, last, pick } from "lodash"

import { TravelDeskTravelRequest, TravelSegment, User } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"

export type TravelDeskTravelRequestAsIndex = Pick<
  TravelDeskTravelRequest,
  | "id"
  | "travelAuthorizationId"
  | "travelAgencyId"
  | "invoiceNumber"
  | "legalFirstName"
  | "legalMiddleName"
  | "legalLastName"
  | "strAddress"
  | "city"
  | "province"
  | "postalCode"
  | "passportCountry"
  | "passportNum"
  | "travelPurpose"
  | "travelLocation"
  | "travelNotes"
  | "busPhone"
  | "busEmail"
  | "travelContact"
  | "travelPhone"
  | "travelEmail"
  | "additionalInformation"
  | "travelDeskOfficer"
  | "isInternationalTravel"
  | "status"
  | "createdAt"
  | "updatedAt"
> & {
  // extra fields
  branch: string
  department: string
  isAssignedToCurrentUser: boolean
  isBooked: boolean
  locationsTraveled: string
  requestedOptions: string
  travelEndDate: string
  travelStartDate: string
  userDisplayName: string
  hasPassengerNameRecordDocument: boolean
}

export class IndexSerializer extends BaseSerializer<TravelDeskTravelRequest> {
  constructor(
    protected record: TravelDeskTravelRequest,
    protected currentUser: User
  ) {
    super(record)
  }

  perform(): TravelDeskTravelRequestAsIndex {
    const { passengerNameRecordDocument, travelAuthorization } = this.record
    if (isUndefined(passengerNameRecordDocument)) {
      throw new Error("Expected passengerNameRecordDocument association to be pre-loaded.")
    }

    if (isUndefined(travelAuthorization)) {
      throw new Error("Expected travelAuthorization association to be pre-loaded.")
    }

    const { user: travelAuthorizationUser } = travelAuthorization
    if (isUndefined(travelAuthorizationUser)) {
      throw new Error("Expected travelAuthorization.user association to be pre-loaded.")
    }

    const { travelSegments } = travelAuthorization
    if (isUndefined(travelSegments)) {
      throw new Error("Expected travelAuthorization.travelSegments association to be pre-loaded.")
    }

    const { firstName, lastName } = travelAuthorizationUser
    const userDisplayName = [firstName, lastName].filter(Boolean).join(" ") || "Unknown"

    const department = travelAuthorizationUser.department ?? ""
    const branch = travelAuthorizationUser.branch ?? ""

    // TODO: rework this using ids, once data model permits
    const isAssignedToCurrentUser = this.record.travelDeskOfficer === this.currentUser.displayName
    const isBooked = this.record.status === TravelDeskTravelRequest.Statuses.BOOKED

    const travelStartDate = this.determineStartDate(travelSegments)
    const travelEndDate = this.determineEndDate(
      travelSegments,
      travelAuthorization.dateBackToWorkEstimateAsString
    )
    const locationsTraveled = this.determineLocationsTraveled(travelSegments)
    const requestedOptions = this.determineRequestedOptions(this.record)

    const hasPassengerNameRecordDocument = !isNil(passengerNameRecordDocument)

    return {
      ...pick(this.record, [
        "id",
        "travelAuthorizationId",
        "travelAgencyId",
        "invoiceNumber",
        "legalFirstName",
        "legalMiddleName",
        "legalLastName",
        "strAddress",
        "city",
        "province",
        "postalCode",
        "passportCountry",
        "passportNum",
        "travelPurpose",
        "travelLocation",
        "travelNotes",
        "busPhone",
        "busEmail",
        "travelContact",
        "travelPhone",
        "travelEmail",
        "additionalInformation",
        "travelDeskOfficer",
        "isInternationalTravel",
        "status",
        "createdAt",
        "updatedAt",
      ]),
      branch,
      department,
      isAssignedToCurrentUser,
      isBooked,
      locationsTraveled,
      requestedOptions,
      travelStartDate,
      travelEndDate,
      userDisplayName,
      hasPassengerNameRecordDocument,
    }
  }

  private determineStartDate(travelSegments: TravelSegment[]): string {
    const firstTravelSegment = first(travelSegments)
    if (isUndefined(firstTravelSegment)) {
      return ""
    }

    const { departureOnAsString } = firstTravelSegment
    if (isNil(departureOnAsString)) {
      return ""
    }

    return departureOnAsString
  }

  private determineEndDate(travelSegments: TravelSegment[], dateBackToWork: string | null): string {
    if (!isNil(dateBackToWork)) {
      return dateBackToWork
    }

    const lastTravelSegment = last(travelSegments)
    if (isUndefined(lastTravelSegment)) {
      return ""
    }

    const { departureOnAsString } = lastTravelSegment
    if (isNil(departureOnAsString)) {
      return ""
    }

    return departureOnAsString
  }

  private determineLocationsTraveled(travelSegments: TravelSegment[]): string {
    const names = new Set()

    for (const travelSegment of travelSegments) {
      const { departureLocation, arrivalLocation } = travelSegment
      if (!isNil(departureLocation)) {
        const departureName = `${departureLocation.city} (${departureLocation.province})`
        names.add(departureName)
      }

      if (!isNil(arrivalLocation)) {
        const arrivalName = `${arrivalLocation.city} (${arrivalLocation.province})`
        names.add(arrivalName)
      }
    }

    return Array.from(names).join(", ")
  }

  private determineRequestedOptions(travelDeskTravelRequest: TravelDeskTravelRequest): string {
    const requested = []

    if (!isEmpty(travelDeskTravelRequest.flightRequests)) {
      requested.push("flight")
    }

    if (!isEmpty(travelDeskTravelRequest.hotels)) {
      requested.push("hotel")
    }

    if (!isEmpty(travelDeskTravelRequest.rentalCars)) {
      requested.push("rental car")
    }

    if (!isEmpty(travelDeskTravelRequest.otherTransportations)) {
      requested.push("transportation")
    }

    return requested.join(", ")
  }
}

export default IndexSerializer
