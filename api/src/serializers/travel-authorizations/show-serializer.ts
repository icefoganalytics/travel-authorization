import { isNil, isUndefined, pick } from "lodash"

import {
  Expense,
  Stop,
  TravelAuthorization,
  TravelDeskTravelRequest,
  TravelPurpose,
  TravelSegment,
  User,
} from "@/models"

import BaseSerializer from "@/serializers/base-serializer"
import {
  Expenses,
  Stops,
  TravelDeskTravelRequests,
  TravelPurposes,
  TravelSegments,
  Users,
} from "@/serializers"
import StateFlagsSerializer, {
  type TravelAuthorizationStateFlagsView,
} from "@/serializers/travel-authorizations/state-flags-serializer"
import { type ExpenseAsReference } from "@/serializers/expenses/reference-serializer"

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
  expenses: ExpenseAsReference[]
  purpose: TravelPurposes.AsReference | null
  stops: Stops.AsReference[]
  travelDeskTravelRequest: TravelDeskTravelRequests.AsReference | null
  travelSegments: TravelSegments.AsReference[]
  user: Users.AsReference
} & TravelAuthorizationStateFlagsView

export class ShowSerializer extends BaseSerializer<TravelAuthorization> {
  perform(): TravelAuthorizationShowView {
    const { expenses, purpose, stops, travelDeskTravelRequest, travelSegments, user } = this.record
    if (isUndefined(expenses)) {
      throw new Error("Expected expenses association to be pre-loaded.")
    }

    if (isUndefined(purpose)) {
      throw new Error("Expected purpose association to be pre-loaded.")
    }

    if (isUndefined(stops)) {
      throw new Error("Expected stops association to be pre-loaded.")
    }

    if (isUndefined(travelDeskTravelRequest)) {
      throw new Error("Expected travelDeskTravelRequest association to be pre-loaded.")
    }

    if (isUndefined(travelSegments)) {
      throw new Error("Expected travelSegments association to be pre-loaded.")
    }

    if (isUndefined(user)) {
      throw new Error("Expected user association to be pre-loaded.")
    }

    const serializedExpenses = this.serializeExpenses(expenses)
    const serializedTravelPurpose = this.serializeTravelPurpose(purpose)
    const serializedStops = this.serializeStops(stops)
    const serializedTravelDeskTravelRequest =
      this.serializeTravelDeskTravelRequest(travelDeskTravelRequest)
    const serializedTravelSegments = this.serializeTravelSegments(travelSegments)
    const serializedUser = this.serializeUser(user)

    const stateFlagsAttributes = StateFlagsSerializer.perform(this.record)

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
      expenses: serializedExpenses,
      purpose: serializedTravelPurpose,
      stops: serializedStops,
      travelDeskTravelRequest: serializedTravelDeskTravelRequest,
      travelSegments: serializedTravelSegments,
      user: serializedUser,
    }
  }

  private serializeExpenses(expenses: Expense[]): ExpenseAsReference[] {
    return Expenses.ReferenceSerializer.perform(expenses)
  }

  private serializeTravelPurpose(purpose: TravelPurpose | null): TravelPurposes.AsReference | null {
    if (isNil(purpose)) return null

    return TravelPurposes.ReferenceSerializer.perform(purpose)
  }

  private serializeStops(stops: Stop[]): Stops.AsReference[] {
    return Stops.ReferenceSerializer.perform(stops)
  }

  private serializeTravelDeskTravelRequest(
    travelDeskTravelRequest: TravelDeskTravelRequest | null
  ): TravelDeskTravelRequests.AsReference | null {
    if (isNil(travelDeskTravelRequest)) return null

    return TravelDeskTravelRequests.ReferenceSerializer.perform(travelDeskTravelRequest)
  }

  private serializeTravelSegments(travelSegments: TravelSegment[]): TravelSegments.AsReference[] {
    return TravelSegments.ReferenceSerializer.perform(travelSegments)
  }

  private serializeUser(user: User): Users.AsReference {
    return Users.ReferenceSerializer.perform(user)
  }
}

export default ShowSerializer
