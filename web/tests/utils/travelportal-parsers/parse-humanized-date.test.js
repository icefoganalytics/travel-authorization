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
    ])(`when given "%s" parses date with year format to "%s"`, (dateStr, expected) => {
      const result = parseHumanizedDate(dateStr)
      expect(result.toISOString()).toBe(expected)
    })

    test.each([
      ["9 Jan", "2023-01-09T00:00:00.000Z"],
      ["9/Jan", "2023-01-09T00:00:00.000Z"],
      ["9-Jan", "2023-01-09T00:00:00.000Z"],
      ["09 Jan", "2023-01-09T00:00:00.000Z"],
      ["09/Jan", "2023-01-09T00:00:00.000Z"],
      ["09-Jan", "2023-01-09T00:00:00.000Z"],
    ])(`when given "%s" parses date with day first format to "%s"`, (dateStr, expected) => {
      const result = parseHumanizedDate(dateStr)
      expect(result.toISOString()).toBe(expected)
    })

    test.each([
      ["Jan 9", "2023-01-09T00:00:00.000Z"],
      ["Jan/9", "2023-01-09T00:00:00.000Z"],
      ["Jan-9", "2023-01-09T00:00:00.000Z"],
      ["Jan 09", "2023-01-09T00:00:00.000Z"],
      ["Jan/09", "2023-01-09T00:00:00.000Z"],
      ["Jan-09", "2023-01-09T00:00:00.000Z"],
    ])("when given '%s' parses date with month first format to '%s'", (dateStr, expected) => {
      const result = parseHumanizedDate(dateStr)
      expect(result.toISOString()).toBe(expected)
    })

    test("when date with no year is in the past, assumes it's for the next year", () => {
      const result = parseHumanizedDate("4 Jan")
      expect(result.toISOString()).toBe("2024-01-04T00:00:00.000Z")
    })

    test("when invalid date is given, returns null", () => {
      const result = parseHumanizedDate("Invalid Date String")
      expect(result).toBeNull()
    })
  })
})
