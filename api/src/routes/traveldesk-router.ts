import { isNil, isNull, minBy } from "lodash"
import express, { Request, Response } from "express"
import { CreationAttributes, Op, WhereOptions } from "sequelize"
import { DateTime } from "luxon"

import logger from "@/utils/logger"
import { RequiresAuth, RequiresRoleTdUser } from "@/middleware"
import { AuthorizedRequest } from "@/middleware/authorization-middleware"
import {
  TravelAuthorization,
  TravelDeskFlightOption,
  TravelDeskFlightRequest,
  TravelDeskFlightSegment,
  TravelDeskHotel,
  TravelDeskOtherTransportation,
  TravelDeskPassengerNameRecordDocument,
  TravelDeskQuestion,
  TravelDeskRentalCar,
  TravelDeskTravelRequest,
  User,
} from "@/models"

import db from "@/db/db-client"
import dbLegacy from "@/db/db-migration-client"

/** @deprecated - prefer using controller pattern with per-model CRUD actions */
export const travelDeskRouter = express.Router()

travelDeskRouter.get("/", RequiresAuth, async function (_req: Request, res: Response) {
  const travelRequests = await TravelDeskTravelRequest.findAll({
    where: {
      status: {
        [Op.ne]: TravelDeskTravelRequest.Statuses.DRAFT,
      },
    },
    include: [
      "flightRequests",
      "hotels",
      "otherTransportations",
      "questions",
      "rentalCars",
      {
        association: "travelAuthorization",
        include: [
          "stops",
          "user",
          {
            association: "travelSegments",
            include: ["departureLocation", "arrivalLocation"],
          },
        ],
      },
      {
        association: "travelDeskPassengerNameRecordDocument",
        attributes: ["invoiceNumber"],
      },
    ],
  })

  const travelRequestsJson = travelRequests.map((travelRequest) => travelRequest.toJSON())

  for (const travelRequest of travelRequestsJson) {
    // @ts-expect-error - not worth fixing at this time, belongs in a serializer
    travelRequest.form = travelRequest.travelAuthorization

    // @ts-expect-error - not worth fixing at this time, belongs in a serializer
    travelRequest.invoiceNumber =
      // @ts-expect-error - not worth fixing at this time, belongs in a serializer
      travelRequest.travelDeskPassengerNameRecordDocument?.invoiceNumber || ""
  }

  res.status(200).json(travelRequestsJson)
})

travelDeskRouter.get(
  "/authorized-travels/",
  RequiresAuth,
  async function (req: Request, res: Response) {
    const adminScoping: WhereOptions<TravelAuthorization> = {}
    if ((req as AuthorizedRequest).user?.roles?.includes(User.Roles.ADMIN)) {
      // No additional conditions for Admin, selects all records
    } else if ((req as AuthorizedRequest).user?.roles?.includes(User.Roles.DEPARTMENT_ADMIN)) {
      adminScoping.department = (req as AuthorizedRequest).user.department
    } else {
      adminScoping.userId = (req as AuthorizedRequest).user.id
    }

    try {
      const forms = await TravelAuthorization.findAll({
        where: adminScoping,
        include: ["stops", "travelDeskTravelRequest"],
      })
      const formsJson = forms.map((form) => form.toJSON())

      // TODO: move this code to a serializer
      for (const form of formsJson) {
        // @ts-expect-error - this code is deprecated so not worth fixing the type issues
        const stops = form.stops
        const earliestStop = minBy(stops, (stop) => {
          // @ts-expect-error - this code is deprecated so not worth fixing the type issues
          return `${stop.departureDate} ${stop.departureTime}`
        })
        // @ts-expect-error - this code is deprecated so not worth fixing the type issues
        form.departureDate = earliestStop?.departureDate || "Unknown"
        // @ts-expect-error - this code is deprecated so not worth fixing the type issues
        form.departureTime = earliestStop?.departureTime || "Unknown"

        // @ts-expect-error - isn't worth fixing at this time
        form.travelRequest = form.travelDeskTravelRequest

        // @ts-expect-error - isn't worth fixing at this time
        const travelDeskTravelRequestId = form.travelRequest?.id
        if (travelDeskTravelRequestId) {
          const travelDeskPnrDocument = await TravelDeskPassengerNameRecordDocument.findOne({
            attributes: ["invoiceNumber"],
            where: { travelDeskTravelRequestId },
          })

          // @ts-expect-error - isn't worth fixing at this time
          form.travelRequest.invoiceNumber = travelDeskPnrDocument?.invoiceNumber || ""
        }
      }
      res.status(200).json(formsJson)
    } catch (error: unknown) {
      logger.info(error)
      res.status(500).json("Internal Server Error")
    }
  }
)

