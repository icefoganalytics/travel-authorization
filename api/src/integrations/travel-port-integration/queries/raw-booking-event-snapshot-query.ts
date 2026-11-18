import { QueryTypes, sql, type Transaction } from "@sequelize/core"

import db from "@/integrations/travel-port-integration/db/db-client"
import type { RawBookingEventSnapshot } from "@/integrations/travel-port-integration/models/raw-booking-event-snapshot"

type SourceColumn = {
  tableName: string
  columnName: string
  dataType: string
}

/** Reads the complete deployed schema, including columns not mapped by our source models. */
export class RawBookingEventSnapshotQuery {
  private columns: SourceColumn[] | undefined

  constructor(private readonly transaction: Transaction) {}

  async read(travelOrderIdentifier: number): Promise<RawBookingEventSnapshot> {
    if (this.columns === undefined) {
      this.columns = await db.query<SourceColumn>(
        `SELECT TABLE_NAME AS [tableName], COLUMN_NAME AS [columnName], DATA_TYPE AS [dataType]
         FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = 'dbo'
           AND TABLE_NAME IN ('TravelOrderEvent', 'Passenger', 'AirRsrvSeg', 'SFTrans')
         ORDER BY TABLE_NAME, ORDINAL_POSITION`,
        {
          type: QueryTypes.SELECT,
          transaction: this.transaction,
        }
      )
    }

    const [travelOrderEvent] = await this.readTable("TravelOrderEvent", travelOrderIdentifier)
    if (travelOrderEvent === undefined) {
      throw new Error("Expected the source booking event to remain present during synchronization.")
    }

    const passengers = await this.readTable("Passenger", travelOrderIdentifier, [
      "LastNameElement",
      "PassengerElement",
    ])
    const airReservationSegments = await this.readTable("AirRsrvSeg", travelOrderIdentifier, [
      "AirSegmentNbr",
    ])
    const [serviceFeeTransaction] = await this.readTable("SFTrans", travelOrderIdentifier)

    return {
      travelOrderEvent,
      passengers,
      airReservationSegments,
      serviceFeeTransaction: serviceFeeTransaction ?? null,
    }
  }

  private async readTable(
    tableName: string,
    travelOrderIdentifier: number,
    order: string[] = ["TravelOrderIdentifier"]
  ): Promise<Record<string, unknown>[]> {
    const columns = this.columns?.filter((column) => column.tableName === tableName) ?? []
    if (columns.length === 0) {
      throw new Error(`Expected source columns for dbo.${tableName}.`)
    }

    const projection = columns.map(({ columnName, dataType }) => {
      const identifier = sql.identifier(columnName)
      // Tedious converts SQL decimals to JS numbers before Sequelize can parse them.
      // Convert in SQL instead, preserving every digit and the original SQL column name.
      if (["money", "smallmoney"].includes(dataType)) {
        return sql`CONVERT(VARCHAR(MAX), ${identifier}, 2) AS ${identifier}`
      }

      if (["decimal", "numeric", "bigint"].includes(dataType)) {
        return sql`CAST(${identifier} AS VARCHAR(MAX)) AS ${identifier}`
      }

      // Preserve SQL precision and timezone meaning rather than converting through JS Date.
      if (["date", "time", "smalldatetime", "datetime", "datetime2"].includes(dataType)) {
        return sql`CONVERT(VARCHAR(MAX), ${identifier}, 126) AS ${identifier}`
      }

      if (dataType === "datetimeoffset") {
        return sql`CONVERT(VARCHAR(MAX), ${identifier}, 127) AS ${identifier}`
      }

      if (["binary", "varbinary", "image", "timestamp", "rowversion"].includes(dataType)) {
        return sql`CONVERT(VARCHAR(MAX), CONVERT(VARBINARY(MAX), ${identifier}), 1) AS ${identifier}`
      }

      return identifier
    })
    const ordering = order.map((columnName) => sql.identifier(columnName))

    return db.query<Record<string, unknown>>(
      sql`SELECT ${sql.join(projection, ", ")}
          FROM ${sql.identifier("dbo", tableName)}
          WHERE [TravelOrderIdentifier] = $travelOrderIdentifier
          ORDER BY ${sql.join(ordering, ", ")}`,
      {
        bind: {
          travelOrderIdentifier,
        },
        type: QueryTypes.SELECT,
        transaction: this.transaction,
      }
    )
  }
}

export default RawBookingEventSnapshotQuery
