import { Attributes, FindOptions, Op } from "@sequelize/core"
import { isUndefined } from "lodash"

import { Path } from "@/utils/deep-pick"
import { User, TravelDeskQuestion, TravelDeskTravelRequest } from "@/models"
import BasePolicy, { ALL_RECORDS_SCOPE } from "@/policies/base-policy"
import PolicyFactory from "@/policies/policy-factory"
import { TravelDeskQuestions, TravelDeskTravelRequestsPolicy } from "@/policies"

export class TravelDeskQuestionsPolicy extends PolicyFactory(TravelDeskQuestion) {
  show(): boolean {
    return this.travelDeskTravelRequestsPolicy.show()
  }

  create(): boolean {
    return this.travelDeskTravelRequestsPolicy.update()
  }

  update(): boolean {
    return this.policyByState.update()
  }

  destroy(): boolean {
    return this.travelDeskTravelRequestsPolicy.update()
  }

  permittedAttributes(): Path[] {
    return this.policyByState.permittedAttributes()
  }

  permittedAttributesForCreate(): Path[] {
    return ["travelRequestId", ...this.permittedAttributes()]
  }

  static policyScope(user: User): FindOptions<Attributes<TravelDeskQuestion>> {
    if (user.isAdmin || user.isTravelDeskUser) {
      return ALL_RECORDS_SCOPE
    }

    return {
      include: [
        {
          association: "travelRequest",
          include: [
            {
              association: "travelAuthorization",
              where: {
                [Op.or]: [
                  {
                    supervisorEmail: user.email,
                  },
                  {
                    userId: user.id,
                  },
                ],
              },
            },
          ],
        },
      ],
    }
  }

  protected get policyByState(): BasePolicy<TravelDeskQuestion> {
    switch (this.travelDeskTravelRequest.status) {
      case TravelDeskTravelRequest.Statuses.OPTIONS_PROVIDED:
        return new TravelDeskQuestions.OptionsProvidedStatePolicy(this.user, this.record)
      default:
        return new TravelDeskQuestions.GenericStatePolicy(this.user, this.record)
    }
  }

  private get travelDeskTravelRequest(): TravelDeskTravelRequest {
    const { travelRequest } = this.record
    if (isUndefined(travelRequest)) {
      throw new Error("Travel request is required")
    }

    return travelRequest
  }

  private get travelDeskTravelRequestsPolicy(): TravelDeskTravelRequestsPolicy {
    return new TravelDeskTravelRequestsPolicy(this.user, this.travelDeskTravelRequest)
  }
}

export default TravelDeskQuestionsPolicy
