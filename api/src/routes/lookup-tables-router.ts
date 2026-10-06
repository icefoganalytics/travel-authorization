import express, { Request, Response } from "express"
import { ReturnValidationErrors } from "../middleware"
import { DB_CONFIG } from "../config"
import knex from "knex"
import logger from "@/utils/logger"
import { DistanceMatrixService } from "../services"

const db = knex(DB_CONFIG)

export const lookupTableRouter = express.Router()
const distanceMatrixService = new DistanceMatrixService()

lookupTableRouter.get(
  "/distanceMatrix/distance",
  ReturnValidationErrors,
  async function (req: Request, res: Response) {
    try {
      if (typeof req.query.origin != "string" || typeof req.query.destination != "string") {
        res.status(400).json("Bad Request")
      } else {
        let distance = await distanceMatrixService.getDistance(
          req.query.origin,
          req.query.destination
        )
        res.status(200).json(distance)
      }
    } catch (error: any) {
      logger.info(error)
      res.status(500).json("Internal Server Error")
    }
  }
)

lookupTableRouter.put(
  "/distanceMatrix/distance",
  ReturnValidationErrors,
  async function (req: Request, res: Response) {
    try {
      if (
        typeof req.query.origin != "string" ||
        typeof req.query.destination != "string" ||
        typeof req.query.distance != "number"
      ) {
        res.status(400).json("Bad Request")
      } else {
        let distance = await distanceMatrixService.updateDistance(
          req.query.origin,
          req.query.destination,
          req.query.distance
        )
        res.status(200).json(distance)
      }
    } catch (error: any) {
      logger.info(error)
      res.status(500).json("Internal Server Error")
    }
  }
)

lookupTableRouter.get(
  "/distanceMatrix/locations",
  ReturnValidationErrors,
  async function (req: Request, res: Response) {
    try {
      let distance = await distanceMatrixService.getLocations()
      res.status(200).json(distance)
    } catch (error: any) {
      logger.info(error)
      res.status(500).json("Internal Server Error")
    }
  }
)

lookupTableRouter.put(
  "/distanceMatrix/locations",
  ReturnValidationErrors,
  async function (req: Request, res: Response) {
    try {
      if (typeof req.query.name != "string" || typeof req.query.newName != "string") {
        res.status(400).json("Bad Request")
      } else {
        let distance = await distanceMatrixService.updateLocationName(
          req.query.name,
          req.query.newName
        )
        res.status(200).json(distance)
      }
    } catch (error: any) {
      logger.info(error)
      res.status(500).json("Internal Server Error")
    }
  }
)
