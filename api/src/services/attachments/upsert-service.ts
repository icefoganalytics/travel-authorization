import { readFileSync } from "fs"

import { Attributes } from "@sequelize/core"
import { isNil } from "lodash"

import { Attachment } from "@/models"

import BaseService from "@/services/base-service"

export interface AttachmentUpsertAttributes extends Partial<Attributes<Attachment>> {}

export class UpsertService extends BaseService {
  constructor(
    protected filePath: string,
    protected fileName: string,
    protected attributes: AttachmentUpsertAttributes
  ) {
    super()
  }

  async perform(): Promise<Attachment> {
    const { targetId, targetType, ...optionalAttributes } = this.attributes

    if (isNil(targetId)) {
      throw new Error("Target ID is required")
    }

    if (isNil(targetType)) {
      throw new Error("Target type is required")
    }

    const { mimeType, extension } = await this.determineMimeTypeAndExtension(this.filePath)
    const name = this.buildFullFileName(this.fileName, extension)
    const content = readFileSync(this.filePath)
    const size = content.length

    const existingAttachment = await Attachment.findOne({
      where: {
        targetId,
        targetType,
      },
    })

    if (isNil(existingAttachment)) {
      const attachment = await Attachment.create({
        targetId,
        targetType,
        name,
        size,
        mimeType,
        content,
        ...optionalAttributes,
      })
      return attachment.reload()
    }

    await existingAttachment.update({
      name,
      size,
      mimeType,
      content,
    })
    return existingAttachment.reload()
  }

  private buildFullFileName(baseName: string, extension: string): string {
    if (extension === "") {
      return baseName
    }

    return `${baseName}.${extension}`
  }

  private async determineMimeTypeAndExtension(
    filePath: string
  ): Promise<{ mimeType: string; extension: string }> {
    const { fileTypeFromFile } = await import("file-type")

    const fileTypeResult = await fileTypeFromFile(filePath)
    if (isNil(fileTypeResult)) {
      return {
        mimeType: "application/octet-stream",
        extension: "",
      }
    }

    return {
      mimeType: fileTypeResult.mime,
      extension: fileTypeResult.ext,
    }
  }
}

export default UpsertService
