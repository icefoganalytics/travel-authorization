export type TravelAuthorizationStateFlags = {
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
