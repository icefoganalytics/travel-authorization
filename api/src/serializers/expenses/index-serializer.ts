import { pick } from "lodash"

import { Expense, User } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"

export type ExpenseIndexView = Pick<
  Expense,
  | "id"
  | "expenseType"
  | "description"
  | "date"
  | "cost"
  | "fileSize"
  | "fileName"
  | "createdAt"
  | "updatedAt"
> & {
  actions: ["delete"] | ["edit", "delete"]
}

export class IndexSerializer extends BaseSerializer<Expense> {
  constructor(
    protected record: Expense,
    protected currentUser: User
  ) {
    super(record)
  }

  perform(): ExpenseIndexView {
    return {
      ...pick(this.record.dataValues, [
        "id",
        "expenseType",
        "description",
        "date",
        "cost",
        "fileSize",
        "fileName",
        "createdAt",
        "updatedAt",
      ]),
      actions: this.actions(),
    }
  }

  // TODO: investigate whether these should depend on a policy check
  private actions(): ["delete"] | ["edit", "delete"] {
    if (this.record.expenseType === Expense.ExpenseTypes.MEALS_AND_INCIDENTALS) {
      return ["delete"]
    } else {
      return ["edit", "delete"]
    }
  }
}

export default IndexSerializer
