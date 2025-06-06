import { CreationAttributes } from "sequelize"
import { isUndefined } from "lodash"
import { v4 as uuid } from "uuid"

import db from "@/db/db-client"

import { TravelAuthorization, User } from "@/models"

import BaseService from "@/services/base-service"
import { TravelSegments, Users } from "@/services"
import { AuditService } from "@/services/audit-service"
import { type UserCreationAttributes } from "@/services/users/create-service"
import { type TravelSegmentCreationAttributes } from "@/services/travel-segments/create-service"

type TravelAuthorizationCreationAttributes = Omit<
  CreationAttributes<TravelAuthorization>,
  "slug"
> & {
  slug?: TravelAuthorization["slug"]
} & {
  travelSegmentEstimatesAttributes?: TravelSegmentCreationAttributes[]
  userAttributes?: UserCreationAttributes
}

// TODO: upgrade this to the enhanced service pattern.
const auditService = new AuditService()

export class CreateService extends BaseService {
  constructor(
    protected attributes: TravelAuthorizationCreationAttributes,
    protected currentUser: User
  ) {
    super()
  }

  async perform(): Promise<TravelAuthorization> {
    return db
      .transaction(async () => {
        const { userId, tripTypeEstimate, slug, status, userAttributes, ...optionalAttributes } =
          this.attributes

        const secureUserId = await this.determineSecureUserId(
          this.currentUser,
          userId,
          userAttributes
        )

        const travelAuthorization = await TravelAuthorization.create({
          ...optionalAttributes,
          userId: secureUserId,
          tripTypeEstimate: tripTypeEstimate || TravelAuthorization.TripTypes.ROUND_TRIP,
          slug: slug || uuid(),
          status: status || TravelAuthorization.Statuses.DRAFT,
          createdBy: this.currentUser.id,
        }).catch((error) => {
          throw new Error(`Could not create TravelAuthorization: ${error}`)
        })

        const { travelSegmentEstimatesAttributes } = this.attributes
        if (!isUndefined(travelSegmentEstimatesAttributes)) {
          this.ensureTravelAuthorizationId(travelAuthorization.id, travelSegmentEstimatesAttributes)
          await TravelSegments.BulkReplaceService.perform(
            travelAuthorization.id,
            travelSegmentEstimatesAttributes,
            false
          )
        }

        await auditService.log(
          this.currentUser.id,
          travelAuthorization.id,
          "Create",
          "TravelAuthorization created successfully."
        )

        return travelAuthorization.reload({
          include: ["expenses", "stops", "purpose", "user", "travelSegments"],
        })
      })
      .catch((error) => {
        auditService.log(
          this.currentUser.id,
          -1,
          "Create",
          "TravelAuthorization did not create successfully."
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

  private ensureTravelAuthorizationId(
    travelAuthorizationId: number,
    travelSegmentEstimatesAttributes: TravelSegmentCreationAttributes[]
  ): void {
    for (const travelSegmentEstimateAttributes of travelSegmentEstimatesAttributes) {
      travelSegmentEstimateAttributes.travelAuthorizationId = travelAuthorizationId
    }
  }
}

export default CreateService
