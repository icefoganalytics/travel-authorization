import FactoryShark from "factory-shark"
import { faker } from "@faker-js/faker/locale/en_CA"

import { FlightReconciliation } from "@/models"

import { userFactory } from "@/factories/user-factory"

export const flightReconciliationFactory = FactoryShark.define(
  FlightReconciliation,
  ({ associate, sequence }) => {
    associate("reconciler", userFactory)
    const invoiceBookingDate = new Date("2026-10-01T12:00:00.000Z")
    const invoiceDetailComputedTravelerFirstName = faker.person.firstName()
    const invoiceDetailComputedTravelerLastName = faker.person.lastName()

    return {
      externalTravComIdentifier: sequence,
      invoiceBookingDate,
      invoiceDepartmentMailcode: "F-1",
      invoiceDetailSellingFare: 1234.5,
      invoiceDetailComputedAgentName: "JANE AGENT",
      invoiceDetailVendorName: "AIR NORTH",
      invoiceDetailComputedTravelerFirstName,
      invoiceDetailComputedTravelerLastName,
      segmentsComputedFlightInfo: "YXY-YVR,YVR-YYZ",
      segmentsComputedFinalDestination: "Toronto",
      reconciled: false,
      reconcilePeriod: null,
    }
  }
)

export default flightReconciliationFactory
