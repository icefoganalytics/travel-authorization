import knex, { Knex } from "knex"
import { DB_CONFIG } from "../config"
import _ from "lodash"
import logger from "@/utils/logger"

export class DistanceMatrixService {
  private db: Knex

  constructor() {
    this.db = knex(DB_CONFIG)
  }

  async getDistance(pointA: string, PointB: string): Promise<any | undefined> {
    try {
      let result = await this.db("distanceMatrix")
        .select("kilometers")
        .where(function () {
          this.where("origin", pointA).andWhere("destination", PointB)
        })
        .orWhere(function () {
          this.where("origin", PointB).andWhere("destination", pointA)
        })
        .first()
      return result
    } catch (error: any) {
      logger.info(error)
      return []
    }
  }

  async getAllDistancesForLocation(location: string): Promise<any | undefined> {
    try {
      let result = await this.db("distanceMatrix")
        .select("origin", "destination", "kilometers")
        .where("origin", location)
        .orWhere("destination", location)
      return result
    } catch (error: any) {
      logger.info(error)
      return []
    }
  }

  async updateDistance(pointA: string, PointB: string, distance: number): Promise<any | undefined> {
    try {
      let result = await this.db("distanceMatrix")
        .update({ kilometers: distance })
        .where(function () {
          this.where("origin", pointA).andWhere("destination", PointB)
        })
        .orWhere(function () {
          this.where("origin", PointB).andWhere("destination", pointA)
        })
      return result
    } catch (error: any) {
      logger.info(error)
      return []
    }
  }

  async updateLocationName(name: string, newName: string): Promise<any | undefined> {
    try {
      let result = await this.db("distanceMatrix").update({ origin: newName }).where("origin", name)
      result = await this.db("distanceMatrix")
        .update({ destination: newName })
        .where("destination", name)
      return result
    } catch (error: any) {
      logger.info(error)
      return []
    }
  }

  async addDistanceMatrixLocation(name: string): Promise<any | undefined> {
    try {
      let result = await this.db("distanceMatrix").select("origin").distinct()
      let insertArray = []
      for (let i = 0; i < result.length; i++) {
        insertArray.push({ origin: result[i].origin, destination: name, kilometers: 0 })
      }
      result = await this.db("distanceMatrix").insert(insertArray)
    } catch (error: any) {
      logger.info(error)
      return []
    }
  }

  async deleteLocation(name: string): Promise<any | undefined> {
    try {
      let result = await this.db("distanceMatrix").delete().where("origin", name)
      result = await this.db("distanceMatrix").delete().where("destination", name)
      return result
    } catch (error: any) {
      logger.info(error)
      return []
    }
  }

  async getLocations(): Promise<any | undefined> {
    try {
      let result = await this.db("distanceMatrix").select("origin").distinct()
      return result.map((item) => {
        return item.origin
      })
    } catch (error: any) {
      logger.info(error)
      return []
    }
  }

  async getAll(): Promise<any | undefined> {
    try {
      let result = await this.db("distanceMatrix").select("origin", "destination", "kilometers")
      return result
    } catch (error: any) {
      logger.info(error)
      return []
    }
  }
}
