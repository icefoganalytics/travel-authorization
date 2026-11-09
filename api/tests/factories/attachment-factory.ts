import { Factory } from "fishery"

import { Attachment } from "@/models"

export const attachmentFactory = Factory.define<Attachment>(
  ({ params, afterBuild, onCreate, sequence }) => {
    onCreate(async (attachment) => {
      try {
        return await attachment.save()
      } catch (error) {
        console.error(error)
        throw new Error(
          `Could not create Attachment with attributes: ${JSON.stringify(attachment.dataValues, null, 2)}`
        )
      }
    })

    const { targetId, targetType } = params
    if (targetId === undefined || targetType === undefined) {
      throw new Error("Attachment factory requires targetId and targetType.")
    }

    const content = Buffer.from("attachment")
    // Fishery's deep merge does not preserve Buffer overrides.
    afterBuild((attachment) => {
      if (Buffer.isBuffer(params.content)) {
        attachment.content = params.content
      }
    })

    return Attachment.build({
      targetId,
      targetType,
      name: `attachment-${sequence}.txt`,
      content,
      size: content.length,
      mimeType: "text/plain",
    })
  }
)

export default attachmentFactory
