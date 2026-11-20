import parseHumanizedDate from "@/utils/travelportal-parsers/parse-humanized-date"

describe("web/src/utils/travel-port-parsers/parse-humanized-date.js", () => {
  describe(".parseHumanizedDate", () => {
    beforeEach(() => {
      vi.useFakeTimers()

      const date = new Date("2023-01-08T13:29:00.000Z")
      vi.setSystemTime(date)
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    test.each([
      ["9 Jan 23", "2023-01-09T00:00:00.000Z"],
      ["9/Jan/23", "2023-01-09T00:00:00.000Z"],
      ["9-Jan-23", "2023-01-09T00:00:00.000Z"],
      ["9 Jan 2023", "2023-01-09T00:00:00.000Z"],
      ["9/Jan/2023", "2023-01-09T00:00:00.000Z"],
      ["9-Jan-2023", "2023-01-09T00:00:00.000Z"],
      ["09 Jan 23", "2023-01-09T00:00:00.000Z"],
      ["09/Jan/23", "2023-01-09T00:00:00.000Z"],
      ["09-Jan-23", "2023-01-09T00:00:00.000Z"],
      ["09 Jan 2023", "2023-01-09T00:00:00.000Z"],
      ["09/Jan/2023", "2023-01-09T00:00:00.000Z"],
      ["09-Jan-2023", "2023-01-09T00:00:00.000Z"],
      ["4 Jan 2023", "2023-01-04T00:00:00.000Z"],
      ["8 Jan 2023", "2023-01-08T00:00:00.000Z"],
    ])(`when given "%s", parses the date with a year as "%s"`, (dateString, expected) => {
      // Arrange: dateString and expected come from the scenario.

      // Act
      const result = parseHumanizedDate(dateString)

      // Assert
      expect(result.toISOString()).toBe(expected)
    })

    test.each([
      ["9 Jan", "2023-01-09T00:00:00.000Z"],
      ["9/Jan", "2023-01-09T00:00:00.000Z"],
      ["9-Jan", "2023-01-09T00:00:00.000Z"],
      ["09 Jan", "2023-01-09T00:00:00.000Z"],
      ["09/Jan", "2023-01-09T00:00:00.000Z"],
      ["09-Jan", "2023-01-09T00:00:00.000Z"],
    ])(`when given "%s", parses the day-first date as "%s"`, (dateString, expected) => {
      // Arrange: dateString and expected come from the scenario.

      // Act
      const result = parseHumanizedDate(dateString)

      // Assert
      expect(result.toISOString()).toBe(expected)
    })

    test.each([
      ["Jan 9", "2023-01-09T00:00:00.000Z"],
      ["Jan/9", "2023-01-09T00:00:00.000Z"],
      ["Jan-9", "2023-01-09T00:00:00.000Z"],
      ["Jan 09", "2023-01-09T00:00:00.000Z"],
      ["Jan/09", "2023-01-09T00:00:00.000Z"],
      ["Jan-09", "2023-01-09T00:00:00.000Z"],
    ])("when given '%s', parses the month-first date as '%s'", (dateString, expected) => {
      // Arrange: dateString and expected come from the scenario.

      // Act
      const result = parseHumanizedDate(dateString)

      // Assert
      expect(result.toISOString()).toBe(expected)
    })

    test("when date with no year is in the past, assumes it's for the next year", () => {
      // Arrange
      const dateString = "4 Jan"

      // Act
      const result = parseHumanizedDate(dateString)

      // Assert
      expect(result.toISOString()).toBe("2024-01-04T00:00:00.000Z")
    })

    test("when invalid date is given, returns null", () => {
      // Arrange
      const dateString = "Invalid Date String"

      // Act
      const result = parseHumanizedDate(dateString)

      // Assert
      expect(result).toBeNull()
    })
  })
})
