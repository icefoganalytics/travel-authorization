import { Factory } from "fishery"
import { faker } from "@faker-js/faker/locale/en_CA"

import { TravelAuthorizationPreApproval } from "@/models"
import { userFactory } from "@/factories"

export const travelAuthorizationPreApprovalFactory = Factory.define<TravelAuthorizationPreApproval>(
  ({ associations, onCreate }) => {
    onCreate((travelAuthorizationPreApproval) => {
      try {
        return travelAuthorizationPreApproval.save()
      } catch (error) {
        console.error(error)
        throw new Error(
          `Could not create TravelAuthorizationPreApproval with attributes: ${JSON.stringify(
            travelAuthorizationPreApproval.dataValues,
            null,
            2
          )}`
        )
      }
    })

    const creator = associations.creator ?? userFactory.build({ id: undefined })

    const travelAuthorizationPreApproval = TravelAuthorizationPreApproval.build({
      creatorId: creator.id,
      estimatedCost: faker.number.int({ min: 500, max: 2000 }),
      location: faker.helpers.arrayElement(["Whitehorse", "Dawson", "Watson Lake"]),
      department: "Economic Development",
      branch: "Human Resources",
      purpose: faker.helpers.arrayElement([
        "Annual Financial Review",
        "Marketing Campaign Launch",
        "Technology Upgrade Planning",
      ]),
      reason: faker.lorem.sentence(),
      startDate: faker.date.soon({ days: 60 }),
      endDate: faker.date.soon({ days: 180 }),
      isOpenForAnyDate: faker.datatype.boolean(),
      month: faker.date.month(),
      isOpenForAnyTraveler: faker.datatype.boolean(),
      numberTravelers: faker.number.int({ min: 1, max: 5 }),
      travelerNotes: faker.lorem.sentence(),
      status: faker.helpers.enumValue(TravelAuthorizationPreApproval.Statuses),
    })

    travelAuthorizationPreApproval.creator = creator

    return travelAuthorizationPreApproval
  }
)

export default travelAuthorizationPreApprovalFactory
