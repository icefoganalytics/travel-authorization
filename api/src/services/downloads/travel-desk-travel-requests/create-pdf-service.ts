import { DateTime } from "luxon"

import templateClient from "@/templates/template-client"
import { generatePdf } from "@/lib/generate-pdf"

import {
  type TravelDeskTravelRequestAsReport,
  TravelDeskTravelRequestReportHeaders,
} from "@/serializers/travel-desk-travel-requests/report-serializer"
import BaseService from "@/services/base-service"

const ROWS_PER_PAGE = 10

export class CreatePdfService extends BaseService {
  constructor(private rows: TravelDeskTravelRequestAsReport[]) {
    super()
  }

  async perform(): Promise<Buffer> {
    const pages: TravelDeskTravelRequestAsReport[][] = []

    for (let rowIndex = 0; rowIndex < this.rows.length; rowIndex += ROWS_PER_PAGE) {
      pages.push(this.rows.slice(rowIndex, rowIndex + ROWS_PER_PAGE))
    }

    const headers = Object.values(TravelDeskTravelRequestReportHeaders)
    const logoDataUri = `data:image/svg+xml;base64,${templateClient.loadAsset("assets/yukon.svg")}`
    const htmlDocument = templateClient.render("travel-desk-travel-requests/report.html", {
      headers,
      logoDataUri,
      pages,
    })

    const printedAt = DateTime.utc().toFormat("yyyy-MM-dd HH:mm 'UTC'")

    return generatePdf(htmlDocument, {
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
