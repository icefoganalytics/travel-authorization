import { isEmpty, isNil } from "lodash"
import { Attributes } from "@sequelize/core"

import logger from "@/utils/logger"
import { yukonGovernmentIntegration } from "@/integrations"
import db, { TravelDeskTravelRequest, TravelSegment, User } from "@/models"
import BaseService from "@/services/base-service"
import PrefillFlightRequestsService from "@/services/travel-desk-travel-requests/prefill-flight-requests-service"

type TravelDeskTravelRequestCreationAttributes = Partial<Attributes<TravelDeskTravelRequest>>

export class CreateService extends BaseService {
  constructor(
    protected attributes: TravelDeskTravelRequestCreationAttributes,
    protected currentUser: User
  ) {
    super()
  }

  async perform(): Promise<TravelDeskTravelRequest> {
    const {
      travelAuthorizationId,
      legalFirstName,
      legalLastName,
      busEmail,
      travelPurpose,
      strAddress,
      city,
      province,
      postalCode,
      busPhone,
      ...optionalAttributes
    } = this.attributes

    if (isNil(travelAuthorizationId)) {
      throw new Error("Travel authorization ID required.")
    }

    if (isNil(legalFirstName)) {
      throw new Error("Legal first name required.")
    }

    if (isNil(legalLastName)) {
      throw new Error("Legal last name required.")
    }

    if (isNil(busEmail)) {
      throw new Error("Business email required.")
    }

    if (isNil(travelPurpose)) {
      throw new Error("Travel purpose required.")
    }

    if (isNil(strAddress)) {
      throw new Error("Street address required.")
    }

    if (isNil(city)) {
      throw new Error("City required.")
    }

    if (isNil(province)) {
      throw new Error("Province required.")
    }

    if (isNil(postalCode)) {
      throw new Error("Postal code required.")
    }

    if (isNil(busPhone)) {
      throw new Error("Business phone required.")
    }

    const travelerDetails = await this.getTravelerDetails(busEmail)

    return db.transaction(async () => {
      const travelDeskTravelRequest = await TravelDeskTravelRequest.create({
        ...optionalAttributes,
        travelAuthorizationId,
        legalFirstName,
        legalLastName,
        strAddress,
        city,
        province,
        postalCode,
        busPhone,
        busEmail,
        travelPurpose,
        ...travelerDetails,
        status: TravelDeskTravelRequest.Statuses.DRAFT,
      })

      const travelSegments = await this.loadTravelSegments(travelAuthorizationId)
      if (!isEmpty(travelSegments)) {
        await PrefillFlightRequestsService.perform(
          travelDeskTravelRequest,
          travelSegments,
          this.currentUser
        )
      }

      return travelDeskTravelRequest
    })
  }

  private async getTravelerDetails(
    email: string
  ): Promise<Partial<Attributes<TravelDeskTravelRequest>>> {
    try {
      const employee = await yukonGovernmentIntegration.fetchEmployee(email)
      if (isNil(employee)) {
        logger.debug(`Failed to find employee info for email: ${email}`)
        return {}
      }

      const province = employee.community?.toLowerCase() == "whitehorse" ? "Yukon" : ""
      const travelContact =
        isNil(employee.mobile) ||
        isEmpty(employee.mobile) ||
        isNil(employee.email) ||
        isEmpty(employee.email)
          ? false
          : true
      const travelPhone = travelContact === true ? employee.mobile : null
      const travelEmail = travelContact === true ? email : null

      return {
        legalFirstName: employee.first_name,
        legalLastName: employee.last_name,
        strAddress: employee.address,
        city: employee.community,
        province,
        postalCode: employee.postal_code,
        busPhone: employee.phone_office,
        busEmail: employee.email,
        travelContact,
        travelPhone,
        travelEmail,
      }
    } catch (error) {
      logger.error(`Failed to retrieve employee info: ${error}`)
      return {}
    }
  }

  private async loadTravelSegments(travelAuthorizationId: number): Promise<TravelSegment[]> {
    const travelSegments = await TravelSegment.findAll({
      where: {
        travelAuthorizationId,
      },
      include: ["departureLocation", "arrivalLocation"],
      order: [["segmentNumber", "ASC"]],
    })
    return travelSegments
  }
}

export default CreateService
