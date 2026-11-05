import knex, { Knex } from "knex"
import { DB_CONFIG } from "../config"
import logger from "@/utils/logger"

type DistanceMatrixRow = {
  origin: string
  destination: string
  kilometers: number
}

export class DistanceMatrixService {
  private db: Knex

  constructor() {
    this.db = knex(DB_CONFIG)
  }

  async getDistance(
    pointA: string,
    PointB: string
  ): Promise<Pick<DistanceMatrixRow, "kilometers"> | undefined | []> {
    try {
      const result = await this.db<DistanceMatrixRow>("distanceMatrix")
        .select("kilometers")
        .where(function () {
          this.where("origin", pointA).andWhere("destination", PointB)
        })
        .orWhere(function () {
          this.where("origin", PointB).andWhere("destination", pointA)
        })
        .first()
      return result
    } catch (error: unknown) {
      logger.info(error)
      return []
    }
  }

  async getAllDistancesForLocation(location: string): Promise<DistanceMatrixRow[]> {
    try {
      const result = await this.db<DistanceMatrixRow>("distanceMatrix")
        .select("origin", "destination", "kilometers")
        .where("origin", location)
        .orWhere("destination", location)
      return result
    } catch (error: unknown) {
      logger.info(error)
      return []
    }
  }

  async updateDistance(pointA: string, PointB: string, distance: number): Promise<number | []> {
    try {
      const result = await this.db<DistanceMatrixRow>("distanceMatrix")
        .update({ kilometers: distance })
        .where(function () {
          this.where("origin", pointA).andWhere("destination", PointB)
        })
        .orWhere(function () {
          this.where("origin", PointB).andWhere("destination", pointA)
        })
      return result
    } catch (error: unknown) {
      logger.info(error)
      return []
    }
  }

  async updateLocationName(name: string, newName: string): Promise<number | []> {
    try {
      await this.db<DistanceMatrixRow>("distanceMatrix")
        .update({ origin: newName })
        .where("origin", name)
      const result = await this.db<DistanceMatrixRow>("distanceMatrix")
        .update({ destination: newName })
        .where("destination", name)
      return result
    } catch (error: unknown) {
      logger.info(error)
      return []
    }
  }

  async addDistanceMatrixLocation(name: string): Promise<[] | undefined> {
    try {
      const result = await this.db<DistanceMatrixRow>("distanceMatrix").select("origin").distinct()
      const insertArray = []
      for (let i = 0; i < result.length; i++) {
        insertArray.push({ origin: result[i].origin, destination: name, kilometers: 0 })
      }
      await this.db<DistanceMatrixRow>("distanceMatrix").insert(insertArray)
    } catch (error: unknown) {
      logger.info(error)
      return []
    }
  }

  async deleteLocation(name: string): Promise<number | []> {
    try {
      await this.db<DistanceMatrixRow>("distanceMatrix").delete().where("origin", name)
      const result = await this.db<DistanceMatrixRow>("distanceMatrix")
        .delete()
        .where("destination", name)
      return result
    } catch (error: unknown) {
      logger.info(error)
      return []
    }
  }

  async getLocations(): Promise<string[]> {
    try {
      const result = await this.db<DistanceMatrixRow>("distanceMatrix").select("origin").distinct()
      return result.map((item) => {
        return item.origin
      })
    } catch (error: unknown) {
      logger.info(error)
      return []
    }
  }

  async getAll(): Promise<DistanceMatrixRow[]> {
    try {
      const result = await this.db<DistanceMatrixRow>("distanceMatrix").select(
        "origin",
        "destination",
        "kilometers"
      )
      return result
    } catch (error: unknown) {
      logger.info(error)
      return []
    }
  }
}
