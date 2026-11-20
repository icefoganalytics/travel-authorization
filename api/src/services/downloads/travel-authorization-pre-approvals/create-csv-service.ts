import { type Writable } from "node:stream"

import { type Attributes, type WhereOptions } from "@sequelize/core"

import withAbortableReadTransaction from "@/db/utils/with-abortable-read-transaction"

import CsvStreamingClient from "@/lib/csv-streaming-client"

import { type ModelOrder } from "@/controllers/base-controller"
import { type TravelAuthorizationPreApproval, type User } from "@/models"
import {
  TravelAuthorizationPreApprovalProfilesPolicy,
  type TravelAuthorizationPreApprovalsPolicy,
} from "@/policies"
import {
  ReportSerializer,
  TRAVEL_AUTHORIZATION_PRE_APPROVAL_REPORT_HEADERS,
} from "@/serializers/travel-authorization-pre-approvals/report-serializer"
import BaseService from "@/services/base-service"

export class CreateCsvService extends BaseService {
  constructor(
    private outputStream: Writable,
    private scopedTravelAuthorizationPreApprovals: ReturnType<typeof TravelAuthorizationPreApprovalsPolicy.applyScope>,
    private where: WhereOptions<Attributes<TravelAuthorizationPreApproval>>,
    private order: ModelOrder[] | undefined,
    private currentUser: User
  ) {
    super()
  }

  async perform(): Promise<void> {
    const profileScope = TravelAuthorizationPreApprovalProfilesPolicy.policyScope(this.currentUser)

    return CsvStreamingClient.stream(
      this.outputStream,
      TRAVEL_AUTHORIZATION_PRE_APPROVAL_REPORT_HEADERS,
      (writeRow, signal) => {
        return withAbortableReadTransaction(signal, async () => {
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
        })
      }
    )
  }
}

export default CreateCsvService
