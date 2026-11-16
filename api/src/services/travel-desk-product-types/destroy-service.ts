import { isNil } from "lodash"

import { db } from "@/db/db-client"

import { TravelDeskInvoiceItem, TravelDeskProductType, User } from "@/models"

import BaseService from "@/services/base-service"

export class DestroyService extends BaseService {
  constructor(
    protected productType: TravelDeskProductType,
    protected currentUser: User
  ) {
    super()
  }

  async perform(): Promise<void> {
    await db.transaction(async (transaction) => {
      const productType = await TravelDeskProductType.findByPk(this.productType.id, {
        lock: transaction.LOCK.UPDATE,
        transaction,
      })
      if (isNil(productType)) {
        throw new Error("Product type does not exist.")
      }

      const referencedInvoiceItem = await TravelDeskInvoiceItem.findOne({
        attributes: ["id"],
        where: {
          travelDeskProductTypeId: productType.id,
        },
        paranoid: false,
        raw: true,
      })

      if (!isNil(referencedInvoiceItem)) {
        throw new Error("A product type used by an invoice cannot be deleted.")
      }

      await productType.destroy()
    })
  }
}

export default DestroyService