travelDeskRouter.get(
  "/flight-options/:flightRequestId",
  RequiresAuth,
  async function (req: Request, res: Response) {
    const flightSegmentState = {
      flightErr: false,
      departAtErr: false,
      departTimeErr: false,
      departLocationErr: false,
      arriveAtErr: false,
      arriveTimeErr: false,
      arriveLocationErr: false,
      durationErr: false,
      classErr: false,
      statusErr: false,
    }

    const flightRequestId = Number(req.params.flightRequestId)
    let tmpId = 2000

    const flightOptions = await TravelDeskFlightOption.findAll({
      where: {
        flightRequestId,
      },
      include: ["flightSegments"],
    })

    const serializedFlightOptions: (TravelDeskFlightOption & {
      flightSegments: (TravelDeskFlightSegment & {
        state: typeof flightSegmentState
        tmpId: number
        departDay: string
        departTime: string
        arriveDay: string
        arriveTime: string
        departAt: string
        arriveAt: string
      })[]
      state: Record<string, boolean>
    })[] = flightOptions.map((flightOption) => flightOption.toJSON())
    for (const flightOption of serializedFlightOptions) {
      for (const flightSegment of flightOption.flightSegments || []) {
        flightSegment.state = flightSegmentState
        flightSegment.tmpId = tmpId
        flightSegment.departDay = flightSegment.departAt.substring(0, 10)
        flightSegment.departTime = flightSegment.departAt.substring(11, 16)
        flightSegment.arriveDay = flightSegment.arriveAt.substring(0, 10)
        flightSegment.arriveTime = flightSegment.arriveAt.substring(11, 16)
        tmpId++
      }
      flightOption.state = { costErr: false, legErr: false }
    }

    res.status(200).json(flightOptions)
  }
)

travelDeskRouter.post(
  "/flight-options/:travelDeskTravelRequestId",
  RequiresAuth,
  async function (req: Request, res: Response) {
    try {
      const travelDeskTravelRequestId = Number(req.params.travelDeskTravelRequestId)
      const newFlightOptions = req.body
      //logger.info(newFlightOptions)
      if (newFlightOptions.length < 1 || !travelDeskTravelRequestId)
        return res.status(422).json("Empty Payload for Flight Options")

      const travelDeskTravelRequest = await TravelDeskTravelRequest.findByPk(
        travelDeskTravelRequestId,
        {
          include: [
            {
              association: "travelAuthorization",
              include: ["user"],
            },
          ],
          rejectOnEmpty: true,
        }
      )
      const traveler = travelDeskTravelRequest.travelAuthorization?.user
      if (isNil(traveler)) {
        throw new Error("Traveler not found")
      }

      const flightRequestsIds = await TravelDeskFlightRequest.findAll({
        attributes: ["id"],
        where: { id: travelDeskTravelRequestId },
      })
      const flightRequestIds = flightRequestsIds.map((flightRequest) => flightRequest.id)

      await dbLegacy.transaction(async () => {
        await TravelDeskFlightOption.destroy({
          where: { flightRequestId: flightRequestIds },
        })

        for (const newFlightOption of newFlightOptions) {
          delete newFlightOption.state

          const flightSegments = newFlightOption.flightSegments
          delete newFlightOption.flightSegments

          newFlightOption.travelerId = traveler.id

          const travelDeskFlighOption = await TravelDeskFlightOption.create(newFlightOption)

          for (const flightSegment of flightSegments) {
            // logger.info(flightSegment)
            delete flightSegment.tmpId
            delete flightSegment.state
            delete flightSegment.departDay
            delete flightSegment.departTime
            delete flightSegment.arriveDay
            delete flightSegment.arriveTime
            flightSegment.flightOptionId = travelDeskFlighOption.id
            await TravelDeskFlightSegment.create(flightSegment)
          }
        }
        res.status(200).json("Successful")
      })
    } catch (error: unknown) {
      logger.info(error)
      res.status(500).json("Saving the Flight Options failed")
    }
  }
)

