import { isNil, isUndefined } from "lodash"

import { TravelAuthorization, TravelDeskTravelRequest, TravelSegment } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"

export type TravelAuthorizationStateFlagsView = {
  isDraft: boolean
  isDeleted: boolean
  isSubmitted: boolean
  isApproved: boolean
  isDenied: boolean
  isChangeRequested: boolean
  isBooked: boolean
  isExpenseClaimSubmitted: boolean
  isExpenseClaimApproved: boolean
  isExpenseClaimDenied: boolean
  isExpensed: boolean
  // Travel Desk states
  isTravelDeskDraft: boolean
  isTravelDeskSubmitted: boolean
  isTravelDeskOptionsProvided: boolean
  isTravelDeskOptionsRanked: boolean
  isTravelDeskBooked: boolean
  isTravelDeskComplete: boolean
  // Composite states
  isTravellingByAir: boolean
  isInFinalState: boolean
  isInTravelDeskFlow: boolean
}

export class StateFlagsSerializer extends BaseSerializer<TravelAuthorization> {
  perform(): TravelAuthorizationStateFlagsView {
    const { travelDeskTravelRequest, travelSegments } = this.record

    if (isUndefined(travelDeskTravelRequest)) {
      throw new Error("Expected travelDeskTravelRequest association to be pre-loaded.")
    }

    if (isUndefined(travelSegments)) {
      throw new Error("Expected travelSegments association to be pre-loaded.")
    }

    const isTravelDeskDraft = this.isTravelDeskDraft(travelDeskTravelRequest)
    const isTravelDeskSubmitted = this.isTravelDeskSubmitted(travelDeskTravelRequest)
    const isTravelDeskOptionsProvided = this.isTravelDeskOptionsProvided(travelDeskTravelRequest)
    const isTravelDeskOptionsRanked = this.isTravelDeskOptionsRanked(travelDeskTravelRequest)
    const isTravelDeskBooked = this.isTravelDeskBooked(travelDeskTravelRequest)
    const isTravelDeskComplete = this.isTravelDeskComplete(travelDeskTravelRequest)

    const isTravellingByAir = this.isTravellingByAir(travelSegments)
    const isInTravelDeskFlow = this.isInTravelDeskFlow(travelDeskTravelRequest)

    return {
      isDraft: this.isDraft(),
      isDeleted: this.isDeleted(),
      isSubmitted: this.isSubmitted(),
      isApproved: this.isApproved(),
      isDenied: this.isDenied(),
      isChangeRequested: this.isChangeRequested(),
      isBooked: this.isBooked(),
      isExpenseClaimSubmitted: this.isExpenseClaimSubmitted(),
      isExpenseClaimApproved: this.isExpenseClaimApproved(),
      isExpenseClaimDenied: this.isExpenseClaimDenied(),
      isExpensed: this.isExpensed(),
      // Travel Desk states
      isTravelDeskDraft,
      isTravelDeskSubmitted,
      isTravelDeskOptionsProvided,
      isTravelDeskOptionsRanked,
      isTravelDeskBooked,
      isTravelDeskComplete,

      // Composite states
      isTravellingByAir,
      isInFinalState: this.isInFinalState(),
      isInTravelDeskFlow,
    }
  }

  // State flags
  private isDraft() {
    return this.record.status === TravelAuthorization.Statuses.DRAFT
  }

  private isDeleted() {
    return this.record.status === TravelAuthorization.Statuses.DELETED
  }

  private isSubmitted() {
    return this.record.status === TravelAuthorization.Statuses.SUBMITTED
  }

  private isApproved() {
    return this.record.status === TravelAuthorization.Statuses.APPROVED
  }

  private isDenied() {
    return this.record.status === TravelAuthorization.Statuses.DENIED
  }

  private isChangeRequested() {
    return this.record.status === TravelAuthorization.Statuses.CHANGE_REQUESTED
  }

  private isBooked() {
    return this.record.status === TravelAuthorization.Statuses.BOOKED
  }

  private isExpenseClaimSubmitted() {
    return this.record.status === TravelAuthorization.Statuses.EXPENSE_CLAIM_SUBMITTED
  }

  private isExpenseClaimApproved() {
    return this.record.status === TravelAuthorization.Statuses.EXPENSE_CLAIM_APPROVED
  }

  private isExpenseClaimDenied() {
    return this.record.status === TravelAuthorization.Statuses.EXPENSE_CLAIM_DENIED
  }

  private isExpensed() {
    return this.record.status === TravelAuthorization.Statuses.EXPENSED
  }

  // Travel Desk Request States
  private isTravelDeskDraft(travelDeskRequest: TravelDeskTravelRequest | null) {
    if (isNil(travelDeskRequest)) return false

    return travelDeskRequest.status === TravelDeskTravelRequest.Statuses.DRAFT
  }

  private isTravelDeskSubmitted(travelDeskTravelRequest: TravelDeskTravelRequest | null) {
    if (isNil(travelDeskTravelRequest)) return false

    return travelDeskTravelRequest.status === TravelDeskTravelRequest.Statuses.SUBMITTED
  }

  private isTravelDeskOptionsProvided(travelDeskTravelRequest: TravelDeskTravelRequest | null) {
    if (isNil(travelDeskTravelRequest)) return false

    return travelDeskTravelRequest.status === TravelDeskTravelRequest.Statuses.OPTIONS_PROVIDED
  }

  private isTravelDeskOptionsRanked(travelDeskTravelRequest: TravelDeskTravelRequest | null) {
    if (isNil(travelDeskTravelRequest)) return false

    return travelDeskTravelRequest.status === TravelDeskTravelRequest.Statuses.OPTIONS_RANKED
  }

  private isTravelDeskBooked(travelDeskTravelRequest: TravelDeskTravelRequest | null) {
    if (isNil(travelDeskTravelRequest)) return false

    return travelDeskTravelRequest.status === TravelDeskTravelRequest.Statuses.BOOKED
  }

  private isTravelDeskComplete(travelDeskTravelRequest: TravelDeskTravelRequest | null) {
    if (isNil(travelDeskTravelRequest)) return false

    return travelDeskTravelRequest.status === TravelDeskTravelRequest.Statuses.COMPLETE
  }

  // Composite States
  private isTravellingByAir(travelSegments: TravelSegment[]) {
    return travelSegments.some(
      (travelSegment) => travelSegment.modeOfTransport === TravelSegment.TravelMethods.AIRCRAFT
    )
  }

  private isInFinalState() {
    return this.isDeleted() || this.isDenied() || this.isExpenseClaimDenied() || this.isExpensed()
  }

  private isInTravelDeskFlow(travelDeskTravelRequest: TravelDeskTravelRequest | null) {
    if (isNil(travelDeskTravelRequest)) return false

    return (
      this.isTravelDeskDraft(travelDeskTravelRequest) ||
      this.isTravelDeskSubmitted(travelDeskTravelRequest) ||
      this.isTravelDeskOptionsProvided(travelDeskTravelRequest) ||
      this.isTravelDeskOptionsRanked(travelDeskTravelRequest) ||
      this.isTravelDeskBooked(travelDeskTravelRequest) ||
      this.isTravelDeskComplete(travelDeskTravelRequest)
    )
  }
}

export default StateFlagsSerializer
