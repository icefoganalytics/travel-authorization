import express, { Request, Response } from "express"
import knex from "knex"

import logger from "@/utils/logger"
import { RequiresAuth } from "@/middleware"
import { airports } from "@/json/airportCodes"
import { TRAVCOM_DB_CONFIG } from "@/config"

const db = knex(TRAVCOM_DB_CONFIG)

export const travComRouter = express.Router()

travComRouter.get(
  "/itinerary/:InvoiceNumber",
  RequiresAuth,
  async function (req: Request, res: Response) {
    try {
      const InvoiceNumber = req.params.InvoiceNumber
      const invoice = await db("dbo.ARInvoicesNoHealth")
        .where({ InvoiceNumber: InvoiceNumber })
        .select()
        .first()
      const InvoiceID = invoice.InvoiceID
      const details = await db("dbo.ARInvoiceDetailsNoHealth")
        .where({ InvoiceID: InvoiceID })
        .select()
      const unsortedSegments = await db("dbo.segmentsNoHealth")
        .where({ InvoiceID: InvoiceID })
        .select()

      const segments = unsortedSegments.sort((a: any, b: any) =>
        a.DepartureInfo >= b.DepartureInfo ? 1 : -1
      )

      const result: { segments: any[]; remarks: string; totalCost: number } = {
        segments: [],
        remarks: "",
        totalCost: 0,
      }
      result.remarks = invoice.InvoiceRemarks
      details.forEach((detail: any) => (result.totalCost += Number(detail.GrossAmount)))

      for (const segment of segments) {
        const depAirport = airports.filter(
          (airport) => airport.iata_code == segment.DepartureCityCode
        )
        const arrAirport = airports.filter(
          (airport) => airport.iata_code == segment.ArrivalCityCode
        )
        const detail = details.filter(
          (detail: any) => detail.InvoiceDetailID == segment.InvoiceDetailID
        )

        result.segments.push({
          flightNumber: segment.AirlineCode + Number(segment.FlightNumber),
          departDate: segment.DepartureInfo,
          departLocation:
            (depAirport[0] ? depAirport[0].name : "") + " (" + segment.DepartureCityCode + ")",
          arriveDate: segment.ArrivalInfo,
          arriveLocation:
            (arrAirport[0] ? arrAirport[0].name : "") + " (" + segment.ArrivalCityCode + ")",
          class: segment.ClassOfService,
          leg: segment.LegNumber,
          ticketNumber: detail[0] ? detail[0].TicketNumber : "",
          passengerName: detail[0] ? detail[0].PassengerName : "",
        })
      }

      res.status(200).json(result)
    } catch (error: unknown) {
      logger.error(`Failed to get itinerary: ${error}`, { error })
      res.status(400).json({
        message: `Failed to get itinerary: ${error}`,
      })
    }
  }
)

