import { Attributes, WhereOptions } from "@sequelize/core"
import { isEmpty, isNil } from "lodash"

import { TravComIntegration } from "@/integrations"

import { FlightReconciliation, User } from "@/models"
import { BaseScopeOptions } from "@/policies"
import BaseService from "@/services/base-service"
import { ModelOrder } from "@/controllers/base-controller"

type AccountsReceivableInvoiceDetailQuery = {
  filters?: Record<string, unknown>
  where?: WhereOptions<Attributes<TravComIntegration.Models.AccountsReceivableInvoiceDetail>>
  limit?: number
  offset?: number
  order?: ModelOrder[]
}

export class SyncService extends BaseService {
  constructor(
    protected query: AccountsReceivableInvoiceDetailQuery,
    protected currentUser: User
  ) {
    super()
  }

  async perform(): Promise<void> {
    const scopes = this.buildFilterScopes()
    const scopedAccountsReceivableInvoiceDetails =
      TravComIntegration.Models.AccountsReceivableInvoiceDetail.withScope(scopes)

    const { where } = this.query
    const order = this.buildOrder()
    await scopedAccountsReceivableInvoiceDetails.findEach(
      {
        where,
        order,
        include: [
          "invoice",
          {
            association: "segments",
            include: ["arrivalCity"],
          },
        ],
      },
      async (accountsReceivableInvoiceDetail) => {
        const serializedInvoiceDetail =
          TravComIntegration.Serializers.AccountsReceivableInvoiceDetails.IndexSerializer.perform(
            accountsReceivableInvoiceDetail
          )

        const flightReconciliationAttributes = {
          invoiceBookingDate: serializedInvoiceDetail.invoiceBookingDate,
          invoiceMailcode: serializedInvoiceDetail.invoiceMailcode,
          invoiceDetailSellingFare: serializedInvoiceDetail.sellingFare,
          invoiceDetailComputedAgentName: serializedInvoiceDetail.agentName,
          invoiceDetailVendorName: serializedInvoiceDetail.vendorName,
          invoiceDetailComputedTravelerFirstName: serializedInvoiceDetail.travelerFirstName,
          invoiceDetailComputedTravelerLastName: serializedInvoiceDetail.travelerLastName,
          segmentsComputedFlightInfo: serializedInvoiceDetail.flightInfo,
          segmentsComputedFinalDestination: serializedInvoiceDetail.finalDestination,
        }

        const flightReconciliation = await FlightReconciliation.findOne({
          where: {
            externalTravComIdentifier: serializedInvoiceDetail.id,
          },
        })
        if (isNil(flightReconciliation)) {
          const flightReconciliationCreationAttributes = {
            ...flightReconciliationAttributes,
            externalTravComIdentifier: serializedInvoiceDetail.id,
            reconcilerId: this.currentUser.id,
            reconciled: false,
            reconcilePeriod: null,
          }
          await FlightReconciliation.create(flightReconciliationCreationAttributes)
        } else {
          await flightReconciliation.update(flightReconciliationAttributes)
        }
      }
    )

    return
  }

  private buildFilterScopes(): BaseScopeOptions[] {
    const scopes: BaseScopeOptions[] = ["includeAgentNameAttribute"]
    const { filters } = this.query
    if (!isEmpty(filters)) {
      Object.entries(filters).forEach(([key, value]) => {
        scopes.push({ method: [key, value] })
      })
    }

    return scopes
  }

  buildOrder(): ModelOrder[] | undefined {
    const baseOrder: ModelOrder[] = [
      ["segments", "departureInfo", "ASC"],
      ["segments", "arrivalInfo", "ASC"],
    ]

    const { order } = this.query
    if (isNil(order) || isEmpty(order)) {
      return baseOrder
    }

    return [...order, ...baseOrder]
  }
}

export default SyncService
