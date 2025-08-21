import { pick } from "lodash"

import { Attachment, User } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"

export type AttachmentReferenceView = Pick<
  Attachment,
  "id" | "targetId" | "targetType" | "name" | "size" | "mimeType" | "createdAt" | "updatedAt"
>

export class ReferenceSerializer extends BaseSerializer<Attachment> {
  constructor(
    protected record: Attachment,
    protected currentUser: User
  ) {
    super(record)
  }

  perform(): AttachmentReferenceView {
    return pick(this.record, [
      "id",
      "targetId",
      "targetType",
      "name",
      "size",
      "mimeType",
      "createdAt",
      "updatedAt",
    ])
  }
}

export default ReferenceSerializer
