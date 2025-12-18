import { isNil, isUndefined, pick } from "lodash"

import db, {
  TravelAuthorization,
  TravelAuthorizationActionLog,
  TravelDeskTravelRequest,
  TravelSegment,
  User,
} from "@/models"

import BaseService from "@/services/base-service"
import { TravelDeskTravelRequests } from "@/services"

export class ApproveService extends BaseService {
  private travelAuthorization: TravelAuthorization
  private approver: User

  constructor(travelAuthorization: TravelAuthorization, approver: User) {
    super()
    this.travelAuthorization = travelAuthorization
    this.approver = approver
  }

  async perform(): Promise<TravelAuthorization> {
    if (this.travelAuthorization.status !== TravelAuthorization.Statuses.SUBMITTED) {
      throw new Error("Travel authorization must be in submitted state to approve.")
    }

    const { travelSegments, user, purpose } = this.travelAuthorization
    if (isUndefined(travelSegments)) {
      throw new Error("Travel authorization expected to have travel segments association.")
    }

    if (isUndefined(user)) {
      throw new Error("Travel authorization expected to have user association.")
    }

    if (isUndefined(purpose)) {
      throw new Error("Travel authorization expected to have purpose association.")
    }

    await db.transaction(async () => {
      await this.travelAuthorization.update({
        status: TravelAuthorization.Statuses.APPROVED,
        wizardStepName: TravelAuthorization.WizardStepNames.EDIT_TRAVELLER_DETAILS,
      })

      if (this.isTravellingByAir(travelSegments)) {
        const defaultTravelDeskTravelRequestAttributes =
          await this.loadDefaultsFromPreviousTravelDeskTravelRequest()
        await TravelDeskTravelRequests.CreateService.perform(
          {
            ...defaultTravelDeskTravelRequestAttributes,
            travelAuthorizationId: this.travelAuthorization.id,
            legalFirstName: user.firstName || "",
            legalLastName: user.lastName || "",
            busEmail: user.email,
            travelPurpose: purpose.purpose,
          },
          this.approver
        )
      }

      await TravelAuthorizationActionLog.create({
        travelAuthorizationId: this.travelAuthorization.id,
        actorId: this.approver.id,
        assigneeId: this.travelAuthorization.userId,
        action: TravelAuthorizationActionLog.Actions.APPROVED,
      })
    })

    return this.travelAuthorization.reloadWithScope("asShow")
  }

  private isTravellingByAir(travelSegments: TravelSegment[]): boolean {
    return travelSegments.some(
      (segment) => segment.modeOfTransport === TravelSegment.TravelMethods.AIRCRAFT
    )
  }

  private async loadDefaultsFromPreviousTravelDeskTravelRequest(): Promise<
    Partial<TravelDeskTravelRequest>
  > {
    const newestPreviousTravelDeskTravelRequestForUser = await TravelDeskTravelRequest.findOne({
      include: [
        {
          association: "travelAuthorization",
          attributes: [],
          where: {
            userId: this.travelAuthorization.userId,
          },
        },
      ],
      order: [["createdAt", "DESC"]],
    })
    if (isNil(newestPreviousTravelDeskTravelRequestForUser)) {
      return {
        strAddress: "",
        city: "",
        province: "",
        postalCode: "",
        busPhone: "",
      }
    }

    return {
      ...pick(newestPreviousTravelDeskTravelRequestForUser, [
        "birthDate",
        "strAddress",
        "city",
        "province",
        "postalCode",
        "busPhone",
      ]),
    }
  }
}

export default ApproveService
