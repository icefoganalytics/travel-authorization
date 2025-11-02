import { pick } from "lodash"

import { FlightStatistic, User } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"

export type FlightStatisticAsIndex = Pick<
  FlightStatistic,
  | "id"
  | "department"
  | "destinationCity"
  | "destinationProvince"
  | "totalTrips"
  | "totalExpenses"
  | "totalFlightCost"
  | "averageDurationDays"
  | "averageExpensesPerDay"
  | "createdAt"
  | "updatedAt"
>

export class IndexSerializer extends BaseSerializer<FlightStatistic> {
  constructor(
    protected record: FlightStatistic,
    protected currentUser: User
  ) {
    super(record)
  }

  perform(): FlightStatisticAsIndex {
    return pick(this.record, [
      "id",
      "department",
      "destinationCity",
      "destinationProvince",
      "totalTrips",
      "totalExpenses",
      "totalFlightCost",
      "averageDurationDays",
      "averageExpensesPerDay",
      "createdAt",
      "updatedAt",
    ])
  }
}

export default IndexSerializer
