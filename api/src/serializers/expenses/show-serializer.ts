import { isUndefined, pick } from "lodash"

import { Attachment, Expense, User } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"
import AttachmentsReferenceSerializer, {
  AttachmentReferenceView,
} from "@/serializers/attachments/reference-serializer"

export type ExpenseShowView = Pick<
  Expense,
  | "id"
  | "travelAuthorizationId"
  | "description"
  | "date"
  | "cost"
  | "currency"
  | "type"
  | "expenseType"
  | "approverId"
  | "approvedAt"
  | "rejectorId"
  | "rejectedAt"
  | "rejectionNote"
  | "createdAt"
  | "updatedAt"
> & {
  receipt: AttachmentReferenceView | null
}

export class ShowSerializer extends BaseSerializer<Expense> {
  constructor(
    protected record: Expense,
    protected currentUser: User
  ) {
    super(record)
  }

  perform(): ExpenseShowView {
    const { receipt } = this.record
    if (isUndefined(receipt)) {
      throw new Error("Expected receipt association to be pre-loaded")
    }

    const serializedReceipt = this.serializeReceipt(receipt)

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
        "approverId",
        "approvedAt",
        "rejectorId",
        "rejectedAt",
        "rejectionNote",
        "createdAt",
        "updatedAt",
      ]),
      receipt: serializedReceipt,
    }
  }

  private serializeReceipt(receipt: Attachment): AttachmentReferenceView {
    return AttachmentsReferenceSerializer.perform(receipt, this.currentUser)
  }
}

export default ShowSerializer
