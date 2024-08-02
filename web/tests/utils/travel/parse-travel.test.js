import parseTravel from "@/utils/travel/parse-travel"

describe("web/src/utils/travel/parse-travel.js", () => {
  describe(".parseTravel", () => {
    test("when given two flights from Air Canada, parses them correctly", () => {
      const text = `Flights:
        Air Canada AC303
        Departure:	13 Jan 09:05	Pierre Elliott Trudeau Intl Arpt (YUL)	Terminal:
        Arrival:		13 Jan 11:53	Vancouver Intl Arpt (YVR)	Terminal: M
        Duration:	5 Hour(s) 48 Minutes
        Status:		Confirmed
        Class:		Q


        Air Canada AC8099 - Operated By: AIR CANADA EXPRESS - JAZZ
        Departure:	13 Jan 13:55	Vancouver Intl Arpt (YVR)	Terminal: M
        Arrival:		13 Jan 17:19	Whitehorse Arpt (YXY)	Terminal:
        Duration:	3 Hour(s) 24 Minutes
        Status:		Confirmed
        Class:		Q
      `
      const result = parseTravel(text)

      expect(result).toEqual("will fail, not implemented")
    })
  })
})
