import { isNil } from "lodash"

import logger from "@/utils/logger"

import { Location } from "@/models"
import BaseController from "@/controllers/base-controller"

export class LocationsController extends BaseController<Location> {
  async index() {
    try {
      const where = this.buildWhere()
      const scopes = this.buildFilterScopes()
      const order = this.buildOrder([
        ["city", "ASC"],
        ["province", "ASC"],
      ])

      const scopedLocations = Location.scope(scopes)

      const totalCount = await scopedLocations.count({ where })
      const locations = await scopedLocations.findAll({
        where,
        limit: this.pagination.limit,
        offset: this.pagination.offset,
        order,
      })
      return this.response.json({
        locations,
        totalCount,
      })
    } catch (error) {
      logger.error(`Error fetching locations: ${error}`, { error })
      return this.response.status(400).json({
        message: `Failed to retrieve locations: ${error}`,
      })
    }
  }

  async show() {
    try {
      const location = await this.loadLocation()
      if (isNil(location)) {
        return this.response.status(404).json({
          message: "Location not found.",
        })
      }

      return this.response.json({
        location,
      })
    } catch (error) {
      logger.error(`Error fetching location: ${error}`, { error })
      return this.response.status(400).json({
        message: `Failed to retrieve location: ${error}`,
      })
    }
  }

  private async loadLocation() {
    return await Location.findByPk(this.params.locationId)
  }
}

export default LocationsController
