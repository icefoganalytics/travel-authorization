import { Attributes, FindOptions, Op } from "@sequelize/core"

import { Path } from "@/utils/deep-pick"
import { User, TravelAuthorization } from "@/models"
import BasePolicy, { ALL_RECORDS_SCOPE } from "@/policies/base-policy"
import PolicyFactory from "@/policies/policy-factory"
import ApproveStatePolicy from "@/policies/travel-authorizations/approve-state-policy"
import DraftStatePolicy from "@/policies/travel-authorizations/draft-state-policy"
import GenericStatePolicy from "@/policies/travel-authorizations/generic-state-policy"
import SubmitStatePolicy from "@/policies/travel-authorizations/submit-state-policy"
import UsersPolicy from "@/policies/users-policy"

export class TravelAuthorizationsPolicy extends PolicyFactory(TravelAuthorization) {
  show(): boolean {
    if (this.user.isAdmin) return true
    if (this.user.isFinanceUser && this.record.department === this.user.department) return true
    if (this.record.supervisorEmail === this.user.email) return true
    if (this.record.userId === this.user.id) return true

    return false
  }

  create(): boolean {
    if (this.user.isAdmin) return true
    if (this.record.userId === this.user.id) return true

    return false
  }

  update(): boolean {
    return this.policyByState.update()
  }

  destroy(): boolean {
    return this.policyByState.destroy()
  }

  permittedAttributes(): Path[] {
    return this.policyByState.permittedAttributes()
  }

  permittedAttributesForCreate(): Path[] {
    const permittedAttributes: Path[] = ["slug", ...this.permittedAttributes()]

    if (this.user.isAdmin) {
      permittedAttributes.push("userId", {
        userAttributes: this.userPolicy.permittedAttributesForCreate(),
      })
    }

    return permittedAttributes
  }

  static policyScope(user: User): FindOptions<Attributes<TravelAuthorization>> {
    if (user.isAdmin) return ALL_RECORDS_SCOPE

    if (user.isFinanceUser) {
      return {
        where: {
          [Op.or]: [
            {
              department: user.department,
            },
            {
              supervisorEmail: user.email,
            },
            {
              userId: user.id,
            },
          ],
        },
      }
    }

    return {
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
    }
  }

  protected get policyByState(): BasePolicy<TravelAuthorization> {
    switch (this.record.status) {
      case TravelAuthorization.Statuses.DRAFT:
        return new DraftStatePolicy(this.user, this.record)
      case TravelAuthorization.Statuses.SUBMITTED:
        return new SubmitStatePolicy(this.user, this.record)
      case TravelAuthorization.Statuses.APPROVED:
        return new ApproveStatePolicy(this.user, this.record)
      default:
        return new GenericStatePolicy(this.user, this.record)
    }
  }

  protected get userPolicy(): UsersPolicy {
    return new UsersPolicy(this.user, User.build())
  }
}

export default TravelAuthorizationsPolicy
