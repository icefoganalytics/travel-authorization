import parseTravelportalFlights from "@/utils/travelportal-parsers/parse-travelportal-flights"
import simpleDedent from "@/tests/support/simple-dedent"

describe("web/src/utils/travel-port-parsers/parser-travel-port-flights.js", () => {
  describe(".parseTravelportFlights", () => {
    test.each([
      {
        text: `
        Air Canada AC303
        Departure: 13 Jan 09:05 Pierre Elliott Trudeau Intl Arpt (YUL) Terminal:
        Arrival: 13 Jan 11:53 Vancouver Intl Arpt (YVR) Terminal: M
        Duration: 5 Hour(s) 48 Minutes
        Status: Confirmed
        Class: Q

        Air Canada AC304
        Departure: 13 Jan 09:05 Pierre Elliott Trudeau Intl Arpt (YUL) Terminal:
        Arrival: 13 Jan 11:53 Vancouver Intl Arpt (YVR) Terminal: M
        Duration: 5 Hour(s) 48 Minutes
        Status: Confirmed
        Class: Q
      `,
        expected: [
          {
            airline: "Air Canada",
            arrivalAirport: "Vancouver Intl Arpt",
            arrivalAirportCode: "YVR",
            arrivalDate: "13 Jan",
            arrivalTime: "11:53",
            arrivalTerminal: "M",
            class: "Q",
            departureAirport: "Pierre Elliott Trudeau Intl Arpt",
            departureAirportCode: "YUL",
            departureDate: "13 Jan",
            departureTime: "09:05",
            duration: "5 Hour(s) 48 Minutes",
            flightNumber: "AC303",
            status: "Confirmed",
          },
          {
            airline: "Air Canada",
            arrivalAirport: "Vancouver Intl Arpt",
            arrivalAirportCode: "YVR",
            arrivalDate: "13 Jan",
            arrivalTime: "11:53",
            arrivalTerminal: "M",
            class: "Q",
            departureAirport: "Pierre Elliott Trudeau Intl Arpt",
            departureAirportCode: "YUL",
            departureDate: "13 Jan",
            departureTime: "09:05",
            duration: "5 Hour(s) 48 Minutes",
            flightNumber: "AC304",
            status: "Confirmed",
          },
        ],
      },
      {
        text: `
          Air North 4N521
          Departure:         25 Nov 10:45    Whitehorse Arpt (YXY)  Terminal:
          Arrival:                 25 Nov 12:00    Vancouver Intl Arpt (YVR)           Terminal: M
          Duration:            1 Hour(s) 15 Minutes
          Status:                 Confirmed (Passive)
          Class:                   Y

          Air Canada AC118
          Departure:         25 Nov 14:00    Vancouver Intl Arpt (YVR)           Terminal: M
          Arrival:                 25 Nov 21:26    Lester B Pearson Intl (YYZ)         Terminal: 1
          Duration:            4 Hour(s) 26 Minutes
          Status:                 Sold
          Class:                   S

          Air Canada AC105
          Departure:         30 Nov 09:45    Lester B Pearson Intl (YYZ)         Terminal: 1
          Arrival:                 30 Nov 11:49    Vancouver Intl Arpt (YVR)           Terminal: M
          Duration:            5 Hour(s) 4 Minutes
          Status:                 Sold
          Class:                   L

          Air North 4N540
          Departure:         30 Nov 14:30    Vancouver Intl Arpt (YVR)           Terminal: M
          Arrival:                 30 Nov 17:55    Whitehorse Arpt (YXY)  Terminal:
          Duration:            3 Hour(s) 25 Minutes
          Status:                 Confirmed (Passive)
          Class:                   Y
        `,
        expected: [
          {
            airline: "Air North",
            arrivalAirport: "Vancouver Intl Arpt",
            arrivalAirportCode: "YVR",
            arrivalDate: "25 Nov",
            arrivalTime: "12:00",
            arrivalTerminal: "M",
            class: "Y",
            departureAirport: "Whitehorse Arpt",
            departureAirportCode: "YXY",
            departureDate: "25 Nov",
            departureTime: "10:45",
            duration: "1 Hour(s) 15 Minutes",
            flightNumber: "4N521",
            status: "Confirmed (Passive)",
          },
          {
            airline: "Air Canada",
            arrivalAirport: "Lester B Pearson Intl",
            arrivalAirportCode: "YYZ",
            arrivalDate: "25 Nov",
            arrivalTime: "21:26",
            arrivalTerminal: "1",
            class: "S",
            departureAirport: "Vancouver Intl Arpt",
            departureAirportCode: "YVR",
            departureDate: "25 Nov",
            departureTime: "14:00",
            departureTerminal: "M",
            duration: "4 Hour(s) 26 Minutes",
            flightNumber: "AC118",
            status: "Sold",
          },
          {
            airline: "Air Canada",
            arrivalAirport: "Vancouver Intl Arpt",
            arrivalAirportCode: "YVR",
            arrivalDate: "30 Nov",
            arrivalTime: "11:49",
            arrivalTerminal: "M",
            class: "L",
            departureAirport: "Lester B Pearson Intl",
            departureAirportCode: "YYZ",
            departureDate: "30 Nov",
            departureTime: "09:45",
            departureTerminal: "1",
            duration: "5 Hour(s) 4 Minutes",
            flightNumber: "AC105",
            status: "Sold",
          },
          {
            airline: "Air North",
            arrivalAirport: "Whitehorse Arpt",
            arrivalAirportCode: "YXY",
            arrivalDate: "30 Nov",
            arrivalTime: "17:55",
            class: "Y",
            departureAirport: "Vancouver Intl Arpt",
            departureAirportCode: "YVR",
            departureDate: "30 Nov",
            departureTime: "14:30",
            departureTerminal: "M",
            duration: "3 Hour(s) 25 Minutes",
            flightNumber: "4N540",
            status: "Confirmed (Passive)",
          },
        ],
      },
      {
        text: `
          WestJet WS3566 - Operated By: WESTJET ENCORE
          Departure:         03 Dec 06:25    Cranbrook Municipal (YXC)       Terminal:
          Arrival:                 03 Dec 07:09    Calgary Intl Arpt (YYC)  Terminal:
          Duration:            0 Hour(s) 44 Minutes
          Status:                 Sold
          Class:                   B

          WestJet WS107
          Departure:         03 Dec 09:00    Calgary Intl Arpt (YYC)  Terminal:
          Arrival:                 03 Dec 09:47    Vancouver Intl Arpt (YVR)           Terminal: M
          Duration:            1 Hour(s) 47 Minutes
          Status:                 Sold
          Class:                   B

          Air North 4N564
          Departure:         03 Dec 14:30    Vancouver Intl Arpt (YVR)           Terminal: M
          Arrival:                 03 Dec 17:55    Whitehorse Arpt (YXY)  Terminal:
          Duration:            3 Hour(s) 25 Minutes
          Status:                 Confirmed (Passive)
          Class:                   Y

          Air Canada AC8299 - Operated By: AIR CANADA EXPRESS - JAZZ
          Departure:         03 Dec 16:10    Cranbrook Municipal (YXC)       Terminal:
          Arrival:                 03 Dec 16:39    Vancouver Intl Arpt (YVR)           Terminal: M
          Duration:            1 Hour(s) 29 Minutes
          Status:                 Sold
          Class:                   K

          Air North 4N594
          Departure:         03 Dec 20:50    Vancouver Intl Arpt (YVR)           Terminal: M
          Arrival:                 04 Dec 00:15    Whitehorse Arpt (YXY)  Terminal:
          Duration:            3 Hour(s) 25 Minutes
          Status:                 Confirmed (Passive)
          Class:                   Y

          Air North 4N519
          Departure:         07 Dec 08:20    Whitehorse Arpt (YXY)  Terminal:
          Arrival:                 07 Dec 09:35    Vancouver Intl Arpt (YVR)           Terminal: M
          Duration:            1 Hour(s) 15 Minutes
          Status:                 Sold
          Class:                   Y

          Air Canada AC8298 - Operated By: AIR CANADA EXPRESS - JAZZ
          Departure:         07 Dec 13:00    Vancouver Intl Arpt (YVR)           Terminal: M
          Arrival:                 07 Dec 15:21    Cranbrook Municipal (YXC)       Terminal:
          Duration:            1 Hour(s) 21 Minutes
          Status:                 Sold
          Class:                   K
        `,
        expected: [
          {
            airline: "WestJet",
            operatedBy: "WESTJET ENCORE",
            arrivalAirport: "Calgary Intl Arpt",
            arrivalAirportCode: "YYC",
            arrivalDate: "03 Dec",
            arrivalTime: "07:09",
            class: "B",
            departureAirport: "Cranbrook Municipal",
            departureAirportCode: "YXC",
            departureDate: "03 Dec",
            departureTime: "06:25",
            duration: "0 Hour(s) 44 Minutes",
            flightNumber: "WS3566",
            status: "Sold",
          },
          {
            airline: "WestJet",
            arrivalAirport: "Vancouver Intl Arpt",
            arrivalAirportCode: "YVR",
            arrivalDate: "03 Dec",
            arrivalTime: "09:47",
            arrivalTerminal: "M",
            class: "B",
            departureAirport: "Calgary Intl Arpt",
            departureAirportCode: "YYC",
            departureDate: "03 Dec",
            departureTime: "09:00",
            duration: "1 Hour(s) 47 Minutes",
            flightNumber: "WS107",
            status: "Sold",
          },
          {
            airline: "Air North",
            arrivalAirport: "Whitehorse Arpt",
            arrivalAirportCode: "YXY",
            arrivalDate: "03 Dec",
            arrivalTime: "17:55",
            class: "Y",
            departureAirport: "Vancouver Intl Arpt",
            departureAirportCode: "YVR",
            departureDate: "03 Dec",
            departureTime: "14:30",
            departureTerminal: "M",
            duration: "3 Hour(s) 25 Minutes",
            flightNumber: "4N564",
            status: "Confirmed (Passive)",
          },
          {
            airline: "Air Canada",
            operatedBy: "AIR CANADA EXPRESS - JAZZ",
            arrivalAirport: "Vancouver Intl Arpt",
            arrivalAirportCode: "YVR",
            arrivalDate: "03 Dec",
            arrivalTime: "16:39",
            arrivalTerminal: "M",
            class: "K",
            departureAirport: "Cranbrook Municipal",
            departureAirportCode: "YXC",
            departureDate: "03 Dec",
            departureTime: "16:10",
            duration: "1 Hour(s) 29 Minutes",
            flightNumber: "AC8299",
            status: "Sold",
          },
          {
            airline: "Air North",
            arrivalAirport: "Whitehorse Arpt",
            arrivalAirportCode: "YXY",
            arrivalDate: "04 Dec",
            arrivalTime: "00:15",
            class: "Y",
            departureAirport: "Vancouver Intl Arpt",
            departureAirportCode: "YVR",
            departureDate: "03 Dec",
            departureTime: "20:50",
            departureTerminal: "M",
            duration: "3 Hour(s) 25 Minutes",
            flightNumber: "4N594",
            status: "Confirmed (Passive)",
          },
          {
            airline: "Air North",
            arrivalAirport: "Vancouver Intl Arpt",
            arrivalAirportCode: "YVR",
            arrivalDate: "07 Dec",
            arrivalTime: "09:35",
            arrivalTerminal: "M",
            class: "Y",
            departureAirport: "Whitehorse Arpt",
            departureAirportCode: "YXY",
            departureDate: "07 Dec",
            departureTime: "08:20",
            duration: "1 Hour(s) 15 Minutes",
            flightNumber: "4N519",
            status: "Sold",
          },
          {
            airline: "Air Canada",
            operatedBy: "AIR CANADA EXPRESS - JAZZ",
            arrivalAirport: "Cranbrook Municipal",
            arrivalAirportCode: "YXC",
            arrivalDate: "07 Dec",
            arrivalTime: "15:21",
            class: "K",
            departureAirport: "Vancouver Intl Arpt",
            departureAirportCode: "YVR",
            departureDate: "07 Dec",
            departureTime: "13:00",
            departureTerminal: "M",
            duration: "1 Hour(s) 21 Minutes",
            flightNumber: "AC8298",
            status: "Sold",
          },
        ],
      },
    ])("when given raw example %#, parses it correctly", ({ text, expected }) => {
      const dedentedText = simpleDedent(text)
      const result = parseTravelportalFlights(dedentedText)

      expect(result).toEqual(expected)
    })
  })
})
