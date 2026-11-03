import fs from "fs"
import path from "path"

import { Knex } from "knex"
import Papa from "papaparse"

import { APP_ROOT } from "@/config"

function readCsv<T>(fileName: string): T[] {
  const filePath = path.join(
    APP_ROOT,
    "integrations/travelport-integration/db/seeds/data",
    fileName
  )
  const { data } = Papa.parse<T>(fs.readFileSync(filePath, "utf8"), {
    header: true,
    skipEmptyLines: true,
    transform: (value) => (value === "" ? null : value),
  })
  return data
}

export async function seed(knex: Knex): Promise<void> {
  const existingEvents = await knex("TravelOrderEvent").count("* as count").first()
  if (Number(existingEvents?.count ?? 0) > 0) return

  await knex.transaction(async (transaction) => {
    await transaction("TravelOrderEvent").insert(
      readCsv<Record<string, unknown>>("events.csv").map((event) => ({
        ...event,
        PnrBfVersionNbr: event.PnrBfVersionNbr === null ? null : Number(event.PnrBfVersionNbr),
        TravelOrderIdentifier: Number(event.TravelOrderIdentifier),
      }))
    )
    await transaction("Passenger").insert(
      readCsv<Record<string, unknown>>("passengers.csv").map((passenger) => ({
        ...passenger,
        TravelOrderIdentifier: Number(passenger.TravelOrderIdentifier),
        LastNameElement: Number(passenger.LastNameElement),
        PassengerElement: Number(passenger.PassengerElement),
        AbsoluteNameElement: Number(passenger.AbsoluteNameElement),
      }))
    )
    await transaction("AirRsrvSeg").insert(
      readCsv<Record<string, unknown>>("segments.csv").map((segment) => ({
        ...segment,
        TravelOrderIdentifier: Number(segment.TravelOrderIdentifier),
        AirSegmentNbr: Number(segment.AirSegmentNbr),
        ChangeOfDay: Number(segment.ChangeOfDay),
      }))
    )
    await transaction("SFTrans").insert(
      readCsv<Record<string, unknown>>("fees.csv").map((fee) => ({
        ...fee,
        TravelOrderIdentifier: Number(fee.TravelOrderIdentifier),
        ServiceFeeAmount: fee.ServiceFeeAmount,
      }))
    )
  })
}
