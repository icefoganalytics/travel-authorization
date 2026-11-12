import { Op } from "@sequelize/core"

import { TravelAuthorization, TravelSegment } from "@/models"

export async function validatePrimaryDestination(
  travelAuthorization: TravelAuthorization,
  isActual: boolean
): Promise<void> {
  const tripType = isActual
    ? (travelAuthorization.tripTypeActual ?? travelAuthorization.tripTypeEstimate)
    : travelAuthorization.tripTypeEstimate
  if (tripType !== TravelAuthorization.TripTypes.MULTI_CITY) return

  const numberOfPrimaryDestinations = await TravelSegment.count({
    where: {
      travelAuthorizationId: travelAuthorization.id,
      isActual,
      isPrimaryDestination: true,
      arrivalLocationId: { [Op.ne]: null },
    },
  })
  if (numberOfPrimaryDestinations !== 1) {
    throw new Error("Select a primary destination for the multi-city itinerary before submitting.")
  }
}
