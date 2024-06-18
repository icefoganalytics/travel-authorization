import { Includeable } from "sequelize"
import { Factory } from "fishery"
import { faker } from "@faker-js/faker"
import { isNil } from "lodash"

import { TravelAuthorization, TravelSegment } from "@/models"
import { travelPurposeFactory, userFactory } from "@/factories"
import { POSTGRES_INT_4_MAX, presence } from "./helpers"

type TransientParam = {
  include?: Includeable | Includeable[]
  roundTrip?: boolean
}

export const travelAuthorizationFactory = Factory.define<TravelAuthorization, TransientParam>(
  ({ associations, params, transientParams, onCreate }) => {
    onCreate(async (travelAuthorization) => {
      if (isNil(travelAuthorization.purposeId)) {
        const purpose = associations.purpose || travelPurposeFactory.build()
        await purpose.save()
        travelAuthorization.purposeId = purpose.id
      }

      if (isNil(travelAuthorization.userId)) {
        const user = associations.user || userFactory.build()
        await user.save()
        travelAuthorization.userId = user.id
      }

      await travelAuthorization.save()

      if (associations.travelSegments) {
        const travelSegmentAttributes = associations.travelSegments.map((travelSegment) => {
          return {
            ...travelSegment.dataValues,
            travelAuthorizationId: travelAuthorization.id,
          }
        })
        await TravelSegment.bulkCreate(travelSegmentAttributes)
      }

      if (transientParams.include === undefined) {
        return travelAuthorization
      }

      return travelAuthorization.reload({
        include: transientParams.include,
      })
    })

    let oneWayTrip = presence(params.oneWayTrip, !params.multiStop && faker.datatype.boolean())
    let multiStop = presence(params.multiStop, !oneWayTrip && faker.datatype.boolean())
    if (transientParams.roundTrip === true) {
      if (params.oneWayTrip === true) {
        throw new Error("roundTrip transient param conflicts with oneWayTrip param")
      } else if (params.multiStop === true) {
        throw new Error("roundTrip transient param conflicts with multiStop param")
      }

      oneWayTrip = false
      multiStop = false
    }

    return TravelAuthorization.build({
      slug: faker.string.uuid(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      department: faker.commerce.department(),
      division: faker.company.buzzNoun(),
      branch: faker.company.buzzAdjective(),
      unit: faker.company.catchPhraseDescriptor(),
      email: faker.internet.exampleEmail(),
      mailcode: faker.location.zipCode(),
      daysOffTravelStatus: faker.number.int({ min: 1, max: 14 }),
      dateBackToWork: faker.date.future(),
      travelDuration: faker.number.int({ min: 1, max: 14 }),
      travelAdvance: faker.number.int({ min: 0, max: 3000 }),
      eventName: faker.company.catchPhrase(),
      summary: faker.lorem.sentence(),
      benefits: faker.lorem.sentence(),
      status: faker.helpers.enumValue(TravelAuthorization.Statuses),
      supervisorEmail: `supervisor-${faker.internet.exampleEmail()}`, // TODO: add factories once foreign key constraint exists
      requestChange: faker.lorem.sentence(),
      denialReason: faker.lorem.sentence(),
      oneWayTrip,
      multiStop,
      createdBy: faker.number.int({ min: 1, max: POSTGRES_INT_4_MAX }),
      travelAdvanceInCents: faker.number.int({ min: 0, max: 3000 * 100 }), // TODO: add factories once foreign key constraint exists
      allTravelWithinTerritory: faker.datatype.boolean(),
    })
  }
)

export default travelAuthorizationFactory
