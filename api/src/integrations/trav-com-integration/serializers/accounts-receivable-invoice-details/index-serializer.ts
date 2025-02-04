import { Op } from "sequelize"
import { isEmpty, isNil, isUndefined, keyBy, pick, sortBy } from "lodash"

import { Airport } from "@/models"
import {
  AccountsReceivableInvoice,
  AccountsReceivableInvoiceDetail,
  Segment,
} from "@/integrations/trav-com-integration/models"
import BaseSerializer from "@/serializers/base-serializer"

export type AccountsReceivableInvoiceDetailIndexView = Pick<
  AccountsReceivableInvoiceDetail,
  | "id"
  | "invoiceId"
  | "transactionType"
  | "vendorNumber"
  | "vendorName"
  | "productCode"
  | "passengerName"
  | "ticketNumber"
  | "publishedFare"
  | "sellingFare"
  | "referenceFare"
  | "lowFare"
  | "tax1"
  | "grossAmount"
  | "commissionAmount"
  | "vatOnCommission"
  | "freeFieldA"
  | "travelDate"
  | "returnDate"
  | "numberOfDays"
  | "cityCode"
  | "profileNumber"
  | "addedBy"
> & {
  // magic attributes
  agentName: string | null // see includeAgentNameAttribute scope
  flightInfo: string

  // associations
  // TODO: move invoice type definition to accounts-receivable-invoice show serializer
  invoice: Pick<
    AccountsReceivableInvoice,
    | "id"
    | "invoiceNumber"
    | "profileNumber"
    | "profileName"
    | "department"
    | "bookingDate"
    | "systemDate"
    | "description"
    | "invoiceRemarks"
  >
  // TODO: move segment type definition to segments show serializer
  segments: Pick<
    Segment,
    | "id"
    | "invoiceId"
    | "invoiceDetailId"
    | "legNumber"
    | "departureCityCode"
    | "departureInfo"
    | "arrivalCityCode"
    | "arrivalInfo"
    | "airlineCode"
    | "flightNumber"
    | "classOfService"
    | "fareBasis"
  >[]
}

export class IndexSerializer extends BaseSerializer<AccountsReceivableInvoiceDetail> {
  constructor(protected record: AccountsReceivableInvoiceDetail) {
    super(record)
  }

  async perform(): Promise<AccountsReceivableInvoiceDetailIndexView> {
    if (isUndefined(this.record.invoice)) {
      throw new Error("'invoice' association is required")
    }

    const { agentName } = this.record.dataValues as AccountsReceivableInvoiceDetail & {
      agentName: string | null
    }
    const arrivalAirportsByIataCode = await this.buildArrivalAirportsByIataCode(this.segments)
    const flightInfo = await this.buildFlightInfo(this.segments, arrivalAirportsByIataCode)

    return {
      ...pick(
        this.record,
        "id",
        "invoiceId",
        "transactionType",
        "vendorNumber",
        "vendorName",
        "productCode",
        "passengerName",
        "ticketNumber",
        "publishedFare",
        "sellingFare",
        "referenceFare",
        "lowFare",
        "tax1",
        "grossAmount",
        "commissionAmount",
        "vatOnCommission",
        "freeFieldA",
        "travelDate",
        "returnDate",
        "numberOfDays",
        "cityCode",
        "profileNumber",
        "addedBy"
      ),
      agentName,
      flightInfo,
      // TODO: move invoice serialization to accounts receivable invoice show serializer
      invoice: pick(
        this.record.invoice,
        "id",
        "invoiceNumber",
        "profileNumber",
        "profileName",
        "department",
        "bookingDate",
        "systemDate",
        "description",
        "invoiceRemarks"
      ),
      segments: this.segments.map((segment) =>
        pick(
          segment,
          "id",
          "invoiceId",
          "invoiceDetailId",
          "legNumber",
          "departureCityCode",
          "departureInfo",
          "arrivalCityCode",
          "arrivalInfo",
          "airlineCode",
          "flightNumber",
          "classOfService",
          "fareBasis"
        )
      ),
    }
  }

  private async buildFlightInfo(
    segments: Segment[],
    arrivalAirportsByIataCode: Record<string, Airport>
  ): Promise<string> {
    return segments
      .map((segment) => {
        const { airlineCode, flightNumber, arrivalCityCode } = segment
        if (isNil(arrivalCityCode) || isEmpty(arrivalCityCode)) {
          return `${airlineCode}${flightNumber}`
        }

        const arrivalAirport = arrivalAirportsByIataCode[arrivalCityCode]
        if (isNil(arrivalAirport) || isEmpty(arrivalAirport)) {
          return `${airlineCode}${flightNumber}\u00A0(${arrivalCityCode})`
        }

        const { municipality } = arrivalAirport
        if (isNil(municipality) || isEmpty(municipality)) {
          return `${airlineCode}${flightNumber}\u00A0(${arrivalCityCode})`
        }

        return `${airlineCode}${flightNumber}\u00A0(${municipality})`
      })
      .join(", ")
  }

  private get segments(): Segment[] {
    if (isUndefined(this.record.segments)) {
      throw new Error("'segments' association is required")
    }

    return sortBy(this.record.segments, "departureInfo")
  }

  // TODO: consider if this needs to be optimized further
  private async buildArrivalAirportsByIataCode(
    segments: Segment[]
  ): Promise<Record<string, Airport>> {
    const arrivalCityCodes = segments
      .map((segment) => segment.arrivalCityCode)
      .filter((segment) => !isNil(segment) && !isEmpty(segment)) as string[]

    const arrivalAirports = await Airport.findAll({
      where: {
        iataCode: {
          [Op.in]: arrivalCityCodes,
        },
      },
    })
    const arrivalAirportsByIataCode = keyBy(arrivalAirports, "iataCode")
    return arrivalAirportsByIataCode
  }
}
