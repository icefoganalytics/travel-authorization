import { Attributes, FindOptions, Op } from "sequelize"

import { Path } from "@/utils/deep-pick"
import { User, TravelAuthorization } from "@/models"
import BasePolicy, { ALL_RECORDS_SCOPE } from "@/policies/base-policy"
import PolicyFactory from "@/policies/policy-factory"
import ApprovePolicy from "@/policies/travel-authorizations/approve-policy"
import DraftPolicy from "@/policies/travel-authorizations/draft-policy"
import SubmitPolicy from "@/policies/travel-authorizations/submit-policy"
import UsersPolicy from "@/policies/users-policy"

export class TravelAuthorizationsPolicy extends PolicyFactory(TravelAuthorization) {
  create(): boolean {
    return this.policyByState.create()
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

  destroy(): boolean {
    return this.policyByState.destroy()
  }

  permittedAttributes(): Path[] {
    return this.policyByState.permittedAttributes()
  }

  permittedAttributesForCreate(): Path[] {
    return this.policyByState.permittedAttributesForCreate()
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

  protected get policyByState(): BasePolicy<TravelAuthorization> {
    switch (this.record.status) {
      case TravelAuthorization.Statuses.DRAFT:
        return new DraftPolicy(this.user, this.record)
      case TravelAuthorization.Statuses.SUBMITTED:
        return new SubmitPolicy(this.user, this.record)
      case TravelAuthorization.Statuses.APPROVED:
        return new ApprovePolicy(this.user, this.record)
      default:
        return new BasePolicy(this.user, this.record)
    }
  }

  protected get draftPolicy(): DraftPolicy {
    return new DraftPolicy(this.user, this.record)
  }

  protected get userPolicy(): UsersPolicy {
    return new UsersPolicy(this.user, User.build())
  }
}

export default TravelAuthorizationsPolicy