travelDeskRouter.delete(
  "/flight-options/:travelDeskTravelRequestId",
  RequiresAuth,
  RequiresRoleTdUser,
  async function (req: Request, res: Response) {
    try {
      const travelDeskTravelRequestId = Number(req.params.travelDeskTravelRequestId)
      const flightRequestsIds = await TravelDeskFlightRequest.findAll({
        attributes: ["id"],
        where: { travelRequestId: travelDeskTravelRequestId },
      })
      const flightRequestIds = flightRequestsIds.map((flightRequest) => flightRequest.id)

      await TravelDeskFlightOption.destroy({
        where: { flightRequestId: flightRequestIds },
      })

      res.status(200).json("Delete Successful")
    } catch (error: unknown) {
      logger.info(error)
      res.status(500).json("Delete failed")
    }
  }
)

travelDeskRouter.get(
  "/flight-request/:travelDeskTravelRequestId",
  RequiresAuth,
  async function (req: Request, res: Response) {
    try {
      const flightSegmentState = {
        flightErr: false,
        departAtErr: false,
        departTimeErr: false,
        departLocationErr: false,
        arriveAtErr: false,
        arriveTimeErr: false,
        arriveLocationErr: false,
        durationErr: false,
        classErr: false,
        statusErr: false,
      }

      const travelDeskTravelRequestId = Number(req.params.travelDeskTravelRequestId)

      if (isNil(travelDeskTravelRequestId)) {
        return res.status(422).json({
          message: "Missing travelDeskTravelRequestId parameter.",
        })
      }

      const flightRequests = await TravelDeskFlightRequest.findAll({
        where: {
          travelRequestId: travelDeskTravelRequestId,
        },
        include: [
          {
            association: "flightOptions",
            include: ["flightSegments"],
          },
        ],
      })
      const flightRequestsJson: (TravelDeskFlightRequest & {
        flightOptions: (TravelDeskFlightOption & {
          flightSegments: (TravelDeskFlightSegment & {
            departAt: string
            arriveAt: string
            state: typeof flightSegmentState
            departDay: string | null
            departTime: string | null
            arriveDay: string | null
            arriveTime: string | null
          })[]
          state: Record<string, boolean>
        })[]
      })[] = flightRequests.map((flightRequest) => flightRequest.toJSON())

      for (const flightRequest of flightRequestsJson) {
        for (const flightOption of flightRequest.flightOptions) {
          for (const flightSegment of flightOption.flightSegments) {
            flightSegment.state = flightSegmentState

            if (flightSegment.departAt) {
              const departDateTime = DateTime.fromISO(flightSegment.departAt, { zone: "utc" })
              flightSegment.departDay = departDateTime.toISODate()
              flightSegment.departTime = departDateTime.toISOTime({
                suppressSeconds: true,
                includeOffset: false,
              })
            } else {
              console.warn("Warning: departAt is undefined for flightSegment.")
            }

            // Parsing arrival date and time
            if (flightSegment.arriveAt) {
              const arriveDateTime = DateTime.fromISO(flightSegment.arriveAt, { zone: "utc" })
              flightSegment.arriveDay = arriveDateTime.toISODate()
              flightSegment.arriveTime = arriveDateTime.toISOTime({
                suppressSeconds: true,
                includeOffset: false,
              })
            } else {
              console.warn("Warning: arriveAt is undefined for flightSegment.")
            }
          }
          flightOption.state = { costErr: false, legErr: false }
        }
        // @ts-expect-error - not worth fixing at this time
        flightRequest.flightOptions = flightOptions
      }

      return res.status(200).json(flightRequestsJson)
    } catch (error: unknown) {
      logger.error(`Failed to get flight requests: ${error}`, { error })
      return res.status(500).json({
        message: "Failed to get flight requests",
      })
    }
  }
)

