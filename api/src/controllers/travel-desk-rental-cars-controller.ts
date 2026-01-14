import { isNil } from "lodash"

import logger from "@/utils/logger"

import { TravelDeskRentalCar, TravelDeskTravelRequest } from "@/models"
import { TravelDeskRentalCarsPolicy } from "@/policies"
import { CreateService, UpdateService } from "@/services/travel-desk-rental-cars"
import { IndexSerializer, ShowSerializer } from "@/serializers/travel-desk-rental-cars"

import BaseController from "@/controllers/base-controller"

export class TravelDeskRentalCarsController extends BaseController<TravelDeskRentalCar> {
  async index() {
    try {
      const where = this.buildWhere()
      const scopes = this.buildFilterScopes()
      const order = this.buildOrder()

      const scopedTravelDeskRentalCars = TravelDeskRentalCarsPolicy.applyScope(
        scopes,
        this.currentUser
      )

      const totalCount = await scopedTravelDeskRentalCars.count({ where })
      const travelDeskRentalCars = await scopedTravelDeskRentalCars.findAll({
        where,
        order,
        limit: this.pagination.limit,
        offset: this.pagination.offset,
      })
      const serializedTravelDeskRentalCars = IndexSerializer.perform(
        travelDeskRentalCars,
        this.currentUser
      )
      return this.response.status(200).json({
        travelDeskRentalCars: serializedTravelDeskRentalCars,
        totalCount,
      })
    } catch (error) {
      logger.error(`Failed to retrieve travel desk rental cars: ${error}`, { error })
      return this.response.status(400).json({
        message: `Failed to retrieve travel desk rental cars: ${error}`,
      })
    }
  }

  async show() {
    try {
      const travelDeskRentalCar = await this.loadTravelDeskRentalCar()
      if (isNil(travelDeskRentalCar)) {
        return this.response.status(404).json({
          message: "Rental car not found.",
        })
      }

      const policy = this.buildPolicy(travelDeskRentalCar)
      if (!policy.show()) {
        return this.response.status(403).json({
          message: "You are not authorized to view this rental car.",
        })
      }

      const serializedTravelDeskRentalCar = ShowSerializer.perform(
        travelDeskRentalCar,
        this.currentUser
      )
      return this.response.status(200).json({
        travelDeskRentalCar: serializedTravelDeskRentalCar,
        policy,
      })
    } catch (error) {
      logger.error(`Failed to retrieve rental car: ${error}`, { error })
      return this.response.status(500).json({
        message: `Failed to retrieve rental car: ${error}`,
      })
    }
  }

  async create() {
    try {
      const travelDeskRentalCar = await this.buildTravelDeskRentalCar()
      const policy = this.buildPolicy(travelDeskRentalCar)
      if (!policy.create()) {
        return this.response.status(403).json({
          message: "You are not authorized to create this rental car.",
        })
      }

      const permittedAttributes = policy.permitAttributesForCreate(this.request.body)
      const newTravelDeskRentalCar = await CreateService.perform(
        permittedAttributes,
        this.currentUser
      )
      const serializedTravelDeskRentalCar = ShowSerializer.perform(
        newTravelDeskRentalCar,
        this.currentUser
      )
      return this.response.status(201).json({
        travelDeskRentalCar: serializedTravelDeskRentalCar,
        policy,
      })
    } catch (error) {
      logger.error(`Failed to create rental car: ${error}`, { error })
      return this.response.status(422).json({
        message: `Rental car creation failed: ${error}`,
      })
    }
  }

  async update() {
    try {
      const travelDeskRentalCar = await this.loadTravelDeskRentalCar()
      if (isNil(travelDeskRentalCar)) {
        return this.response.status(404).json({
          message: "Rental car not found.",
        })
      }

      const policy = this.buildPolicy(travelDeskRentalCar)
      if (!policy.update()) {
        return this.response.status(403).json({
          message: "You are not authorized to update this rental car.",
        })
      }

      const permittedAttributes = policy.permitAttributesForUpdate(this.request.body)
      const updatedTravelDeskRentalCar = await UpdateService.perform(
        travelDeskRentalCar,
        permittedAttributes,
        this.currentUser
      )
      const serializedTravelDeskRentalCar = ShowSerializer.perform(
        updatedTravelDeskRentalCar,
        this.currentUser
      )
      return this.response.status(200).json({
        travelDeskRentalCar: serializedTravelDeskRentalCar,
        policy,
      })
    } catch (error) {
      logger.error(`Failed to update rental car: ${error}`, { error })
      return this.response.status(422).json({
        message: `Rental car update failed: ${error}`,
      })
    }
  }

  async destroy() {
    try {
      const travelDeskRentalCar = await this.loadTravelDeskRentalCar()
      if (isNil(travelDeskRentalCar)) {
        return this.response.status(404).json({
          message: "Rental car not found.",
        })
      }

      const policy = this.buildPolicy(travelDeskRentalCar)
      if (!policy.destroy()) {
        return this.response.status(403).json({
          message: "You are not authorized to delete this rental car.",
        })
      }

      await travelDeskRentalCar.destroy()
      return this.response.status(204).send()
    } catch (error) {
      logger.error(`Failed to delete rental car: ${error}`, { error })
      return this.response.status(422).json({
        message: `Rental car deletion failed: ${error}`,
      })
    }
  }

  // TODO: Nest this endpoint under the travel-desk-travel-requests endpoint
  // As creation requires a travel request, this should be nested under the travel request endpoint
  private async buildTravelDeskRentalCar(): Promise<TravelDeskRentalCar> {
    const travelDeskRentalCar = TravelDeskRentalCar.build(this.request.body)

    const { travelRequestId } = travelDeskRentalCar
    const travelDeskTravelRequest = await TravelDeskTravelRequest.findByPk(travelRequestId, {
      include: ["travelAuthorization"],
    })
    if (isNil(travelDeskTravelRequest)) {
      throw new Error(`Travel request not found for travelRequestId=${travelRequestId}`)
    }

    travelDeskRentalCar.travelRequest = travelDeskTravelRequest

    return travelDeskRentalCar
  }

  private loadTravelDeskRentalCar(): Promise<TravelDeskRentalCar | null> {
    return TravelDeskRentalCar.findByPk(this.params.travelDeskRentalCarId, {
      include: [
        // required for policy check
        {
          association: "travelRequest",
          include: ["travelAuthorization"],
        },
      ],
    })
  }

  private buildPolicy(travelDeskRentalCar: TravelDeskRentalCar) {
    return new TravelDeskRentalCarsPolicy(this.currentUser, travelDeskRentalCar)
  }
}

export default TravelDeskRentalCarsController
