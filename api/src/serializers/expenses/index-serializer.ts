import { isNil, isUndefined, pick } from "lodash"

import { Attachment, Expense, User } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"
import AttachmentsReferenceSerializer, {
  type AttachmentReferenceView,
} from "@/serializers/attachments/reference-serializer"

export type ExpenseIndexView = Pick<
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
    const { receipt } = this.record
    if (isUndefined(receipt)) {
      throw new Error("Expected receipt association to be pre-loaded")
    }

    const serializedReceipt = this.serializeReceipt(receipt)

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
      actions: this.actions(),
    }
  }

  private serializeReceipt(receipt: Attachment | null) {
    if (isNil(receipt)) return null

    return AttachmentsReferenceSerializer.perform(receipt, this.currentUser)
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
