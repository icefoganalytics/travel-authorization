import {
  amountToThousandths,
  calculateInvoiceTotal,
  InvoiceValidationError,
} from "@/services/travel-desk-invoices/amounts"

describe("api/src/services/travel-desk-invoices/amounts.ts", () => {
  describe("calculateInvoiceTotal", () => {
    describe(".perform", () => {
      test("when large sales and fractional credits are combined, it retains every thousandth", () => {
        // Arrange
        const items = [
          { grossAmount: "900000000000000.001", saleType: "Sale" as const },
          { grossAmount: "0.002", saleType: "Sale" as const },
          { grossAmount: "0.001", saleType: "Refund" as const },
          { grossAmount: "42.125", saleType: "Void" as const },
        ]

        // Act
        const total = calculateInvoiceTotal(items)

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
        const total = calculateInvoiceTotal(items)

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
        expect(() => calculateInvoiceTotal(items)).toThrow(InvoiceValidationError)
      })
    })
  })

  describe("amountToThousandths", () => {
    describe(".perform", () => {
      test("when an amount has more than three decimal places, it refuses precision loss", () => {
        // Arrange
        const amount = "1.0001"

        // Act / Assert
        expect(() => amountToThousandths(amount)).toThrow(InvoiceValidationError)
      })

      test("when an amount is blank, it does not substitute a zero charge", () => {
        // Arrange
        const amount = ""

        // Act / Assert
        expect(() => amountToThousandths(amount)).toThrow(InvoiceValidationError)
      })
    })
  })
})
