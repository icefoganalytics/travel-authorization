import { TravComIntegration } from "@/integrations"

import {
  accountsReceivableInvoiceFactory,
  accountsReceivableInvoiceDetailFactory,
  createCity,
  segmentFactory,
} from "@/integrations/trav-com-integration/tests/factories"

describe("api/src/integrations/trav-com-integration/tests/factories/segment-factory.ts", () => {
  describe("segmentFactory", () => {
    describe("#create", () => {
      test("when parents are generated, persists the detail and segment on the same invoice", async () => {
        // Arrange
        const segmentAttributes = { legNumber: 1 }

        // Act
        const segment = await segmentFactory.create(segmentAttributes)

        // Assert
        const invoices = await TravComIntegration.Models.AccountsReceivableInvoice.findAll({
          include: ["details", "segments"],
        })
        expect(invoices).toEqual([
          expect.objectContaining({
            id: segment.invoiceId,
            details: [
              expect.objectContaining({
                id: segment.invoiceDetailId,
                invoiceId: segment.invoiceId,
              }),
            ],
            segments: [
              expect.objectContaining({
                id: segment.id,
                invoiceId: segment.invoiceId,
                invoiceDetailId: segment.invoiceDetailId,
              }),
            ],
          }),
        ])
      })

      test("when foreign keys are supplied, reloads existing parents and cities by city code", async () => {
        // Arrange
        const invoice = await accountsReceivableInvoiceFactory.create()
        const detail = await accountsReceivableInvoiceDetailFactory.create({
          invoiceId: invoice.id,
        })
        const departureCity = await createCity({ cityCode: "YXY", cityName: "WHITEHORSE" })
        const arrivalCity = await createCity({ cityCode: "YVR", cityName: "VANCOUVER INTL" })
        const reloadingSegmentFactory = segmentFactory.transient({
          include: ["invoice", "invoiceDetail", "departureCity", "arrivalCity"],
        })

        // Act
        const segment = await reloadingSegmentFactory.create({
          id: 9001,
          invoiceId: invoice.id,
          invoiceDetailId: detail.id,
          departureCityCode: departureCity.cityCode,
          arrivalCityCode: arrivalCity.cityCode,
        })

        // Assert
        expect(segment.get({ plain: true })).toMatchObject({
          id: "9001",
          invoiceId: invoice.id,
          invoiceDetailId: detail.id,
          invoice: { id: invoice.id },
          invoiceDetail: { id: detail.id, invoiceId: invoice.id },
          departureCity: { cityCode: "YXY", cityName: "WHITEHORSE" },
          arrivalCity: { cityCode: "YVR", cityName: "VANCOUVER INTL" },
        })
      })
    })
  })
})
