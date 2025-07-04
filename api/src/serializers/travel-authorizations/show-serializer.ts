import { isNil, pick } from "lodash"

import { TravelAuthorization, User } from "@/models"

import BaseSerializer from "@/serializers/base-serializer"
import { Expenses, TravelDeskTravelRequests, TravelPurposes, TravelSegments } from "@/serializers"
import StopsSerializer, { StopDetailedView } from "@/serializers/stops-serializer"
import UsersSerializer, { UserDetailedView } from "@/serializers/users-serializer"
import StateFlagsSerializer, {
  type TravelAuthorizationStateFlagsView,
} from "@/serializers/travel-authorizations/state-flags-serializer"
import { type ExpenseShowView } from "@/serializers/expenses/show-serializer"
import { type TravelDeskTravelRequestShowView } from "@/serializers/travel-desk-travel-requests/show-serializer"
import { type TravelPurposeShowView } from "@/serializers/travel-purposes/show-serializer"
import { type TravelSegmentShowView } from "@/serializers/travel-segments/show-serializer"

export type TravelAuthorizationShowView = Pick<
  TravelAuthorization,
  | "id"
  | "slug"
  | "userId"
  | "preApprovalProfileId"
  | "purposeId"
  | "firstName"
  | "lastName"
  | "department"
  | "division"
  | "branch"
  | "unit"
  | "email"
  | "mailcode"
  | "daysOffTravelStatusEstimate"
  | "daysOffTravelStatusActual"
  | "dateBackToWorkEstimate"
  | "dateBackToWorkActual"
  | "travelDurationEstimate"
  | "travelDurationActual"
  | "travelAdvance"
  | "eventName"
  | "summary"
  | "benefits"
  | "status"
  | "wizardStepName"
  | "supervisorEmail"
  | "requestChange"
  | "denialReason"
  | "tripTypeEstimate"
  | "tripTypeActual"
  | "createdBy"
  | "travelAdvanceInCents"
  | "allTravelWithinTerritory"
  | "createdAt"
  | "updatedAt"
> & {
  expenses: ExpenseShowView[] // TODO: return undefined once expenses use standard serializer
  purpose?: TravelPurposeShowView
  stops: StopDetailedView[] // TODO: return undefined once stops use standard serializer
  travelDeskTravelRequest?: TravelDeskTravelRequestShowView
  travelSegments?: TravelSegmentShowView[]
  user: UserDetailedView
} & TravelAuthorizationStateFlagsView

export class ShowSerializer extends BaseSerializer<TravelAuthorization> {
  constructor(
    protected record: TravelAuthorization,
    protected currentUser: User
  ) {
    super(record)
  }

  perform(): TravelAuthorizationShowView {
    const stateFlagsAttributes = StateFlagsSerializer.perform(this.record, this.currentUser)

    return {
      ...pick(this.record, [
        "id",
        "slug",
        "userId",
        "preApprovalProfileId",
        "purposeId",
        "firstName",
        "lastName",
        "department",
        "division",
        "branch",
        "unit",
        "email",
        "mailcode",
        "daysOffTravelStatusEstimate",
        "daysOffTravelStatusActual",
        "dateBackToWorkEstimate",
        "dateBackToWorkActual",
        "travelDurationEstimate",
        "travelDurationActual",
        "travelAdvance",
        "eventName",
        "summary",
        "benefits",
        "status",
        "wizardStepName",
        "supervisorEmail",
        "requestChange",
        "denialReason",
        "tripTypeEstimate",
        "tripTypeActual",
        "createdBy",
        "travelAdvanceInCents",
        "allTravelWithinTerritory",
        "createdAt",
        "updatedAt",
      ]),
      // computed fields
      ...stateFlagsAttributes,
      // associations
      expenses: this.serializeExpensesAttributes(),
      purpose: this.serializeTravelPurposeAttributes(),
      stops: this.serializeStopsAttributes(),
      travelDeskTravelRequest: this.serializeTravelDeskTravelRequestAttributes(),
      travelSegments: this.serializeTravelSegmentsAttributes(),
      user: this.serializeUserAttributes(),
    }
  }

  private get traveller(): User {
    if (isNil(this.record.user)) {
      throw new Error("TravelAuthorization must include an associated User")
    }

    return this.record.user
  }

  private serializeExpensesAttributes(): ExpenseShowView[] {
    if (isNil(this.record.expenses)) {
      return []
    }

    return Expenses.ShowSerializer.perform(this.record.expenses, this.currentUser)
  }

  private serializeTravelPurposeAttributes(): TravelPurposeShowView | undefined {
    if (isNil(this.record.purpose)) {
      return undefined
    }

    return TravelPurposes.ShowSerializer.perform(this.record.purpose, this.currentUser)
  }

  private serializeStopsAttributes(): StopDetailedView[] {
    if (isNil(this.record.stops)) {
      return []
    }

    return this.record.stops.map(StopsSerializer.asDetailed)
  }

  private serializeTravelDeskTravelRequestAttributes():
    | TravelDeskTravelRequestShowView
    | undefined {
    if (isNil(this.record.travelDeskTravelRequest)) {
      return undefined
    }

    return TravelDeskTravelRequests.ShowSerializer.perform(
      this.record.travelDeskTravelRequest,
      this.currentUser
    )
  }

  private serializeTravelSegmentsAttributes(): TravelSegmentShowView[] | undefined {
    if (isNil(this.record.travelSegments)) {
      return undefined
    }

    return TravelSegments.ShowSerializer.perform(this.record.travelSegments, this.currentUser)
  }

  private serializeUserAttributes(): UserDetailedView {
    return UsersSerializer.asDetailed(this.traveller)
  }
}

export default ShowSerializer
