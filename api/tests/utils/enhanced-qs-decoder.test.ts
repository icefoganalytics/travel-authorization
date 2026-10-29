import qs from "qs"

import { enhancedQsDecoder } from "@/utils/enhanced-qs-decoder"

describe("api/src/utils/enhanced-qs-decoder.ts", () => {
  describe("enhancedQsDecoder", () => {
    test("when a query contains one thousand indexed IDs and query options, it preserves the complete typed query", () => {
      // Arrange
      const selectedIds = Array.from({ length: 1000 }, (_, index) => index + 1)
      const query = qs.stringify(
        {
          where: { id: selectedIds, isInternationalTravel: true, travelAgencyId: null },
          order: [["id", "DESC"]],
          format: "csv",
        },
        { arrayFormat: "indices", strictNullHandling: true }
      )

      // Act
      const decodedQuery = enhancedQsDecoder(query)

      // Assert
      expect(decodedQuery).toEqual({
        where: {
          id: expect.objectContaining({
            0: "1",
            499: "500",
            999: "1000",
            length: 1000,
          }),
          isInternationalTravel: true,
          travelAgencyId: null,
        },
        order: [["id", "DESC"]],
        format: "csv",
      })
    })

    test.each([1000, 999999999])(
      "when an array index is %i, it rejects the out-of-range query",
      (arrayIndex) => {
        // Arrange
        const query = `where[id][${arrayIndex}]=1`

        // Act / Assert
        expect(() => enhancedQsDecoder(query)).toThrow(RangeError)
      }
    )

    test("when a query exceeds fifteen hundred parameters, it rejects it instead of truncating values", () => {
      // Arrange
      const query = Array.from({ length: 1501 }, (_, index) => `field${index}=value`).join("&")

      // Act / Assert
      expect(() => enhancedQsDecoder(query)).toThrow(RangeError)
    })
  })
})
