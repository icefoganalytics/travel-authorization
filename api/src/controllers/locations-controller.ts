import { isNil } from "lodash"

import logger from "@/utils/logger"

import { Location } from "@/models"
import { IndexSerializer, ShowSerializer } from "@/serializers/locations"
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

      const scopedLocations = Location.withScope(scopes)

      const totalCount = await scopedLocations.count({ where })
      const locations = await scopedLocations.findAll({
        where,
        limit: this.pagination.limit,
        offset: this.pagination.offset,
        order,
      })
      const serializedLocations = IndexSerializer.perform(locations, this.currentUser)
      return this.response.json({
        locations: serializedLocations,
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

      const serializedLocation = ShowSerializer.perform(location, this.currentUser)
      return this.response.json({
        location: serializedLocation,
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
