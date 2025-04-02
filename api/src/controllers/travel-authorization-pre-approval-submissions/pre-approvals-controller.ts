import { isNil } from "lodash"

import { TravelAuthorizationPreApproval, TravelAuthorizationPreApprovalSubmission } from "@/models"
import {
  TravelAuthorizationPreApprovalsPolicy,
  TravelAuthorizationPreApprovalSubmissionsPolicy,
} from "@/policies"
import {
  CreateService,
  DestroyService,
} from "@/services/travel-authorization-pre-approval-submissions/pre-approvals"

import BaseController from "@/controllers/base-controller"

export class PreApprovalsController extends BaseController<TravelAuthorizationPreApproval> {
  async create() {
    try {
      const travelAuthorizationPreApprovalSubmission =
        await this.loadTravelAuthorizationPreApprovalSubmission()
      if (isNil(travelAuthorizationPreApprovalSubmission)) {
        return this.response.status(404).json({
          message: "Travel pre-approval submission not found.",
        })
      }

      const travelAuthorizationPreApproval = await this.loadTravelAuthorizationPreApproval()
      if (isNil(travelAuthorizationPreApproval)) {
        return this.response.status(404).json({
          message: "Travel pre-approval not found.",
        })
      }

      const policy = this.buildPolicy(travelAuthorizationPreApprovalSubmission)
      if (!policy.update()) {
        return this.response.status(403).json({
          message: "You are not authorized to add requests to this travel pre-approval submission.",
        })
      }

      await CreateService.perform(
        travelAuthorizationPreApprovalSubmission,
        travelAuthorizationPreApproval,
        this.currentUser
      )
      return this.response.status(204).send()
    } catch (error) {
      return this.response.status(422).json({
        message: `Failed to add request to travel pre-approval submission: ${error}`,
      })
    }
  }

  async destroy() {
    try {
      const travelAuthorizationPreApprovalSubmission =
        await this.loadTravelAuthorizationPreApprovalSubmission()
      if (isNil(travelAuthorizationPreApprovalSubmission)) {
        return this.response.status(404).json({
          message: "Travel pre-approval submission not found.",
        })
      }

      const travelAuthorizationPreApproval = await this.loadTravelAuthorizationPreApproval()
      if (isNil(travelAuthorizationPreApproval)) {
        return this.response.status(404).json({
          message: "Travel pre-approval not found.",
        })
      }

      const policy = this.buildPolicy(travelAuthorizationPreApprovalSubmission)
      if (!policy.update()) {
        return this.response.status(403).json({
          message: "You are not authorized to detach this travel pre-approval submission.",
        })
      }

      await DestroyService.perform(
        travelAuthorizationPreApprovalSubmission,
        travelAuthorizationPreApproval,
        this.currentUser
      )
      return this.response.status(204).send()
    } catch (error) {
      return this.response.status(422).json({
        message: `Failed to detach travel pre-approval submission: ${error}`,
      })
    }
  }

  private loadTravelAuthorizationPreApprovalSubmission(): Promise<TravelAuthorizationPreApprovalSubmission | null> {
    return TravelAuthorizationPreApprovalSubmission.findByPk(
      this.params.travelAuthorizationPreApprovalSubmissionId
    )
  }

  private loadTravelAuthorizationPreApproval(): Promise<TravelAuthorizationPreApproval | null> {
    return TravelAuthorizationPreApproval.findByPk(this.params.travelAuthorizationPreApprovalId)
  }

  private buildPolicy(
    travelAuthorizationPreApprovalSubmission: TravelAuthorizationPreApprovalSubmission
  ): TravelAuthorizationPreApprovalSubmissionsPolicy {
    return new TravelAuthorizationPreApprovalSubmissionsPolicy(
      this.currentUser,
      travelAuthorizationPreApprovalSubmission
    )
  }

  private buildTravelAuthorizationPreApprovalPolicy(
    travelAuthorizationPreApproval: TravelAuthorizationPreApproval = TravelAuthorizationPreApproval.build()
  ): TravelAuthorizationPreApprovalsPolicy {
    return new TravelAuthorizationPreApprovalsPolicy(
      this.currentUser,
      travelAuthorizationPreApproval
    )
  }
}

export default PreApprovalsController
