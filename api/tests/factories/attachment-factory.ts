import FactoryShark from "factory-shark"
import { isNil } from "lodash"

import { Attachment } from "@/models"

export const attachmentFactory = FactoryShark.define(Attachment, ({ params, sequence }) => {
  const { targetId, targetType } = params
  if (isNil(targetId) || isNil(targetType)) {
    throw new Error("Attachment factory requires targetId and targetType.")
  }

  const content = Buffer.from("attachment")

  return {
    targetId,
    targetType,
    name: `attachment-${sequence}.txt`,
    content,
    size: content.length,
    mimeType: "text/plain",
  }
})

export default attachmentFactory
