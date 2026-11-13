import { CalculateTotalService } from "@/services/travel-desk-invoices/calculate-total-service"
import { InvoiceValidationError } from "@/services/travel-desk-invoices/invoice-validation-error"

describe("api/src/services/travel-desk-invoices/calculate-total-service.ts", () => {
  describe("CalculateTotalService", () => {
    describe(".perform", () => {
      test("when amounts have excess precision, it totals individually rounded lines", () => {
        // Arrange
        const items = [
          { grossAmount: "1.0005", saleType: "Sale" as const },
          { grossAmount: "1.0005", saleType: "Sale" as const },
          { grossAmount: "-0.0005", saleType: "Refund" as const },
        ]

        // Act
        const total = CalculateTotalService.perform(items)

        // Assert
        expect(total).toEqual("2.001")
      })

      test("when an amount is blank, it does not substitute a zero charge", () => {
        // Arrange
        const amount = ""

        // Act / Assert
        expect(() =>
          CalculateTotalService.perform([{ grossAmount: amount, saleType: "Sale" }])
        ).toThrow(InvoiceValidationError)
      })

      test("when large sales and fractional credits are combined, it retains every thousandth", () => {
        // Arrange
        const items = [
          { grossAmount: "900000000000000.001", saleType: "Sale" as const },
          { grossAmount: "0.002", saleType: "Sale" as const },
          { grossAmount: "0.001", saleType: "Refund" as const },
          { grossAmount: "42.125", saleType: "Void" as const },
        ]

        // Act
        const total = CalculateTotalService.perform(items)

        // Assert
        expect(total).toEqual("900000000000000.002")
      })

      test("when a refund amount is negative, it subtracts the credit only once", () => {
        // Arrange
        const items = [
          { grossAmount: "-0.001", saleType: "Sale" as const },
          { grossAmount: "-1.234", saleType: "Refund" as const },
        ]

        // Act
        const total = CalculateTotalService.perform(items)

        // Assert
        expect(total).toEqual("-1.235")
      })

      test("when the total exceeds database precision, it rejects rather than rounding", () => {
        // Arrange
        const items = [
          { grossAmount: "999999999999999.999", saleType: "Sale" as const },
          { grossAmount: "0.001", saleType: "Sale" as const },
        ]

        // Act / Assert
        expect(() => CalculateTotalService.perform(items)).toThrow(InvoiceValidationError)
      })
    })
  })
})
