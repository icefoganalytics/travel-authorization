import { type Attributes, type ModelStatic, type WhereOptions } from "@sequelize/core"
import { writeToBuffer } from "fast-csv"

import { type ModelOrder } from "@/controllers/base-controller"
import { type TravelAuthorizationPreApproval, type User } from "@/models"
import { TravelAuthorizationPreApprovalProfilesPolicy } from "@/policies"
import {
  ReportSerializer,
  TravelAuthorizationPreApprovalReportHeaders,
} from "@/serializers/travel-authorization-pre-approvals/report-serializer"
import neutralizeSpreadsheetFormula from "@/utils/neutralize-spreadsheet-formula"
import BaseService from "@/services/base-service"

export class CreateCsvService extends BaseService {
  constructor(
    private scopedTravelAuthorizationPreApprovals: ModelStatic<TravelAuthorizationPreApproval>,
    private where: WhereOptions<Attributes<TravelAuthorizationPreApproval>>,
    private order: ModelOrder[] | undefined,
    private currentUser: User
  ) {
    super()
  }

  async perform(): Promise<Buffer> {
    const profileScope = TravelAuthorizationPreApprovalProfilesPolicy.policyScope(this.currentUser)
    const travelAuthorizationPreApprovals = await this.scopedTravelAuthorizationPreApprovals.findAll({
      where: this.where,
      order: this.order,
      include: [
        {
          association: "profiles",
          ...profileScope,
          required: false,
          separate: true,
          order: [["id", "ASC"]],
        },
      ],
    })
    const serializedTravelAuthorizationPreApprovals = ReportSerializer.perform(
      travelAuthorizationPreApprovals
    )
    const headers = Object.values(TravelAuthorizationPreApprovalReportHeaders)
    const csvRows: (string[] | Record<string, string>)[] = [headers]
    for (const row of serializedTravelAuthorizationPreApprovals) {
      const safeRow = Object.fromEntries(
        Object.entries(row).map(([header, value]) => {
          const safeValue = neutralizeSpreadsheetFormula(value)

          return [header, safeValue]
        })
      )
      csvRows.push(safeRow)
    }

    return writeToBuffer(csvRows, {
      headers: true,
      includeEndRowDelimiter: true,
      rowDelimiter: "\r\n",
      writeBOM: true,
    })
  }
}

export default CreateCsvService
