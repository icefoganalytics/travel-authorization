import { WhereOptions } from "@sequelize/core"
import { isNil } from "lodash"

import { TravelDeskRentalCar, TravelDeskTravelRequest } from "@/models"
import { TravelDeskRentalCarsPolicy } from "@/policies"
import { CreateService, UpdateService } from "@/services/travel-desk-rental-cars"
import { IndexSerializer } from "@/serializers/travel-desk-rental-cars"

import BaseController from "@/controllers/base-controller"

export class TravelDeskRentalCarsController extends BaseController {
  async index() {
    try {
      const where = this.query.where as WhereOptions<TravelDeskRentalCar>

      const scopedTravelDeskRentalCars = TravelDeskRentalCarsPolicy.applyScope(
        TravelDeskRentalCar,
        this.currentUser
      )

      const totalCount = await scopedTravelDeskRentalCars.count({ where })
      const travelDeskRentalCars = await scopedTravelDeskRentalCars.findAll({
        where,
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
      return this.response
        .status(500)
        .json({ message: `Failed to retrieve travel desk rental cars: ${error}` })
    }
  }

  async create() {
    try {
      const travelDeskRentalCar = await this.buildTravelDeskRentalCar()
      const policy = this.buildPolicy(travelDeskRentalCar)
      if (!policy.create()) {
        return this.response
          .status(403)
          .json({ message: "You are not authorized to create this rental car." })
      }

      const permittedAttributes = policy.permitAttributesForCreate(this.request.body)
      const newTravelDeskRentalCar = await CreateService.perform(
        permittedAttributes,
        this.currentUser
      )
      return this.response.status(201).json({ travelDeskRentalCar: newTravelDeskRentalCar })
    } catch (error) {
      return this.response.status(422).json({ message: `Rental car creation failed: ${error}` })
    }
  }

  async update() {
    try {
      const travelDeskRentalCar = await this.loadTravelDeskRentalCar()
      if (isNil(travelDeskRentalCar)) {
        return this.response.status(404).json({ message: "Rental car not found." })
      }

      const policy = this.buildPolicy(travelDeskRentalCar)
      if (!policy.update()) {
        return this.response
          .status(403)
          .json({ message: "You are not authorized to update this rental car." })
      }

      const permittedAttributes = policy.permitAttributesForUpdate(this.request.body)
      const updatedTravelDeskRentalCar = await UpdateService.perform(
        travelDeskRentalCar,
        permittedAttributes,
        this.currentUser
      )
      return this.response.status(200).json({ travelDeskRentalCar: updatedTravelDeskRentalCar })
    } catch (error) {
      return this.response.status(422).json({ message: `Rental car update failed: ${error}` })
    }
  }

  async destroy() {
    try {
      const travelDeskRentalCar = await this.loadTravelDeskRentalCar()
      if (isNil(travelDeskRentalCar)) {
        return this.response.status(404).json({ message: "Rental car not found." })
      }

      const policy = this.buildPolicy(travelDeskRentalCar)
      if (!policy.destroy()) {
        return this.response
          .status(403)
          .json({ message: "You are not authorized to delete this rental car." })
      }

      await travelDeskRentalCar.destroy()
      return this.response.status(204).send()
    } catch (error) {
      return this.response.status(422).json({ message: `Rental car deletion failed: ${error}` })
    }
  }

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
