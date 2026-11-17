import { TravelDeskInvoice, TravelDeskInvoiceItem } from "@/models"

import BaseService from "@/services/base-service"
import { WithLockService } from "@/services/travel-desk-invoices/with-lock-service"

export class DestroyService extends BaseService {
  constructor(protected invoice: TravelDeskInvoice) {
    super()
  }

  async perform(): Promise<void> {
    await WithLockService.perform(this.invoice, async () => {
      await TravelDeskInvoiceItem.destroy({
        where: { travelDeskInvoiceId: this.invoice.id },
      })
      await this.invoice.destroy()
    })
  }
}

export default DestroyService