travelDeskRouter.post(
  "/flight-request/:travelDeskTravelRequestId",
  RequiresAuth,
  async function (req: Request, res: Response) {
    return db
      .transaction(async () => {
        const travelDeskTravelRequestId = Number(req.params.travelDeskTravelRequestId)
        const flightRequests = req.body
        if (isNil(travelDeskTravelRequestId)) {
          return res.status(422).json({
            message: "Missing travelDeskTravelRequestId parameter.",
          })
        }

        const travelDeskTravelRequest = await TravelDeskTravelRequest.findByPk(
          travelDeskTravelRequestId,
          {
            include: [
              {
                association: "travelAuthorization",
                include: ["user"],
              },
            ],
            rejectOnEmpty: true,
          }
        )
        const traveler = travelDeskTravelRequest.travelAuthorization?.user
        if (isNil(traveler)) {
          throw new Error("Traveler not found")
        }

        await TravelDeskFlightRequest.destroy({
          where: { travelRequestId: travelDeskTravelRequestId },
        })

        for (const flightRequest of flightRequests) {
          const newFlightOptions = flightRequest.flightOptions
          delete flightRequest.flightOptions
          delete flightRequest.tmpId
          if (flightRequest.flightRequestId == null) {
            delete flightRequest.flightRequestId
          }

          flightRequest.travelRequestId = travelDeskTravelRequestId

          const newFlightRequest = await TravelDeskFlightRequest.create(flightRequest)

          await TravelDeskFlightOption.destroy({
            where: { flightRequestId: newFlightRequest.id },
          })

          for (const newFlightOption of newFlightOptions) {
            delete newFlightOption.state

            const flightSegments = newFlightOption.flightSegments
            delete newFlightOption.flightSegments

            newFlightOption.flightRequestId = newFlightRequest.id
            newFlightOption.travelerId = traveler.id

            const travelDeskFlighOption = await TravelDeskFlightOption.create(newFlightOption)

            for (const flightSegment of flightSegments) {
              // logger.info(flightSegment)
              delete flightSegment.tmpId
              delete flightSegment.state
              delete flightSegment.departDay
              delete flightSegment.departTime
              delete flightSegment.arriveDay
              delete flightSegment.arriveTime
              flightSegment.flightOptionId = travelDeskFlighOption.id
              await TravelDeskFlightSegment.create(flightSegment)
            }
          }
        }
        return res.status(200).json("Successful")
      })
      .catch((error) => {
        logger.info(error)
        return res.status(500).json("Saving the Flight Request failed")
      })
  }
)

travelDeskRouter.get(
  "/travel-request/:travelDeskTravelRequestId",
  RequiresAuth,
  async function (req: Request, res: Response) {
    const flightSegmentState = {
      flightErr: false,
      departAtErr: false,
      departTimeErr: false,
      departLocationErr: false,
      arriveAtErr: false,
      arriveTimeErr: false,
      arriveLocationErr: false,
      durationErr: false,
      classErr: false,
      statusErr: false,
    }

    const travelDeskTravelRequestId = req.params.travelDeskTravelRequestId
    const travelRequest = await TravelDeskTravelRequest.findByPk(travelDeskTravelRequestId, {
      include: [
        "hotels",
        "otherTransportations",
        "questions",
        "rentalCars",
        {
          association: "flightRequests",
          include: [
            {
              association: "flightOptions",
              include: ["flightSegments"],
            },
          ],
        },
        {
          association: "travelDeskPassengerNameRecordDocument",
          attributes: ["invoiceNumber"],
        },
      ],
    })
    if (isNil(travelRequest)) {
      return res.status(404).json({ message: "No Travel Request found" })
    }

    const travelRequestJson = travelRequest.toJSON()

    // TODO: move this code to a serializer
    // @ts-expect-error - not worth fixing at this time
    for (const flightRequest of travelRequestJson.flightRequests || []) {
      for (const flightOption of flightRequest.flightOptions || []) {
        for (const flightSegment of flightOption.flightSegments || []) {
          flightSegment.state = flightSegmentState

          if (flightSegment.departAt) {
            const departDateTime = DateTime.fromISO(flightSegment.departAt, { zone: "utc" })
            flightSegment.departDay = departDateTime.toISODate()
            flightSegment.departTime = departDateTime.toISOTime({
              suppressSeconds: true,
              includeOffset: false,
            })
          } else {
            console.warn("Warning: departAt is undefined for flightSegment.")
          }

          // Parsing arrival date and time
          if (flightSegment.arriveAt) {
            const arriveDateTime = DateTime.fromISO(flightSegment.arriveAt, { zone: "utc" })
            flightSegment.arriveDay = arriveDateTime.toISODate()
            flightSegment.arriveTime = arriveDateTime.toISOTime({
              suppressSeconds: true,
              includeOffset: false,
            })
          } else {
            console.warn("Warning: arriveAt is undefined for flightSegment.")
          }
        }
        flightOption.state = { costErr: false, legErr: false }
      }
    }

    // @ts-expect-error - not worth fixing at this time
    travelRequestJson.invoiceNumber =
      // @ts-expect-error - not worth fixing at this time
      travelRequestJson.travelDeskPassengerNameRecordDocument?.invoiceNumber || ""

    res.status(200).json(travelRequestJson)
  }
)

