import { isNil } from "lodash"
import { v4 as uuid } from "uuid"
import moment from "moment"

import BaseService from "@/services/base-service"
import { TravelAuthorization, Stop, Location, User, TravelDeskTravelRequest } from "@/models"

export class MyTravelRequestsService extends BaseService {
  private user: User

  constructor(user: User) {
    super()
    this.user = user
  }

  async perform(): Promise<void> {
    await Stop.destroy({ where: {} })
    await TravelAuthorization.destroy({ where: {} })

    // Phase: Travel Planning
    // Location: Vancouver
    // Description: Conference
    // Start Date: in-future, format 12-May-2023
    // End Date: in-future, format 14-May-2023
    // Travel Auth Status: Approved
    // Travel Action: Submit Travel Desk Request
    const nextWeek = moment().add(7, "days")
    const [travelAuthorization1] = await TravelAuthorization.findOrCreate({
      where: {
        userId: this.user.id,
        slug: uuid(),
        status: TravelAuthorization.Statuses.APPROVED,
        eventName: "Conference",
      },
      defaults: {
        userId: this.user.id,
        slug: uuid(),
        status: TravelAuthorization.Statuses.APPROVED,
        eventName: "Conference",
      },
    })
    const [vancouverLocation] = await Location.findOrCreate({
      where: { city: "Vancouver", province: "British Columbia" },
      defaults: { city: "Vancouver", province: "British Columbia" },
    })
    const [_firstStop] = await Stop.findOrCreate({
      where: {
        travelAuthorizationId: travelAuthorization1.id,
        locationId: vancouverLocation.id,
        departureDate: nextWeek.toDate(),
        departureTime: "00:00:00",
        transport: Stop.TravelMethods.AIRCRAFT,
        isActual: false,
      },
      defaults: {
        travelAuthorizationId: travelAuthorization1.id,
        locationId: vancouverLocation.id,
        departureDate: nextWeek.toDate(),
        departureTime: "00:00:00",
        transport: Stop.TravelMethods.AIRCRAFT,
        isActual: false,
      },
    })
    const [_lastStop] = await Stop.findOrCreate({
      where: {
        travelAuthorizationId: travelAuthorization1.id,
        locationId: vancouverLocation.id,
        departureDate: nextWeek.clone().add(2, "days").toDate(),
        departureTime: "00:00:00",
        transport: Stop.TravelMethods.AIRCRAFT,
        isActual: false,
      },
      defaults: {
        travelAuthorizationId: travelAuthorization1.id,
        locationId: vancouverLocation.id,
        departureDate: nextWeek.clone().add(2, "days").toDate(),
        departureTime: "00:00:00",
        transport: Stop.TravelMethods.AIRCRAFT,
        isActual: false,
      },
    })

    // Phase: Travel Approval
    // Location: Vancouver
    // Description: FN Finance meeting #3
    // Start Date: in-future, format 12-May-2023
    // End Date: in-future, format 14-May-2023
    // Travel Auth Status: Awaiting Director Approval
    // Travel Action: no action
    const [travelAuthorization2] = await TravelAuthorization.findOrCreate({
      where: {
        userId: this.user.id,
        slug: uuid(),
        status: TravelAuthorization.Statuses.AWAITING_DIRECTOR_APPROVAL,
        eventName: "FN Finance meeting #3",
      },
      defaults: {
        userId: this.user.id,
        slug: uuid(),
        status: TravelAuthorization.Statuses.AWAITING_DIRECTOR_APPROVAL,
        eventName: "FN Finance meeting #3",
      },
    })
    const [_firstStop2] = await Stop.findOrCreate({
      where: {
        travelAuthorizationId: travelAuthorization2.id,
        locationId: vancouverLocation.id,
        departureDate: nextWeek.toDate(),
        departureTime: "00:00:00",
        isActual: false,
      },
      defaults: {
        travelAuthorizationId: travelAuthorization2.id,
        locationId: vancouverLocation.id,
        departureDate: nextWeek.toDate(),
        departureTime: "00:00:00",
        isActual: false,
      },
    })
    const [_lastStop2] = await Stop.findOrCreate({
      where: {
        travelAuthorizationId: travelAuthorization2.id,
        locationId: vancouverLocation.id,
        departureDate: nextWeek.clone().add(2, "days").toDate(),
        departureTime: "00:00:00",
        isActual: false,
      },
      defaults: {
        travelAuthorizationId: travelAuthorization2.id,
        locationId: vancouverLocation.id,
        departureDate: nextWeek.clone().add(2, "days").toDate(),
        departureTime: "00:00:00",
        isActual: false,
      },
    })

    // Phase: Travel Approval
    // Location: Edmonton
    // Description: FN Finance meeting #4
    // Start Date: in-future, format 12-May-2023
    // End Date: in-future, format 14-May-2023
    // Travel Auth Status: Draft
    // Travel Action: no action
    const [edmontonLocation] = await Location.findOrCreate({
      where: { city: "Edmonton", province: "Alberta" },
      defaults: { city: "Edmonton", province: "Alberta" },
    })
    const [travelAuthorization3] = await TravelAuthorization.findOrCreate({
      where: {
        userId: this.user.id,
        slug: uuid(),
        status: TravelAuthorization.Statuses.DRAFT,
        eventName: "FN Finance meeting #4",
      },
      defaults: {
        userId: this.user.id,
        slug: uuid(),
        status: TravelAuthorization.Statuses.DRAFT,
        eventName: "FN Finance meeting #4",
      },
    })
    const [_firstStop3] = await Stop.findOrCreate({
      where: {
        travelAuthorizationId: travelAuthorization3.id,
        locationId: edmontonLocation.id,
        departureDate: nextWeek.toDate(),
        departureTime: "00:00:00",
        isActual: false,
      },
      defaults: {
        travelAuthorizationId: travelAuthorization3.id,
        locationId: edmontonLocation.id,
        departureDate: nextWeek.toDate(),
        departureTime: "00:00:00",
        isActual: false,
      },
    })
    const [_lastStop3] = await Stop.findOrCreate({
      where: {
        travelAuthorizationId: travelAuthorization3.id,
        locationId: edmontonLocation.id,
        departureDate: nextWeek.clone().add(2, "days").toDate(),
        departureTime: "00:00:00",
        isActual: false,
      },
      defaults: {
        travelAuthorizationId: travelAuthorization3.id,
        locationId: edmontonLocation.id,
        departureDate: nextWeek.clone().add(2, "days").toDate(),
        departureTime: "00:00:00",
        isActual: false,
      },
    })

    // Phase: Travel Complete
    // Location: Calgary
    // Description: FN Finance meeting #1
    // Start Date: in-past, format 12-May-2023
    // End Date: in-past, format 14-May-2023
    // Travel Auth Status: Expense Claim
    // Travel Action: Submit Expense Claim
    const lastWeek = moment().subtract(7, "days")
    const [calgaryLocation] = await Location.findOrCreate({
      where: { city: "Calgary", province: "Alberta" },
      defaults: { city: "Calgary", province: "Alberta" },
    })
    const [travelAuthorization4] = await TravelAuthorization.findOrCreate({
      where: {
        userId: this.user.id,
        slug: uuid(),
        status: TravelAuthorization.Statuses.EXPENSE_CLAIM_SUBMITTED,
        eventName: "FN Finance meeting #1",
      },
      defaults: {
        userId: this.user.id,
        slug: uuid(),
        status: TravelAuthorization.Statuses.EXPENSE_CLAIM_SUBMITTED,
        eventName: "FN Finance meeting #1",
      },
    })
    const [_firstStop4] = await Stop.findOrCreate({
      where: {
        travelAuthorizationId: travelAuthorization4.id,
        locationId: calgaryLocation.id,
        departureDate: lastWeek.clone().subtract(2, "days").toDate(),
        departureTime: "00:00:00",
        isActual: false,
      },
      defaults: {
        travelAuthorizationId: travelAuthorization4.id,
        locationId: calgaryLocation.id,
        departureDate: lastWeek.clone().subtract(2, "days").toDate(),
        departureTime: "00:00:00",
        isActual: false,
      },
    })
    const [_lastStop4] = await Stop.findOrCreate({
      where: {
        travelAuthorizationId: travelAuthorization4.id,
        locationId: calgaryLocation.id,
        departureDate: lastWeek.toDate(),
        departureTime: "00:00:00",
        isActual: false,
      },
      defaults: {
        travelAuthorizationId: travelAuthorization4.id,
        locationId: calgaryLocation.id,
        departureDate: lastWeek.toDate(),
        departureTime: "00:00:00",
        isActual: false,
      },
    })

    // Phase: Travel Planning
    // Location: Calgary
    // Description: FN Finance meeting #1
    // Start Date: in-future, format 12-May-2023
    // End Date: in-future, format 14-May-2023
    // Travel Auth Status: Booked
    // Travel Action: View Itinerary
    const [travelAuthorization5] = await TravelAuthorization.findOrCreate({
      where: {
        userId: this.user.id,
        slug: uuid(),
        status: TravelAuthorization.Statuses.BOOKED,
        eventName: "FN Finance meeting #1",
      },
      defaults: {
        userId: this.user.id,
        slug: uuid(),
        status: TravelAuthorization.Statuses.BOOKED,
        eventName: "FN Finance meeting #1",
      },
    })
    const [_firstStop5] = await Stop.findOrCreate({
      where: {
        travelAuthorizationId: travelAuthorization5.id,
        locationId: calgaryLocation.id,
        departureDate: nextWeek.toDate(),
        departureTime: "00:00:00",
        isActual: false,
      },
      defaults: {
        travelAuthorizationId: travelAuthorization5.id,
        locationId: calgaryLocation.id,
        departureDate: nextWeek.toDate(),
        departureTime: "00:00:00",
        isActual: false,
      },
    })
    const [_lastStop5] = await Stop.findOrCreate({
      where: {
        travelAuthorizationId: travelAuthorization5.id,
        locationId: calgaryLocation.id,
        departureDate: nextWeek.clone().add(2, "days").toDate(),
        departureTime: "00:00:00",
        isActual: false,
      },
      defaults: {
        travelAuthorizationId: travelAuthorization5.id,
        locationId: calgaryLocation.id,
        departureDate: nextWeek.clone().add(2, "days").toDate(),
        departureTime: "00:00:00",
        isActual: false,
      },
    })

    if (isNil(this.user.firstName)) {
      throw new Error("User must have a first name")
    }
    if (isNil(this.user.lastName)) {
      throw new Error("User must have a last name")
    }
    if (isNil(travelAuthorization5.eventName)) {
      throw new Error("Travel Authorization must have an event name")
    }
    const [_travelDeskTravelRequest1] = await TravelDeskTravelRequest.findOrCreate({
      where: {
        travelAuthorizationId: travelAuthorization5.id,
        legalFirstName: this.user.firstName,
        legalLastName: this.user.lastName,
        strAddress: "NOT_SURE_WHERE_THIS_DATA_SHOULD_COME_FROM",
        city: "NOT_SURE_WHERE_THIS_DATA_SHOULD_COME_FROM",
        province: "NOT_SURE_WHERE_THIS_DATA_SHOULD_COME_FROM",
        postalCode: "NOT_SURE_WHERE_THIS_DATA_SHOULD_COME_FROM",
        travelPurpose: travelAuthorization5.eventName, // Not sure if this is correct, or even relevant?
        busPhone: "123-456-7890", // This field should likely not be required?
        busEmail: "john.doe@example.com", // This field should likely not be required?
        status: TravelDeskTravelRequest.Statuses.BOOKED,
      },
      defaults: {
        travelAuthorizationId: travelAuthorization5.id,
        legalFirstName: this.user.firstName,
        legalLastName: this.user.lastName,
        strAddress: "NOT_SURE_WHERE_THIS_DATA_SHOULD_COME_FROM",
        city: "NOT_SURE_WHERE_THIS_DATA_SHOULD_COME_FROM",
        province: "NOT_SURE_WHERE_THIS_DATA_SHOULD_COME_FROM",
        postalCode: "NOT_SURE_WHERE_THIS_DATA_SHOULD_COME_FROM",
        travelPurpose: travelAuthorization5.eventName, // Not sure if this is correct, or even relevant?
        busPhone: "123-456-7890", // This field should likely not be required?
        busEmail: "john.doe@example.com", // This field should likely not be required?
        status: TravelDeskTravelRequest.Statuses.BOOKED,
      },
    })

    // Phase: Travelling
    // Location: Calgary
    // Description: FN Finance meeting #2
    // Start Date: in-past, format 12-May-2023
    // End Date: in-future, format 14-May-2023
    // Travel Auth Status: Travelling
    // Travel Action: Add Expense
    const [travelAuthorization6] = await TravelAuthorization.findOrCreate({
      where: {
        userId: this.user.id,
        slug: uuid(),
        status: TravelAuthorization.Statuses.APPROVED,
        eventName: "FN Finance meeting #2",
      },
      defaults: {
        userId: this.user.id,
        slug: uuid(),
        status: TravelAuthorization.Statuses.APPROVED,
        eventName: "FN Finance meeting #2",
      },
    })
    const [_firstStop6] = await Stop.findOrCreate({
      where: {
        travelAuthorizationId: travelAuthorization6.id,
        locationId: calgaryLocation.id,
        departureDate: lastWeek.toDate(),
        departureTime: "00:00:00",
        isActual: false,
      },
      defaults: {
        travelAuthorizationId: travelAuthorization6.id,
        locationId: calgaryLocation.id,
        departureDate: lastWeek.toDate(),
        departureTime: "00:00:00",
        isActual: false,
      },
    })
    const [_lastStop6] = await Stop.findOrCreate({
      where: {
        travelAuthorizationId: travelAuthorization6.id,
        locationId: calgaryLocation.id,
        departureDate: nextWeek.toDate(),
        departureTime: "00:00:00",
        isActual: false,
      },
      defaults: {
        travelAuthorizationId: travelAuthorization6.id,
        locationId: calgaryLocation.id,
        departureDate: nextWeek.toDate(),
        departureTime: "00:00:00",
        isActual: false,
      },
    })

    // Phase: Travel Planning
    // Location: Dawson
    // Description: Field Work
    // Start Date: in-future, format 12-May-2023
    // End Date: in-future, format 14-May-2023
    // Travel Auth Status: Approved
    // Travel Action: Submit Pool Vehicle Request
    const [dawsonLocation] = await Location.findOrCreate({
      where: { city: "Dawson", province: "Yukon" },
      defaults: { city: "Dawson", province: "Yukon" },
    })
    const [travelAuthorization7] = await TravelAuthorization.findOrCreate({
      where: {
        userId: this.user.id,
        slug: uuid(),
        status: TravelAuthorization.Statuses.APPROVED,
        eventName: "Field Work",
      },
      defaults: {
        userId: this.user.id,
        slug: uuid(),
        status: TravelAuthorization.Statuses.APPROVED,
        eventName: "Field Work",
      },
    })
    const [_firstStop7] = await Stop.findOrCreate({
      where: {
        travelAuthorizationId: travelAuthorization7.id,
        locationId: dawsonLocation.id,
        departureDate: nextWeek.toDate(),
        departureTime: "00:00:00",
        transport: Stop.TravelMethods.POOL_VEHICLE,
        isActual: false,
      },
      defaults: {
        travelAuthorizationId: travelAuthorization7.id,
        locationId: dawsonLocation.id,
        departureDate: nextWeek.toDate(),
        departureTime: "00:00:00",
        transport: Stop.TravelMethods.POOL_VEHICLE,
        isActual: false,
      },
    })
    const [_lastStop7] = await Stop.findOrCreate({
      where: {
        travelAuthorizationId: travelAuthorization7.id,
        locationId: dawsonLocation.id,
        departureDate: nextWeek.clone().add(2, "days").toDate(),
        departureTime: "00:00:00",
        transport: Stop.TravelMethods.POOL_VEHICLE,
        isActual: false,
      },
      defaults: {
        travelAuthorizationId: travelAuthorization7.id,
        locationId: dawsonLocation.id,
        departureDate: nextWeek.clone().add(2, "days").toDate(),
        departureTime: "00:00:00",
        transport: Stop.TravelMethods.POOL_VEHICLE,
        isActual: false,
      },
    })
  }
}

export default MyTravelRequestsService
