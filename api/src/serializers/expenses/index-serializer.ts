import { isNil, isUndefined, pick } from "lodash"

import { Attachment, Expense, User } from "@/models"
import { ExpensesPolicy } from "@/policies"
import BaseSerializer from "@/serializers/base-serializer"
import AttachmentsReferenceSerializer, {
  type AttachmentReferenceView,
} from "@/serializers/attachments/reference-serializer"

export type ExpenseAsIndex = Pick<
  Expense,
  | "id"
  | "expenseType"
  | "description"
  | "date"
  | "cost"
  | "approverId"
  | "approvedAt"
  | "rejectorId"
  | "rejectedAt"
  | "rejectionNote"
  | "createdAt"
  | "updatedAt"
> & {
  receipt: AttachmentReferenceView | null
  policy: ExpensesPolicy
}

export class IndexSerializer extends BaseSerializer<Expense> {
  constructor(
    protected record: Expense,
    protected currentUser: User
  ) {
    super(record)
  }

  perform(): ExpenseAsIndex {
    const { receipt } = this.record
    if (isUndefined(receipt)) {
      throw new Error("Expected receipt association to be pre-loaded")
    }

    const serializedReceipt = this.serializeReceipt(receipt)
    const policy = this.buildExpensePolicy(this.currentUser, this.record)

    return {
      ...pick(this.record, [
        "id",
        "expenseType",
        "description",
        "date",
        "cost",
        "approverId",
        "approvedAt",
        "rejectorId",
        "rejectedAt",
        "rejectionNote",
        "createdAt",
        "updatedAt",
      ]),
      receipt: serializedReceipt,
      policy,
    }
  }

  private serializeReceipt(receipt: Attachment | null) {
    if (isNil(receipt)) return null

    return AttachmentsReferenceSerializer.perform(receipt, this.currentUser)
  }

  private buildExpensePolicy(currentUser: User, expense: Expense) {
    return new ExpensesPolicy(currentUser, expense)
  }
}

export default IndexSerializer
