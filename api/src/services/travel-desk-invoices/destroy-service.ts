import { db } from "@/db/db-client"

import { TravelDeskInvoice, TravelDeskInvoiceItem } from "@/models"

import BaseService from "@/services/base-service"

export class DestroyService extends BaseService {
  constructor(protected invoice: TravelDeskInvoice) {
    super()
  }

  async perform(): Promise<void> {
    await db.transaction(async (transaction) => {
      await this.invoice.reload({
        include: [],
        lock: transaction.LOCK.UPDATE,
        transaction,
      })

      await TravelDeskInvoiceItem.destroy({
        where: { travelDeskInvoiceId: this.invoice.id },
      })
      await this.invoice.destroy()
    })
  }
}

export default DestroyService
