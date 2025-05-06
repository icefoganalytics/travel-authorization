import { Attributes, FindOptions, Op } from "sequelize"

import { Path } from "@/utils/deep-pick"
import { User, TravelAuthorization, TravelSegment } from "@/models"
import { ALL_RECORDS_SCOPE } from "@/policies/base-policy"
import PolicyFactory from "@/policies/policy-factory"
import TravelSegmentsPolicy from "@/policies/travel-segments-policy"
import UsersPolicy from "@/policies/users-policy"

export class TravelAuthorizationsPolicy extends PolicyFactory(TravelAuthorization) {
  create(): boolean {
    if (this.user.isAdmin) return true
    if (this.record.userId === this.user.id) return true

    return false
  }

  show(): boolean {
    if (this.user.isAdmin) return true
    if (this.record.supervisorEmail === this.user.email) return true
    if (this.record.userId === this.user.id) return true

    return false
  }

  update(): boolean {
    if (this.user.isAdmin) return true
    if (this.record.supervisorEmail === this.user.email) return true
    if (this.record.userId === this.user.id) return true

    return false
  }

  // Currently the same as the update policy, but this is likely to change in the future
  // so opted for duplication over premature abstraction.
  destroy(): boolean {
    if (this.user.isAdmin) return true
    if (this.record.supervisorEmail === this.user.email) return true
    if (
      this.record.userId === this.user.id &&
      this.record.status === TravelAuthorization.Statuses.DRAFT
    ) {
      return true
    }

    return false
  }

  // NOTE: userId is always restricted after creation.
  permittedAttributes(): Path[] {
    if (
      this.record.status === TravelAuthorization.Statuses.DRAFT ||
      this.user.isAdmin ||
      this.record.supervisorEmail === this.user.email
    ) {
      return [
        "preApprovalProfileId",
        "purposeId",
        "wizardStepName",
        "firstName",
        "lastName",
        "department",
        "division",
        "branch",
        "unit",
        "email",
        "mailcode",
        "daysOffTravelStatusEstimate",
        "dateBackToWorkEstimate",
        "travelDurationEstimate",
        "travelAdvance",
        "eventName",
        "summary",
        "benefits",
        "supervisorEmail",
        "approved",
        "requestChange",
        "denialReason",
        "tripTypeEstimate",
        "travelAdvanceInCents",
        "allTravelWithinTerritory",
        {
          travelSegmentEstimatesAttributes:
            this.travelSegmentsPolicy.permittedAttributesForCreate(),
        },
      ]
    }

    // TODO: consider moving state based check to the service layer since its business logic?
    if (this.record.status === TravelAuthorization.Statuses.APPROVED) {
      return [
        "daysOffTravelStatusActual",
        "dateBackToWorkActual",
        "travelDurationActual",
        "tripTypeActual",
        "wizardStepName",
        {
          travelSegmentActualsAttributes:
            this.travelSegmentsPolicy.permittedAttributesForCreate(),
        },
      ]
    }

    return ["wizardStepName"]
  }

  permittedAttributesForCreate(): Path[] {
    const permittedAttributes = [
      ...this.permittedAttributes(),
      "slug",
      // TODO: use permitedAttributes from relevant policies once they exist
      {
        stopsAttributes: [
          "travelAuthorizationId",
          "locationId",
          "departureDate",
          "departureTime",
          "transport",
          "accommodationType",
        ],
        expensesAttributes: [
          "travelAuthorizationId",
          "type",
          "expenseType",
          "description",
          "date",
          "cost",
          "currency",
          "receiptImage",
          "fileName",
        ],
      },
    ]

    if (this.user.isAdmin) {
      permittedAttributes.push("userId", {
        userAttributes: this.userPolicy.permittedAttributesForCreate(),
      })
    }

    return permittedAttributes
  }

  static policyScope(user: User): FindOptions<Attributes<TravelAuthorization>> {
    if (user.isAdmin) return ALL_RECORDS_SCOPE

    return {
      where: {
        [Op.or]: [
          {
            supervisorEmail: user.email,
          },
          { userId: user.id },
        ],
      },
    }
  }

  private get userPolicy(): UsersPolicy {
    return new UsersPolicy(this.user, User.build())
  }

  private get travelSegmentsPolicy(): TravelSegmentsPolicy {
    return new TravelSegmentsPolicy(this.user, TravelSegment.build())
  }
}

export default TravelAuthorizationsPolicy
