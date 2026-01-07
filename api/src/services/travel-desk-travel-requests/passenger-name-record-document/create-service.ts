import { readFileSync } from "fs"

import { CreationAttributes } from "@sequelize/core"
import { isEmpty, isNil } from "lodash"
import { DateTime } from "luxon"

import { Attachment, TravelDeskTravelRequest } from "@/models"

import BaseService from "@/services/base-service"

export class CreateService extends BaseService {
  constructor(
    protected travelDeskTravelRequest: TravelDeskTravelRequest,
    protected filePath: string
  ) {
    super()
  }

  async perform(): Promise<Attachment> {
    const { mimeType, extension } = await this.determineMimeTypeAndExtension(this.filePath)
    const name = this.buildFileName(extension)
    const content = readFileSync(this.filePath)
    const size = content.length

    const attachmentAttributes: CreationAttributes<Attachment> = {
      targetId: this.travelDeskTravelRequest.id,
      targetType: Attachment.TargetTypes.TravelDeskTravelRequest,
      name,
      size,
      mimeType,
      content,
    }

    const attachment = await this.ensurePassengerNameRecordDocument(attachmentAttributes)
    return attachment.reload()
  }

  private buildFileName(extension: string): string {
    const { legalLastName, invoiceNumber } = this.travelDeskTravelRequest
    const date = DateTime.now().toFormat("yyyy-MM-dd")

    let baseName = `Passenger Name Record, ${legalLastName}, ${date}`
    if (!isNil(invoiceNumber)) {
      baseName = `Passenger Name Record, ${legalLastName} - ${invoiceNumber}, ${date}`
    }

    if (isEmpty(extension)) {
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

  private async ensurePassengerNameRecordDocument(
    attachmentAttributes: CreationAttributes<Attachment>
  ): Promise<Attachment> {
    const { targetId, targetType } = attachmentAttributes

    const attachment = await Attachment.findOne({
      where: {
        targetId,
        targetType,
      },
    })
    if (!isNil(attachment)) {
      return attachment.update(attachmentAttributes)
    }

    return Attachment.create(attachmentAttributes)
  }
}
