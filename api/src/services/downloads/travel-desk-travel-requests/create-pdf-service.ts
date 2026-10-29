import { type Attributes, type ModelStatic, type WhereOptions } from "@sequelize/core"
import { isEmpty } from "lodash"
import { DateTime } from "luxon"

import { type ModelOrder } from "@/controllers/base-controller"
import { type TravelDeskTravelRequest, type User } from "@/models"
import templateClient from "@/templates/template-client"

import {
  type TravelDeskTravelRequestAsReport,
  TravelDeskTravelRequestReportHeaders,
} from "@/serializers/travel-desk-travel-requests/report-serializer"
import BaseService from "@/services/base-service"
import { IndexService } from "@/services/downloads/travel-desk-travel-requests/index-service"

const ROWS_PER_PAGE = 10

export class CreatePdfService extends BaseService {
  constructor(
    private scopedTravelDeskTravelRequests: ModelStatic<TravelDeskTravelRequest>,
    private where: WhereOptions<Attributes<TravelDeskTravelRequest>>,
    private order: ModelOrder[] | undefined,
    private currentUser: User
  ) {
    super()
  }

  async perform(): Promise<Buffer> {
    const serializedTravelDeskTravelRequests = await IndexService.perform(
      this.scopedTravelDeskTravelRequests,
      this.where,
      this.order,
      this.currentUser
    )
    if (isEmpty(serializedTravelDeskTravelRequests)) {
      throw new Error("Travel desk travel requests were not found")
    }

    const pages: TravelDeskTravelRequestAsReport[][] = []

    for (
      let rowIndex = 0;
      rowIndex < serializedTravelDeskTravelRequests.length;
      rowIndex += ROWS_PER_PAGE
    ) {
      pages.push(serializedTravelDeskTravelRequests.slice(rowIndex, rowIndex + ROWS_PER_PAGE))
    }

    const headers = Object.values(TravelDeskTravelRequestReportHeaders)
    const logoDataUri = `data:image/svg+xml;base64,${templateClient.loadAsset("assets/yukon.svg")}`
    const htmlDocument = templateClient.render("travel-desk-travel-requests/report.html", {
      headers,
      logoDataUri,
      pages,
    })

    const printedAt = DateTime.utc().toFormat("yyyy-MM-dd HH:mm 'UTC'")

    return templateClient.htmlToPdf(htmlDocument, {
      format: "letter",
      landscape: true,
      preferCSSPageSize: true,
      displayHeaderFooter: true,
      headerTemplate: "<span></span>",
      footerTemplate: `
        <div style="width: 100%; padding: 0 8mm; color: #555; font: 8px Arial, sans-serif;">
          Printed on: ${printedAt}
          <span style="float: right;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
        </div>
      `,
    })
  }
}

export default CreatePdfService
