import { pick } from "lodash"

import { FlightStatistic, User } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"

export type FlightStatisticAsShow = Pick<
  FlightStatistic,
  | "id"
  | "department"
  | "destinationAirportCode"
  | "destinationCity"
  | "destinationProvince"
  | "totalTrips"
  | "totalRoundTrips"
  | "totalDays"
  | "totalExpenses"
  | "totalFlightCost"
  | "totalRoundTripCost"
  | "averageDurationDays"
  | "averageExpensesPerDay"
  | "averageRoundTripFlightCost"
  | "createdAt"
  | "updatedAt"
>

export class ShowSerializer extends BaseSerializer<FlightStatistic> {
  constructor(
    protected record: FlightStatistic,
    protected currentUser: User
  ) {
    super(record)
  }

  perform(): FlightStatisticAsShow {
    return pick(this.record, [
      "id",
      "department",
      "destinationAirportCode",
      "destinationCity",
      "destinationProvince",
      "totalTrips",
      "totalRoundTrips",
      "totalDays",
      "totalExpenses",
      "totalFlightCost",
      "totalRoundTripCost",
      "averageDurationDays",
      "averageExpensesPerDay",
      "averageRoundTripFlightCost",
      "createdAt",
      "updatedAt",
    ])
  }
}

export default ShowSerializer
