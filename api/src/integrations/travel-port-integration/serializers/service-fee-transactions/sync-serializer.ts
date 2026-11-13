import { pick } from "lodash"

import { ServiceFeeTransaction } from "@/integrations/travel-port-integration/models"
import BaseSerializer from "@/serializers/base-serializer"

export class SyncSerializer extends BaseSerializer<ServiceFeeTransaction> {
  perform() {
    const activeVoidStatus = this.trimSourceValue(this.record.activeVoidStatus)
    const serviceFeeDocumentNumber = this.trimSourceValue(this.record.serviceFeeDocumentNumber)
    const issueDate = this.trimSourceValue(this.record.issueDate)
    const currencyCode = this.trimSourceValue(this.record.currencyCode)
    const nameOnServiceFee = this.trimSourceValue(this.record.nameOnServiceFee)
    const relatedTicketDocumentNumber = this.trimSourceValue(this.record.relatedTicketDocumentNumber)
    const relatedInvoiceNumber = this.trimSourceValue(this.record.relatedInvoiceNumber)

    return {
      ...pick(this.record, ["serviceFeeAmount", "commissionAmount"]),
      activeVoidStatus,
      serviceFeeDocumentNumber,
      issueDate,
      currencyCode,
      nameOnServiceFee,
      relatedTicketDocumentNumber,
      relatedInvoiceNumber,
    }
  }

  private trimSourceValue(value: string | null): string | null {
    return value?.trim() ?? null
  }
}

export default SyncSerializer
