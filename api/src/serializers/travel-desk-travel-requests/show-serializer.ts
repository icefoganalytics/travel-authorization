import { isNil, isUndefined, pick } from "lodash"

import { TravelDeskTravelRequest, User } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"

export type TravelDeskTravelRequestAsShow = Pick<
  TravelDeskTravelRequest,
  | "id"
  | "travelAuthorizationId"
  | "travelAgencyId"
  | "invoiceNumber"
  | "legalFirstName"
  | "legalLastName"
  | "strAddress"
  | "city"
  | "province"
  | "postalCode"
  | "legalMiddleName"
  | "travelPurpose"
  | "busPhone"
  | "busEmail"
  | "status"
  | "birthDate"
  | "isInternationalTravel"
  | "passportCountry"
  | "passportNum"
  | "travelLocation"
  | "travelNotes"
  | "travelContact"
  | "travelPhone"
  | "travelEmail"
  | "additionalInformation"
  | "travelDeskOfficer"
  | "createdAt"
  | "updatedAt"
> & {
  hasPassengerNameRecordDocument: boolean
}

export class ShowSerializer extends BaseSerializer<TravelDeskTravelRequest> {
  constructor(
    protected record: TravelDeskTravelRequest,
    protected currentUser: User
  ) {
    super(record)
  }

  perform(): TravelDeskTravelRequestAsShow {
    const { passengerNameRecordDocument } = this.record
    if (isUndefined(passengerNameRecordDocument)) {
      throw new Error("Expected passengerNameRecordDocument association to be pre-loaded.")
    }

    const hasPassengerNameRecordDocument = !isNil(passengerNameRecordDocument)

    return {
      ...pick(this.record, [
        "id",
        "travelAuthorizationId",
        "travelAgencyId",
        "invoiceNumber",
        "legalFirstName",
        "legalLastName",
        "strAddress",
        "city",
        "province",
        "postalCode",
        "legalMiddleName",
        "travelPurpose",
        "busPhone",
        "busEmail",
        "status",
        "birthDate",
        "isInternationalTravel",
        "passportCountry",
        "passportNum",
        "travelLocation",
        "travelNotes",
        "travelContact",
        "travelPhone",
        "travelEmail",
        "additionalInformation",
        "travelDeskOfficer",
        "createdAt",
        "updatedAt",
      ]),
      hasPassengerNameRecordDocument,
    }
  }
}

export default ShowSerializer
