import { pick } from "lodash"

import { Expense, User } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"

export type ExpenseAsReference = Pick<
  Expense,
  | "id"
  | "travelAuthorizationId"
  | "description"
  | "date"
  | "cost"
  | "currency"
  | "type"
  | "expenseType"
  | "createdAt"
  | "updatedAt"
>

export class ReferenceSerializer extends BaseSerializer<Expense> {
  constructor(
    protected record: Expense,
    protected currentUser: User
  ) {
    super(record)
  }

  perform(): ExpenseAsReference {
    return {
      ...pick(this.record, [
        "id",
        "travelAuthorizationId",
        "description",
        "date",
        "cost",
        "currency",
        "type",
        "expenseType",
        "createdAt",
        "updatedAt",
      ]),
    }
  }
}

export default ReferenceSerializer
