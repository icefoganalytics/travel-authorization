import { pick } from "lodash"

import { Expense } from "@/models"
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