travelDeskRouter.post(
  "/travel-request/:travelDeskTravelRequestId",
  RequiresAuth,
  async function (req: Request, res: Response) {
    logger.warn(
      "Deprecated: travel requests are now created during TravelAuthorization approval service action."
    )
    const travelDeskTravelRequestId = Number(req.params.travelDeskTravelRequestId)
    if (isNil(travelDeskTravelRequestId) || isNaN(travelDeskTravelRequestId)) {
      return res.status(422).json("Missing travelDeskTravelRequestId parameter.")
    }

    const newTravelRequest = req.body
    delete newTravelRequest.invoiceNumber

    const flightRequests = newTravelRequest.flightRequests
    delete newTravelRequest.flightRequests

    const rentalCars = newTravelRequest.rentalCars
    delete newTravelRequest.rentalCars

    const hotels = newTravelRequest.hotels
    delete newTravelRequest.hotels

    const otherTransportations = newTravelRequest.otherTransportation || []
    delete newTravelRequest.otherTransportation

    const questions = newTravelRequest.questions
    delete newTravelRequest.questions

    return db
      .transaction(async () => {
        let travelRequest = await TravelDeskTravelRequest.findByPk(travelDeskTravelRequestId)
        if (isNil(travelRequest)) {
          travelRequest = await TravelDeskTravelRequest.create(newTravelRequest)
        } else {
          await travelRequest.update(newTravelRequest)
        }

        const travelDeskTravelRequest = await TravelDeskTravelRequest.findByPk(
          travelDeskTravelRequestId,
          {
            include: [
              {
                association: "travelAuthorization",
                include: ["user"],
              },
            ],
            rejectOnEmpty: true,
          }
        )
        const traveler = travelDeskTravelRequest.travelAuthorization?.user
        if (isNil(traveler)) {
          throw new Error("Traveler not found")
        }

        //FlightRequests
        await TravelDeskFlightRequest.destroy({
          where: { travelRequestId: travelRequest.id },
        })

        for (const flightRequest of flightRequests) {
          const newFlightOptions = flightRequest.flightOptions || []
          delete flightRequest.flightOptions

          delete flightRequest.tmpId
          delete flightRequest.id
          flightRequest.travelRequestId = travelRequest.id
          const newFlightRequest = await TravelDeskFlightRequest.create(flightRequest)

          await TravelDeskFlightOption.destroy({
            where: {
              flightRequestId: newFlightRequest.id,
            },
          })

          for (const newFlightOption of newFlightOptions) {
            delete newFlightOption.state

            const flightSegments = newFlightOption.flightSegments
            delete newFlightOption.flightSegments

            newFlightOption.flightRequestId = newFlightRequest.id
            newFlightOption.travelerId = traveler.id

            const travelDeskFlighOption = await TravelDeskFlightOption.create(newFlightOption)

            for (const flightSegment of flightSegments) {
              // logger.info(flightSegment)
              delete flightSegment.tmpId
              delete flightSegment.state
              delete flightSegment.departDay
              delete flightSegment.departTime
              delete flightSegment.arriveDay
              delete flightSegment.arriveTime
              flightSegment.flightOptionId = travelDeskFlighOption.id
              await TravelDeskFlightSegment.create(flightSegment)
            }
          }
        }

        //RentalCars
        await TravelDeskRentalCar.destroy({
          where: { travelRequestId: travelRequest.id },
        })

        const cleanRentalCars = rentalCars.map(
          (
            rentalCar: CreationAttributes<TravelDeskRentalCar> & {
              id?: number
              tmpId?: number
            }
          ) => {
            delete rentalCar.tmpId
            delete rentalCar.id
            if (isNil(travelRequest)) {
              throw new Error("Travel Request is null")
            }

            rentalCar.travelRequestId = travelRequest.id
            return rentalCar
          }
        )
        await TravelDeskRentalCar.bulkCreate(cleanRentalCars)

        //Hotels
        await TravelDeskHotel.destroy({
          where: { travelRequestId: travelRequest.id },
        })

        const cleanHotels = hotels.map(
          (
            hotel: CreationAttributes<TravelDeskHotel> & {
              id?: number
              tmpId?: number
            }
          ) => {
            delete hotel.tmpId
            delete hotel.id
            if (isNil(travelRequest)) {
              throw new Error("Travel Request is null")
            }

            hotel.travelRequestId = travelRequest.id
            return hotel
          }
        )
        await TravelDeskHotel.bulkCreate(cleanHotels)

        //Other Transportations
        await TravelDeskOtherTransportation.destroy({
          where: { travelRequestId: travelRequest.id },
        })

        const cleanOtherTransportations = otherTransportations.map(
          (
            otherTransportation: CreationAttributes<TravelDeskOtherTransportation> & {
              id?: number
              tmpId?: number
            }
          ) => {
            delete otherTransportation.tmpId
            delete otherTransportation.id
            if (isNil(travelRequest)) {
              throw new Error("Travel Request is null")
            }

            otherTransportation.travelRequestId = travelRequest.id
            return otherTransportation
          }
        )
        await TravelDeskOtherTransportation.bulkCreate(cleanOtherTransportations)

        //Questions
        await TravelDeskQuestion.destroy({
          where: { travelRequestId: travelRequest.id },
        })

        const cleanQuestions = questions.map(
          (
            question: CreationAttributes<TravelDeskQuestion> & {
              tmpId?: number
              state?: Record<string, boolean>
            }
          ) => {
            delete question.tmpId
            delete question.state
            delete question.id
            if (isNil(travelRequest)) {
              throw new Error("Travel Request is null")
            }

            question.travelRequestId = travelRequest.id
            return question
          }
        )
        await TravelDeskQuestion.bulkCreate(cleanQuestions)
        return res.status(200).json("Successful")
      })
      .catch((error) => {
        logger.error(error)
        res.status(500).json("Saving the Travel Request failed")
      })
  }
)

