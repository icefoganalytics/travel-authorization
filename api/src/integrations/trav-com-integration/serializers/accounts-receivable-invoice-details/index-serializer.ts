import { isEmpty, isNil, isUndefined, last, pick, sortBy } from "lodash"

import guessNameCapitalization from "@/integrations/trav-com-integration/utils/guess-name-capitalization"
import {
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
  agentName: string
  flightInfo: string
  finalDestination: string
  travelerFirstName: string
  travelerLastName: string
  invoiceBookingDate: Date | null
  /** NOTE: This field contains mail codes, not department names. Multiple mail codes may map to the same department. */
  invoiceMailcode: string | null
}

export class IndexSerializer extends BaseSerializer<AccountsReceivableInvoiceDetail> {
  constructor(protected record: AccountsReceivableInvoiceDetail) {
    super(record)
  }

  perform(): AccountsReceivableInvoiceDetailIndexView {
    const { invoice } = this.record
    if (isUndefined(invoice)) {
      throw new Error("'invoice' association is required")
    }

    const agentName = this.buildAgentName(this.record)
    const flightInfo = this.buildFlightInfo(this.segments)
    const finalDestination = this.buildFinalDestination(this.segments)
    const [travelerFirstName, travelerLastName] = this.buildTravelerFirstAndLastName(this.record)

    // NOTE: invoice.departmentMailcode contains mail codes, not department names
    const invoiceMailcode = invoice.departmentMailcode
    const invoiceBookingDate = invoice.bookingDate

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
      finalDestination,
      travelerFirstName,
      travelerLastName,
      invoiceBookingDate,
      invoiceMailcode,
    }
  }

  /**
   * See includeAgentNameAttribute scope
   */
  private buildAgentName(accountReceivableInvoiceDetail: AccountsReceivableInvoiceDetail): string {
    const { dataValues } = accountReceivableInvoiceDetail as AccountsReceivableInvoiceDetail & {
      dataValues: {
        agentName: string | null
      }
    }

    const { agentName } = dataValues
    if (isUndefined(agentName)) {
      throw new Error("'agentName' attribute include is required")
    }

    return agentName ?? ""
  }

  private buildFlightInfo(segments: Segment[]): string {
    return segments
      .map((segment) => {
        const { airlineCode, flightNumber, arrivalCityCode, arrivalCity } = segment
        if (isUndefined(arrivalCity)) {
          throw new Error("Requires segment to preload 'arrivalCity' association")
        }

        if (isNil(arrivalCityCode) || isEmpty(arrivalCityCode)) {
          return `${airlineCode}${flightNumber}`
        }

        const formattedArrivalCityCode = guessNameCapitalization(arrivalCityCode)
        if (isNil(arrivalCity)) {
          return `${airlineCode}${flightNumber} (${formattedArrivalCityCode})`
        }

        const { cityName } = arrivalCity
        if (isNil(cityName) || isEmpty(cityName)) {
          return `${airlineCode}${flightNumber} (${formattedArrivalCityCode})`
        }

        const formattedCityName = guessNameCapitalization(cityName)
        return `${airlineCode}${flightNumber} (${formattedCityName})`
      })
      .map((flightInfo) => flightInfo.replace(/\s/g, "\u00A0"))
      .join(", ")
  }

  private buildFinalDestination(segments: Segment[]): string {
    const lastSegment = last(segments)
    if (isNil(lastSegment)) {
      return ""
    }

    const { arrivalCity } = lastSegment
    if (isUndefined(arrivalCity)) {
      throw new Error("Requires segment to preload 'arrivalCity' association")
    }

    if (isNil(arrivalCity)) {
      return ""
    }

    const { cityName } = arrivalCity
    if (isNil(cityName) || isEmpty(cityName)) {
      return ""
    }

    return cityName
  }

  private buildTravelerFirstAndLastName(
    accountReceivableInvoiceDetail: AccountsReceivableInvoiceDetail
  ): [string, string] {
    const { passengerName } = accountReceivableInvoiceDetail
    if (isNil(passengerName) || isEmpty(passengerName)) {
      return ["", ""]
    }

    const [lastName, firstNameAndTitle] = passengerName
      .split("/")
      .map((part) => part.trim())
      .map((part) => guessNameCapitalization(part))

    if (
      (isNil(lastName) || isEmpty(lastName)) &&
      (isNil(firstNameAndTitle) || isEmpty(firstNameAndTitle))
    ) {
      return ["", ""]
    }

    const [firstName, _title] = firstNameAndTitle
      .split(" ")
      .map((part) => part.trim())
      .map((part) => guessNameCapitalization(part))
    if (isNil(firstName) || isEmpty(firstName)) {
      return ["", lastName]
    }

    return [firstName, lastName]
  }

  private get segments(): Segment[] {
    if (isUndefined(this.record.segments)) {
      throw new Error("'segments' association is required")
    }

    return sortBy(this.record.segments, "departureInfo")
  }
}
