import { Attributes, FindOptions } from "@sequelize/core"
import { isEmpty, isNil } from "lodash"

import { Path } from "@/utils/deep-pick"
import { User, FlightReconciliation } from "@/models"
import { ALL_RECORDS_SCOPE, NO_RECORDS_SCOPE } from "@/policies/base-policy"
import PolicyFactory from "@/policies/policy-factory"

export class FlightReconciliationsPolicy extends PolicyFactory(FlightReconciliation) {
  show(): boolean {
    if (this.user.isTravelDeskUser || this.user.isAdmin) return true
    if (this.isFinanceUserWithMatchingDepartment) return true

    return false
  }

  create(): boolean {
    if (this.user.isTravelDeskUser || this.user.isAdmin) return true

    return false
  }

  update(): boolean {
    if (this.user.isTravelDeskUser || this.user.isAdmin) return true
    if (this.isFinanceUserWithMatchingDepartment) return true

    return false
  }

  destroy(): boolean {
    if (this.user.isTravelDeskUser || this.user.isAdmin) return true

    return false
  }

  permittedAttributes(): Path[] {
    return ["reconciled", "reconcilePeriod"]
  }

  permittedAttributesForCreate(): Path[] {
    return ["externalTravComIdentifier", ...this.permittedAttributes()]
  }

  static policyScope(user: User): FindOptions<Attributes<FlightReconciliation>> {
    if (user.isTravelDeskUser || user.isAdmin) {
      return ALL_RECORDS_SCOPE
    }

    const { mailcode } = user
    if (user.isFinanceUser && !isNil(mailcode) && !isEmpty(mailcode)) {
      // TODO: Update TravCom database `ARInvoicesNoHealth` table so that `Department` has a deparment value
      // and not a mailcode value.
      // This requires access to the TravCom database, and updating the seed files in this app.
      return {
        where: {
          invoiceDepartment: mailcode,
        },
      }
    }

    return NO_RECORDS_SCOPE
  }

  get isFinanceUserWithMatchingDepartment(): boolean {
    // TODO: Update TravCom database `ARInvoicesNoHealth` table so that `Department` has a deparment value
    // and not a mailcode value.
    // This requires access to the TravCom database, and updating the seed files in this app.
    return this.user.isFinanceUser && this.record.invoiceDepartment === this.user.mailcode
  }
}

export default FlightReconciliationsPolicy
