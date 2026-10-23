import Papa from "papaparse"

import {
  TravelDeskTravelRequestReportHeaders,
  type TravelDeskTravelRequestAsReport,
} from "@/serializers/travel-desk-travel-requests/report-serializer"

import { CreateCsvService } from "@/services/downloads/travel-desk-travel-requests/create-csv-service"

describe("api/src/services/downloads/travel-desk-travel-requests/create-csv-service.ts", () => {
  describe("CreateCsvService", () => {
    describe(".perform", () => {
      test("when report cells contain formula text and CSV delimiters, it writes a safe escaped CSV file", async () => {
        // Arrange
        const reportRows: TravelDeskTravelRequestAsReport[] = [
          {
            [TravelDeskTravelRequestReportHeaders.SUBMIT_DATE]: "2026-10-23",
            [TravelDeskTravelRequestReportHeaders.NAME]: 'Élodie, "Anne"\r\nApplicant',
            [TravelDeskTravelRequestReportHeaders.DEPARTMENT]: " \t=SUM(A1:A2)",
            [TravelDeskTravelRequestReportHeaders.BRANCH]: "North, Yukon",
            [TravelDeskTravelRequestReportHeaders.TRAVEL_START_DATE]: "2026-11-02",
            [TravelDeskTravelRequestReportHeaders.TRAVEL_END_DATE]: "2026-11-04",
            [TravelDeskTravelRequestReportHeaders.LOCATION]: "Whitehorse, YT",
            [TravelDeskTravelRequestReportHeaders.REQUESTED]: "flight, hotel",
            [TravelDeskTravelRequestReportHeaders.STATUS]: "Submitted",
            [TravelDeskTravelRequestReportHeaders.TRAVEL_DESK_OFFICER]: "",
          },
        ]

        // Act
        const csvBuffer = await CreateCsvService.perform(reportRows)
        const parsedCsv = Papa.parse<Record<string, string>>(csvBuffer.toString("utf-8"), {
          header: true,
          skipEmptyLines: true,
        })

        // Assert
        expect(csvBuffer.subarray(0, 3).toString("hex")).toEqual("efbbbf")
        expect(csvBuffer.toString("utf-8").endsWith("\r\n")).toBe(true)
        expect(parsedCsv.meta.fields).toEqual(Object.values(TravelDeskTravelRequestReportHeaders))
        expect(parsedCsv.data).toEqual([
          {
            "Submit Date": "2026-10-23",
            Name: 'Élodie, "Anne"\r\nApplicant',
            Department: "' \t=SUM(A1:A2)",
            Branch: "North, Yukon",
            "Travel Start Date": "2026-11-02",
            "Travel End Date": "2026-11-04",
            Location: "Whitehorse, YT",
            Requested: "flight, hotel",
            Status: "Submitted",
            "Travel Desk Officer": "",
          },
        ])
      })
    })
  })
})
