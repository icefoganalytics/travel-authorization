import { times } from "lodash"
import qs from "qs"

import { enhancedQsDecoder } from "@/utils/enhanced-qs-decoder"

describe("api/src/utils/enhanced-qs-decoder.ts", () => {
  describe("enhancedQsDecoder", () => {
    test("when an indexed array has 1000 values and other query options, it preserves the complete typed query", () => {
      // Arrange
      const requestIds = times(1000, (index) => String(index + 1))
      const query = qs.stringify(
        {
          order: [["id", "DESC"]],
          format: "csv",
          where: {
            id: requestIds,
            isInternationalTravel: false,
            travelAgencyId: null,
          },
        },
        {
          arrayFormat: "indices",
          strictNullHandling: true,
        }
      )

      // Act
      const decodedQuery = enhancedQsDecoder(query)

      // Assert
      expect(decodedQuery).toEqual({
        order: [["id", "DESC"]],
        format: "csv",
        where: {
          id: requestIds,
          isInternationalTravel: false,
          travelAgencyId: null,
        },
      })
    })

    test("when an indexed array exceeds 1000 values, it rejects the query instead of changing its shape", () => {
      // Arrange
      const requestIds = times(1001, (index) => String(index + 1))
      const query = qs.stringify({
        where: {
          id: requestIds,
        },
      })

      // Act / Assert
      expect(() => enhancedQsDecoder(query)).toThrow(RangeError)
    })

    test("when a query exceeds 1500 parameters, it rejects the query instead of silently truncating values", () => {
      // Arrange
      const query = times(1501, (index) => `field${index}=value`).join("&")

      // Act / Assert
      expect(() => enhancedQsDecoder(query)).toThrow(RangeError)
    })
  })
})
