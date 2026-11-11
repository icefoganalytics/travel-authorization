import amountToThousandths from "@/utils/amount-to-thousandths"
import { InvoiceValidationError } from "@/services/travel-desk-invoices/invoice-validation-error"

describe("api/src/utils/amount-to-thousandths.ts", () => {
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
