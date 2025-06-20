import { isNil } from "lodash"

import logger from "@/utils/logger"

import { GeneralLedgerCoding, TravelAuthorization } from "@/models"
import { GeneralLedgerCodingsPolicy } from "@/policies"
import { GeneralLedgerCodingsSerializer } from "@/serializers"
import { CreateService, UpdateService, DestroyService } from "@/services/general-ledger-codings"
import BaseController from "@/controllers/base-controller"

export class GeneralLedgerCodingsController extends BaseController<GeneralLedgerCoding> {
  async index() {
    try {
      const where = this.buildWhere()
      const scopes = this.buildFilterScopes()
      const order = this.buildOrder()

      const scopedGeneralLedgerCodings = GeneralLedgerCodingsPolicy.applyScope(
        scopes,
        this.currentUser
      )

      const totalCount = await scopedGeneralLedgerCodings.count({ where })
      const generalLedgerCodings = await scopedGeneralLedgerCodings.findAll({
        where,
        limit: this.pagination.limit,
        offset: this.pagination.offset,
        order,
      })
      const serializedGeneralLedgerCodings =
        GeneralLedgerCodingsSerializer.asTable(generalLedgerCodings)
      return this.response.json({
        generalLedgerCodings: serializedGeneralLedgerCodings,
        totalCount,
      })
    } catch (error) {
      logger.error(`Error fetching general ledger codings: ${error}`, { error })
      return this.response.status(400).json({
        message: `Failed to retrieve general ledger codings: ${error}`,
      })
    }
  }

  async create() {
    try {
      const generalLedgerCoding = await this.buildGeneralLedgerCoding()
      const policy = this.buildPolicy(generalLedgerCoding)
      if (!policy.create()) {
        return this.response.status(403).json({
          message: "You are not authorized to create this general ledger coding.",
        })
      }

      const permittedAttributes = policy.permitAttributesForCreate(this.request.body)
      const newGeneralLedgerCoding = await CreateService.perform(
        permittedAttributes,
        this.currentUser
      )
      return this.response.status(201).json({
        generalLedgerCoding: newGeneralLedgerCoding,
      })
    } catch (error) {
      logger.error(`Error creating general ledger coding: ${error}`, { error })
      return this.response.status(422).json({
        message: `General ledger coding creation failed: ${error}`,
      })
    }
  }

  async update() {
    try {
      const generalLedgerCoding = await this.loadGeneralLedgerCoding()
      if (isNil(generalLedgerCoding)) {
        return this.response.status(404).json({
          message: "General ledger coding not found.",
        })
      }

      const policy = this.buildPolicy(generalLedgerCoding)
      if (!policy.update()) {
        return this.response.status(403).json({
          message: "You are not authorized to update this general ledger coding.",
        })
      }

      const permittedAttributes = policy.permitAttributesForUpdate(this.request.body)
      const updatedGeneralLedgerCoding = await UpdateService.perform(
        generalLedgerCoding,
        permittedAttributes,
        this.currentUser
      )
      return this.response.json({
        generalLedgerCoding: updatedGeneralLedgerCoding,
      })
    } catch (error) {
      logger.error(`Error updating general ledger coding: ${error}`, { error })
      return this.response.status(422).json({
        message: `General ledger coding update failed: ${error}`,
      })
    }
  }

  async destroy() {
    try {
      const generalLedgerCoding = await this.loadGeneralLedgerCoding()
      if (isNil(generalLedgerCoding)) {
        return this.response.status(404).json({
          message: "General ledger coding not found.",
        })
      }

      const policy = this.buildPolicy(generalLedgerCoding)
      if (!policy.destroy()) {
        return this.response.status(403).json({
          message: "You are not authorized to delete this general ledger coding.",
        })
      }

      await DestroyService.perform(generalLedgerCoding, this.currentUser)
      return this.response.status(204).end()
    } catch (error) {
      logger.error(`Error deleting general ledger coding: ${error}`, { error })
      return this.response.status(422).json({
        message: `General ledger coding deletion failed: ${error}`,
      })
    }
  }

  private async buildGeneralLedgerCoding() {
    const attributes = this.request.body
    const generalLedgerCoding = GeneralLedgerCoding.build(attributes)

    // TODO: Given this requirement, consider nesting /travel-authorizations/:travelAuthorizationId/general-ledger-codings
    const { travelAuthorizationId } = attributes
    const travelAuthorization = await TravelAuthorization.findByPk(travelAuthorizationId, {
      rejectOnEmpty: true,
    })
    generalLedgerCoding.travelAuthorization = travelAuthorization

    return generalLedgerCoding
  }

  private loadGeneralLedgerCoding(): Promise<GeneralLedgerCoding | null> {
    return GeneralLedgerCoding.findByPk(this.params.generalLedgerCodingId, {
      include: ["travelAuthorization"],
    })
  }

  private buildPolicy(record: GeneralLedgerCoding): GeneralLedgerCodingsPolicy {
    return new GeneralLedgerCodingsPolicy(this.currentUser, record)
  }
}

export default GeneralLedgerCodingsController
