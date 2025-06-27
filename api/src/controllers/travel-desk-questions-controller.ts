import { literal } from "@sequelize/core"
import { Literal } from "sequelize/lib/utils"
import { isNil } from "lodash"

import { TravelDeskQuestion, TravelDeskTravelRequest } from "@/models"
import { TravelDeskQuestionsPolicy } from "@/policies"
import { CreateService } from "@/services/travel-desk-questions"

import BaseController from "@/controllers/base-controller"

export class TravelDeskQuestionsController extends BaseController<TravelDeskQuestion> {
  async index() {
    try {
      const where = this.buildWhere()
      const scopes = this.buildFilterScopes()
      const scopedTravelDeskQuestions = TravelDeskQuestionsPolicy.applyScope(
        scopes,
        this.currentUser
      )

      const nullResponsesFirstOrder: [Literal, string] = [literal("response IS NULL"), "DESC"]

      const totalCount = await scopedTravelDeskQuestions.count({ where })
      const travelDeskQuestions = await scopedTravelDeskQuestions.findAll({
        where,
        limit: this.pagination.limit,
        offset: this.pagination.offset,
        order: [nullResponsesFirstOrder, ["updatedAt", "DESC"]],
      })
      return this.response.status(200).json({
        travelDeskQuestions,
        totalCount,
      })
    } catch (error) {
      return this.response.status(500).json({
        message: `Failed to retrieve travel desk questions: ${error}`,
      })
    }
  }

  async show() {
    try {
      const travelDeskQuestion = await this.loadTravelDeskQuestion()
      if (isNil(travelDeskQuestion)) {
        return this.response.status(404).json({
          message: "Travel desk question not found.",
        })
      }

      const policy = this.buildPolicy(travelDeskQuestion)
      if (!policy.show()) {
        return this.response.status(403).json({
          message: "You are not authorized to view this travel desk question.",
        })
      }

      return this.response.status(200).json({
        travelDeskQuestion,
        policy,
      })
    } catch (error) {
      return this.response.status(400).json({
        message: `Failed to retrieve travel desk question: ${error}`,
      })
    }
  }

  async create() {
    try {
      const travelDeskQuestion = await this.buildTravelDeskQuestion()
      const policy = this.buildPolicy(travelDeskQuestion)
      if (!policy.create()) {
        return this.response
          .status(403)
          .json({ message: "You are not authorized to create this travel desk question." })
      }

      const permittedAttributes = policy.permitAttributesForCreate(this.request.body)
      const newTravelDeskQuestion = await CreateService.perform(
        permittedAttributes,
        this.currentUser
      )
      return this.response.status(201).json({
        travelDeskQuestion: newTravelDeskQuestion,
      })
    } catch (error) {
      return this.response.status(422).json({
        message: `Travel desk question creation failed: ${error}`,
      })
    }
  }

  async update() {
    try {
      const travelDeskQuestion = await this.loadTravelDeskQuestion()
      if (isNil(travelDeskQuestion)) {
        return this.response.status(404).json({
          message: "Travel desk question not found.",
        })
      }

      const policy = this.buildPolicy(travelDeskQuestion)
      if (!policy.update()) {
        return this.response
          .status(403)
          .json({ message: "You are not authorized to update this travel desk question." })
      }

      const permittedAttributes = policy.permitAttributesForUpdate(this.request.body)
      const updatedTravelDeskQuestion = await travelDeskQuestion.update(permittedAttributes)
      return this.response.status(200).json({
        travelDeskQuestion: updatedTravelDeskQuestion,
      })
    } catch (error) {
      return this.response.status(422).json({
        message: `Travel desk question update failed: ${error}`,
      })
    }
  }

  async destroy() {
    try {
      const travelDeskQuestion = await this.loadTravelDeskQuestion()
      if (isNil(travelDeskQuestion)) {
        return this.response.status(404).json({
          message: "Travel desk question not found.",
        })
      }

      const policy = this.buildPolicy(travelDeskQuestion)
      if (!policy.destroy()) {
        return this.response.status(403).json({
          message: "You are not authorized to delete this travel desk question.",
        })
      }

      await travelDeskQuestion.destroy()
      return this.response.status(204).send()
    } catch (error) {
      return this.response.status(422).json({
        message: `Travel desk question deletion failed: ${error}`,
      })
    }
  }

  private async buildTravelDeskQuestion(): Promise<TravelDeskQuestion> {
    const travelDeskQuestion = TravelDeskQuestion.build(this.request.body)

    const { travelRequestId } = travelDeskQuestion
    const travelDeskTravelRequest = await TravelDeskTravelRequest.findByPk(travelRequestId, {
      include: ["travelAuthorization"],
    })
    if (isNil(travelDeskTravelRequest)) {
      throw new Error(`Travel request not found for travelRequestId=${travelRequestId}`)
    }

    travelDeskQuestion.travelRequest = travelDeskTravelRequest

    return travelDeskQuestion
  }

  private loadTravelDeskQuestion(): Promise<TravelDeskQuestion | null> {
    return TravelDeskQuestion.findByPk(this.params.travelDeskQuestionId, {
      include: [
        // required for policy check
        {
          association: "travelRequest",
          include: ["travelAuthorization"],
        },
      ],
    })
  }

  private buildPolicy(travelDeskQuestion: TravelDeskQuestion) {
    return new TravelDeskQuestionsPolicy(this.currentUser, travelDeskQuestion)
  }
}

export default TravelDeskQuestionsController
