import { CreationAttributes } from "@sequelize/core"
import { isNil } from "lodash"
import { Knex } from "knex"

import {
  Location,
  TravelAuthorization,
  TravelAuthorizationPreApprovalProfile,
  TravelPurpose,
  TravelSegment,
  User,
} from "@/models"
import { Users } from "@/services"

export async function seed(_knex: Knex): Promise<void> {
  const travelAuthorizationPreApprovalProfiles =
    await TravelAuthorizationPreApprovalProfile.findAll()
  if (travelAuthorizationPreApprovalProfiles.length < 3) {
    throw new Error("Could not find enough travel authorization pre-approvals.")
  }

  const travelPurposeInfoTech = await TravelPurpose.findOne({ where: { purpose: "IT" } })
  if (isNil(travelPurposeInfoTech)) {
    throw new Error("Could not find IT travel purpose.")
  }

  const systemUser = await User.findOne({
    where: {
      email: "system.user@yukon.com",
    },
    rejectOnEmpty: true,
  })

  const usersAttributes = [
    {
      firstName: "John",
      lastName: "Doe",
      department: "IT",
      division: "IT",
      branch: "IT",
      unit: "IT",
      email: "John.Doe@yukon.ca",
      mailcode: "123",
    },
    {
      firstName: "Jane",
      lastName: "Doe",
      department: "IT",
      division: "IT",
      branch: "IT",
      unit: "IT",
      email: "Jane.Doe@yukon.ca",
      mailcode: "123",
    },
    {
      firstName: "Some Other",
      lastName: "Guy",
      department: "IT",
      division: "IT",
      branch: "IT",
      unit: "IT",
      email: "SomeOther.Guy@yukon.ca",
      mailcode: "123",
    },
  ]
  const users = []
  for (const userAttributes of usersAttributes) {
    let user = await User.findOne({
      where: {
        email: userAttributes.email.toLowerCase(),
      },
    })
    if (isNil(user)) {
      user = await Users.CreateService.perform(userAttributes, systemUser, { skipSync: true })
    } else {
      await user.update(userAttributes)
    }
    users.push(user)
  }

  if (users.length < 3) {
    throw new Error("Could not find enough users.")
  }
  const travelAuthorizationsAttributes: CreationAttributes<TravelAuthorization>[] = [
    {
      userId: users[0].id,
      firstName: "John",
      lastName: "Doe",
      department: "IT",
      division: "IT",
      branch: "IT",
      unit: "IT",
      email: "John.Doe@yukon.ca",
      mailcode: "123",
      daysOffTravelStatusEstimate: 1,
      dateBackToWorkEstimate: new Date("2019-01-01"),
      travelDurationEstimate: 1,
      purposeId: travelPurposeInfoTech.id,
      travelAdvance: 4,
      eventName: "An Event",
      summary: "Summary",
      benefits: "Benefits",
      status: TravelAuthorization.Statuses.APPROVED,
      slug: "2c2db7f4-5711-40c8-bd54-a6b7ad306319",
      supervisorEmail: "dpdavids@ynet.gov.yk.ca",
      preApprovalProfileId: travelAuthorizationPreApprovalProfiles[0].id,
      requestChange: "",
      denialReason: "",
      tripTypeEstimate: TravelAuthorization.TripTypes.ONE_WAY,
      createdBy: users[0].id,
    },
    {
      userId: users[1].id,
      firstName: "Jane",
      lastName: "Doe",
      department: "IT",
      division: "IT",
      branch: "IT",
      unit: "IT",
      email: "Jane.Doe@yukon.ca",
      mailcode: "123",
      daysOffTravelStatusEstimate: 1,
      dateBackToWorkEstimate: new Date("2019-01-01"),
      travelDurationEstimate: 1,
      purposeId: travelPurposeInfoTech.id,
      travelAdvance: 4,
      eventName: "An Event",
      summary: "Summary",
      benefits: "Benefits",
      status: TravelAuthorization.Statuses.APPROVED,
      slug: "2c2db7f4-5711-40c8-bd54-a6b7ad306311",
      supervisorEmail: "dpdavids@ynet.gov.yk.ca",
      preApprovalProfileId: travelAuthorizationPreApprovalProfiles[1].id,
      requestChange: "",
      denialReason: "",
      tripTypeEstimate: TravelAuthorization.TripTypes.ONE_WAY,
      createdBy: users[1].id,
    },
    {
      userId: users[2].id,
      firstName: "Some Other",
      lastName: "Guy",
      department: "IT",
      division: "IT",
      branch: "IT",
      unit: "IT",
      email: "SomeOther.Guy@yukon.ca",
      mailcode: "123",
      daysOffTravelStatusEstimate: 1,
      dateBackToWorkEstimate: new Date("2019-01-01"),
      travelDurationEstimate: 1,
      purposeId: travelPurposeInfoTech.id,
      travelAdvance: 4,
      eventName: "An Event",
      summary: "Summary",
      benefits: "Benefits",
      status: TravelAuthorization.Statuses.APPROVED,
      slug: "2c2db7f4-5711-40c8-bd54-a6b7ad306312",
      supervisorEmail: "dpdavids@ynet.gov.yk.ca",
      preApprovalProfileId: travelAuthorizationPreApprovalProfiles[2].id,
      requestChange: "",
      denialReason: "",
      tripTypeEstimate: TravelAuthorization.TripTypes.ONE_WAY,
      createdBy: users[2].id,
    },
  ]
  const travelAuthorizations = []
  for (const travelAuthorizationAttributes of travelAuthorizationsAttributes) {
    let travelAuthorization = await TravelAuthorization.findOne({
      where: { slug: travelAuthorizationAttributes.slug },
    })
    if (isNil(travelAuthorization)) {
      travelAuthorization = await TravelAuthorization.create(travelAuthorizationAttributes)
    } else {
      await travelAuthorization.update(travelAuthorizationAttributes)
    }
    travelAuthorizations.push(travelAuthorization)
  }

  const whitehorse = await Location.findOne({
    where: {
      province: "YT",
      city: "Whitehorse",
    },
    rejectOnEmpty: true,
  })
  const vancouver = await Location.findOne({
    where: {
      province: "BC",
      city: "Vancouver",
    },
    rejectOnEmpty: true,
  })
  const airdrie = await Location.findOne({
    where: {
      province: "AB",
      city: "Airdrie",
    },
    rejectOnEmpty: true,
  })
  const grandePrairie = await Location.findOne({
    where: {
      province: "AB",
      city: "Grande Prairie",
    },
    rejectOnEmpty: true,
  })
  const redDeer = await Location.findOne({
    where: {
      province: "AB",
      city: "Red Deer",
    },
    rejectOnEmpty: true,
  })
  const beaumont = await Location.findOne({
    where: {
      province: "AB",
      city: "Beaumont",
    },
    rejectOnEmpty: true,
  })
  const travelSegmentsAttributes: CreationAttributes<TravelSegment>[] = [
    {
      travelAuthorizationId: travelAuthorizations[0].id,
      isActual: false,
      segmentNumber: 1,
      departureLocationId: whitehorse.id,
      arrivalLocationId: vancouver.id,
      departureOn: new Date("2023-05-12"),
      departureTime: "12:00:00",
      modeOfTransport: TravelSegment.TravelMethods.AIRCRAFT,
    },
    {
      travelAuthorizationId: travelAuthorizations[1].id,
      isActual: false,
      segmentNumber: 1,
      departureLocationId: airdrie.id,
      arrivalLocationId: grandePrairie.id,
      departureOn: new Date("2023-05-12"),
      departureTime: "12:00:00",
      modeOfTransport: TravelSegment.TravelMethods.AIRCRAFT,
    },
    {
      travelAuthorizationId: travelAuthorizations[2].id,
      isActual: false,
      segmentNumber: 1,
      departureLocationId: redDeer.id,
      arrivalLocationId: beaumont.id,
      departureOn: new Date("2023-05-12"),
      departureTime: "12:00:00",
      modeOfTransport: TravelSegment.TravelMethods.AIRCRAFT,
    },
  ]
  for (const travelSegmentAttributes of travelSegmentsAttributes) {
    const travelSegment = await TravelSegment.findOne({
      where: {
        travelAuthorizationId: travelSegmentAttributes.travelAuthorizationId,
        departureLocationId: travelSegmentAttributes.departureLocationId,
        arrivalLocationId: travelSegmentAttributes.arrivalLocationId,
        modeOfTransport: travelSegmentAttributes.modeOfTransport,
      },
    })
    if (isNil(travelSegment)) {
      await TravelSegment.create(travelSegmentAttributes)
    } else {
      await travelSegment.update(travelSegmentAttributes)
    }
  }
}