travelDeskRouter.post(
  "/pnr-document/:travelDeskTravelRequestId",
  RequiresAuth,
  RequiresRoleTdUser,
  async function (req: Request, res: Response) {
    const file = req.body.file
    const travelDeskTravelRequestId = parseInt(req.params.travelDeskTravelRequestId)
    const data = JSON.parse(req.body.data)
    const { invoiceNumber, travelAgencyId } = data

    return db
      .transaction(async () => {
        await TravelDeskPassengerNameRecordDocument.upsert({
          travelDeskTravelRequestId,
          invoiceNumber,
          pnrDocument: file,
        })

        if (travelAgencyId) {
          await TravelDeskTravelRequest.update(
            {
              travelAgencyId,
            },
            {
              where: { id: travelDeskTravelRequestId },
            }
          )
        }

        res.status(200).json("Successful")
      })
      .catch((error) => {
        logger.info(error)
        res.status(500).json("Insert failed")
      })
  }
)

travelDeskRouter.get(
  "/pnr-document/:travelDeskTravelRequestId",
  RequiresAuth,
  RequiresRoleTdUser,
  async function (req, res) {
    try {
      const travelDeskTravelRequestId = req.params.travelDeskTravelRequestId
      const doc = await TravelDeskPassengerNameRecordDocument.findOne({
        where: { travelDeskTravelRequestId },
      })

      if (isNull(doc)) {
        return res.status(404).json({ message: "No PNR Document found" })
      }

      res.status(200).send(doc.pnrDocument)
    } catch (error: unknown) {
      logger.info(error)
      res.status(500).json("PDF not Found")
    }
  }
)
