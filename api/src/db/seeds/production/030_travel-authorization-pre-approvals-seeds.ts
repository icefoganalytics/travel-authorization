import { Knex } from "knex"
import { isNil } from "lodash"

import {
  TravelAuthorizationPreApproval,
  TravelAuthorizationPreApprovalProfile,
  User,
} from "@/models"

export async function seed(_knex: Knex): Promise<void> {
  const systemUser = await User.findOne({
    where: {
      email: "system.user@yukon.com",
    },
    rejectOnEmpty: true,
  })

  const travelAuthorizationPreApprovalsAttributes = [
    {
      creatorId: systemUser.id,
      estimatedCost: 1500,
      location: "Whitehorse",
      // Department and branch are taken from YgDepartments table.
      // TODO: create relevant records in YgDepartments table.
      department: "Economic Development",
      branch: "Human Resources",
      purpose: "Annual Financial Review",
      reason: "Annual departmental meeting to discuss financial strategies and performance",
      startDate: new Date("2024-06-15"),
      endDate: new Date("2024-06-20"),
      isOpenForAnyDate: true,
      month: "June",
      isOpenForAnyTraveler: false,
      numberTravelers: 3,
      travelerNotes: "All travelers are senior finance officers",
      status: TravelAuthorizationPreApproval.Statuses.APPROVED,
    },
    {
      creatorId: systemUser.id,
      estimatedCost: 800,
      location: "Dawson",
      department: "Economic Development",
      branch: "Human Resources",
      purpose: "Marketing Campaign Launch",
      reason: "Coordination meeting for the upcoming product launch",
      startDate: new Date("2024-07-22"),
      endDate: new Date("2024-07-25"),
      isOpenForAnyDate: false,
      month: null,
      isOpenForAnyTraveler: true,
      numberTravelers: 2,
      travelerNotes: "Include both a creative director and campaign manager",
      status: TravelAuthorizationPreApproval.Statuses.APPROVED,
    },
    {
      creatorId: systemUser.id,
      estimatedCost: 1200,
      location: "Watson Lake",
      department: "Economic Development",
      branch: "Human Resources",
      purpose: "Technology Upgrade Planning",
      reason: "Planning session for upcoming software and hardware upgrades",
      startDate: null,
      endDate: null,
      isOpenForAnyDate: true,
      month: "January",
      isOpenForAnyTraveler: true,
      numberTravelers: 4,
      travelerNotes: "Includes IT managers and system administrators",
      status: TravelAuthorizationPreApproval.Statuses.APPROVED,
    },
  ]
  const travelAuthorizationPreApprovals = []
  for (const travelAuthorizationPreApprovalAttributes of travelAuthorizationPreApprovalsAttributes) {
    let travelAuthorizationPreApproval = await TravelAuthorizationPreApproval.findOne({
      where: {
        location: travelAuthorizationPreApprovalAttributes.location,
        department: travelAuthorizationPreApprovalAttributes.department,
        branch: travelAuthorizationPreApprovalAttributes.branch,
        purpose: travelAuthorizationPreApprovalAttributes.purpose,
        reason: travelAuthorizationPreApprovalAttributes.reason,
      },
    })
    if (isNil(travelAuthorizationPreApproval)) {
      travelAuthorizationPreApproval = await TravelAuthorizationPreApproval.create(
        travelAuthorizationPreApprovalAttributes
      )
    } else {
      await travelAuthorizationPreApproval.update(travelAuthorizationPreApprovalAttributes)
    }
    travelAuthorizationPreApprovals.push(travelAuthorizationPreApproval)
  }

  if (travelAuthorizationPreApprovals.length < 3) {
    throw new Error("Need at least 3 pre-approvals to seed pre-approval profiles.")
  }
  const travelAuthorizationPreApprovalProfilesAttributes = [
    {
      preApprovalId: travelAuthorizationPreApprovals[0].id,
      profileName: "Finance Officers",
      department: "Economic Development",
      branch: "Human Resources",
    },
    {
      preApprovalId: travelAuthorizationPreApprovals[1].id,
      profileName: "Marketing Team",
      department: "Economic Development",
      branch: "Human Resources",
    },
    {
      preApprovalId: travelAuthorizationPreApprovals[2].id,
      profileName: "IT Team",
      department: "Economic Development",
      branch: "Human Resources",
    },
  ]
  for (const travelAuthorizationPreApprovalProfileAttributes of travelAuthorizationPreApprovalProfilesAttributes) {
    const travelAuthorizationPreApprovalProfile =
      await TravelAuthorizationPreApprovalProfile.findOne({
        where: {
          preApprovalId: travelAuthorizationPreApprovalProfileAttributes.preApprovalId,
          profileName: travelAuthorizationPreApprovalProfileAttributes.profileName,
          department: travelAuthorizationPreApprovalProfileAttributes.department,
          branch: travelAuthorizationPreApprovalProfileAttributes.branch,
        },
      })
    if (isNil(travelAuthorizationPreApprovalProfile)) {
      await TravelAuthorizationPreApprovalProfile.create(
        travelAuthorizationPreApprovalProfileAttributes
      )
    } else {
      await travelAuthorizationPreApprovalProfile.update(
        travelAuthorizationPreApprovalProfileAttributes
      )
    }
  }
}
