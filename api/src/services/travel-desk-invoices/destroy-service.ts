import { TravelDeskInvoice, TravelDeskInvoiceItem } from "@/models"

import BaseService from "@/services/base-service"
import { withTravelDeskInvoiceLock } from "@/services/travel-desk-invoices/with-travel-desk-invoice-lock"

export class DestroyService extends BaseService {
  constructor(protected travelDeskInvoice: TravelDeskInvoice) {
    super()
  }

  async perform(): Promise<void> {
    return withTravelDeskInvoiceLock(this.travelDeskInvoice, async (travelDeskInvoice) => {
      await TravelDeskInvoiceItem.destroy({
        where: {
          travelDeskInvoiceId: travelDeskInvoice.id,
        },
      })
      await travelDeskInvoice.destroy()
    })
  }
}

export default DestroyService
