import express, { Request, Response } from "express"
import knex from "knex"

import logger from "@/utils/logger"
import { RequiresAuth } from "@/middleware"
import { airports } from "@/json/airportCodes"
import { TRAVCOM_DB_CONFIG } from "@/config"
import { Location } from "@/models"

import dbLegacy from "@/db/db-migration-client"

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

travComRouter.get("/statistics", RequiresAuth, async function (req: Request, res: Response) {
  const reports = await dbLegacy("StatisticsRecord").select("*")
  res.status(200).json(reports)
})

travComRouter.get(
  "/statistics-update-progress",
  RequiresAuth,
  async function (req: Request, res: Response) {
    const progress = await dbLegacy("StatisticsProgress").select("*")
    res.status(200).json(progress)
  }
)

travComRouter.get("/update-statistics", RequiresAuth, async function (req: Request, res: Response) {
  //__Progress
  const statisticsProgress = await dbLegacy("StatisticsProgress").select("*").where("id", 1)

  if (statisticsProgress.length == 0) {
    await dbLegacy("StatisticsProgress").insert({ id: 1, last_update: new Date(), progress: 0 })
  } else {
    const lastUpdateTime = new Date(statisticsProgress[0].last_update)
    const updateTime = new Date()
    updateTime.setMinutes(updateTime.getMinutes() - 30) //at least 30 minutes before re-run
    if (lastUpdateTime > updateTime) {
      return res.status(500).json("Please Wait at least 30 minutes before re-run the updates.")
    } else {
      await dbLegacy("StatisticsProgress")
        .update({ last_update: new Date(), progress: 0 })
        .where("id", 1)
    }
  }

  //__
  const invoices = await db("dbo.ARInvoicesNoHealth").select()
  const allDetails = await db("dbo.ARInvoiceDetailsNoHealth").select()
  const allSegments = await db("dbo.segmentsNoHealth").select()

  const statistics: any = {}
  let invoiceCounter = 0
  logger.info(invoices.length)

  for (const invoice of invoices) {
    const InvoiceID = invoice.InvoiceID

    invoiceCounter++
    if (invoiceCounter % 300 == 0) {
      const progress = ((100 * invoiceCounter) / invoices.length) | 0
      logger.info(invoiceCounter + " => " + String(progress) + " %")
      try {
        await dbLegacy("StatisticsProgress")
          .update({ last_update: new Date(), progress: progress })
          .where("id", 1)
      } catch (error: any) {
        logger.info(error)
      }
    }

    // const details = await db("dbo.ARInvoiceDetailsNoHealth").where({ InvoiceID: InvoiceID }).select();
    // const unsortedSegments = await db("dbo.segmentsNoHealth").where({ InvoiceID: InvoiceID }).select();
    const details = allDetails.filter((detail) => detail.InvoiceID == InvoiceID)
    const unsortedSegments = allSegments.filter((seg) => seg.InvoiceID == InvoiceID)
    if (!unsortedSegments || unsortedSegments.length == 0) continue

    const segments = unsortedSegments.sort((a: any, b: any) =>
      a.DepartureInfo >= b.DepartureInfo ? 1 : -1
    )

    const lastInx = segments.length - 1
    const departureCity = segments[0].DepartureCityCode
    const lastLegCity = segments[lastInx].ArrivalCityCode
    const departureDate = segments[0].DepartureInfo
    const lastLegDate = segments[lastInx].ArrivalInfo

    let totalExpenses = 0
    details.forEach((detail: any) => (totalExpenses += Number(detail.SellingFare)))

    let totalFlightCost = 0
    details.forEach((detail: any) => {
      if (detail.ProductCode == 4 || detail.ProductCode == 7 || detail.ProductCode == 12)
        totalFlightCost += Number(detail.SellingFare)
    })

    const result = {
      dept: invoice.Department,
      totalFlightCost: totalFlightCost,
      totalExpenses: totalExpenses,
      finalDestinationCity: lastLegCity,
      returnFlight: departureCity == lastLegCity,
      days: getDays(departureDate, lastLegDate),
    }

    //_______STATISTICS_______
    const inx = result.dept + "/" + result.finalDestinationCity
    if (!statistics[inx]) statistics[inx] = {}
    statistics[inx].dept = result.dept
    statistics[inx].arrAirport = result.finalDestinationCity

    if (!statistics[inx].totalExpenses) statistics[inx].totalExpenses = 0
    statistics[inx].totalExpenses += totalExpenses

    if (!statistics[inx].totalFlightCost) statistics[inx].totalFlightCost = 0
    statistics[inx].totalFlightCost += totalFlightCost

    if (!statistics[inx].days) statistics[inx].days = 0
    statistics[inx].days += result.days

    if (!statistics[inx].totalTrips) statistics[inx].totalTrips = 0
    statistics[inx].totalTrips += 1

    if (!statistics[inx].totalRoundTrips) statistics[inx].totalRoundTrips = 0
    if (result.returnFlight) statistics[inx].totalRoundTrips += 1

    if (!statistics[inx].roundTripCost) statistics[inx].roundTripCost = 0
    if (result.returnFlight) statistics[inx].roundTripCost += totalFlightCost
  }

  await dbLegacy("StatisticsRecord").del()
  await dbLegacy.raw(`ALTER SEQUENCE "StatisticsRecord_id_seq" RESTART WITH 1;`)

  const locations = await Location.findAll({ attributes: ["province", "city"] })

  for (const key of Object.keys(statistics)) {
    const record = statistics[key]

    const arrAirport = airports.filter((airport) => airport.iata_code == record.arrAirport)
    record.finalDestinationCity = arrAirport[0]?.municipality ? arrAirport[0].municipality : ""

    const destination = locations.filter(
      (dest: any) =>
        dest.city.toLowerCase().trim() == record.finalDestinationCity.toLowerCase().trim()
    )
    record.finalDestinationProvince = destination[0]
      ? destination[0].province
      : arrAirport[0]
        ? arrAirport[0].iso_country
        : ""

    record.averageDurationDays = record.days / record.totalTrips
    record.averageExpensesPerDay = record.totalExpenses / record.days
    record.averageRoundTripFlightCost = record.roundTripCost / record.totalRoundTrips
    try {
      await dbLegacy("StatisticsRecord").insert(record)
    } catch (error: any) {
      logger.info(error)
      logger.info(record)
    }
  }

  try {
    await dbLegacy("StatisticsProgress")
      .update({ last_update: new Date(), progress: 100 })
      .where("id", 1)
  } catch (error: any) {
    logger.info(error)
  }

  res.status(200).json("Done")
})

function getDays(departureDate: string, lastLegDate: string) {
  const start = new Date(departureDate)
  const end = new Date(lastLegDate)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}
