import { Factory } from "fishery"
import { faker } from "@faker-js/faker"

import { TravelDeskTravelAgency } from "@/models"

export const travelDeskTravelAgencyFactory = Factory.define<TravelDeskTravelAgency>(
  ({ onCreate }) => {
    onCreate(async (travelDeskTravelAgency) => {
      try {
        await travelDeskTravelAgency.save()
        return travelDeskTravelAgency
      } catch (error) {
        console.error(error)
        throw new Error(
          `Could not create TravelDeskTravelAgency with attributes: ${JSON.stringify(
            travelDeskTravelAgency.dataValues,
            null,
            2
          )}`
        )
      }
    })

    return TravelDeskTravelAgency.build({
      agencyName: faker.company.name(),
      contactName: faker.person.fullName(),
      contactEmail: faker.internet.email(),
      contactPhoneNumber: faker.string.numeric(10),
      agencyInfo: null,
    })
  }
)

export default travelDeskTravelAgencyFactory
