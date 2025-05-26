import { Expense, TravelSegment } from "@/models"
import BaseService from "@/services/base-service"
import BuildAttributesFromTravelSegmentsService from "@/services/expenses/build-attributes-from-travel-segments-service"

export class PrefillService extends BaseService {
  constructor(
    protected travelAuthorizationId: number,
    protected travelSegments: TravelSegment[],
    protected daysOffTravelStatus: number
  ) {
    super()
  }

  async perform(): Promise<Expense[]> {
    const expensesAttributes = await BuildAttributesFromTravelSegmentsService.perform(
      this.travelAuthorizationId,
      this.travelSegments,
      this.daysOffTravelStatus,
      Expense.Types.EXPENSE
    )

    return Expense.bulkCreate(expensesAttributes)
  }
}

export default PrefillService
