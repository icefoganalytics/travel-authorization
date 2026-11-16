import { faker } from "@faker-js/faker"
import { Factory } from "fishery"

import {
  type TravelAuthorizationPreApproval,
  TravelAuthorizationPreApprovalStatuses,
} from "@/api/travel-authorization-pre-approvals-api"

export const travelAuthorizationPreApprovalFactory = Factory.define<TravelAuthorizationPreApproval>(
  ({ sequence }) => {
    const createdAt = faker.date.past().toISOString()

    return {
      id: sequence,
      creatorId: sequence,
      submissionId: null,
      estimatedCost: faker.number.int({ min: 100, max: 5000 }),
      location: faker.location.city(),
      department: null,
      branch: null,
      purpose: null,
      reason: null,
      startDate: null,
      endDate: null,
      isOpenForAnyDate: true,
      month: null,
      isOpenForAnyTraveler: true,
      numberTravelers: null,
      travelerNotes: null,
      status: TravelAuthorizationPreApprovalStatuses.DRAFT,
      createdAt,
      updatedAt: createdAt,
    }
  }
)

export default travelAuthorizationPreApprovalFactory
