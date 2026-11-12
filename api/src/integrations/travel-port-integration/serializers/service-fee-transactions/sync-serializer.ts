import { pick } from "lodash"

import { ServiceFeeTransaction } from "@/integrations/travel-port-integration/models"
import BaseSerializer from "@/serializers/base-serializer"

export class SyncSerializer extends BaseSerializer<ServiceFeeTransaction> {
  perform() {
    return {
      ...pick(this.record, ["serviceFeeAmount", "commissionAmount"]),
      activeVoidStatus: this.record.activeVoidStatus?.trim() ?? null,
      serviceFeeDocumentNumber: this.record.serviceFeeDocumentNumber?.trim() ?? null,
      issueDate: this.record.issueDate?.trim() ?? null,
      currencyCode: this.record.currencyCode?.trim() ?? null,
      nameOnServiceFee: this.record.nameOnServiceFee?.trim() ?? null,
      relatedTicketDocumentNumber: this.record.relatedTicketDocumentNumber?.trim() ?? null,
      relatedInvoiceNumber: this.record.relatedInvoiceNumber?.trim() ?? null,
    }
  }
}

export default SyncSerializer
