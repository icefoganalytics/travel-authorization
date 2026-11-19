import { TravelDeskInvoice, TravelDeskInvoiceItem } from "@/models"

import BaseService from "@/services/base-service"
import { withInvoiceLock } from "@/services/travel-desk-invoices/with-invoice-lock"

export class DestroyService extends BaseService {
  constructor(protected invoice: TravelDeskInvoice) {
    super()
  }

  async perform(): Promise<void> {
    return withInvoiceLock(this.invoice, async (invoice) => {
      await TravelDeskInvoiceItem.destroy({
        where: { travelDeskInvoiceId: invoice.id },
      })
      await invoice.destroy()
    })
  }
}

export default DestroyService
