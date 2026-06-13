import { Attributes, FindOptions, Op } from "@sequelize/core"

import { Path } from "@/utils/deep-pick"
import { User, TravelAuthorization } from "@/models"
import BasePolicy, { ALL_RECORDS_SCOPE } from "@/policies/base-policy"
import PolicyFactory from "@/policies/policy-factory"
import ApproveStatePolicy from "@/policies/travel-authorizations/approve-state-policy"
import BookedStatePolicy from "@/policies/travel-authorizations/booked-state-policy"
import ChangeRequestedStatePolicy from "@/policies/travel-authorizations/change-requested-state-policy"
import DraftStatePolicy from "@/policies/travel-authorizations/draft-state-policy"
import ExpenseClaimApprovedStatePolicy from "@/policies/travel-authorizations/expense-claim-approved-state-policy"
import ExpenseClaimSubmittedStatePolicy from "@/policies/travel-authorizations/expense-claim-submitted-state-policy"
import ExpenseClaimSupervisorChangesRequestedStatePolicy from "@/policies/travel-authorizations/expense-claim-supervisor-changes-requested-state-policy"
import ExpenseClaimTravellerChangesRequestedStatePolicy from "@/policies/travel-authorizations/expense-claim-traveller-changes-requested-state-policy"
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
      case TravelAuthorization.Statuses.CHANGE_REQUESTED:
        return new ChangeRequestedStatePolicy(this.user, this.record)
      case TravelAuthorization.Statuses.APPROVED:
        return new ApproveStatePolicy(this.user, this.record)
      case TravelAuthorization.Statuses.BOOKED:
        return new BookedStatePolicy(this.user, this.record)
      case TravelAuthorization.Statuses.EXPENSE_CLAIM_APPROVED:
        return new ExpenseClaimApprovedStatePolicy(this.user, this.record)
      case TravelAuthorization.Statuses.EXPENSE_CLAIM_SUBMITTED:
        return new ExpenseClaimSubmittedStatePolicy(this.user, this.record)
      case TravelAuthorization.Statuses.EXPENSE_CLAIM_TRAVELLER_CHANGES_REQUESTED:
        return new ExpenseClaimTravellerChangesRequestedStatePolicy(this.user, this.record)
      case TravelAuthorization.Statuses.EXPENSE_CLAIM_SUPERVISOR_CHANGES_REQUESTED:
        return new ExpenseClaimSupervisorChangesRequestedStatePolicy(this.user, this.record)
      default:
        return new GenericStatePolicy(this.user, this.record)
    }
  }

  protected get userPolicy(): UsersPolicy {
    return new UsersPolicy(this.user, User.build())
  }
}

export default TravelAuthorizationsPolicy
