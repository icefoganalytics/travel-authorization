import { WhereOptions } from "@sequelize/core"
import { isNil } from "lodash"

import { TravelDeskOtherTransportation, TravelDeskTravelRequest } from "@/models"
import { TravelDeskOtherTransportationsPolicy } from "@/policies"
import { CreateService, UpdateService } from "@/services/travel-desk-other-transportations"
import { IndexSerializer } from "@/serializers/travel-desk-other-transportations"

import BaseController from "@/controllers/base-controller"

export class TravelDeskOtherTransportationsController extends BaseController {
  async index() {
    try {
      const where = this.query.where as WhereOptions<TravelDeskOtherTransportation>

      const scopedTravelDeskOtherTransportations = TravelDeskOtherTransportationsPolicy.applyScope(
        TravelDeskOtherTransportation,
        this.currentUser
      )

      const totalCount = await scopedTravelDeskOtherTransportations.count({ where })
      const travelDeskOtherTransportations = await scopedTravelDeskOtherTransportations.findAll({
        where,
        limit: this.pagination.limit,
        offset: this.pagination.offset,
      })
      const serializedTravelDeskOtherTransportations = IndexSerializer.perform(
        travelDeskOtherTransportations,
        this.currentUser
      )
      return this.response.status(200).json({
        travelDeskOtherTransportations: serializedTravelDeskOtherTransportations,
        totalCount,
      })
    } catch (error) {
      return this.response
        .status(500)
        .json({ message: `Failed to retrieve travel desk other transportations: ${error}` })
    }
  }

  async create() {
    try {
      const travelDeskOtherTransportation = await this.buildTravelDeskOtherTransportation()
      const policy = this.buildPolicy(travelDeskOtherTransportation)
      if (!policy.create()) {
        return this.response
          .status(403)
          .json({ message: "You are not authorized to create this other transportation." })
      }

      const permittedAttributes = policy.permitAttributesForCreate(this.request.body)
      const newTravelDeskOtherTransportation = await CreateService.perform(
        permittedAttributes,
        this.currentUser
      )
      return this.response
        .status(201)
        .json({ travelDeskOtherTransportation: newTravelDeskOtherTransportation })
    } catch (error) {
      return this.response
        .status(422)
        .json({ message: `Other transportation creation failed: ${error}` })
    }
  }

  async update() {
    try {
      const travelDeskOtherTransportation = await this.loadTravelDeskOtherTransportation()
      if (isNil(travelDeskOtherTransportation)) {
        return this.response.status(404).json({ message: "Other transportation not found." })
      }

      const policy = this.buildPolicy(travelDeskOtherTransportation)
      if (!policy.update()) {
        return this.response
          .status(403)
          .json({ message: "You are not authorized to update this other transportation." })
      }

      const permittedAttributes = policy.permitAttributesForUpdate(this.request.body)
      const updatedTravelDeskOtherTransportation = await UpdateService.perform(
        travelDeskOtherTransportation,
        permittedAttributes,
        this.currentUser
      )
      return this.response
        .status(200)
        .json({ travelDeskOtherTransportation: updatedTravelDeskOtherTransportation })
    } catch (error) {
      return this.response
        .status(422)
        .json({ message: `Other transportation update failed: ${error}` })
    }
  }

  async destroy() {
    try {
      const travelDeskOtherTransportation = await this.loadTravelDeskOtherTransportation()
      if (isNil(travelDeskOtherTransportation)) {
        return this.response.status(404).json({ message: "Other transportation not found." })
      }

      const policy = this.buildPolicy(travelDeskOtherTransportation)
      if (!policy.destroy()) {
        return this.response
          .status(403)
          .json({ message: "You are not authorized to delete this other transportation." })
      }

      await travelDeskOtherTransportation.destroy()
      return this.response.status(204).send()
    } catch (error) {
      return this.response
        .status(422)
        .json({ message: `Other transportation deletion failed: ${error}` })
    }
  }

  private async buildTravelDeskOtherTransportation(): Promise<TravelDeskOtherTransportation> {
    const travelDeskOtherTransportation = TravelDeskOtherTransportation.build(this.request.body)

    const { travelRequestId } = travelDeskOtherTransportation
    const travelDeskTravelRequest = await TravelDeskTravelRequest.findByPk(travelRequestId, {
      include: ["travelAuthorization"],
    })
    if (isNil(travelDeskTravelRequest)) {
      throw new Error(`Travel request not found for travelRequestId=${travelRequestId}`)
    }

    travelDeskOtherTransportation.travelRequest = travelDeskTravelRequest

    return travelDeskOtherTransportation
  }

  private loadTravelDeskOtherTransportation(): Promise<TravelDeskOtherTransportation | null> {
    return TravelDeskOtherTransportation.findByPk(this.params.travelDeskOtherTransportationId, {
      include: [
        // required for policy check
        {
          association: "travelRequest",
          include: ["travelAuthorization"],
        },
      ],
    })
  }

  private buildPolicy(travelDeskOtherTransportation: TravelDeskOtherTransportation) {
    return new TravelDeskOtherTransportationsPolicy(this.currentUser, travelDeskOtherTransportation)
  }
}

export default TravelDeskOtherTransportationsController
