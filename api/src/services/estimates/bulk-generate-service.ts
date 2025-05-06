import { Expense, TravelSegment } from "@/models"

import BaseService from "@/services/base-service"
import BuildAttributesFromTravelSegmentsService from "@/services/expenses/build-attributes-from-travel-segments-service"

export class BulkGenerateService extends BaseService {
  constructor(
    protected travelAuthorizationId: number,
    protected travelSegments: TravelSegment[],
    protected daysOffTravelStatus: number
  ) {
    super()
  }

  async perform(): Promise<Expense[]> {
    const estimatesAttributes = await BuildAttributesFromTravelSegmentsService.perform(
      this.travelAuthorizationId,
      this.travelSegments,
      this.daysOffTravelStatus,
      Expense.Types.ESTIMATE
    )

    return Expense.bulkCreate(estimatesAttributes)
  }
}

export default BulkGenerateService
