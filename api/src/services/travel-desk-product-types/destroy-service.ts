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
    const referencedInvoiceItem = await TravelDeskInvoiceItem.findOne({
      where: {
        travelDeskProductTypeId: this.productType.id,
      },
      paranoid: false,
    })

    if (referencedInvoiceItem != null) {
      throw new Error("A product type used by an invoice cannot be deleted.")
    }

    await this.productType.destroy()
  }
}

export default DestroyService
