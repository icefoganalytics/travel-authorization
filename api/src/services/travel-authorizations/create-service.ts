import { CreationAttributes } from "sequelize"
import { isEmpty } from "lodash"
import { v4 as uuid } from "uuid"

import db from "@/db/db-client"

import BaseService from "@/services/base-service"
import { Stops, StopsService, ExpensesService, Users } from "@/services"
import { AuditService } from "@/services/audit-service"
import { UserCreationAttributes } from "@/services/users/create-service"
import { Expense, Stop, TravelAuthorization, User } from "@/models"

type StopsCreationAttributes = CreationAttributes<Stop>[]
type TravelAuthorizationCreationAttributes = Omit<
  CreationAttributes<TravelAuthorization>,
  "slug"
> & {
  slug?: TravelAuthorization["slug"]
} & {
  stopsAttributes?: StopsCreationAttributes
  expensesAttributes?: CreationAttributes<Expense>[]
  userAttributes?: UserCreationAttributes
}

// TODO: upgrade this to the enhanced service pattern.
const auditService = new AuditService()

export class CreateService extends BaseService {
  private stopsAttributes: StopsCreationAttributes
  private expensesAttributes: CreationAttributes<Expense>[]
  private attributes: TravelAuthorizationCreationAttributes
  private userAttributes?: UserCreationAttributes
  private currentUser: User

  constructor(
    {
      userAttributes,
      stopsAttributes = [],
      expensesAttributes = [],
      ...attributes
    }: TravelAuthorizationCreationAttributes,
    currentUser: User
  ) {
    super()
    this.attributes = attributes
    this.userAttributes = userAttributes
    this.stopsAttributes = stopsAttributes
    this.expensesAttributes = expensesAttributes
    this.currentUser = currentUser
  }

  async perform(): Promise<TravelAuthorization> {
    return db
      .transaction(async () => {
        const secureAttributes = {
          ...this.attributes,
          tripTypeEstimate: this.attributes.tripTypeEstimate || TravelAuthorization.TripTypes.ROUND_TRIP,
          status: TravelAuthorization.Statuses.DRAFT,
          slug: this.attributes.slug || uuid(),
          createdBy: this.currentUser.id,
        }

        secureAttributes.userId = await this.determineSecureUserId(
          this.currentUser,
          this.attributes.userId,
          this.userAttributes
        )

        const travelAuthorization = await TravelAuthorization.create(secureAttributes).catch(
          (error) => {
            throw new Error(`Could not create TravelAuthorization: ${error}`)
          }
        )

        const travelAuthorizationId = travelAuthorization.id
        await this.createStops(travelAuthorization, this.stopsAttributes)
        // TODO: remove this once travel segments fully replace stops
        await Stops.BulkConvertStopsToTravelSegmentsService.perform(travelAuthorization)

        if (!isEmpty(this.expensesAttributes)) {
          await ExpensesService.bulkCreate(travelAuthorizationId, this.expensesAttributes)
        }

        await auditService.log(
          this.currentUser.id,
          travelAuthorization.id,
          "Submit",
          "TravelAuthorization submitted successfully."
        )

        return travelAuthorization.reload({
          include: ["expenses", "stops", "purpose", "user", "travelSegments"],
        })
      })
      .catch((error) => {
        auditService.log(
          this.currentUser.id,
          -1,
          "Submit",
          "TravelAuthorization did not submit successfully."
        )
        throw error
      })
  }

  private async determineSecureUserId(
    currentUser: User,
    userId: number | undefined,
    userAttributes: UserCreationAttributes | undefined
  ): Promise<number> {
    // This pattern is a bit off, but I can't think of a better place to put this logic.
    // If the user is not an admin, the userId must come from the current user.
    // TODO: consider putting this code in the policy?
    if (!currentUser.roles.includes(User.Roles.ADMIN)) {
      return currentUser.id
    }

    if (userId !== undefined && userAttributes !== undefined) {
      throw new Error("Cannot specify both userId and userAttributes.")
    } else if (userId === undefined && userAttributes === undefined) {
      throw new Error("Must specify either userId or userAttributes.")
    } else if (userId !== undefined) {
      return userId
    } else if (userAttributes !== undefined) {
      const user = await Users.EnsureService.perform(userAttributes, currentUser)
      return user.id
    } else {
      throw new Error("This should never be reached, but it makes TypeScript happy.")
    }
  }

  private async createStops(
    travelAuthorization: TravelAuthorization,
    stopsAttributes: StopsCreationAttributes
  ) {
    const minimalStopsAttributesWithDefaults = this.ensureMinimalDefaultStopsAttributes(
      travelAuthorization,
      stopsAttributes
    )

    return StopsService.bulkCreate(travelAuthorization.id, minimalStopsAttributesWithDefaults)
  }

  // TODO: might want to make this a validator against updates as well?
  private ensureMinimalDefaultStopsAttributes(
    travelAuthorization: TravelAuthorization,
    stopsAttributes: StopsCreationAttributes
  ): StopsCreationAttributes {
    if (travelAuthorization.tripTypeEstimate === TravelAuthorization.TripTypes.MULTI_CITY) {
      return this.ensureMinimalDefaultMultiDestinationStopsAttributes(
        travelAuthorization.id,
        stopsAttributes
      )
    } else if (travelAuthorization.tripTypeEstimate === TravelAuthorization.TripTypes.ONE_WAY) {
      return this.ensureMinimalDefaultOneWayStopsAttributes(travelAuthorization.id, stopsAttributes)
    } else {
      return this.ensureMinimalDefaultRoundTripStopsAttributes(
        travelAuthorization.id,
        stopsAttributes
      )
    }
  }

  private ensureMinimalDefaultMultiDestinationStopsAttributes(
    travelAuthorizationId: number,
    stopsAttributes: StopsCreationAttributes
  ): StopsCreationAttributes {
    return [
      {
        travelAuthorizationId,
        accommodationType: Stop.AccommodationTypes.HOTEL,
        transport: Stop.TravelMethods.AIRCRAFT,
        ...stopsAttributes[0],
      },
      {
        travelAuthorizationId,
        accommodationType: null,
        transport: Stop.TravelMethods.AIRCRAFT,
        ...stopsAttributes[1],
      },
      {
        travelAuthorizationId,
        accommodationType: null,
        transport: null,
        ...stopsAttributes[2],
      },
    ]
  }

  private ensureMinimalDefaultOneWayStopsAttributes(
    travelAuthorizationId: number,
    stopsAttributes: StopsCreationAttributes
  ): StopsCreationAttributes {
    return [
      {
        travelAuthorizationId,
        accommodationType: null,
        transport: Stop.TravelMethods.AIRCRAFT,
        ...stopsAttributes[0],
      },
      {
        travelAuthorizationId,
        accommodationType: null,
        transport: null,
        ...stopsAttributes[1],
      },
    ]
  }

  private ensureMinimalDefaultRoundTripStopsAttributes(
    travelAuthorizationId: number,
    stopsAttributes: StopsCreationAttributes
  ): StopsCreationAttributes {
    return [
      {
        travelAuthorizationId,
        accommodationType: Stop.AccommodationTypes.HOTEL,
        transport: Stop.TravelMethods.AIRCRAFT,
        ...stopsAttributes[0],
      },
      {
        travelAuthorizationId,
        accommodationType: null,
        transport: Stop.TravelMethods.AIRCRAFT,
        ...stopsAttributes[1],
      },
    ]
  }
}

export default CreateService
