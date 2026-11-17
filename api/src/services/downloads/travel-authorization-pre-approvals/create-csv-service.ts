import { type Writable } from "node:stream"

import { IsolationLevel, type Attributes, type ModelStatic, type WhereOptions } from "@sequelize/core"

import { type ModelOrder } from "@/controllers/base-controller"
import { type TravelAuthorizationPreApproval, type User } from "@/models"
import BaseModel from "@/models/base-model"
import { TravelAuthorizationPreApprovalProfilesPolicy } from "@/policies"
import {
  ReportSerializer,
  TravelAuthorizationPreApprovalReportHeaders,
} from "@/serializers/travel-authorization-pre-approvals/report-serializer"
import streamCsv from "@/utils/stream-csv"
import BaseService from "@/services/base-service"

export class CreateCsvService extends BaseService {
  constructor(
    private scopedTravelAuthorizationPreApprovals: ModelStatic<TravelAuthorizationPreApproval>,
    private where: WhereOptions<Attributes<TravelAuthorizationPreApproval>>,
    private order: ModelOrder[] | undefined,
    private currentUser: User,
    private destination: Writable
  ) {
    super()
  }

  async perform(): Promise<void> {
    const headers = Object.values(TravelAuthorizationPreApprovalReportHeaders)
    const profileScope = TravelAuthorizationPreApprovalProfilesPolicy.policyScope(this.currentUser)

    return streamCsv(this.destination, headers, async (writeRow) => {
      await this.scopedTravelAuthorizationPreApprovals.sequelize.transaction(
        {
          isolationLevel: IsolationLevel.REPEATABLE_READ,
          readOnly: true,
        },
        async (transaction) => {
          await (BaseModel.findEach<TravelAuthorizationPreApproval>).call(
            this.scopedTravelAuthorizationPreApprovals,
            {
              where: this.where,
              order: this.order,
              transaction,
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
