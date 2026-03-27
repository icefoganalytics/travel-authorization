import { Attributes, FindOptions } from "@sequelize/core"
import { isUndefined } from "lodash"

import { Path } from "@/utils/deep-pick"
import { User, TravelDeskTravelRequest, TravelAuthorization } from "@/models"
import { ALL_RECORDS_SCOPE } from "@/policies/base-policy"
import PolicyFactory from "@/policies/policy-factory"
import TravelAuthorizationsPolicy from "@/policies/travel-authorizations-policy"

export class TravelDeskTravelRequestsPolicy extends PolicyFactory(TravelDeskTravelRequest) {
  show(): boolean {
    return this.travelAuthorizationsPolicy.show()
  }

  update(): boolean {
    if (this.user.isAdmin) return true
    if (this.travelAuthorization.supervisorEmail === this.user.email) return true
    if (
      this.travelAuthorization.userId === this.user.id &&
      this.travelAuthorization.status === TravelAuthorization.Statuses.APPROVED &&
      this.record.status === TravelDeskTravelRequest.Statuses.DRAFT
    ) {
      return true
    }

    return false
  }

  permittedAttributes(): Path[] {
    return [
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
    ]
  }

  // CONSIDER: should draft records be hidden from non-creator?
  static policyScope(user: User): FindOptions<Attributes<TravelDeskTravelRequest>> {
    if (user.isAdmin) return ALL_RECORDS_SCOPE

    const travelAuthorizationsPolicyScope = TravelAuthorizationsPolicy.policyScope(user)

    return {
      include: [
        {
          association: "travelAuthorization",
          required: true,
          ...travelAuthorizationsPolicyScope,
        },
      ],
    }
  }

  private get travelAuthorization(): TravelAuthorization {
    const { travelAuthorization } = this.record
    if (isUndefined(travelAuthorization)) {
      throw new Error("Travel Authorization is required")
    }

    return travelAuthorization
  }

  private get travelAuthorizationsPolicy(): TravelAuthorizationsPolicy {
    return new TravelAuthorizationsPolicy(this.user, this.travelAuthorization)
  }
}

export default TravelDeskTravelRequestsPolicy
