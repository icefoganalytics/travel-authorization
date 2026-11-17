import { type Writable } from "node:stream"

import { IsolationLevel, type Attributes, type WhereOptions } from "@sequelize/core"

import csvStreamingClient from "@/lib/csv-streaming-client"
import { type ModelOrder } from "@/controllers/base-controller"
import db, { type TravelAuthorizationPreApproval, type User } from "@/models"
import { type BaseModelConstructor } from "@/models/base-model"
import { TravelAuthorizationPreApprovalProfilesPolicy } from "@/policies"
import {
  ReportSerializer,
  TravelAuthorizationPreApprovalReportHeaders,
} from "@/serializers/travel-authorization-pre-approvals/report-serializer"
import BaseService from "@/services/base-service"

export class CreateCsvService extends BaseService {
  constructor(
    private outputStream: Writable,
    private scopedTravelAuthorizationPreApprovals: BaseModelConstructor<TravelAuthorizationPreApproval>,
    private where: WhereOptions<Attributes<TravelAuthorizationPreApproval>>,
    private order: ModelOrder[] | undefined,
    private currentUser: User
  ) {
    super()
  }

  async perform(): Promise<void> {
    const headers = Object.values(TravelAuthorizationPreApprovalReportHeaders)
    const profileScope = TravelAuthorizationPreApprovalProfilesPolicy.policyScope(this.currentUser)

    return csvStreamingClient.stream(this.outputStream, headers, async (writeRow) => {
      await db.transaction(
        {
          isolationLevel: IsolationLevel.REPEATABLE_READ,
          readOnly: true,
        },
        async () => {
          await this.scopedTravelAuthorizationPreApprovals.findEach(
            {
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
            },
            async (record) => {
              const row = ReportSerializer.perform(record)
              await writeRow(row)
            }
          )
        }
      )
    })
  }
}

export default CreateCsvService
