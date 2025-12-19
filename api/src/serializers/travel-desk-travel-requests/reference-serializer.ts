import { pick } from "lodash"

import { TravelDeskTravelRequest } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"

export type TravelDeskTravelRequestAsReference = Pick<
  TravelDeskTravelRequest,
  | "id"
  | "travelAuthorizationId"
  | "travelAgencyId"
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
>

export class ReferenceSerializer extends BaseSerializer<TravelDeskTravelRequest> {
  perform(): TravelDeskTravelRequestAsReference {
    return pick(this.record, [
      "id",
      "travelAuthorizationId",
      "travelAgencyId",
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
    ])
  }
}

export default ReferenceSerializer
