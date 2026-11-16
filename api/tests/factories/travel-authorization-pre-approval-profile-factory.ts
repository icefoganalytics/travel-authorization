import FactoryShark from "factory-shark"
import { faker } from "@faker-js/faker/locale/en_CA"

import { TravelAuthorizationPreApprovalProfile } from "@/models"
import travelAuthorizationPreApprovalFactory from "@/factories/travel-authorization-pre-approval-factory"

export const travelAuthorizationPreApprovalProfileFactory = FactoryShark.define(
  TravelAuthorizationPreApprovalProfile,
  ({ associate }) => {
    associate("preApproval", travelAuthorizationPreApprovalFactory)
    const firstName = faker.person.firstName()
    const lastName = faker.person.lastName()

    return {
      profileName: `${firstName}.${lastName}`,
      department: "Economic Development",
      branch: "Human Resources",
    }
  }
)

export default travelAuthorizationPreApprovalProfileFactory
